import { lotteryHistory } from "@/data/lotteryHistory";

export interface Last2Pattern {
  pattern: string;
  count: number;
  percentage: number;
  lastSeen: string;
  lottery?: string;
}

export interface Last2Prediction {
  digits: string;
  confidence: number;
  method: string;
  frequency?: number;
}

// Get frequency of all last-2 digit patterns (00-99)
export const getLast2Frequency = (): Last2Pattern[] => {
  const counts: Record<string, { count: number; lastSeen: string; lottery: string }> = {};

  lotteryHistory.forEach((r) => {
    const last2 = r.result.slice(-2);
    if (!counts[last2]) {
      counts[last2] = { count: 0, lastSeen: r.date, lottery: r.lottery };
    }
    counts[last2].count++;
  });

  const total = lotteryHistory.length;

  return Object.entries(counts)
    .map(([pattern, data]) => ({
      pattern,
      count: data.count,
      percentage: Math.round((data.count / total) * 10000) / 100,
      lastSeen: data.lastSeen,
      lottery: data.lottery,
    }))
    .sort((a, b) => b.count - a.count);
};

// Get top N high-frequency last-2 patterns
export const getTopLast2Patterns = (n: number = 25): Last2Pattern[] => {
  return getLast2Frequency().slice(0, n);
};

// Positional frequency for position 5 (tens) and position 6 (units)
export const getPositionalFrequency = (): { tens: Record<string, number>; units: Record<string, number> } => {
  const tens: Record<string, number> = {};
  const units: Record<string, number> = {};

  for (let i = 0; i <= 9; i++) {
    tens[i.toString()] = 0;
    units[i.toString()] = 0;
  }

  lotteryHistory.forEach((r) => {
    const t = r.result[4] || "";
    const u = r.result[5] || "";
    if (t) tens[t] = (tens[t] || 0) + 1;
    if (u) units[u] = (units[u] || 0) + 1;
  });

  return { tens, units };
};

// Mirror-based last-2 prediction
const POWER_MAP: Record<string, string[]> = {
  "0": ["0", "6", "3", "7", "8", "2", "4", "9", "1"],
  "1": ["1", "7", "4", "3", "0"],
  "2": ["2", "1", "8", "7", "3", "5", "4"],
  "3": ["7", "8", "2", "0", "4", "6"],
  "4": ["8", "3", "4", "1", "0", "7", "9", "6", "2", "5"],
  "5": ["7", "0", "5", "8", "3"],
  "6": ["6", "8", "4", "7", "2", "9", "3"],
  "7": ["7", "2", "3", "0", "9"],
  "8": ["8", "3", "7", "1", "4", "5", "2", "9", "6"],
  "9": ["9", "8", "5", "4", "1"],
};

export const getMirrorLast2Predictions = (inputLast2: string): Last2Prediction[] => {
  const d1 = inputLast2[0] || "0";
  const d2 = inputLast2[1] || "0";
  const m1 = POWER_MAP[d1] || [d1];
  const m2 = POWER_MAP[d2] || [d2];

  const predictions: Last2Prediction[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < Math.min(m1.length, 5); i++) {
    for (let j = 0; j < Math.min(m2.length, 5); j++) {
      const pair = m1[i] + m2[j];
      if (!seen.has(pair)) {
        seen.add(pair);
        const conf = Math.max(95 - (i + j) * 8, 30);
        predictions.push({ digits: pair, confidence: conf, method: "Mirror Power Map" });
      }
    }
  }

  return predictions.sort((a, b) => b.confidence - a.confidence).slice(0, 15);
};

// Delta-based predictions
export const getDeltaLast2Predictions = (): Last2Prediction[] => {
  const deltas: Record<string, number> = {};

  for (let i = 0; i < lotteryHistory.length - 1; i++) {
    const curr = parseInt(lotteryHistory[i].result.slice(-2));
    const next = parseInt(lotteryHistory[i + 1].result.slice(-2));
    const delta = ((curr - next + 100) % 100).toString().padStart(2, "0");
    deltas[delta] = (deltas[delta] || 0) + 1;
  }

  return Object.entries(deltas)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15)
    .map(([digits, freq]) => ({
      digits,
      confidence: Math.min(Math.round((freq / lotteryHistory.length) * 500), 95),
      method: "Delta Pattern",
      frequency: freq,
    }));
};

// Sum-based predictions
export const getSumLast2Predictions = (): Last2Prediction[] => {
  const sumCounts: Record<number, string[]> = {};

  lotteryHistory.forEach((r) => {
    const last2 = r.result.slice(-2);
    const sum = parseInt(last2[0]) + parseInt(last2[1]);
    if (!sumCounts[sum]) sumCounts[sum] = [];
    sumCounts[sum].push(last2);
  });

  const sorted = Object.entries(sumCounts).sort(([, a], [, b]) => b.length - a.length);
  const predictions: Last2Prediction[] = [];

  sorted.slice(0, 5).forEach(([sum, patterns]) => {
    const unique = [...new Set(patterns)];
    const topPatterns = unique
      .map((p) => ({ p, c: patterns.filter((x) => x === p).length }))
      .sort((a, b) => b.c - a.c)
      .slice(0, 3);

    topPatterns.forEach((tp) => {
      predictions.push({
        digits: tp.p,
        confidence: Math.min(Math.round((tp.c / lotteryHistory.length) * 800), 90),
        method: `Sum=${sum}`,
        frequency: tp.c,
      });
    });
  });

  return predictions.sort((a, b) => b.confidence - a.confidence).slice(0, 15);
};

// Combined all methods
export const getAllLast2Predictions = (inputLast2?: string): Record<string, Last2Prediction[]> => {
  const freq = getTopLast2Patterns(15).map((p) => ({
    digits: p.pattern,
    confidence: Math.min(Math.round(p.percentage * 10), 95),
    method: "Frequency",
    frequency: p.count,
  }));

  const mirror = inputLast2 ? getMirrorLast2Predictions(inputLast2) : [];
  const delta = getDeltaLast2Predictions();
  const sumPred = getSumLast2Predictions();

  return {
    "High Frequency": freq,
    "Mirror Power Map": mirror,
    "Delta Pattern": delta,
    "Sum Pattern": sumPred,
  };
};
