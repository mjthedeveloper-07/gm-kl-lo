import type { LotteryResult } from "@/data/lotteryHistory";

// Parse "dd.mm.yy" into a sortable timestamp
const parseTs = (d: string): number => {
  const [dd, mm, yy] = d.split(".").map(Number);
  if (!dd || !mm || yy === undefined) return 0;
  const year = yy < 50 ? 2000 + yy : 1900 + yy;
  return new Date(year, mm - 1, dd).getTime();
};

/**
 * Compute hot pos-2 / pos-3 digits from the most-recent N draws.
 * Returns sets of the top-3 digits at each position.
 */
const hotPrefixDigits = (history: LotteryResult[], windowSize = 50): { p2: Set<string>; p3: Set<string> } => {
  const sorted = [...history].sort((a, b) => parseTs(b.date) - parseTs(a.date)).slice(0, windowSize);
  const c2: Record<string, number> = {};
  const c3: Record<string, number> = {};
  for (const r of sorted) {
    if (r.result.length < 4) continue;
    const d2 = r.result[2];
    const d3 = r.result[3];
    if (d2) c2[d2] = (c2[d2] || 0) + 1;
    if (d3) c3[d3] = (c3[d3] || 0) + 1;
  }
  const top = (counts: Record<string, number>): Set<string> =>
    new Set(
      Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([d]) => d),
    );
  return { p2: top(c2), p3: top(c3) };
};

/**
 * MID NET (~250): top-N L4 tails by recency-weighted frequency,
 * boosted by hot pos-2 / pos-3 prefix matches from the last 50 draws.
 *
 * Score = recency_weight × (1 + 0.5 × prefix_match_bonus)
 *   prefix_match_bonus = (1 if pos-2 hot, +1 if pos-3 hot) → 0/1/2
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

  const { p2: hotP2, p3: hotP3 } = hotPrefixDigits(history, 50);

  // Boost score by prefix match. L4 string is positions 2..5 of the 6-digit number.
  // L4[0] corresponds to the pos-2 digit; L4[1] corresponds to pos-3.
  const scored: Array<[string, number]> = Object.entries(w).map(([tail, base]) => {
    let bonus = 0;
    if (hotP2.has(tail[0])) bonus += 1;
    if (hotP3.has(tail[1])) bonus += 1;
    return [tail, base * (1 + 0.5 * bonus)];
  });

  return scored
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
 * Group method names into independent "families" so we can score diversity.
 * Methods within the same family vote for similar tails — counting their
 * overlap as confirmation is a mistake (this was the Tight Net bug).
 */
const METHOD_FAMILIES: Record<string, string> = {
  // Positional family — all use top-K-per-position logic
  "L4 Positional Top-K": "positional",
  "L4 Stable Positional": "positional",
  "Hot-Cold Balanced": "positional",
  "High-Frequency Based": "positional",
  // Markov / sequential family
  "L4 Markov Tail": "markov",
  "Pattern Matching": "markov",
  "Trend-Based": "markov",
  // Bigram family
  "L4 Recency Bigrams": "bigram",
  // L3-anchor family
  "L3 Anchor + L4 Prefix": "l3anchor",
  // Probability / distribution family
  "Probability-Weighted": "distribution",
  "KL Divergence": "distribution",
  // Complex-number family
  "Complex Number Analysis": "complex",
  "Real/Imaginary Decomposition": "complex",
  "Exponentiation (z^n)": "complex",
  "Exponential Form (z=|z|e^iθ)": "complex",
  "Phase & Magnitude Based": "complex",
  "Complex Roots (nth roots)": "complex",
};

const familyOf = (method: string): string => METHOD_FAMILIES[method] ?? `other:${method}`;

/**
 * TIGHT NET (~50): diversity-weighted re-ranking.
 *
 * Old (broken) version: counted votes from overlapping methods → picked tails
 * that all positional methods happened to agree on, which is *not* signal.
 *
 * New version:
 *   score(tail) = total_votes × log(1 + distinct_families) × recency_weight
 *
 * Plus a hard filter: a tail must appear in ≥ 2 distinct method families to
 * qualify. Empty-result safety: if filter leaves <10 candidates, relax to
 * single-family votes ranked by recency weight.
 */
export const buildL4TightNet = (
  perMethodPredictions: Array<{ method: string; numbers: string[] }> | string[][],
  history: LotteryResult[],
  size = 50,
): string[] => {
  // Backward compatibility: if caller passed plain string[][], wrap with
  // synthetic method names so legacy callers still work (without diversity).
  const methodPreds: Array<{ method: string; numbers: string[] }> = Array.isArray(perMethodPredictions[0])
    ? (perMethodPredictions as string[][]).map((numbers, i) => ({ method: `unknown_${i}`, numbers }))
    : (perMethodPredictions as Array<{ method: string; numbers: string[] }>);

  // Collect votes + per-tail family set
  const votes: Record<string, number> = {};
  const families: Record<string, Set<string>> = {};
  for (const { method, numbers } of methodPreds) {
    const fam = familyOf(method);
    for (const p of numbers.slice(0, 5)) {
      const tail = p.slice(-4);
      if (tail.length !== 4) continue;
      votes[tail] = (votes[tail] || 0) + 1;
      if (!families[tail]) families[tail] = new Set();
      families[tail].add(fam);
    }
  }

  // Recency weight per tail (exp decay, 365-day half-life)
  const sorted = [...history].sort((a, b) => parseTs(b.date) - parseTs(a.date));
  const newestTs = sorted[0] ? parseTs(sorted[0].date) : 0;
  const recency: Record<string, number> = {};
  for (const r of sorted) {
    if (r.result.length < 4) continue;
    const tail = r.result.slice(-4);
    const ageDays = Math.max(0, (newestTs - parseTs(r.date)) / (1000 * 60 * 60 * 24));
    recency[tail] = (recency[tail] || 0) + Math.exp(-ageDays / 365);
  }

  const score = (tail: string): number => {
    const v = votes[tail] || 0;
    const fc = families[tail]?.size ?? 0;
    const rec = recency[tail] || 0.01; // floor so brand-new tails aren't zeroed
    return v * Math.log(1 + fc) * rec;
  };

  // Strict pass: tails appearing in ≥ 2 distinct families
  const strict = Object.keys(votes)
    .filter(t => (families[t]?.size ?? 0) >= 2)
    .sort((a, b) => score(b) - score(a))
    .slice(0, size);

  if (strict.length >= 10) return strict;

  // Relaxed fallback: all voted tails ranked by recency (ignore family bonus)
  return Object.keys(votes)
    .sort((a, b) => (recency[b] || 0) - (recency[a] || 0) || (votes[b] || 0) - (votes[a] || 0))
    .slice(0, size);
};
