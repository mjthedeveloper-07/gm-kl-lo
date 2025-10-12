import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { generateAllPredictions, analyzeHistoricalData, type PredictionSet } from "@/utils/predictionGenerator";
import { Sparkles, RefreshCw, Copy, CheckCircle2, TrendingUp, Target, Zap } from "lucide-react";
import { toast } from "sonner";

export const PredictionSetsView = () => {
  const [predictionSets, setPredictionSets] = useState<PredictionSet[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const analysis = analyzeHistoricalData();

  useEffect(() => {
    regeneratePredictions();
  }, []);

  const regeneratePredictions = () => {
    const predictions = generateAllPredictions();
    setPredictionSets(predictions);
    toast.success("Generated new predictions based on statistical analysis");
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case "high":
        return <Badge className="bg-green-500">High Confidence</Badge>;
      case "medium":
        return <Badge variant="secondary">Medium Confidence</Badge>;
      case "low":
        return <Badge variant="outline">Low Confidence</Badge>;
      default:
        return <Badge variant="outline">{confidence}</Badge>;
    }
  };

  // Group predictions by type
  const frequencyBased = predictionSets.filter(s => s.method.includes("Frequency"));
  const probabilityBased = predictionSets.filter(s => s.method.includes("Probability"));
  const trendBased = predictionSets.filter(s => s.method.includes("Trend"));
  const otherMethods = predictionSets.filter(s => 
    !s.method.includes("Frequency") && 
    !s.method.includes("Probability") && 
    !s.method.includes("Trend")
  );

  const renderPredictionGroup = (
    title: string,
    icon: React.ReactNode,
    description: string,
    sets: PredictionSet[],
    bgColor: string
  ) => {
    if (sets.length === 0) return null;

    return (
      <div className="space-y-4">
        <div className={`${bgColor} rounded-lg p-4 border-2`}>
          <div className="flex items-center gap-3 mb-2">
            {icon}
            <h3 className="text-xl font-bold">{title}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {sets.map((set, setIndex) => (
          <Card key={setIndex} className="hover:shadow-lg transition-shadow border-2">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg">{set.method}</CardTitle>
                  <CardDescription>{set.description}</CardDescription>
                </div>
                {getConfidenceBadge(set.confidence)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {set.numbers.map((number, numIndex) => (
                  <div
                    key={numIndex}
                    className="group relative p-4 rounded-lg border-2 border-primary/20 bg-gradient-to-br from-card to-card/50 hover:border-primary/50 hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">#{numIndex + 1}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => copyToClipboard(number, `${setIndex}-${numIndex}`)}
                        >
                          {copiedIndex === `${setIndex}-${numIndex}` ? (
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <p className="font-mono text-2xl font-bold text-center">
                        {number}
                      </p>
                      <p className="text-xs text-muted-foreground text-center">
                        Last 4: {number.slice(-4)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const allNumbers = set.numbers.join(", ");
                    copyToClipboard(allNumbers, `set-${setIndex}`);
                  }}
                  className="text-xs"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy All Numbers
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header with Key Stats */}
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Sparkles className="h-6 w-6 text-primary" />
                AI-Generated Lottery Predictions
              </CardTitle>
              <CardDescription className="mt-2 text-base">
                Multi-method statistical analysis with {predictionSets.length} prediction algorithms
              </CardDescription>
            </div>
            <Button onClick={regeneratePredictions} className="gap-2 shadow-glow">
              <RefreshCw className="h-4 w-4" />
              Regenerate All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-card rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground mb-1">Top Hot Number</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {analysis.topFrequentDigits[0]?.digit}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {analysis.topFrequentDigits[0]?.percentage}% frequency
              </p>
            </div>
            <div className="bg-card rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground mb-1">Most Common Pair</p>
              <p className="text-3xl font-bold font-mono">
                {analysis.digitPairs[0]?.pair}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {analysis.digitPairs[0]?.frequency} occurrences
              </p>
            </div>
            <div className="bg-card rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground mb-1">Starting Digit</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {analysis.mostCommonStartDigit}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Position 1 leader
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="border-yellow-500/50 bg-yellow-500/5">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">⚠️ Disclaimer:</strong> These predictions are generated using advanced statistical analysis of historical Kerala Lottery data from 2009-2025. 
            Lottery outcomes are random and unpredictable. These numbers should be used for entertainment purposes only. 
            Past frequency does not guarantee future results. Please gamble responsibly.
          </p>
        </CardContent>
      </Card>

      {/* Method 1: High-Frequency Picks */}
      {renderPredictionGroup(
        "Method 1: High-Frequency Based Predictions",
        <Target className="h-6 w-6 text-green-600" />,
        "Generated by selecting the most frequently occurring digits from each position in historical data. Uses positional frequency analysis.",
        frequencyBased,
        "bg-green-500/10 border-green-500/30"
      )}

      {/* Method 2: Probability-Weighted Picks */}
      {renderPredictionGroup(
        "Method 2: Probability-Weighted Predictions",
        <TrendingUp className="h-6 w-6 text-blue-600" />,
        "Generated using weighted random selection based on frequency charts. Higher probability for frequent numbers, but allows less common ones.",
        probabilityBased,
        "bg-blue-500/10 border-blue-500/30"
      )}

      {/* Method 3: Trend-Based Picks */}
      {renderPredictionGroup(
        "Method 3: Trend-Based Predictions",
        <Zap className="h-6 w-6 text-purple-600" />,
        "Generated based on temporal trends (monthly/daily patterns) and hot digit pairs from recent draws.",
        trendBased,
        "bg-purple-500/10 border-purple-500/30"
      )}

      {/* Advanced Methods */}
      {otherMethods.length > 0 && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-accent/10 to-primary/5 rounded-lg p-4 border-2 border-accent/30">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="h-6 w-6 text-accent" />
              <h3 className="text-xl font-bold">Advanced Mathematical Methods</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Additional predictions using complex number theory, pattern matching, and advanced statistical techniques.
            </p>
          </div>

          {otherMethods.map((set, setIndex) => (
            <Card key={setIndex} className="hover:shadow-lg transition-shadow border-2 border-accent/20">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{set.method}</CardTitle>
                    <CardDescription>{set.description}</CardDescription>
                  </div>
                  {getConfidenceBadge(set.confidence)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {set.numbers.map((number, numIndex) => (
                    <div
                      key={numIndex}
                      className="group relative p-4 rounded-lg border-2 border-primary/20 bg-gradient-to-br from-card to-card/50 hover:border-primary/50 hover:shadow-md transition-all"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">#{numIndex + 1}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => copyToClipboard(number, `adv-${setIndex}-${numIndex}`)}
                          >
                            {copiedIndex === `adv-${setIndex}-${numIndex}` ? (
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <p className="font-mono text-2xl font-bold text-center">
                          {number}
                        </p>
                        <p className="text-xs text-muted-foreground text-center">
                          Last 4: {number.slice(-4)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const allNumbers = set.numbers.join(", ");
                      copyToClipboard(allNumbers, `adv-set-${setIndex}`);
                    }}
                    className="text-xs"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy All Numbers
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
