import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendVisualization } from "./TrendVisualization";
import { useLotteryData } from "@/hooks/useLotteryData";
import { analyzeOctoberTrend, getDatePatternAnalysis, calculateDeltaAnalysis } from "@/utils/trendAnalysis";
import { Copy, CheckCircle2, TrendingUp, BarChart3, Calendar } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const October2025Analysis = () => {
  const { data: lotteryHistory, isLoading } = useLotteryData();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (isLoading || lotteryHistory.length === 0) {
    return (
      <Card className="shadow-elevated animate-fade-in">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Loading October 2025 analysis...</p>
        </CardContent>
      </Card>
    );
  }

  // Check if October 18 result is available
  const actualResult = lotteryHistory.find(r => {
    if (r.year !== 2025 || r.month !== 10) return false;
    const dayOfMonth = parseInt(r.date.split('.')[0]);
    return dayOfMonth === 18;
  });
  const actualValue = actualResult ? parseInt(actualResult.result) : null;

  // Run comprehensive analysis
  const octoberAnalysis = analyzeOctoberTrend(lotteryHistory);
  const datePattern = getDatePatternAnalysis(lotteryHistory, 18);
  const deltaAnalysis = calculateDeltaAnalysis(octoberAnalysis.lastNResults);

  // Calculate accuracy for each candidate
  const calculateAccuracy = (predicted: number, actual: number) => {
    const predStr = predicted.toString();
    const actStr = actual.toString();
    
    const last4Match = predStr.slice(-4) === actStr.slice(-4);
    const last3Match = predStr.slice(-3) === actStr.slice(-3);
    
    let matchingDigits = 0;
    for (let i = 0; i < predStr.length; i++) {
      if (predStr[i] === actStr[i]) matchingDigits++;
    }
    
    const difference = Math.abs(predicted - actual);
    const percentError = (difference / actual * 100).toFixed(2);
    
    return {
      last4Match,
      last3Match,
      matchingDigits,
      difference,
      percentError
    };
  };

  // Define the three candidates
  const candidates = [
    {
      name: "Candidate 1 (Most Likely)",
      value: 885156,
      confidence: "High",
      rationale: "Based on average daily increase of 5,896 from October 1-15. Projecting forward from October 15 (867468) over 3 days gives 867468 + 3×5896 ≈ 885156. Aligns with overall upward trend and recent high values.",
      method: "Trend Projection",
      color: "#10b981" // green
    },
    {
      name: "Candidate 2",
      value: 815475,
      confidence: "Medium",
      rationale: "Uses most common digits per position from October data: 8 (recent trends), 1 (Position 2), 5 (Position 3), 4 (Position 4), 7 (Position 5), 5 (Position 6). Combines frequency with recent patterns.",
      method: "Frequency-Based",
      color: "#f59e0b" // amber
    },
    {
      name: "Candidate 3",
      value: 732475,
      confidence: "Medium",
      rationale: "Based on average of recent high values from October (705757, 706935, 649740, 867468) ≈ 732475. Accounts for volatility and provides conservative estimate.",
      method: "Conservative Average",
      color: "#3b82f6" // blue
    }
  ];

  // Prepare trend visualization data
  const octoberData = lotteryHistory
    .filter(r => r.year === 2025 && r.month === 10)
    .map(r => {
      const dayOfMonth = parseInt(r.date.split('.')[0]);
      return {
        date: `Oct ${dayOfMonth}`,
        value: parseInt(r.result)
      };
    });

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Card */}
      <Card className={actualValue ? "bg-gradient-subtle shadow-glow border-green-500" : "bg-gradient-primary shadow-glow border-primary"}>
        <CardHeader>
          <CardTitle className="text-3xl flex items-center gap-2 text-primary-foreground">
            <Calendar className="w-8 h-8" />
            October 18, 2025 {actualValue ? "- Result Available" : "Special Analysis"}
          </CardTitle>
          <CardDescription className="text-primary-foreground/80">
            {actualValue 
              ? `Actual Result: ${actualValue.toLocaleString()} | Prediction Accuracy Analysis`
              : "Comprehensive prediction analysis based on October 2025 trends, frequency patterns, and historical data"
            }
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Trend Visualization */}
      <TrendVisualization
        historicalValues={octoberData}
        projectedValue={octoberAnalysis.projectedValue}
        candidates={candidates.map(c => ({ name: c.name, value: c.value, color: c.color }))}
        trendDirection={octoberAnalysis.trendMetrics.currentTrend}
        confidenceInterval={octoberAnalysis.confidenceInterval}
      />

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Trend Projection</CardDescription>
            <CardTitle className="text-2xl">{octoberAnalysis.projectedValue.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Linear regression based</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Daily Increase (Avg)</CardDescription>
            <CardTitle className="text-2xl text-green-500">
              +{Math.round(octoberAnalysis.trendMetrics.averageDailyIncrease).toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Per day in October</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Volatility (σ)</CardDescription>
            <CardTitle className="text-2xl text-amber-500">
              ±{Math.round(octoberAnalysis.trendMetrics.volatility).toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Standard deviation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Historical 18th Avg</CardDescription>
            <CardTitle className="text-2xl">{datePattern.average.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Jan-Sep 2025</p>
          </CardContent>
        </Card>
      </div>

      {/* Prediction Candidates */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold">Prediction Candidates</h2>
        </div>

        {candidates.map((candidate, index) => {
          const accuracy = actualValue ? calculateAccuracy(candidate.value, actualValue) : null;
          
          return (
            <Card 
              key={index} 
              className="shadow-elevated hover:shadow-glow transition-all duration-300 border-2"
              style={{ borderColor: candidate.color }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{candidate.name}</CardTitle>
                      <Badge 
                        variant={candidate.confidence === "High" ? "default" : "secondary"}
                        style={candidate.confidence === "High" ? { backgroundColor: candidate.color } : {}}
                      >
                        {candidate.confidence} Confidence
                      </Badge>
                      <Badge variant="outline">{candidate.method}</Badge>
                      {accuracy && accuracy.matchingDigits > 0 && (
                        <Badge variant="default" className="bg-green-500">
                          {accuracy.matchingDigits} digit{accuracy.matchingDigits > 1 ? 's' : ''} matched
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{candidate.rationale}</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(candidate.value.toString(), index)}
                    className="ml-4"
                  >
                    {copiedIndex === index ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="text-5xl font-bold tabular-nums" style={{ color: candidate.color }}>
                    {candidate.value.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Last 4: <span className="font-mono font-bold">{candidate.value.toString().slice(-4)}</span></div>
                    <div>Last 3: <span className="font-mono font-bold">{candidate.value.toString().slice(-3)}</span></div>
                  </div>
                </div>
                
                {accuracy && (
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <div className="font-semibold text-sm mb-2">Accuracy Analysis:</div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Difference:</span>
                        <span className="ml-2 font-mono font-bold">{accuracy.difference.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Error:</span>
                        <span className="ml-2 font-mono font-bold">{accuracy.percentError}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last 4:</span>
                        <Badge variant={accuracy.last4Match ? "default" : "secondary"} className="ml-2">
                          {accuracy.last4Match ? "✓ Match" : "✗ No Match"}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last 3:</span>
                        <Badge variant={accuracy.last3Match ? "default" : "secondary"} className="ml-2">
                          {accuracy.last3Match ? "✓ Match" : "✗ No Match"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Supporting Analysis */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Position Frequency */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              October Position Frequency
            </CardTitle>
            <CardDescription>Most frequent digits by position (October 2025)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(octoberAnalysis.positionFrequency).map(([pos, digits]) => {
                const sortedDigits = Object.entries(digits)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3);
                
                return (
                  <div key={pos} className="flex items-center gap-3">
                    <Badge variant="outline" className="w-20">Pos {parseInt(pos) + 1}</Badge>
                    <div className="flex gap-2 flex-wrap">
                      {sortedDigits.map(([digit, count]) => (
                        <Badge key={digit} variant="secondary">
                          {digit} ({count}×)
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Delta Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Volatility Analysis
            </CardTitle>
            <CardDescription>Day-to-day changes in October</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Average Change</p>
                <p className="text-2xl font-bold">{deltaAnalysis.averageDelta.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Max Increase</p>
                <p className="text-2xl font-bold text-green-500">+{deltaAnalysis.maxIncrease.toLocaleString()}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Recent Changes (Last 5)</p>
              <div className="flex gap-2 flex-wrap">
                {deltaAnalysis.deltas.slice(-5).map((delta, idx) => (
                  <Badge 
                    key={idx} 
                    variant={delta > 0 ? "default" : "destructive"}
                  >
                    {delta > 0 ? '+' : ''}{delta.toLocaleString()}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disclaimer */}
      <Card className="border-amber-500/50 bg-amber-500/5">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Analysis Disclaimer:</strong> These predictions are based on statistical analysis of historical patterns, trends, and frequency distributions. 
            Lottery outcomes are inherently random, and past patterns do not guarantee future results. This analysis is for informational and educational purposes only.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
