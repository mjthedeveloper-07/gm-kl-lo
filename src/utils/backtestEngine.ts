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
  l4HitRateLast365: number; // hit rate over the last 365 evaluated draws (recent form)
  l4HitsLast365: number;
  totalDrawsLast365: number;
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
  combinedTopL4: {
    // Per-draw ensemble: union of top-5 L4 tails from each method.
    // If the actual L4 lands in that union, it counts as an ensemble hit.
    hits: number;
    drawsCounted: number;
    hitRate: number;
    avgUnionSize: number;
  };
  nets: {
    tight: { hits: number; drawsCounted: number; hitRate: number; avgSize: number };
    mid: { hits: number; drawsCounted: number; hitRate: number; avgSize: number };
    wide: { hits: number; drawsCounted: number; hitRate: number; avgSize: number };
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
      // Per-draw L4-hit log for "recent form" computation:
      drawLog: Array<{ ts: number; l4Hit: boolean }>;
    }
  > = {};

  const timeline: TimelinePoint[] = [];

  // Ensemble (combined top-5 L4) tracking
  let ensembleHits = 0;
  let ensembleDraws = 0;
  let ensembleUnionTotal = 0;

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
    const drawTs = parseDate(draw.date);

    const methodsWithL4: string[] = [];
    const methodsWithL3: string[] = [];

    // Build the per-draw ensemble L4 union (top-5 L4 tails per method)
    const ensembleL4: Set<string> = new Set();

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
          drawLog: [],
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

      // Contribute first 5 L4 tails to the ensemble union
      set.numbers.slice(0, 5).forEach(n => ensembleL4.add(last(n, 4)));

      a.drawLog.push({ ts: drawTs, l4Hit: !!l4Match });

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

    // Score the ensemble for this draw
    ensembleDraws += 1;
    ensembleUnionTotal += ensembleL4.size;
    if (ensembleL4.has(actualL4)) ensembleHits += 1;

    timeline.push({
      date: draw.date,
      lottery: draw.lottery,
      methodsWithL4Hit: methodsWithL4,
      methodsWithL3Hit: methodsWithL3,
    });
  }

  const evaluatedDraws = timeline.length;

  // Cutoff for "recent form": last 365 days from the most-recent evaluated draw
  const newestDrawTs = timeline.length > 0 ? parseDate(timeline[timeline.length - 1].date) : 0;
  const cutoffTs = newestDrawTs - 365 * 24 * 60 * 60 * 1000;

  const methodScores: MethodScore[] = Object.entries(accum).map(([method, a]) => {
    const predictionsPerDraw = a.drawsCounted > 0 ? a.predTotal / a.drawsCounted : 0;
    const l4Baseline = baselineHitRate(predictionsPerDraw, 4);
    const l3Baseline = baselineHitRate(predictionsPerDraw, 3);
    const l4HitRate = a.drawsCounted > 0 ? a.l4Hits / a.drawsCounted : 0;
    const l3HitRate = a.drawsCounted > 0 ? a.l3Hits / a.drawsCounted : 0;

    const recentLog = a.drawLog.filter(d => d.ts >= cutoffTs);
    const l4HitsLast365 = recentLog.reduce((s, d) => s + (d.l4Hit ? 1 : 0), 0);
    const totalDrawsLast365 = recentLog.length;
    const l4HitRateLast365 = totalDrawsLast365 > 0 ? l4HitsLast365 / totalDrawsLast365 : 0;

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
      l4HitRateLast365,
      l4HitsLast365,
      totalDrawsLast365,
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
    combinedTopL4: {
      hits: ensembleHits,
      drawsCounted: ensembleDraws,
      hitRate: ensembleDraws > 0 ? ensembleHits / ensembleDraws : 0,
      avgUnionSize: ensembleDraws > 0 ? ensembleUnionTotal / ensembleDraws : 0,
    },
    timeline: timeline.slice(-120),
    topL4Hits,
  };
};
