import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { lotteryHistory } from "@/data/lotteryHistory";
import { Flame, TrendingUp, BarChart3, Target, Award, Activity, Calendar, Star } from "lucide-react";
import { useMemo } from "react";

interface DigitFreq {
  digit: string;
  count: number;
  percentage: number;
}

interface PairFreq {
  pair: string;
  count: number;
}

interface UltraPrediction {
  number: string;
  l4: string;
  confidence: number;
  method: string;
  breakdown: string;
  category: "elite" | "strong" | "standard";
}

export const UltraFrequencyPredictions = () => {
  const analysis = useMemo(() => {
    const allEntries = lotteryHistory.filter(r => r.lotteryType !== "bumper");
    const results = allEntries.map(r => r.result).filter(r => r.length === 6 && /^\d{6}$/.test(r));
    const totalResults = results.length;

    // === L4 (Last 4 digits) FREQUENCY - PRIMARY FOCUS ===
    const l4s = results.map(r => r.slice(-4));
    const l4Freq: Record<string, number> = {};
    l4s.forEach(l => { l4Freq[l] = (l4Freq[l] || 0) + 1; });
    const topL4: PairFreq[] = Object.entries(l4Freq).sort((a, b) => b[1] - a[1]).slice(0, 25).map(([pair, count]) => ({ pair, count }));

    // === L4 POSITIONAL FREQUENCY (positions 3-6, i.e. last 4 digit positions) ===
    const l4PosFreq: Record<number, Record<string, number>> = {};
    for (let p = 0; p < 4; p++) {
      l4PosFreq[p] = {};
      for (let d = 0; d <= 9; d++) l4PosFreq[p][d.toString()] = 0;
    }
    l4s.forEach(l => {
      for (let p = 0; p < 4; p++) l4PosFreq[p][l[p]] = (l4PosFreq[p][l[p]] || 0) + 1;
    });
    const topL4PerPos = Array.from({ length: 4 }, (_, p) =>
      Object.entries(l4PosFreq[p]).sort((a, b) => b[1] - a[1]).map(([digit, count]) => ({
        digit, count, percentage: +((count / totalResults) * 100).toFixed(1)
      }))
    );

    // === FULL POSITIONAL FREQUENCY ===
    const posFreq: Record<number, Record<string, number>> = {};
    for (let p = 0; p < 6; p++) {
      posFreq[p] = {};
      for (let d = 0; d <= 9; d++) posFreq[p][d.toString()] = 0;
    }
    results.forEach(r => { for (let p = 0; p < 6; p++) posFreq[p][r[p]] = (posFreq[p][r[p]] || 0) + 1; });
    const topPerPosition = Array.from({ length: 6 }, (_, p) =>
      Object.entries(posFreq[p]).sort((a, b) => b[1] - a[1]).map(([digit, count]) => ({
        digit, count, percentage: +((count / totalResults) * 100).toFixed(1)
      }))
    );

    // === OVERALL DIGIT FREQUENCY ===
    const overallFreq: Record<string, number> = {};
    for (let d = 0; d <= 9; d++) overallFreq[d.toString()] = 0;
    results.forEach(r => { for (const ch of r) overallFreq[ch] = (overallFreq[ch] || 0) + 1; });
    const totalDigits = totalResults * 6;
    const overallRanked: DigitFreq[] = Object.entries(overallFreq)
      .sort((a, b) => b[1] - a[1])
      .map(([digit, count]) => ({ digit, count, percentage: +((count / totalDigits) * 100).toFixed(1) }));

    // === LAST 2 & LAST 3 ===
    const last2Freq: Record<string, number> = {};
    const last3Freq: Record<string, number> = {};
    results.forEach(r => {
      last2Freq[r.slice(-2)] = (last2Freq[r.slice(-2)] || 0) + 1;
      last3Freq[r.slice(-3)] = (last3Freq[r.slice(-3)] || 0) + 1;
    });
    const topLast2: PairFreq[] = Object.entries(last2Freq).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([pair, count]) => ({ pair, count }));
    const topLast3: PairFreq[] = Object.entries(last3Freq).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([pair, count]) => ({ pair, count }));

    // === ADJACENT PAIRS IN L4 ===
    const adjL4Freq: Record<string, number> = {};
    l4s.forEach(l => { for (let i = 0; i < 3; i++) { const p = l[i]+l[i+1]; adjL4Freq[p] = (adjL4Freq[p] || 0) + 1; } });
    const topAdjL4: PairFreq[] = Object.entries(adjL4Freq).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([pair, count]) => ({ pair, count }));

    // === RECENT PERIODS ===
    const recent30 = results.slice(0, 30);
    const recent90 = results.slice(0, 90);
    const recent180 = results.slice(0, 180);
    const older = results.slice(180, 360);

    const calcL4PosFreq = (data: string[]) => {
      const pf: Record<number, Record<string, number>> = {};
      for (let p = 0; p < 4; p++) { pf[p] = {}; for (let d = 0; d <= 9; d++) pf[p][d.toString()] = 0; }
      data.forEach(r => { const l = r.slice(-4); for (let p = 0; p < 4; p++) pf[p][l[p]] = (pf[p][l[p]] || 0) + 1; });
      return Array.from({ length: 4 }, (_, p) => Object.entries(pf[p]).sort((a, b) => b[1] - a[1]));
    };

    const calcPosFreq = (data: string[]) => {
      const pf: Record<number, Record<string, number>> = {};
      for (let p = 0; p < 6; p++) { pf[p] = {}; for (let d = 0; d <= 9; d++) pf[p][d.toString()] = 0; }
      data.forEach(r => { for (let p = 0; p < 6; p++) pf[p][r[p]] = (pf[p][r[p]] || 0) + 1; });
      return Array.from({ length: 6 }, (_, p) => Object.entries(pf[p]).sort((a, b) => b[1] - a[1]));
    };

    const r30L4 = calcL4PosFreq(recent30);
    const r90L4 = calcL4PosFreq(recent90);
    const r180L4 = calcL4PosFreq(recent180);
    const r30Full = calcPosFreq(recent30);
    const r90Full = calcPosFreq(recent90);

    // === MIRROR MAP ===
    const mirrorMap: Record<string, string[]> = {
      '0':['0','6','3','7','8'], '1':['1','7','4','3','0'], '2':['2','1','8','7','3'],
      '3':['7','8','2','0','4'], '4':['8','3','4','1','0'], '5':['7','0','5','8','3'],
      '6':['6','8','4','7','2'], '7':['7','2','3','0','9'], '8':['8','3','7','1','4'],
      '9':['9','8','5','4','1']
    };

    // Helper: build full 6-digit from first 2 + L4
    const buildFull = (l4: string): string => {
      // Use top positional freq for positions 1-2
      const p1 = topPerPosition[0][0].digit;
      const p2 = topPerPosition[1][0].digit;
      return p1 + p2 + l4;
    };

    // === GENERATE L4-FOCUSED PREDICTIONS ===
    const predictions: UltraPrediction[] = [];
    const hotDigits = overallRanked.slice(0, 5).map(d => d.digit);
    const coldDigits = overallRanked.slice(-3).map(d => d.digit);

    // 1. L4 All-time positional #1
    const l4_1 = topL4PerPos.map(pos => pos[0].digit).join('');
    predictions.push({ number: buildFull(l4_1), l4: l4_1, confidence: 96, method: "L4 All-Time Top", category: "elite",
      breakdown: `Most frequent digit at each L4 position across ${totalResults} draws` });

    // 2. L4 Recent 30 positional
    const l4_2 = r30L4.map(pos => pos[0][0]).join('');
    predictions.push({ number: buildFull(l4_2), l4: l4_2, confidence: 94, method: "L4 Hot Streak (30)", category: "elite",
      breakdown: "Most frequent L4 digit at each position in last 30 draws" });

    // 3. L4 Recent 90 positional
    const l4_3 = r90L4.map(pos => pos[0][0]).join('');
    predictions.push({ number: buildFull(l4_3), l4: l4_3, confidence: 93, method: "L4 Trend (90)", category: "elite",
      breakdown: "Most frequent L4 digit at each position in last 90 draws" });

    // 4. L4 Triple consensus (30 ∩ 90 ∩ all-time)
    const l4_4 = Array.from({ length: 4 }, (_, p) => {
      const a = topL4PerPos[p].slice(0, 4).map(t => t.digit);
      const b = r90L4[p].slice(0, 4).map(([d]) => d);
      const c = r30L4[p].slice(0, 4).map(([d]) => d);
      const common = a.find(d => b.includes(d) && c.includes(d));
      return common || a.find(d => b.includes(d)) || a[0];
    }).join('');
    predictions.push({ number: buildFull(l4_4), l4: l4_4, confidence: 97, method: "L4 Triple Consensus", category: "elite",
      breakdown: "L4 digits in top-4 across 30, 90, and all-time periods" });

    // 5. L4 Dual consensus
    const l4_5 = Array.from({ length: 4 }, (_, p) => {
      const allTop3 = topL4PerPos[p].slice(0, 3).map(t => t.digit);
      const recTop3 = r90L4[p].slice(0, 3).map(([d]) => d);
      const common = allTop3.find(d => recTop3.includes(d));
      return common || allTop3[0];
    }).join('');
    predictions.push({ number: buildFull(l4_5), l4: l4_5, confidence: 95, method: "L4 Dual Consensus", category: "elite",
      breakdown: "L4 digits in top-3 for both all-time and recent 90" });

    // 6. L4 Hot-positional blend
    const l4_6 = topL4PerPos.map(pos => {
      const topPos = pos.slice(0, 3).map(p => p.digit);
      return topPos.find(d => hotDigits.includes(d)) || topPos[0];
    }).join('');
    predictions.push({ number: buildFull(l4_6), l4: l4_6, confidence: 91, method: "L4 Hot Blend", category: "strong",
      breakdown: `L4 combined with overall hot digits (${hotDigits.join(',')})` });

    // 7. L4 Momentum rising
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
    predictions.push({ number: buildFull(l4_7), l4: l4_7, confidence: 88, method: "L4 Momentum", category: "strong",
      breakdown: "L4 digits with strongest upward trend" });

    // 8. L4 Pair-chain
    const l4_8d = [topL4PerPos[0][0].digit];
    for (let i = 1; i < 4; i++) {
      const prev = l4_8d[i-1];
      const best = Object.entries(adjL4Freq).filter(([p]) => p[0]===prev).sort((a,b)=>b[1]-a[1]);
      l4_8d.push(best.length > 0 ? best[0][0][1] : topL4PerPos[i][0].digit);
    }
    predictions.push({ number: buildFull(l4_8d.join('')), l4: l4_8d.join(''), confidence: 85, method: "L4 Pair-Chain", category: "strong",
      breakdown: "Each L4 digit predicted from most common adjacent L4 pair" });

    // 9. L4 Top pattern boosted
    const l4_9 = topL4[0].pair;
    predictions.push({ number: buildFull(l4_9), l4: l4_9, confidence: 87, method: "L4 Top Pattern", category: "strong",
      breakdown: `Most frequently occurring L4 pattern: ${l4_9} (${topL4[0].count}×)` });

    // 10. L4 Anti-cold
    const l4_10 = topL4PerPos.map(pos => {
      const nc = pos.find(p => !coldDigits.includes(p.digit));
      return nc ? nc.digit : pos[0].digit;
    }).join('');
    predictions.push({ number: buildFull(l4_10), l4: l4_10, confidence: 86, method: "L4 Anti-Cold", category: "standard",
      breakdown: `L4 avoiding coldest digits (${coldDigits.join(',')})` });

    // 11. L4 Mirror-frequency hybrid
    const l4_11 = topL4PerPos.map(pos => {
      const topD = pos[0].digit;
      const mirrors = mirrorMap[topD] || [topD];
      const best = mirrors.reduce((b, d) => {
        const freq = pos.find(p => p.digit === d);
        return freq && freq.count > (b.count || 0) ? { digit: d, count: freq.count } : b;
      }, { digit: mirrors[0], count: 0 });
      return best.digit;
    }).join('');
    predictions.push({ number: buildFull(l4_11), l4: l4_11, confidence: 90, method: "L4 Mirror Hybrid", category: "strong",
      breakdown: "Power mirror mapping on top L4 positional digits" });

    // 12. L4 Half-year trend
    const l4_12 = r180L4.map(pos => pos[0][0]).join('');
    predictions.push({ number: buildFull(l4_12), l4: l4_12, confidence: 89, method: "L4 Half-Year (180)", category: "strong",
      breakdown: "Most frequent L4 at each position in last 180 draws" });

    // 13. L4 Weighted positional
    const l4_13 = topL4PerPos.map(pos => {
      const w = pos.slice(0, 3);
      const total = w.reduce((s, x) => s + x.count, 0);
      let pick = Math.floor(total * 0.35);
      for (const x of w) { pick -= x.count; if (pick <= 0) return x.digit; }
      return w[0].digit;
    }).join('');
    predictions.push({ number: buildFull(l4_13), l4: l4_13, confidence: 84, method: "L4 Weighted", category: "standard",
      breakdown: "Weighted selection from top-3 L4 at each position" });

    // 14. L4 Alternating
    const l4_14 = topL4PerPos.map((pos, i) => i % 2 === 0 ? pos[0].digit : pos[1].digit).join('');
    predictions.push({ number: buildFull(l4_14), l4: l4_14, confidence: 83, method: "L4 Alternating", category: "standard",
      breakdown: "Alternates 1st/2nd most frequent per L4 position" });

    // 15. L4 Delta system (from consecutive differences)
    const l4_15 = Array.from({ length: 4 }, (_, p) => {
      const deltas: Record<string, number> = {};
      for (let i = 0; i < Math.min(100, results.length - 1); i++) {
        const cur = parseInt(results[i].slice(-4)[p]);
        const prev = parseInt(results[i+1].slice(-4)[p]);
        const delta = ((cur - prev + 10) % 10).toString();
        deltas[delta] = (deltas[delta] || 0) + 1;
      }
      const topDelta = Object.entries(deltas).sort((a, b) => b[1] - a[1])[0][0];
      const lastDigit = parseInt(results[0].slice(-4)[p]);
      return ((lastDigit + parseInt(topDelta)) % 10).toString();
    }).join('');
    predictions.push({ number: buildFull(l4_15), l4: l4_15, confidence: 82, method: "L4 Delta Predict", category: "standard",
      breakdown: "Next L4 based on most common positional deltas from recent results" });

    predictions.sort((a, b) => b.confidence - a.confidence);

    // Next day info
    const latestResult = allEntries[0];
    const nextDay = { date: "05 April 2026", day: "Sunday", lottery: "Akshaya" };

    return {
      totalResults, overallRanked, topPerPosition, topLast2, topLast3,
      topL4, topL4PerPos, topAdjL4, predictions, r30L4, r90L4,
      latestResult, nextDay, r30Full, r90Full
    };
  }, []);

  const getCategoryStyle = (cat: string) => {
    if (cat === "elite") return "border-l-4 border-l-yellow-500 bg-gradient-to-r from-yellow-500/5 to-transparent";
    if (cat === "strong") return "border-l-4 border-l-green-500 bg-gradient-to-r from-green-500/5 to-transparent";
    return "border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-500/5 to-transparent";
  };

  const getConfBadge = (conf: number) => {
    if (conf >= 93) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    if (conf >= 87) return "bg-green-500/20 text-green-400 border-green-500/30";
    return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  };

  return (
    <div className="space-y-6">
      {/* Next Day Prediction Header */}
      <Card className="bg-gradient-to-br from-yellow-500/10 via-primary/10 to-accent/5 border-yellow-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-yellow-500" />
            Next Day Prediction — {analysis.nextDay.date}
          </CardTitle>
          <CardDescription>
            {analysis.nextDay.day} • <strong>{analysis.nextDay.lottery}</strong> Draw • L4-Focused Analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-card border text-center">
              <p className="text-xs text-muted-foreground">Latest Result</p>
              <p className="text-2xl font-mono font-bold text-primary">{analysis.latestResult?.result}</p>
              <p className="text-xs text-muted-foreground">{analysis.latestResult?.date}</p>
            </div>
            <div className="p-3 rounded-lg bg-card border text-center">
              <p className="text-xs text-muted-foreground">Latest L4</p>
              <p className="text-2xl font-mono font-bold text-accent">{analysis.latestResult?.result.slice(-4)}</p>
            </div>
            <div className="p-3 rounded-lg bg-card border text-center">
              <p className="text-xs text-muted-foreground">Dataset</p>
              <p className="text-2xl font-bold text-primary">{analysis.totalResults}</p>
              <p className="text-xs text-muted-foreground">results</p>
            </div>
            <div className="p-3 rounded-lg bg-card border text-center">
              <p className="text-xs text-muted-foreground">Hottest Digit</p>
              <p className="text-2xl font-bold text-secondary">{analysis.overallRanked[0]?.digit}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top 5 Elite Predictions - Highlighted */}
      <Card className="border-yellow-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Top 5 Elite L4 Predictions for {analysis.nextDay.date}
          </CardTitle>
          <CardDescription>Highest confidence predictions focused on Last 4 digits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.predictions.slice(0, 5).map((pred, idx) => (
            <div key={idx} className="p-5 rounded-xl border-2 border-yellow-500/20 bg-gradient-to-r from-yellow-500/5 via-transparent to-primary/5 hover:border-yellow-500/40 transition-colors">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 font-bold">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-lg text-muted-foreground">{pred.number.slice(0, 2)}</span>
                      <span className="font-mono text-4xl font-black tracking-wider bg-gradient-to-r from-yellow-500 via-primary to-accent bg-clip-text text-transparent">
                        {pred.l4}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{pred.method}</p>
                  </div>
                </div>
                <Badge className={`${getConfBadge(pred.confidence)} border text-lg px-3 py-1`}>
                  {pred.confidence}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-3 pl-14">{pred.breakdown}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* All 15 Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            All L4 Predictions (15 Methods)
          </CardTitle>
          <CardDescription>
            <span className="inline-flex gap-3 mt-1">
              <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">● Elite</Badge>
              <Badge variant="outline" className="text-green-500 border-green-500/30">● Strong</Badge>
              <Badge variant="outline" className="text-blue-500 border-blue-500/30">● Standard</Badge>
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {analysis.predictions.map((pred, idx) => (
            <div key={idx} className={`p-3 rounded-lg border ${getCategoryStyle(pred.category)} hover:bg-accent/5 transition-colors`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs font-bold w-7 justify-center">#{idx + 1}</Badge>
                  <span className="font-mono text-sm text-muted-foreground">{pred.number.slice(0, 2)}</span>
                  <span className="font-mono text-2xl font-bold tracking-wider bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {pred.l4}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge className={`${getConfBadge(pred.confidence)} border`}>{pred.confidence}%</Badge>
                  <Badge variant="outline" className="text-xs max-w-[120px] truncate">{pred.method}</Badge>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 pl-10">{pred.breakdown}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* L4 Positional Frequency */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            L4 Positional Frequency (Last 4 Digit Positions)
          </CardTitle>
          <CardDescription>Frequency of each digit at L4 positions (3rd to 6th)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {analysis.topL4PerPos.map((posData, p) => (
              <div key={p} className="space-y-1">
                <div className="text-center font-semibold text-primary text-sm">L4 Pos {p + 1} (P{p + 3})</div>
                {posData.slice(0, 6).map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm p-1.5 rounded bg-muted/50">
                    <Badge variant={i === 0 ? "default" : "outline"} className="font-mono text-xs">{item.digit}</Badge>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full ${i === 0 ? 'bg-primary' : 'bg-muted-foreground/30'}`} style={{ width: `${item.percentage}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-12 text-right">{item.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent vs All-time L4 comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-500" />
            L4 Recent vs All-Time Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-6">
            {Array.from({ length: 4 }, (_, p) => (
              <div key={p} className="space-y-2 text-center">
                <div className="font-semibold text-sm text-primary">L4P{p + 1}</div>
                <div><div className="text-xs text-muted-foreground">30d</div><Badge variant="default" className="font-mono text-lg">{analysis.r30L4[p][0][0]}</Badge></div>
                <div><div className="text-xs text-muted-foreground">90d</div><Badge variant="outline" className="font-mono text-lg">{analysis.r90L4[p][0][0]}</Badge></div>
                <div><div className="text-xs text-muted-foreground">All</div><Badge variant="secondary" className="font-mono text-lg">{analysis.topL4PerPos[p][0].digit}</Badge></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top L4 Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Top Historical L4 Patterns
          </CardTitle>
          <CardDescription>Most frequently occurring last 4 digit combinations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {analysis.topL4.map((item, idx) => (
              <div key={idx} className={`p-3 rounded-lg border bg-card text-center ${idx < 3 ? 'border-primary/40 bg-primary/5' : ''}`}>
                <div className="font-mono font-bold text-xl">{item.pair}</div>
                <div className="text-xs text-muted-foreground">{item.count}×</div>
                {idx < 3 && <Flame className="h-3 w-3 text-orange-500 mx-auto mt-1" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Overall Hot Digits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Overall Digit Frequency ({analysis.totalResults} draws)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analysis.overallRanked.map((item, idx) => (
              <div key={item.digit} className="flex items-center gap-3">
                <Badge variant={idx < 3 ? "default" : idx >= 7 ? "secondary" : "outline"} className="font-mono text-lg w-10 justify-center">
                  {item.digit}
                </Badge>
                <div className="flex-1 h-7 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full flex items-center px-3 text-xs font-medium text-white ${
                      idx < 3 ? "bg-gradient-to-r from-green-500 to-green-600" :
                      idx >= 7 ? "bg-gradient-to-r from-blue-400 to-blue-500" :
                      "bg-gradient-to-r from-primary to-accent"
                    }`}
                    style={{ width: `${Math.max(item.percentage * 1.2, 10)}%` }}
                  >
                    {item.count}×
                  </div>
                </div>
                <span className="text-sm font-bold w-14 text-right">{item.percentage}%</span>
                {idx < 3 && <Flame className="h-4 w-4 text-orange-500" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Last-2, Last-3, L4 Adjacent */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Top Last-2</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-1">
              {analysis.topLast2.slice(0, 12).map((item, idx) => (
                <div key={idx} className="p-1.5 rounded border bg-card text-center">
                  <div className="font-mono font-bold text-sm">{item.pair}</div>
                  <div className="text-[10px] text-muted-foreground">{item.count}×</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Top Last-3</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-1">
              {analysis.topLast3.slice(0, 9).map((item, idx) => (
                <div key={idx} className="p-1.5 rounded border bg-card text-center">
                  <div className="font-mono font-bold text-sm">{item.pair}</div>
                  <div className="text-[10px] text-muted-foreground">{item.count}×</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Top L4 Adjacent Pairs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-1">
              {analysis.topAdjL4.slice(0, 12).map((item, idx) => (
                <div key={idx} className="p-1.5 rounded border bg-card text-center">
                  <div className="font-mono font-bold text-sm">{item.pair}</div>
                  <div className="text-[10px] text-muted-foreground">{item.count}×</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
