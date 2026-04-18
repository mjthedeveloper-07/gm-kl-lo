import { lotteryHistory } from "@/data/lotteryHistory";

export interface L4Prediction {
  pattern: string;
  frequency: number;
  percentage: number;
  lastSeen?: string;
  confidence: "high" | "medium" | "low";
  source: string;
}

export interface L4PositionalFreq {
  position: number;
  digits: { digit: string; count: number; percentage: number }[];
}

const getAllLast4 = (): { pattern: string; date: string }[] =>
  lotteryHistory
    .filter((r) => r.result && r.result.length >= 4)
    .map((r) => ({ pattern: r.result.slice(-4), date: r.date }));

const buildFreq = (entries: { pattern: string; date: string }[]) => {
  const map = new Map<string, { count: number; lastSeen: string }>();
  entries.forEach(({ pattern, date }) => {
    const cur = map.get(pattern);
    if (!cur) map.set(pattern, { count: 1, lastSeen: date });
    else cur.count += 1;
  });
  return map;
};

const confidenceFor = (count: number): "high" | "medium" | "low" =>
  count >= 4 ? "high" : count >= 2 ? "medium" : "low";

// 1. Frequency analysis - top historical L4 patterns
export const getFrequencyL4Predictions = (limit = 12): L4Prediction[] => {
  const all = getAllLast4();
  const total = all.length;
  const map = buildFreq(all);
  return Array.from(map.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit)
    .map(([pattern, v]) => ({
      pattern,
      frequency: v.count,
      percentage: +((v.count / total) * 100).toFixed(2),
      lastSeen: v.lastSeen,
      confidence: confidenceFor(v.count),
      source: "Historical Frequency",
    }));
};

// 2. Recent hot streak - last 50 draws
export const getRecentHotL4Predictions = (limit = 12): L4Prediction[] => {
  const recent = getAllLast4().slice(0, 50);
  const map = buildFreq(recent);
  const entries = Array.from(map.entries()).sort((a, b) => b[1].count - a[1].count);

  // If no repeats, fall back to most recent unique
  if (entries.length && entries[0][1].count === 1) {
    return recent.slice(0, limit).map((e) => ({
      pattern: e.pattern,
      frequency: 1,
      percentage: 2,
      lastSeen: e.date,
      confidence: "low" as const,
      source: "Recent Draw (50)",
    }));
  }

  return entries.slice(0, limit).map(([pattern, v]) => ({
    pattern,
    frequency: v.count,
    percentage: +((v.count / 50) * 100).toFixed(2),
    lastSeen: v.lastSeen,
    confidence: confidenceFor(v.count),
    source: "Hot Streak (50 draws)",
  }));
};

// 3. Positional high-frequency builder - pick top digit per L4 position
export const getPositionalL4Predictions = (limit = 12): L4Prediction[] => {
  const all = getAllLast4();
  const positional: Map<string, number>[] = [new Map(), new Map(), new Map(), new Map()];
  all.forEach(({ pattern }) => {
    for (let i = 0; i < 4; i++) {
      const d = pattern[i];
      positional[i].set(d, (positional[i].get(d) || 0) + 1);
    }
  });
  const topPerPos = positional.map((m) =>
    Array.from(m.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3).map((e) => e[0])
  );

  // Build combinations from top digits (3^4 = 81 max)
  const combos: string[] = [];
  for (const a of topPerPos[0])
    for (const b of topPerPos[1])
      for (const c of topPerPos[2])
        for (const d of topPerPos[3]) combos.push(a + b + c + d);

  const map = buildFreq(all);
  return combos
    .map((p) => {
      const v = map.get(p);
      return {
        pattern: p,
        frequency: v?.count || 0,
        percentage: +(((v?.count || 0) / all.length) * 100).toFixed(2),
        lastSeen: v?.lastSeen,
        confidence: confidenceFor(v?.count || 0),
        source: "Positional High-Freq",
      } as L4Prediction;
    })
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, limit);
};

// 4. Mirror mapping - 0↔5, 1↔6, 2↔7, 3↔8, 4↔9
const MIRROR: Record<string, string> = {
  "0": "5", "1": "6", "2": "7", "3": "8", "4": "9",
  "5": "0", "6": "1", "7": "2", "8": "3", "9": "4",
};

export const getMirrorL4Predictions = (limit = 12): L4Prediction[] => {
  const all = getAllLast4();
  const map = buildFreq(all);
  const recent = all.slice(0, 25);
  const seen = new Set<string>();
  const out: L4Prediction[] = [];
  for (const { pattern, date } of recent) {
    const mirrored = pattern.split("").map((d) => MIRROR[d] || d).join("");
    if (seen.has(mirrored)) continue;
    seen.add(mirrored);
    const hist = map.get(mirrored);
    out.push({
      pattern: mirrored,
      frequency: hist?.count || 0,
      percentage: +(((hist?.count || 0) / all.length) * 100).toFixed(2),
      lastSeen: hist?.lastSeen,
      confidence: hist ? confidenceFor(hist.count) : "low",
      source: `Mirror of ${pattern} (${date})`,
    });
    if (out.length >= limit) break;
  }
  return out;
};

// L4 positional digit frequency (for chart)
export const getL4PositionalFrequency = (): L4PositionalFreq[] => {
  const all = getAllLast4();
  const total = all.length;
  return [0, 1, 2, 3].map((pos) => {
    const counts = new Map<string, number>();
    all.forEach(({ pattern }) => {
      const d = pattern[pos];
      counts.set(d, (counts.get(d) || 0) + 1);
    });
    return {
      position: pos + 1,
      digits: Array.from(counts.entries())
        .map(([digit, count]) => ({
          digit,
          count,
          percentage: +((count / total) * 100).toFixed(2),
        }))
        .sort((a, b) => b.count - a.count),
    };
  });
};

export const getL4DatasetStats = () => {
  const all = getAllLast4();
  const map = buildFreq(all);
  const repeats = Array.from(map.values()).filter((v) => v.count > 1).length;
  return {
    total: all.length,
    uniquePatterns: map.size,
    repeatedPatterns: repeats,
  };
};
