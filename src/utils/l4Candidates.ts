import type { LotteryResult } from "@/data/lotteryHistory";

// Parse "dd.mm.yy" into a sortable timestamp
const parseTs = (d: string): number => {
  const [dd, mm, yy] = d.split(".").map(Number);
  if (!dd || !mm || yy === undefined) return 0;
  const year = yy < 50 ? 2000 + yy : 1900 + yy;
  return new Date(year, mm - 1, dd).getTime();
};

/**
 * MID NET (~250): top-N L4 tails by recency-weighted frequency.
 * Each historical L4 is weighted by exp(-age_days / halfLifeDays).
 */
export const buildL4MidNet = (history: LotteryResult[], size = 250, halfLifeDays = 365): string[] => {
  if (history.length === 0) return [];
  const sorted = [...history].sort((a, b) => parseTs(b.date) - parseTs(a.date));
  const newestTs = parseTs(sorted[0].date);

  const w: Record<string, number> = {};
  for (const r of sorted) {
    if (r.result.length < 4) continue;
    const tail = r.result.slice(-4);
    const ageDays = Math.max(0, (newestTs - parseTs(r.date)) / (1000 * 60 * 60 * 24));
    w[tail] = (w[tail] || 0) + Math.exp(-ageDays / halfLifeDays);
  }

  return Object.entries(w)
    .sort((a, b) => b[1] - a[1])
    .slice(0, size)
    .map(([tail]) => tail);
};

/**
 * WIDE NET (~1000): top-N L4 tails by raw all-time frequency.
 * Includes synthetic neighbours when historical pool is too small.
 */
export const buildL4WideNet = (history: LotteryResult[], size = 1000): string[] => {
  if (history.length === 0) return [];
  const counts: Record<string, number> = {};
  for (const r of history) {
    if (r.result.length < 4) continue;
    const tail = r.result.slice(-4);
    counts[tail] = (counts[tail] || 0) + 1;
  }

  const ranked = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([tail]) => tail);

  if (ranked.length >= size) return ranked.slice(0, size);

  // Pad with synthetic neighbours of the top tails (±1 / ±10 / ±100 / ±1000 mod 10000)
  const out = new Set(ranked);
  const offsets = [1, -1, 10, -10, 100, -100, 1000, -1000];
  outer: for (const tail of ranked) {
    const n = parseInt(tail, 10);
    for (const off of offsets) {
      const next = ((n + off) % 10000 + 10000) % 10000;
      out.add(next.toString().padStart(4, "0"));
      if (out.size >= size) break outer;
    }
  }
  return Array.from(out).slice(0, size);
};

/**
 * TIGHT NET (~50): merge a list of method-generated 6-digit predictions into
 * a deduped, frequency-ranked L4 set. Each prediction's L4 tail gets +1 vote;
 * ties broken by overall historical frequency.
 */
export const buildL4TightNet = (
  perMethodPredictions: string[][],
  history: LotteryResult[],
  size = 50,
): string[] => {
  // Vote count per L4 across methods
  const votes: Record<string, number> = {};
  for (const preds of perMethodPredictions) {
    // Top 5 per method to keep the "tight" feel
    for (const p of preds.slice(0, 5)) {
      const tail = p.slice(-4);
      votes[tail] = (votes[tail] || 0) + 1;
    }
  }

  // Historical frequency tiebreak
  const histCounts: Record<string, number> = {};
  for (const r of history) {
    if (r.result.length < 4) continue;
    const tail = r.result.slice(-4);
    histCounts[tail] = (histCounts[tail] || 0) + 1;
  }

  return Object.entries(votes)
    .sort((a, b) => b[1] - a[1] || (histCounts[b[0]] || 0) - (histCounts[a[0]] || 0))
    .slice(0, size)
    .map(([tail]) => tail);
};
