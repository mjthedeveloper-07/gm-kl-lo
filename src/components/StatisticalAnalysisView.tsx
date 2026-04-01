import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { analyzeHistoricalData } from "@/utils/predictionGenerator";
import { getYearRange, lotteryHistory, getBumperResults, getRegularResults } from "@/data/lotteryHistory";
import { TrendingUp, TrendingDown, BarChart3, Database, Calendar, Flame } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DigitFrequencyChart = ({ analysis, label }: { analysis: ReturnType<typeof analyzeHistoricalData>; label: string }) => (
  <div className="space-y-3">
    {analysis.topFrequentDigits.map((item, index) => {
      const isHot = index < 3;
      const isCold = index >= 7;
      return (
        <div key={item.digit} className="flex items-center gap-4">
          <div className="w-8 text-center">
            <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
          </div>
          <Badge variant={isHot ? "default" : isCold ? "secondary" : "outline"} className="font-mono text-xl w-12 justify-center">
            {item.digit}
          </Badge>
          <div className="flex-1">
            <div className="h-8 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full flex items-center px-3 text-xs font-medium text-white transition-all ${
                  isHot ? "bg-gradient-to-r from-green-500 to-green-600" :
                  isCold ? "bg-gradient-to-r from-blue-400 to-blue-500" :
                  "bg-gradient-to-r from-primary to-accent"
                }`}
                style={{ width: `${Math.max(item.percentage * 1.5, 15)}%` }}
              >
                {item.count} occurrences
              </div>
            </div>
          </div>
          <div className="w-16 text-right">
            <span className="text-lg font-bold">{item.percentage}%</span>
          </div>
          {isHot && <TrendingUp className="h-5 w-5 text-green-500" />}
          {isCold && <TrendingDown className="h-5 w-5 text-blue-500" />}
        </div>
      );
    })}
  </div>
);

const KeyFindings = ({ analysis, totalResults }: { analysis: ReturnType<typeof analyzeHistoricalData>; totalResults: number }) => (
  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
      <p className="text-sm text-muted-foreground mb-1">Most Frequent Digits</p>
      <div className="flex gap-2 flex-wrap">
        {analysis.topFrequentDigits.slice(0, 3).map(d => (
          <Badge key={d.digit} variant="default" className="text-lg font-mono">
            {d.digit} <span className="text-xs ml-1">({d.percentage}%)</span>
          </Badge>
        ))}
      </div>
    </div>
    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
      <p className="text-sm text-muted-foreground mb-1">Least Frequent Digits</p>
      <div className="flex gap-2 flex-wrap">
        {analysis.leastFrequentDigits.slice(0, 3).map(d => (
          <Badge key={d.digit} variant="outline" className="text-lg font-mono">
            {d.digit} <span className="text-xs ml-1">({d.percentage}%)</span>
          </Badge>
        ))}
      </div>
    </div>
    <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
      <p className="text-sm text-muted-foreground mb-1">Most Common Start</p>
      <Badge variant="default" className="text-3xl font-mono px-4 py-2">
        {analysis.mostCommonStartDigit}
      </Badge>
    </div>
    <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
      <p className="text-sm text-muted-foreground mb-1">Most Common End</p>
      <Badge variant="default" className="text-3xl font-mono px-4 py-2">
        {analysis.mostCommonEndDigit}
      </Badge>
    </div>
  </div>
);

const PositionalAnalysis = ({ analysis }: { analysis: ReturnType<typeof analyzeHistoricalData> }) => (
  <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
    {analysis.positionalAnalysis.map((posData, index) => (
      <div key={index} className="space-y-2">
        <div className="text-center font-semibold text-primary">Position {index + 1}</div>
        <div className="space-y-1">
          {posData.slice(0, 5).map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm p-2 rounded bg-muted/50">
              <Badge variant="outline" className="font-mono">{item.digit}</Badge>
              <span className="text-xs text-muted-foreground">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const StatisticalAnalysisView = () => {
  const analysisAll = analyzeHistoricalData();
  const analysis2526 = analyzeHistoricalData([2025, 2026]);
  const analysis2026 = analyzeHistoricalData([2026]);
  const { min, max } = getYearRange();
  const totalResults = lotteryHistory.length;
  const bumperCount = getBumperResults().length;
  const regularCount = getRegularResults().length;
  const results2526 = lotteryHistory.filter(r => r.year === 2025 || r.year === 2026).length;
  const results2026 = lotteryHistory.filter(r => r.year === 2026).length;

  return (
    <div className="space-y-6">
      {/* Dataset Overview */}
      <Card className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            Comprehensive Dataset Overview
          </CardTitle>
          <CardDescription>
            {max - min + 1} years of Kerala Lottery historical data ({min}-{max})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-card border">
              <p className="text-sm text-muted-foreground mb-2">Total Results</p>
              <p className="text-3xl font-bold text-primary">{totalResults}</p>
              <p className="text-xs text-muted-foreground mt-1">All lottery draws</p>
            </div>
            <div className="p-4 rounded-lg bg-card border">
              <p className="text-sm text-muted-foreground mb-2">Bumper Draws</p>
              <p className="text-3xl font-bold text-secondary">{bumperCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Special bumper lotteries</p>
            </div>
            <div className="p-4 rounded-lg bg-card border">
              <p className="text-sm text-muted-foreground mb-2">Regular Draws</p>
              <p className="text-3xl font-bold text-accent">{regularCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Weekly lottery draws</p>
            </div>
            <div className="p-4 rounded-lg bg-card border border-primary/30">
              <p className="text-sm text-muted-foreground mb-2">2025-2026 Data</p>
              <p className="text-3xl font-bold text-primary">{results2526}</p>
              <p className="text-xs text-muted-foreground mt-1">{results2026} from 2026</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Analysis: All Data vs 2025-2026 vs 2026 */}
      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recent" className="flex items-center gap-1">
            <Flame className="h-4 w-4" /> 2025-2026
          </TabsTrigger>
          <TabsTrigger value="2026" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" /> 2026 Only
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" /> All Data
          </TabsTrigger>
        </TabsList>

        {/* 2025-2026 Tab */}
        <TabsContent value="recent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-6 w-6 text-orange-500" />
                Key Findings — 2025-2026 ({results2526} results)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <KeyFindings analysis={analysis2526} totalResults={results2526} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Positional Frequency — 2025-2026</CardTitle>
              <CardDescription>Most common digits at each position</CardDescription>
            </CardHeader>
            <CardContent>
              <PositionalAnalysis analysis={analysis2526} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Digit Pairs — 2025-2026</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {analysis2526.digitPairs.slice(0, 12).map((pair, index) => (
                  <div key={index} className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <Badge variant="default" className="font-mono text-lg">{pair.pair}</Badge>
                      <div className="text-right">
                        <p className="text-sm font-medium">{pair.frequency}×</p>
                        <p className="text-xs text-muted-foreground">{pair.positions}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Digit Frequency — 2025-2026</CardTitle>
            </CardHeader>
            <CardContent>
              <DigitFrequencyChart analysis={analysis2526} label="2025-2026" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2026 Only Tab */}
        <TabsContent value="2026" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                Key Findings — 2026 ({results2026} results)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <KeyFindings analysis={analysis2026} totalResults={results2026} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Positional Frequency — 2026</CardTitle>
            </CardHeader>
            <CardContent>
              <PositionalAnalysis analysis={analysis2026} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends — 2026</CardTitle>
              <CardDescription>Most dominant digit by month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {analysis2026.temporalPatterns.map((tp, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-card">
                    <p className="text-sm text-muted-foreground">{tp.period}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="default" className="font-mono text-2xl px-3 py-1">{tp.digit}</Badge>
                      <span className="text-sm font-medium">{tp.frequency}× appearances</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Digit Frequency — 2026</CardTitle>
            </CardHeader>
            <CardContent>
              <DigitFrequencyChart analysis={analysis2026} label="2026" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Data Tab */}
        <TabsContent value="all" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                Key Findings — All Data ({totalResults} results)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <KeyFindings analysis={analysisAll} totalResults={totalResults} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Positional Frequency — All Data</CardTitle>
            </CardHeader>
            <CardContent>
              <PositionalAnalysis analysis={analysisAll} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Digit Pairs — All Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {analysisAll.digitPairs.slice(0, 12).map((pair, index) => (
                  <div key={index} className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <Badge variant="default" className="font-mono text-lg">{pair.pair}</Badge>
                      <div className="text-right">
                        <p className="text-sm font-medium">{pair.frequency}×</p>
                        <p className="text-xs text-muted-foreground">{pair.positions}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Complete Digit Frequency — All Data</CardTitle>
            </CardHeader>
            <CardContent>
              <DigitFrequencyChart analysis={analysisAll} label="All" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
  const analysis = analyzeHistoricalData();
  const { min, max } = getYearRange();
  const totalResults = lotteryHistory.length;
  const bumperCount = getBumperResults().length;
  const regularCount = getRegularResults().length;

  return (
    <div className="space-y-6">
      {/* Dataset Overview */}
      <Card className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            Comprehensive Dataset Overview
          </CardTitle>
          <CardDescription>
            {max - min + 1} years of Kerala Lottery historical data ({min}-{max})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-card border">
              <p className="text-sm text-muted-foreground mb-2">Total Results</p>
              <p className="text-3xl font-bold text-primary">{totalResults}</p>
              <p className="text-xs text-muted-foreground mt-1">All lottery draws</p>
            </div>
            <div className="p-4 rounded-lg bg-card border">
              <p className="text-sm text-muted-foreground mb-2">Bumper Draws</p>
              <p className="text-3xl font-bold text-secondary">{bumperCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Special bumper lotteries</p>
            </div>
            <div className="p-4 rounded-lg bg-card border">
              <p className="text-sm text-muted-foreground mb-2">Regular Draws</p>
              <p className="text-3xl font-bold text-accent">{regularCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Weekly lottery draws</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Findings Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Key Statistical Findings
          </CardTitle>
          <CardDescription>Based on {totalResults} historical lottery results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-muted-foreground mb-1">Most Frequent Digits</p>
              <div className="flex gap-2 flex-wrap">
                {analysis.topFrequentDigits.slice(0, 3).map(d => (
                  <Badge key={d.digit} variant="default" className="text-lg font-mono">
                    {d.digit} <span className="text-xs ml-1">({d.percentage}%)</span>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm text-muted-foreground mb-1">Least Frequent Digits</p>
              <div className="flex gap-2 flex-wrap">
                {analysis.leastFrequentDigits.slice(0, 3).map(d => (
                  <Badge key={d.digit} variant="outline" className="text-lg font-mono">
                    {d.digit} <span className="text-xs ml-1">({d.percentage}%)</span>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <p className="text-sm text-muted-foreground mb-1">Most Common Start</p>
              <Badge variant="default" className="text-3xl font-mono px-4 py-2">
                {analysis.mostCommonStartDigit}
              </Badge>
            </div>

            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <p className="text-sm text-muted-foreground mb-1">Most Common End</p>
              <Badge variant="default" className="text-3xl font-mono px-4 py-2">
                {analysis.mostCommonEndDigit}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Positional Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Positional Frequency Analysis</CardTitle>
          <CardDescription>Most common digits at each position (1-6)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
            {analysis.positionalAnalysis.map((posData, index) => (
              <div key={index} className="space-y-2">
                <div className="text-center font-semibold text-primary">
                  Position {index + 1}
                </div>
                <div className="space-y-1">
                  {posData.slice(0, 5).map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm p-2 rounded bg-muted/50">
                      <Badge variant="outline" className="font-mono">
                        {item.digit}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {item.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Digit Pairs */}
      <Card>
        <CardHeader>
          <CardTitle>Most Common Adjacent Digit Pairs</CardTitle>
          <CardDescription>Frequently occurring consecutive digit combinations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {analysis.digitPairs.slice(0, 12).map((pair, index) => (
              <div key={index} className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between">
                  <Badge variant="default" className="font-mono text-lg">
                    {pair.pair}
                  </Badge>
                  <div className="text-right">
                    <p className="text-sm font-medium">{pair.frequency}×</p>
                    <p className="text-xs text-muted-foreground">{pair.positions}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Digit Frequency */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Digit Frequency Distribution</CardTitle>
          <CardDescription>All digits ranked by overall appearance frequency</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.topFrequentDigits.map((item, index) => {
              const isHot = index < 3;
              const isCold = index >= 7;
              return (
                <div key={item.digit} className="flex items-center gap-4">
                  <div className="w-8 text-center">
                    <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                  </div>
                  <Badge variant={isHot ? "default" : isCold ? "secondary" : "outline"} className="font-mono text-xl w-12 justify-center">
                    {item.digit}
                  </Badge>
                  <div className="flex-1">
                    <div className="h-8 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full flex items-center px-3 text-xs font-medium text-white transition-all ${
                          isHot ? "bg-gradient-to-r from-green-500 to-green-600" :
                          isCold ? "bg-gradient-to-r from-blue-400 to-blue-500" :
                          "bg-gradient-to-r from-primary to-accent"
                        }`}
                        style={{ width: `${item.percentage * 1.5}%` }}
                      >
                        {item.count} occurrences
                      </div>
                    </div>
                  </div>
                  <div className="w-16 text-right">
                    <span className="text-lg font-bold">{item.percentage}%</span>
                  </div>
                  {isHot && <TrendingUp className="h-5 w-5 text-green-500" />}
                  {isCold && <TrendingDown className="h-5 w-5 text-blue-500" />}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
