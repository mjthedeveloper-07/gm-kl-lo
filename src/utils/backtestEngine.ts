import { lotteryHistory, type LotteryResult } from "@/data/lotteryHistory";
import { generateAllPredictionsFor, type PredictionSet } from "@/utils/predictionGenerator";

export interface MethodHit {
  date: string;
  lottery: string;
  actual: string;
  matched: string;
  matchType: "L4" | "L3";
}

export interface MethodScore {
  method: string;
  description: string;
  confidence: "high" | "medium" | "low";
  totalDraws: number;
  predictionsPerDraw: number; // average
  l4Hits: number;
  l3Hits: number;
  l4HitRate: number; // 0..1
  l3HitRate: number;
  l4Baseline: number; // expected hit-rate by chance
  l3Baseline: number;
  liftL4: number; // actual / baseline
  liftL3: number;
  recentHits: MethodHit[]; // last 10
}

export interface TimelinePoint {
  date: string;
  lottery: string;
  methodsWithL4Hit: string[];
  methodsWithL3Hit: string[];
}

export interface BacktestReport {
  windowSize: number;
  evaluatedDraws: number;
  startDate: string;
  endDate: string;
  methodScores: MethodScore[];
  overall: {
    anyMethodL4Hits: number;
    anyMethodL3Hits: number;
    bestMethodForL4: string;
    bestMethodForL3: string;
  };
  timeline: TimelinePoint[]; // most recent ~60
  topL4Hits: Array<MethodHit & { method: string }>; // best recent L4 wins across all methods
}

// Parse "dd.mm.yy" -> sortable timestamp
const parseDate = (d: string): number => {
  const [dd, mm, yy] = d.split(".").map(Number);
  if (!dd || !mm || yy === undefined) return 0;
  const year = yy < 50 ? 2000 + yy : 1900 + yy;
  return new Date(year, mm - 1, dd).getTime();
};

// Sort oldest -> newest (returns a new array, does not mutate)
const sortChrono = (arr: LotteryResult[]): LotteryResult[] =>
  [...arr].sort((a, b) => parseDate(a.date) - parseDate(b.date));

const last = (s: string, n: number) => s.slice(-n);

/**
 * Backtest baseline: probability that AT LEAST ONE of k random predictions
 * matches the actual draw on the last d digits.
 *   P(match) = 1 - (1 - 1/10^d)^k
 */
const baselineHitRate = (predictionsPerDraw: number, digits: number): number => {
  const pSingle = 1 / Math.pow(10, digits);
  return 1 - Math.pow(1 - pSingle, predictionsPerDraw);
};

export const runBacktest = (windowSize: number = Number.POSITIVE_INFINITY): BacktestReport => {
  const sorted = sortChrono(lotteryHistory);
  const evalStartIdx = Math.max(50, sorted.length - windowSize); // need >=50 priors for warm-up

  // Per-method accumulators
  const accum: Record<
    string,
    {
      description: string;
      confidence: "high" | "medium" | "low";
      l4Hits: number;
      l3Hits: number;
      predTotal: number;
      drawsCounted: number;
      hits: MethodHit[]; // every L4 + L3 hit (we'll trim later)
    }
  > = {};

  const timeline: TimelinePoint[] = [];

  for (let i = evalStartIdx; i < sorted.length; i++) {
    const draw = sorted[i];
    const history = sorted.slice(0, i);
    if (history.length < 50) continue;

    let predictionSets: PredictionSet[];
    try {
      predictionSets = generateAllPredictionsFor(history);
    } catch {
      continue;
    }

    const actualL4 = last(draw.result, 4);
    const actualL3 = last(draw.result, 3);

    const methodsWithL4: string[] = [];
    const methodsWithL3: string[] = [];

    for (const set of predictionSets) {
      if (!accum[set.method]) {
        accum[set.method] = {
          description: set.description,
          confidence: set.confidence,
          l4Hits: 0,
          l3Hits: 0,
          predTotal: 0,
          drawsCounted: 0,
          hits: [],
        };
      }
      const a = accum[set.method];
      a.drawsCounted += 1;
      a.predTotal += set.numbers.length;

      let l4Match: string | null = null;
      let l3Match: string | null = null;
      for (const num of set.numbers) {
        if (!l4Match && last(num, 4) === actualL4) l4Match = num;
        if (!l3Match && last(num, 3) === actualL3) l3Match = num;
        if (l4Match && l3Match) break;
      }

      if (l4Match) {
        a.l4Hits += 1;
        methodsWithL4.push(set.method);
        a.hits.push({
          date: draw.date,
          lottery: draw.lottery,
          actual: draw.result,
          matched: l4Match,
          matchType: "L4",
        });
      }
      if (l3Match) {
        a.l3Hits += 1;
        if (!l4Match) {
          methodsWithL3.push(set.method);
          a.hits.push({
            date: draw.date,
            lottery: draw.lottery,
            actual: draw.result,
            matched: l3Match,
            matchType: "L3",
          });
        }
      }
    }

    timeline.push({
      date: draw.date,
      lottery: draw.lottery,
      methodsWithL4Hit: methodsWithL4,
      methodsWithL3Hit: methodsWithL3,
    });
  }

  const evaluatedDraws = timeline.length;

  const methodScores: MethodScore[] = Object.entries(accum).map(([method, a]) => {
    const predictionsPerDraw = a.drawsCounted > 0 ? a.predTotal / a.drawsCounted : 0;
    const l4Baseline = baselineHitRate(predictionsPerDraw, 4);
    const l3Baseline = baselineHitRate(predictionsPerDraw, 3);
    const l4HitRate = a.drawsCounted > 0 ? a.l4Hits / a.drawsCounted : 0;
    const l3HitRate = a.drawsCounted > 0 ? a.l3Hits / a.drawsCounted : 0;
    return {
      method,
      description: a.description,
      confidence: a.confidence,
      totalDraws: a.drawsCounted,
      predictionsPerDraw: Math.round(predictionsPerDraw * 10) / 10,
      l4Hits: a.l4Hits,
      l3Hits: a.l3Hits,
      l4HitRate,
      l3HitRate,
      l4Baseline,
      l3Baseline,
      liftL4: l4Baseline > 0 ? l4HitRate / l4Baseline : 0,
      liftL3: l3Baseline > 0 ? l3HitRate / l3Baseline : 0,
      recentHits: [...a.hits]
        .sort((x, y) => parseDate(y.date) - parseDate(x.date))
        .slice(0, 25),
    };
  });

  // Sort leaderboard by L4 hits desc, then L3 hits
  methodScores.sort((a, b) => b.l4Hits - a.l4Hits || b.l3Hits - a.l3Hits);

  const anyMethodL4Hits = timeline.filter(t => t.methodsWithL4Hit.length > 0).length;
  const anyMethodL3Hits = timeline.filter(t => t.methodsWithL3Hit.length > 0 || t.methodsWithL4Hit.length > 0).length;

  const sortedByL4 = [...methodScores].sort((a, b) => b.l4HitRate - a.l4HitRate);
  const sortedByL3 = [...methodScores].sort((a, b) => b.l3HitRate - a.l3HitRate);

  // Aggregate top L4 hits across all methods (for "Recent wins" highlight)
  const allL4Hits: Array<MethodHit & { method: string }> = [];
  methodScores.forEach(m =>
    m.recentHits
      .filter(h => h.matchType === "L4")
      .forEach(h => allL4Hits.push({ ...h, method: m.method })),
  );
  allL4Hits.sort((a, b) => parseDate(b.date) - parseDate(a.date));
  const topL4Hits = allL4Hits.slice(0, 20);

  return {
    windowSize,
    evaluatedDraws,
    startDate: timeline[0]?.date ?? "",
    endDate: timeline[timeline.length - 1]?.date ?? "",
    methodScores,
    overall: {
      anyMethodL4Hits,
      anyMethodL3Hits,
      bestMethodForL4: sortedByL4[0]?.method ?? "—",
      bestMethodForL3: sortedByL3[0]?.method ?? "—",
    },
    timeline: timeline.slice(-120),
    topL4Hits,
  };
};
