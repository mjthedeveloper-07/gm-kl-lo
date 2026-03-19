import { lotteryHistory, type LotteryResult } from "@/data/lotteryHistory";

// Seeded random for consistent predictions per day
class SeededRandom {
  private seed: number;
  constructor(seed: number) { this.seed = seed; }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

const generateSeed = (): number => {
  const today = new Date().toISOString().split('T')[0];
  const latestResult = lotteryHistory[0]?.result || '000000';
  let hash = 0;
  for (let i = 0; i < (today + latestResult).length; i++) {
    hash = ((hash << 5) - hash) + (today + latestResult).charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
};

export interface Last2Pattern {
  pattern: string;
  frequency: number;
  lastSeen: string;
  percentage: number;
}

export interface Last2Prediction {
  number: string;
  method: string;
  confidence: "high" | "medium" | "low";
  reason: string;
}

// ── FREQUENCY ANALYSIS ──

export const getLast2Digits = (result: string): string => {
  return result.slice(-2);
};

export const getMostCommonLast2Patterns = (limit = 20): Last2Pattern[] => {
  const counts: Record<string, { count: number; lastSeen: string }> = {};

  lotteryHistory.forEach(r => {
    const last2 = getLast2Digits(r.result);
    if (!counts[last2]) counts[last2] = { count: 0, lastSeen: r.date };
    counts[last2].count++;
  });

  const total = lotteryHistory.length;
  return Object.entries(counts)
    .map(([pattern, { count, lastSeen }]) => ({
      pattern,
      frequency: count,
      lastSeen,
      percentage: (count / total) * 100,
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, limit);
};

// Position-specific frequency for 5th and 6th digits
export const getPositionalFrequencyLast2 = (): { pos5: Record<string, number>; pos6: Record<string, number> } => {
  const pos5: Record<string, number> = {};
  const pos6: Record<string, number> = {};

  for (let d = 0; d <= 9; d++) {
    pos5[d.toString()] = 0;
    pos6[d.toString()] = 0;
  }

  lotteryHistory.forEach(r => {
    const res = r.result;
    if (res.length >= 6) {
      pos5[res[4]]++;
      pos6[res[5]]++;
    }
  });

  return { pos5, pos6 };
};

// ── PREDICTION METHODS ──

// Method 1: Top frequency last 2 patterns
const generateFrequencyPredictions = (count: number): Last2Prediction[] => {
  const patterns = getMostCommonLast2Patterns(count);
  return patterns.map(p => ({
    number: p.pattern,
    method: "Frequency Analysis",
    confidence: p.frequency >= 5 ? "high" : p.frequency >= 3 ? "medium" : "low",
    reason: `Appeared ${p.frequency} times (${p.percentage.toFixed(1)}%)`,
  }));
};

// Method 2: Positional probability (top digits at pos 5 & 6)
const generatePositionalPredictions = (count: number): Last2Prediction[] => {
  const { pos5, pos6 } = getPositionalFrequencyLast2();
  const top5 = Object.entries(pos5).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const top6 = Object.entries(pos6).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const predictions: Last2Prediction[] = [];
  const rng = new SeededRandom(generateSeed() + 100);

  for (let i = 0; i < count && i < 25; i++) {
    const d5 = top5[Math.floor(rng.next() * top5.length)][0];
    const d6 = top6[Math.floor(rng.next() * top6.length)][0];
    const num = d5 + d6;
    if (!predictions.find(p => p.number === num)) {
      predictions.push({
        number: num,
        method: "Positional Probability",
        confidence: "medium",
        reason: `Pos5 freq: ${pos5[d5]}, Pos6 freq: ${pos6[d6]}`,
      });
    }
  }
  return predictions.slice(0, count);
};

// Method 3: Mirror mapping on last 2 digits
const mirrorMap: Record<number, number[]> = {
  0: [0, 6, 3], 1: [1, 7, 4], 2: [2, 8, 5], 3: [3, 9, 0],
  4: [4, 6, 1], 5: [5, 7, 2], 6: [6, 0, 8], 7: [7, 1, 9],
  8: [8, 2, 6], 9: [9, 3, 7],
};

const generateMirrorLast2Predictions = (count: number): Last2Prediction[] => {
  const latest = lotteryHistory[0]?.result || "000000";
  const last2 = getLast2Digits(latest);
  const d1 = parseInt(last2[0]);
  const d2 = parseInt(last2[1]);

  const predictions: Last2Prediction[] = [];
  const mirrors1 = mirrorMap[d1] || [d1];
  const mirrors2 = mirrorMap[d2] || [d2];

  for (const m1 of mirrors1) {
    for (const m2 of mirrors2) {
      const num = `${m1}${m2}`;
      if (num !== last2 && !predictions.find(p => p.number === num)) {
        predictions.push({
          number: num,
          method: "Mirror Formula",
          confidence: predictions.length < 3 ? "high" : "medium",
          reason: `Mirror of ${last2}: ${d1}→${m1}, ${d2}→${m2}`,
        });
      }
    }
  }
  return predictions.slice(0, count);
};

// Method 4: Delta (difference) based
const generateDeltaLast2Predictions = (count: number): Last2Prediction[] => {
  const deltas: number[] = [];
  for (let i = 0; i < Math.min(20, lotteryHistory.length - 1); i++) {
    const curr = parseInt(getLast2Digits(lotteryHistory[i].result));
    const prev = parseInt(getLast2Digits(lotteryHistory[i + 1].result));
    deltas.push(curr - prev);
  }

  const latest = parseInt(getLast2Digits(lotteryHistory[0].result));
  const predictions: Last2Prediction[] = [];
  const seen = new Set<string>();

  // Use most common deltas
  const deltaCounts: Record<number, number> = {};
  deltas.forEach(d => { deltaCounts[d] = (deltaCounts[d] || 0) + 1; });
  const topDeltas = Object.entries(deltaCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count * 2);

  for (const [delta] of topDeltas) {
    const val = ((latest + parseInt(delta)) % 100 + 100) % 100;
    const num = val.toString().padStart(2, "0");
    if (!seen.has(num)) {
      seen.add(num);
      predictions.push({
        number: num,
        method: "Delta System",
        confidence: "medium",
        reason: `Latest(${latest.toString().padStart(2, "0")}) + delta(${delta})`,
      });
    }
  }
  return predictions.slice(0, count);
};

// Method 5: Sum-based (digits summing to common sums)
const generateSumLast2Predictions = (count: number): Last2Prediction[] => {
  const sums: Record<number, number> = {};
  lotteryHistory.forEach(r => {
    const l2 = getLast2Digits(r.result);
    const s = parseInt(l2[0]) + parseInt(l2[1]);
    sums[s] = (sums[s] || 0) + 1;
  });

  const topSums = Object.entries(sums)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([s]) => parseInt(s));

  const predictions: Last2Prediction[] = [];
  const rng = new SeededRandom(generateSeed() + 200);

  for (const targetSum of topSums) {
    for (let d1 = 0; d1 <= 9; d1++) {
      const d2 = targetSum - d1;
      if (d2 >= 0 && d2 <= 9) {
        const num = `${d1}${d2}`;
        if (!predictions.find(p => p.number === num) && rng.next() > 0.4) {
          predictions.push({
            number: num,
            method: "Sum Pattern",
            confidence: "medium",
            reason: `Digit sum ${targetSum} (freq: ${sums[targetSum]})`,
          });
        }
      }
    }
    if (predictions.length >= count) break;
  }
  return predictions.slice(0, count);
};

// Method 6: Power mapping A(x) = (x+5) mod 10
const generatePowerMappingLast2 = (count: number): Last2Prediction[] => {
  const latest = lotteryHistory[0]?.result || "000000";
  const last2 = getLast2Digits(latest);
  const d1 = parseInt(last2[0]);
  const d2 = parseInt(last2[1]);

  const predictions: Last2Prediction[] = [];
  // Apply power mapping iterations
  for (let i = 1; i <= count; i++) {
    const m1 = (d1 + 5 * i) % 10;
    const m2 = (d2 + 5 * i) % 10;
    predictions.push({
      number: `${m1}${m2}`,
      method: "Power Mapping",
      confidence: i <= 2 ? "high" : "medium",
      reason: `A^${i}(${last2}): (${d1}+${5 * i})%10=${m1}, (${d2}+${5 * i})%10=${m2}`,
    });
  }
  return predictions;
};

// ── AGGREGATE ──

export const generateAllLast2Predictions = (): {
  frequency: Last2Prediction[];
  positional: Last2Prediction[];
  mirror: Last2Prediction[];
  delta: Last2Prediction[];
  sum: Last2Prediction[];
  powerMapping: Last2Prediction[];
} => ({
  frequency: generateFrequencyPredictions(10),
  positional: generatePositionalPredictions(8),
  mirror: generateMirrorLast2Predictions(8),
  delta: generateDeltaLast2Predictions(8),
  sum: generateSumLast2Predictions(8),
  powerMapping: generatePowerMappingLast2(5),
});

// Historical validation for last 2 digit predictions
export const validateLast2Prediction = (prediction: string): { matches: number; results: LotteryResult[] } => {
  const matching = lotteryHistory.filter(r => getLast2Digits(r.result) === prediction);
  return { matches: matching.length, results: matching.slice(0, 5) };
};
