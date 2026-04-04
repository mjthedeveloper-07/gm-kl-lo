import { lotteryHistory, LotteryResult } from "@/data/lotteryHistory";

export interface MethodAccuracy {
  method: string;
  exactL4: number;
  match3: number;
  match2: number;
  match1: number;
  posHitRate: number[];  // per L4 position
  avgPosAccuracy: number;
  totalTested: number;
}

export interface RepeatingPattern {
  pattern: string;
  count: number;
  lastSeen: string;
  avgInterval: number;
}

export interface PositionalStreak {
  position: number;
  digit: string;
  streakLength: number;
  endIndex: number;
}

export interface DayPattern {
  day: string;
  topDigits: { digit: string; pct: number }[];
}

export interface FollowOnPattern {
  ending: string;
  nextL4: { l4: string; count: number }[];
}

export interface PatternInsights {
  repeatingL4: RepeatingPattern[];
  repeatingL3: RepeatingPattern[];
  repeatingL2: RepeatingPattern[];
  longestStreaks: PositionalStreak[];
  dayPatterns: DayPattern[];
  followOns: FollowOnPattern[];
  cycleIntervals: { pattern: string; intervals: number[]; avgCycle: number }[];
}

// Mirror map used in predictions
const mirrorMap: Record<string, string[]> = {
  '0':['0','6','3','7','8'], '1':['1','7','4','3','0'], '2':['2','1','8','7','3'],
  '3':['7','8','2','0','4'], '4':['8','3','4','1','0'], '5':['7','0','5','8','3'],
  '6':['6','8','4','7','2'], '7':['7','2','3','0','9'], '8':['8','3','7','1','4'],
  '9':['9','8','5','4','1']
};

// Replicate the 15 prediction methods from the component, but parameterized by training data
function generatePredictions(trainingResults: string[]): { method: string; l4: string }[] {
  const total = trainingResults.length;
  if (total < 50) return [];

  const l4s = trainingResults.map(r => r.slice(-4));

  // L4 positional freq
  const l4PosFreq: Record<number, Record<string, number>> = {};
  for (let p = 0; p < 4; p++) { l4PosFreq[p] = {}; for (let d = 0; d <= 9; d++) l4PosFreq[p][d.toString()] = 0; }
  l4s.forEach(l => { for (let p = 0; p < 4; p++) l4PosFreq[p][l[p]] = (l4PosFreq[p][l[p]] || 0) + 1; });
  const topL4PerPos = Array.from({ length: 4 }, (_, p) =>
    Object.entries(l4PosFreq[p]).sort((a, b) => b[1] - a[1]).map(([digit, count]) => ({ digit, count }))
  );

  // Overall freq
  const overallFreq: Record<string, number> = {};
  for (let d = 0; d <= 9; d++) overallFreq[d.toString()] = 0;
  trainingResults.forEach(r => { for (const ch of r) overallFreq[ch] = (overallFreq[ch] || 0) + 1; });
  const hotDigits = Object.entries(overallFreq).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([d]) => d);
  const coldDigits = Object.entries(overallFreq).sort((a, b) => a[1] - b[1]).slice(0, 3).map(([d]) => d);

  // Recent periods
  const recent30 = trainingResults.slice(0, 30);
  const recent90 = trainingResults.slice(0, 90);
  const recent180 = trainingResults.slice(0, 180);
  const older = trainingResults.slice(180, 360);

  const calcL4PosFreq = (data: string[]) => {
    const pf: Record<number, Record<string, number>> = {};
    for (let p = 0; p < 4; p++) { pf[p] = {}; for (let d = 0; d <= 9; d++) pf[p][d.toString()] = 0; }
    data.forEach(r => { const l = r.slice(-4); for (let p = 0; p < 4; p++) pf[p][l[p]] = (pf[p][l[p]] || 0) + 1; });
    return Array.from({ length: 4 }, (_, p) => Object.entries(pf[p]).sort((a, b) => b[1] - a[1]));
  };

  const r30L4 = calcL4PosFreq(recent30);
  const r90L4 = calcL4PosFreq(recent90);
  const r180L4 = calcL4PosFreq(recent180);

  // Adjacent L4 pairs
  const adjL4Freq: Record<string, number> = {};
  l4s.forEach(l => { for (let i = 0; i < 3; i++) { const p = l[i]+l[i+1]; adjL4Freq[p] = (adjL4Freq[p] || 0) + 1; } });

  // Top L4 patterns
  const l4Freq: Record<string, number> = {};
  l4s.forEach(l => { l4Freq[l] = (l4Freq[l] || 0) + 1; });
  const topL4 = Object.entries(l4Freq).sort((a, b) => b[1] - a[1]);

  const preds: { method: string; l4: string }[] = [];

  // 1. All-time top
  preds.push({ method: "L4 All-Time Top", l4: topL4PerPos.map(pos => pos[0].digit).join('') });

  // 2. Hot streak 30
  preds.push({ method: "L4 Hot Streak (30)", l4: r30L4.map(pos => pos[0][0]).join('') });

  // 3. Trend 90
  preds.push({ method: "L4 Trend (90)", l4: r90L4.map(pos => pos[0][0]).join('') });

  // 4. Triple consensus
  const l4_4 = Array.from({ length: 4 }, (_, p) => {
    const a = topL4PerPos[p].slice(0, 4).map(t => t.digit);
    const b = r90L4[p].slice(0, 4).map(([d]) => d);
    const c = r30L4[p].slice(0, 4).map(([d]) => d);
    return a.find(d => b.includes(d) && c.includes(d)) || a.find(d => b.includes(d)) || a[0];
  }).join('');
  preds.push({ method: "L4 Triple Consensus", l4: l4_4 });

  // 5. Dual consensus
  const l4_5 = Array.from({ length: 4 }, (_, p) => {
    const allTop3 = topL4PerPos[p].slice(0, 3).map(t => t.digit);
    const recTop3 = r90L4[p].slice(0, 3).map(([d]) => d);
    return allTop3.find(d => recTop3.includes(d)) || allTop3[0];
  }).join('');
  preds.push({ method: "L4 Dual Consensus", l4: l4_5 });

  // 6. Hot blend
  preds.push({ method: "L4 Hot Blend", l4: topL4PerPos.map(pos => {
    const topPos = pos.slice(0, 3).map(p => p.digit);
    return topPos.find(d => hotDigits.includes(d)) || topPos[0];
  }).join('') });

  // 7. Momentum
  const l4_7 = Array.from({ length: 4 }, (_, p) => {
    let bestM = -Infinity, bestD = '0';
    for (let d = 0; d <= 9; d++) {
      const ds = d.toString();
      const rc = recent90.map(r => r.slice(-4)).filter(l => l[p] === ds).length;
      const oc = (older.map(r => r.slice(-4)).filter(l => l[p] === ds).length) || 1;
      if (rc / oc > bestM) { bestM = rc / oc; bestD = ds; }
    }
    return bestD;
  }).join('');
  preds.push({ method: "L4 Momentum", l4: l4_7 });

  // 8. Pair-chain
  const l4_8d = [topL4PerPos[0][0].digit];
  for (let i = 1; i < 4; i++) {
    const prev = l4_8d[i-1];
    const best = Object.entries(adjL4Freq).filter(([p]) => p[0]===prev).sort((a,b)=>b[1]-a[1]);
    l4_8d.push(best.length > 0 ? best[0][0][1] : topL4PerPos[i][0].digit);
  }
  preds.push({ method: "L4 Pair-Chain", l4: l4_8d.join('') });

  // 9. Top pattern
  preds.push({ method: "L4 Top Pattern", l4: topL4.length > 0 ? topL4[0][0] : '0000' });

  // 10. Anti-cold
  preds.push({ method: "L4 Anti-Cold", l4: topL4PerPos.map(pos => {
    const nc = pos.find(p => !coldDigits.includes(p.digit));
    return nc ? nc.digit : pos[0].digit;
  }).join('') });

  // 11. Mirror hybrid
  preds.push({ method: "L4 Mirror Hybrid", l4: topL4PerPos.map(pos => {
    const topD = pos[0].digit;
    const mirrors = mirrorMap[topD] || [topD];
    const best = mirrors.reduce((b, d) => {
      const freq = pos.find(p => p.digit === d);
      return freq && freq.count > (b.count || 0) ? { digit: d, count: freq.count } : b;
    }, { digit: mirrors[0], count: 0 });
    return best.digit;
  }).join('') });

  // 12. Half-year
  preds.push({ method: "L4 Half-Year (180)", l4: r180L4.map(pos => pos[0][0]).join('') });

  // 13. Weighted
  preds.push({ method: "L4 Weighted", l4: topL4PerPos.map(pos => {
    const w = pos.slice(0, 3);
    const t = w.reduce((s, x) => s + x.count, 0);
    let pick = Math.floor(t * 0.35);
    for (const x of w) { pick -= x.count; if (pick <= 0) return x.digit; }
    return w[0].digit;
  }).join('') });

  // 14. Alternating
  preds.push({ method: "L4 Alternating", l4: topL4PerPos.map((pos, i) => i % 2 === 0 ? pos[0].digit : pos[1].digit).join('') });

  // 15. Delta
  const l4_15 = Array.from({ length: 4 }, (_, p) => {
    const deltas: Record<string, number> = {};
    for (let i = 0; i < Math.min(100, trainingResults.length - 1); i++) {
      const cur = parseInt(trainingResults[i].slice(-4)[p]);
      const prev = parseInt(trainingResults[i+1].slice(-4)[p]);
      const delta = ((cur - prev + 10) % 10).toString();
      deltas[delta] = (deltas[delta] || 0) + 1;
    }
    const topDelta = Object.entries(deltas).sort((a, b) => b[1] - a[1])[0]?.[0] || '0';
    const lastDigit = parseInt(trainingResults[0].slice(-4)[p]);
    return ((lastDigit + parseInt(topDelta)) % 10).toString();
  }).join('');
  preds.push({ method: "L4 Delta Predict", l4: l4_15 });

  return preds;
}

function compareL4(predicted: string, actual: string): { exact: boolean; match3: boolean; match2: boolean; match1: boolean; posHits: boolean[] } {
  const posHits = [0,1,2,3].map(i => predicted[i] === actual[i]);
  const matchCount = posHits.filter(Boolean).length;
  return {
    exact: matchCount === 4,
    match3: matchCount >= 3,
    match2: matchCount >= 2,
    match1: matchCount >= 1,
    posHits
  };
}

export function runBacktest(sampleSize = 500): MethodAccuracy[] {
  const allEntries = lotteryHistory.filter(r => r.lotteryType !== "bumper");
  const results = allEntries.map(r => r.result).filter(r => r.length === 6 && /^\d{6}$/.test(r));
  
  // We test from index 0 (most recent) back, using everything after index i as training
  const startIdx = 0;
  const endIdx = Math.min(sampleSize, results.length - 200); // need 200+ training results
  
  const methodStats: Record<string, { exactL4: number; match3: number; match2: number; match1: number; posHits: number[]; total: number }> = {};

  for (let i = startIdx; i < endIdx; i++) {
    const actualL4 = results[i].slice(-4);
    const training = results.slice(i + 1); // all results after this one (older)
    
    const preds = generatePredictions(training);
    
    for (const pred of preds) {
      if (!methodStats[pred.method]) {
        methodStats[pred.method] = { exactL4: 0, match3: 0, match2: 0, match1: 0, posHits: [0,0,0,0], total: 0 };
      }
      const s = methodStats[pred.method];
      const cmp = compareL4(pred.l4, actualL4);
      s.total++;
      if (cmp.exact) s.exactL4++;
      if (cmp.match3) s.match3++;
      if (cmp.match2) s.match2++;
      if (cmp.match1) s.match1++;
      cmp.posHits.forEach((h, p) => { if (h) s.posHits[p]++; });
    }
  }

  return Object.entries(methodStats).map(([method, s]) => ({
    method,
    exactL4: +(s.exactL4 / s.total * 100).toFixed(2),
    match3: +(s.match3 / s.total * 100).toFixed(2),
    match2: +(s.match2 / s.total * 100).toFixed(2),
    match1: +(s.match1 / s.total * 100).toFixed(2),
    posHitRate: s.posHits.map(h => +(h / s.total * 100).toFixed(1)),
    avgPosAccuracy: +(s.posHits.reduce((a,b)=>a+b,0) / s.total / 4 * 100).toFixed(1),
    totalTested: s.total
  })).sort((a, b) => b.match2 - a.match2);
}

export function discoverPatterns(): PatternInsights {
  const allEntries = lotteryHistory.filter(r => r.lotteryType !== "bumper");
  const results = allEntries.filter(r => r.result.length === 6 && /^\d{6}$/.test(r.result));

  // Repeating L4, L3, L2
  const countPatterns = (extractor: (r: string) => string, minCount: number, topN: number): RepeatingPattern[] => {
    const freq: Record<string, { count: number; indices: number[] }> = {};
    results.forEach((r, i) => {
      const p = extractor(r.result);
      if (!freq[p]) freq[p] = { count: 0, indices: [] };
      freq[p].count++;
      freq[p].indices.push(i);
    });
    return Object.entries(freq)
      .filter(([, v]) => v.count >= minCount)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, topN)
      .map(([pattern, v]) => {
        const intervals = v.indices.slice(0, -1).map((idx, i) => v.indices[i + 1] - idx);
        return {
          pattern,
          count: v.count,
          lastSeen: results[v.indices[0]]?.date || '',
          avgInterval: intervals.length > 0 ? +(intervals.reduce((a,b)=>a+b,0) / intervals.length).toFixed(1) : 0
        };
      });
  };

  const repeatingL4 = countPatterns(r => r.slice(-4), 2, 15);
  const repeatingL3 = countPatterns(r => r.slice(-3), 3, 15);
  const repeatingL2 = countPatterns(r => r.slice(-2), 5, 15);

  // Positional streaks
  const longestStreaks: PositionalStreak[] = [];
  for (let pos = 2; pos < 6; pos++) {
    let maxStreak = 0, maxDigit = '', maxEnd = 0;
    let curStreak = 1, curDigit = results[0]?.result[pos] || '';
    for (let i = 1; i < results.length; i++) {
      if (results[i].result[pos] === curDigit) {
        curStreak++;
      } else {
        if (curStreak > maxStreak) { maxStreak = curStreak; maxDigit = curDigit; maxEnd = i - curStreak; }
        curDigit = results[i].result[pos];
        curStreak = 1;
      }
    }
    if (curStreak > maxStreak) { maxStreak = curStreak; maxDigit = curDigit; maxEnd = results.length - curStreak; }
    longestStreaks.push({ position: pos, digit: maxDigit, streakLength: maxStreak, endIndex: maxEnd });
  }

  // Day-of-week patterns
  const dayGroups: Record<string, string[]> = {};
  results.forEach(r => {
    const day = r.day || 'Unknown';
    if (!dayGroups[day]) dayGroups[day] = [];
    dayGroups[day].push(r.result);
  });
  const dayPatterns: DayPattern[] = Object.entries(dayGroups).map(([day, rr]) => {
    const digitCount: Record<string, number> = {};
    for (let d = 0; d <= 9; d++) digitCount[d.toString()] = 0;
    rr.forEach(r => { for (const ch of r.slice(-4)) digitCount[ch] = (digitCount[ch] || 0) + 1; });
    const total = rr.length * 4;
    const topDigits = Object.entries(digitCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([digit, count]) => ({ digit, pct: +(count / total * 100).toFixed(1) }));
    return { day, topDigits };
  }).sort((a, b) => a.day.localeCompare(b.day));

  // Follow-on patterns (last 2 digits → next L4)
  const followOns: Record<string, Record<string, number>> = {};
  for (let i = 0; i < results.length - 1; i++) {
    const ending = results[i].result.slice(-2);
    const nextL4 = results[i + 1].result.slice(-4);
    if (!followOns[ending]) followOns[ending] = {};
    followOns[ending][nextL4] = (followOns[ending][nextL4] || 0) + 1;
  }
  const followOnPatterns: FollowOnPattern[] = Object.entries(followOns)
    .map(([ending, nexts]) => ({
      ending,
      nextL4: Object.entries(nexts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([l4, count]) => ({ l4, count }))
    }))
    .sort((a, b) => b.nextL4[0]?.count - a.nextL4[0]?.count)
    .slice(0, 10);

  // Cycle intervals for top L4
  const cycleIntervals = repeatingL4.slice(0, 8).map(rp => {
    const indices: number[] = [];
    results.forEach((r, i) => { if (r.result.slice(-4) === rp.pattern) indices.push(i); });
    const intervals = indices.slice(0, -1).map((idx, i) => indices[i + 1] - idx);
    return { pattern: rp.pattern, intervals, avgCycle: rp.avgInterval };
  });

  return { repeatingL4, repeatingL3, repeatingL2, longestStreaks, dayPatterns, followOns: followOnPatterns, cycleIntervals };
}
