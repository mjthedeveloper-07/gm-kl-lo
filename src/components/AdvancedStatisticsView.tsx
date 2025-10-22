import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Target,
  Zap,
  BarChart3,
  GitBranch
} from "lucide-react";
import { 
  chiSquareGoodnessOfFit, 
  linearRegressionAnalysis, 
  temporalTrendAnalysis,
  uniformityTest
} from "@/utils/statisticalTests";
import { 
  runMonteCarloSimulation, 
  quickMonteCarloTest 
} from "@/utils/monteCarloSimulation";
import { 
  calculateAutocorrelation, 
  durbinWatsonTest 
} from "@/utils/timeSeriesAnalysis";
import { kMeansClustering } from "@/utils/advancedClustering";
import {
  analyzeTriplets,
  calculatePositionCorrelation,
  analyzeSumDistribution,
  analyzeParityBalance
} from "@/utils/lotteryAnalysis";

export function AdvancedStatisticsView() {
  // Memoize expensive statistical calculations
  const chiSquare = useMemo(() => chiSquareGoodnessOfFit(), []);
  const regression = useMemo(() => linearRegressionAnalysis(), []);
  const temporal = useMemo(() => temporalTrendAnalysis(), []);
  const uniformity = useMemo(() => uniformityTest(), []);
  const monteCarlo = useMemo(() => runMonteCarloSimulation(5000), []);
  const quickMC = useMemo(() => quickMonteCarloTest(), []);
  const autocorr = useMemo(() => calculateAutocorrelation(), []);
  const durbinWatson = useMemo(() => durbinWatsonTest(), []);
  const clustering = useMemo(() => kMeansClustering(5), []);
  const triplets = useMemo(() => analyzeTriplets(), []);
  const positionCorr = useMemo(() => calculatePositionCorrelation(), []);
  const sumDist = useMemo(() => analyzeSumDistribution(), []);
  const parity = useMemo(() => analyzeParityBalance(), []);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-2 border-primary/30 shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Activity className="w-6 h-6 text-primary" />
            Advanced Statistical Analysis
          </CardTitle>
          <CardDescription>
            Comprehensive statistical testing using Chi-Square, Monte Carlo, Time Series, and ML clustering methods
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="uniformity">Uniformity Tests</TabsTrigger>
          <TabsTrigger value="patterns">Pattern Analysis</TabsTrigger>
          <TabsTrigger value="timeseries">Time Series</TabsTrigger>
          <TabsTrigger value="clustering">ML Clustering</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Randomness Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Randomness Score
              </CardTitle>
              <CardDescription>
                Monte Carlo simulation result (10,000 runs)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Score</span>
                <Badge variant={quickMC.randomnessScore > 80 ? "default" : "secondary"}>
                  {quickMC.randomnessScore}/100
                </Badge>
              </div>
              <Progress value={quickMC.randomnessScore} className="h-3" />
              <p className="text-sm text-muted-foreground">{quickMC.interpretation}</p>
            </CardContent>
          </Card>

          {/* Chi-Square Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Chi-Square Goodness-of-Fit Test
              </CardTitle>
              <CardDescription>
                Tests if digits follow uniform distribution (χ² = {chiSquare.statistic.toFixed(2)}, p = {chiSquare.pValue.toFixed(3)})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                {chiSquare.isUniform ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                )}
                <span className="font-semibold">
                  {chiSquare.isUniform 
                    ? "Distribution is uniform (fair lottery)" 
                    : "Distribution shows deviations from uniformity"}
                </span>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Digit Deviations</p>
                <div className="grid grid-cols-5 gap-2">
                  {chiSquare.digitDeviations.map(dd => (
                    <div key={dd.digit} className="text-center p-2 rounded-md bg-muted/50">
                      <div className="font-bold text-lg">{dd.digit}</div>
                      <Badge 
                        variant={
                          dd.significance === "high" ? "destructive" : 
                          dd.significance === "medium" ? "secondary" : 
                          "outline"
                        }
                        className="text-xs"
                      >
                        {dd.deviation.toFixed(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Durbin-Watson Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Durbin-Watson Independence Test
              </CardTitle>
              <CardDescription>
                Tests if draws are independent (DW = {durbinWatson.statistic.toFixed(2)})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {durbinWatson.isRandom ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                )}
                <span className="font-semibold capitalize">
                  {durbinWatson.interpretation.replace(/_/g, ' ')}
                  {durbinWatson.isRandom && " - Random sequence confirmed"}
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Uniformity Tests Tab */}
        <TabsContent value="uniformity" className="space-y-6">
          {/* Monte Carlo Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Monte Carlo Simulation Analysis
              </CardTitle>
              <CardDescription>
                Comparing actual frequencies vs. {monteCarlo.simulations.toLocaleString()} simulated random draws
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Overall Deviation</p>
                  <p className="text-2xl font-bold">{monteCarlo.overallDeviation.toFixed(2)}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Anomalies Detected</p>
                  <p className="text-2xl font-bold">{monteCarlo.anomalyCount}/10</p>
                </div>
              </div>

              <div className="space-y-3">
                {monteCarlo.digitComparison.map(d => (
                  <div key={d.digit} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{d.digit}</span>
                        {d.isAnomaly && (
                          <Badge variant="destructive" className="text-xs">Anomaly</Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Actual: {d.actualFrequency.toFixed(2)}% | 
                        Expected: {d.expectedMean.toFixed(2)}%
                      </span>
                    </div>
                    <Progress 
                      value={d.actualFrequency * 10} 
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      95% CI: [{d.confidenceInterval95.lower.toFixed(2)}%, {d.confidenceInterval95.upper.toFixed(2)}%] 
                      | Z-score: {d.deviationScore.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Positional Uniformity */}
          <Card>
            <CardHeader>
              <CardTitle>Positional Uniformity Tests</CardTitle>
              <CardDescription>
                Chi-square test for each position independently
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {uniformity.positionalTests.map(pt => (
                  <div key={pt.position} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      {pt.isUniform ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      )}
                      <span className="font-semibold">Position {pt.position}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">χ² = {pt.chiSquare.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        {pt.isUniform ? "Uniform" : "Non-uniform"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pattern Analysis Tab */}
        <TabsContent value="patterns" className="space-y-6">
          {/* Triplet Patterns */}
          <Card>
            <CardHeader>
              <CardTitle>Top Triplet Patterns</CardTitle>
              <CardDescription>Most frequent 3-digit consecutive sequences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {triplets.slice(0, 10).map((t, idx) => (
                  <div key={t.triplet} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">#{idx + 1}</Badge>
                      <span className="font-bold text-lg">{t.triplet}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{t.frequency} times</p>
                      <p className="text-xs text-muted-foreground">Last: {t.lastSeen}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Position Correlation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-primary" />
                Position Correlation Matrix
              </CardTitle>
              <CardDescription>
                Correlation between different digit positions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {positionCorr.slice(0, 10).map(pc => (
                  <div key={`${pc.position1}-${pc.position2}`} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">P{pc.position1} ↔ P{pc.position2}</span>
                      <Badge variant={
                        pc.strength === "strong" ? "default" :
                        pc.strength === "moderate" ? "secondary" :
                        "outline"
                      }>
                        {pc.strength}
                      </Badge>
                    </div>
                    <span className="font-semibold">{pc.correlation.toFixed(3)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sum Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Sum Distribution Analysis</CardTitle>
              <CardDescription>Total sum of all 6 digits per draw</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {sumDist.slice(0, 15).map(sd => (
                  <div key={sd.sum} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div>
                      <span className="font-bold">Sum: {sd.sum}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {sd.examples[0]}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{sd.frequency} times</p>
                      <p className="text-xs text-muted-foreground">{sd.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Parity Balance */}
          <Card>
            <CardHeader>
              <CardTitle>Parity Balance (Even/Odd)</CardTitle>
              <CardDescription>Distribution of even and odd digits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {parity.map(p => (
                  <div key={p.pattern} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{p.pattern}</span>
                        <span className="text-sm text-muted-foreground">{p.description}</span>
                      </div>
                      <span className="font-semibold">{p.frequency} ({p.percentage.toFixed(1)}%)</span>
                    </div>
                    <Progress value={p.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Time Series Tab */}
        <TabsContent value="timeseries" className="space-y-6">
          {/* Regression Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Linear Regression Trends
              </CardTitle>
              <CardDescription>
                Long-term trends for each digit over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {regression.map(r => (
                  <div key={r.digit} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg">{r.digit}</span>
                      <Badge variant={
                        r.trend === "increasing" ? "default" :
                        r.trend === "decreasing" ? "secondary" :
                        "outline"
                      }>
                        {r.trend}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Slope: {r.slope.toFixed(3)}</p>
                      <p className="text-xs text-muted-foreground">R² = {r.rSquared.toFixed(3)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Temporal Trends (Moving Averages) */}
          <Card>
            <CardHeader>
              <CardTitle>Moving Average Momentum</CardTitle>
              <CardDescription>
                7-day, 30-day, and 90-day moving averages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {temporal.map(t => (
                  <div key={t.digit} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg">{t.digit}</span>
                      <Badge variant={
                        t.momentum === "strong_up" ? "default" :
                        t.momentum === "up" ? "secondary" :
                        t.momentum === "down" ? "secondary" :
                        "outline"
                      }>
                        {t.momentum.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        7D: {t.movingAvg7Day.toFixed(2)} | 
                        30D: {t.movingAvg30Day.toFixed(2)} | 
                        90D: {t.movingAvg90Day.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Autocorrelation */}
          <Card>
            <CardHeader>
              <CardTitle>Autocorrelation Analysis</CardTitle>
              <CardDescription>
                Tests if past appearances predict future occurrences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {autocorr.filter(a => a.hasSignificantCorrelation).map(a => (
                  <div key={a.digit} className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-lg">{a.digit}</span>
                      <Badge variant="destructive">Significant</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{a.interpretation}</p>
                    <p className="text-xs">
                      Lag-1: {a.lag1.toFixed(3)} | 
                      Lag-7: {a.lag7.toFixed(3)} | 
                      Lag-30: {a.lag30.toFixed(3)}
                    </p>
                  </div>
                ))}
                {autocorr.filter(a => !a.hasSignificantCorrelation).length === autocorr.length && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No significant autocorrelations detected - draws appear independent
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clustering Tab */}
        <TabsContent value="clustering" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                K-Means Clustering Results
              </CardTitle>
              <CardDescription>
                Digits grouped by frequency, momentum, and positional dominance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Silhouette Score</p>
                  <p className="text-2xl font-bold">{clustering.silhouetteScore.toFixed(3)}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Clustering Quality</p>
                  <Badge variant="default" className="text-base">
                    {clustering.quality.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                {clustering.clusters.map(cluster => (
                  <Card key={cluster.clusterId} className="border-2">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{cluster.clusterName} Numbers</span>
                        <Badge variant={
                          cluster.clusterName === "Hot" ? "default" :
                          cluster.clusterName === "Warm" ? "secondary" :
                          "outline"
                        }>
                          Avg: {cluster.avgFrequency.toFixed(1)}%
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {cluster.digits.map(digit => (
                          <div 
                            key={digit}
                            className="w-12 h-12 flex items-center justify-center rounded-lg bg-primary/10 font-bold text-xl"
                          >
                            {digit}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
