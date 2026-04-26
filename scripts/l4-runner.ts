import { lotteryHistory, type LotteryResult } from "@/data/lotteryHistory";
import { generateAllPredictionsFor } from "@/utils/predictionGenerator";
import * as fs from "fs";

const parseDate = (d: string): number => {
  const [dd, mm, yy] = d.split(".").map(Number);
  if (!dd || !mm || yy === undefined) return 0;
  const year = yy < 50 ? 2000 + yy : 1900 + yy;
  return new Date(year, mm - 1, dd).getTime();
};
const sortChrono = (a: LotteryResult[]) => [...a].sort((x, y) => parseDate(x.date) - parseDate(y.date));

const PICKS = 5;
const MIN_HISTORY = 200;
const chrono = sortChrono(lotteryHistory).filter(r => r.result?.length === 6);
console.log(`Total draws: ${chrono.length}`);

interface Stat {
  method: string; hits: number; evaluated: number;
  hitsLast365: number; evaluatedLast365: number;
  longestGap: number; curGap: number;
  recentWins: Array<{ date: string; lottery: string; actual: string; predicted: string }>;
  predictionsAgg: number;
}
const stats: Record<string, Stat> = {};
const newestTs = parseDate(chrono[chrono.length - 1].date);
const yearAgo = newestTs - 365 * 86400 * 1000;

for (let i = MIN_HISTORY; i < chrono.length; i++) {
  const target = chrono[i];
  const slice = chrono.slice(0, i);
  const preds = generateAllPredictionsFor(slice);
  const actualL4 = target.result.slice(-4);
  const inRecent = parseDate(target.date) >= yearAgo;

  for (const p of preds) {
    if (!stats[p.method]) stats[p.method] = {
      method: p.method, hits: 0, evaluated: 0, hitsLast365: 0, evaluatedLast365: 0,
      longestGap: 0, curGap: 0, recentWins: [], predictionsAgg: 0,
    };
    const s = stats[p.method];
    s.evaluated++;
    if (inRecent) s.evaluatedLast365++;
    const top = (p.numbers || []).slice(0, PICKS);
    s.predictionsAgg += top.length;
    let hit = ""; for (const n of top) if (n.slice(-4) === actualL4) { hit = n; break; }
    if (hit) {
      s.hits++; if (inRecent) s.hitsLast365++;
      if (s.curGap > s.longestGap) s.longestGap = s.curGap;
      s.curGap = 0;
      s.recentWins.push({ date: target.date, lottery: target.lottery, actual: target.result, predicted: hit });
      if (s.recentWins.length > 10) s.recentWins.shift();
    } else s.curGap++;
  }
  if ((i - MIN_HISTORY + 1) % 250 === 0) console.log(`  ...${i - MIN_HISTORY + 1} draws scored`);
}
for (const s of Object.values(stats)) if (s.curGap > s.longestGap) s.longestGap = s.curGap;

const BASELINE = 1 - Math.pow(1 - 1/10000, PICKS);
const ranked = Object.values(stats).map(s => {
  const hr = s.evaluated ? s.hits/s.evaluated : 0;
  const rr = s.evaluatedLast365 ? s.hitsLast365/s.evaluatedLast365 : 0;
  return { ...s, hitRate: hr, recentRate: rr, lift: hr/BASELINE, recentLift: rr/BASELINE,
           composite: (hr/BASELINE)*0.6 + (rr/BASELINE)*0.4,
           avgPicks: s.evaluated ? s.predictionsAgg/s.evaluated : 0 };
}).sort((a, b) => b.composite - a.composite);

const csvHead = "rank,method,l4_hits,draws_scored,hit_rate_pct,lift,recent_hits,recent_draws,recent_rate_pct,recent_lift,composite,avg_picks_per_draw,longest_gap";
const csvRows = ranked.map((r, i) => [i+1, `"${r.method}"`, r.hits, r.evaluated,
  (r.hitRate*100).toFixed(3), r.lift.toFixed(2), r.hitsLast365, r.evaluatedLast365,
  (r.recentRate*100).toFixed(3), r.recentLift.toFixed(2), r.composite.toFixed(2),
  r.avgPicks.toFixed(1), r.longestGap].join(","));
fs.writeFileSync("/mnt/documents/l4-method-leaderboard.csv", [csvHead, ...csvRows].join("\n") + "\n");

const L: string[] = [];
L.push("=".repeat(72));
L.push("L4 DAILY HIT PLAYBOOK — 20-METHOD LEADERBOARD");
L.push(`History window: ${chrono[0].date} → ${chrono[chrono.length-1].date}`);
L.push(`Draws scored: ${chrono.length - MIN_HISTORY} (after ${MIN_HISTORY}-draw warmup)`);
L.push(`Picks per draw: top ${PICKS} of each method`);
L.push(`Random baseline: ${(BASELINE*100).toFixed(3)}% (5 tickets, 4-digit space)`);
L.push("=".repeat(72)); L.push("");
ranked.forEach((r, i) => {
  L.push(`#${(i+1).toString().padStart(2)} ${r.method}`);
  L.push(`     L4 hits:        ${r.hits} / ${r.evaluated}  (${(r.hitRate*100).toFixed(3)}%)   lift ${r.lift.toFixed(2)}×`);
  L.push(`     Recent (365d):  ${r.hitsLast365} / ${r.evaluatedLast365}  (${(r.recentRate*100).toFixed(3)}%)   lift ${r.recentLift.toFixed(2)}×`);
  L.push(`     Composite:      ${r.composite.toFixed(2)}   avg picks: ${r.avgPicks.toFixed(1)}   longest dry: ${r.longestGap}`);
  if (r.recentWins.length) { L.push(`     Last L4 wins:`);
    r.recentWins.slice(-5).reverse().forEach(w =>
      L.push(`       • ${w.date}  ${w.lottery.padEnd(16)} actual ${w.actual} → predicted ${w.predicted} (L4 ${w.actual.slice(-4)})`));
  } else L.push(`     Last L4 wins: none`);
  L.push("");
});

const today = generateAllPredictionsFor(chrono);
const top3 = ranked.slice(0, 3).map(r => r.method);
const get = (m: string) => (today.find(p => p.method === m)?.numbers ?? []).map(x => x.slice(-4));
const ticket: Array<{ method: string; tail: string }> = [];
const seen = new Set<string>();
const add = (m: string, n: number) => { let k = 0; for (const c of get(m)) if (!seen.has(c)) { seen.add(c); ticket.push({method: m, tail: c}); if (++k >= n) break; } };
add(top3[0], 2); add(top3[1], 2); add(top3[2], 1);
let cur = 0; while (ticket.length < 5 && cur < ranked.length) { add(ranked[cur].method, 5 - ticket.length); cur++; }

L.push("=".repeat(72));
L.push(`TODAY'S 5-TICKET L4 SYSTEM (next draw after ${chrono[chrono.length-1].date})`);
L.push("=".repeat(72));
L.push(`Top 3 methods feeding the system:`);
top3.forEach((m, i) => L.push(`  ${i+1}. ${m}`));
L.push(""); L.push("Play these 5 L4 tails:");
ticket.forEach((t, i) => L.push(`  ${i+1}. ${t.tail}    (from ${t.method})`));
L.push(""); L.push("Refresh rule: regenerate after each new result is added to the dataset.");
L.push("=".repeat(72));
fs.writeFileSync("/mnt/documents/l4-daily-playbook.txt", L.join("\n") + "\n");

const mapping = `L4 COMPLEX-NUMBER FORMULA MAPPING
============================================================
The 4 newly added L4 methods are derived directly from the
standard complex-number identity sheet (matematica.pt). Each
treats an L4 tail "abcd" as the complex number z = ab + cd·i,
predicts the next tail in the (real, imag) grid (each component
0-99), then prepends the most common pos-0/pos-1 prefix from
the last 200 draws to form a 6-digit candidate.

Method 17 — L4 Complex Polar Drift
Identity:    z = |z|·(cos θ + i sin θ)
Computes (|z|, θ) for the last 50 L4 tails, measures the mean
per-step drift in r and θ, projects 5 forward steps in polar
space, converts back to L4 tails.

Method 18 — L4 Conjugate Mirror
Identity:    z̄ = a − bi    and    −z = (−a) + (−b)i
Picks the 5 hottest recency-weighted L4 tails from the last 200
draws and emits their mod-100 conjugate and negative reflections
as candidates.

Method 19 — L4 nth-Roots Generator
Identity:    ⁿ√z = ⁿ√|z|·e^(i(θ + 2kπ)/n),  k = 0..n−1
Treats the most recent L4 tail as z, generates its 5 fifth-roots
(k = 0..4), and converts each back to a 4-digit tail.

Method 20 — L4 z₁·z₂ Angular Drift
Identity:    z₁·z₂ = |z₁|·|z₂|·e^i(θ₁ + θ₂)
Multiplies the last two L4 tails as complex numbers, then fans
out 5 candidates by rotating ±k·30° around the product angle.
`;
fs.writeFileSync("/mnt/documents/l4-formula-mapping.txt", mapping);

console.log("\n=== TOP 5 ===");
ranked.slice(0, 5).forEach((r, i) =>
  console.log(`  ${i+1}. ${r.method.padEnd(35)} composite ${r.composite.toFixed(2)}  hits ${r.hits}/${r.evaluated}  lift ${r.lift.toFixed(2)}×`));
console.log("\nFiles written to /mnt/documents/");
