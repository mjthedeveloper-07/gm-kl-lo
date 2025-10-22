import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { generateAllPredictions, type PredictionSet } from "@/utils/predictionGenerator";
import { useLotteryData } from "@/hooks/useLotteryData";
import { Sparkles, RefreshCw, Copy, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const PredictionSetsView = () => {
  const [predictionSets, setPredictionSets] = useState<PredictionSet[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const { data: lotteryHistory, isLoading } = useLotteryData();

  useEffect(() => {
    if (lotteryHistory.length > 0) {
      regeneratePredictions();
    }
  }, [lotteryHistory]);

  const regeneratePredictions = () => {
    if (lotteryHistory.length === 0) {
      toast.error("No lottery data available. Please import data first.");
      return;
    }
    const predictions = generateAllPredictions(lotteryHistory);
    setPredictionSets(predictions);
    toast.success(`Generated predictions using ${lotteryHistory.length} historical results`);
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
        return <Badge variant="default" className="bg-green-500">High Confidence</Badge>;
      case "medium":
        return <Badge variant="secondary">Medium Confidence</Badge>;
      case "low":
        return <Badge variant="outline">Low Confidence</Badge>;
      default:
        return <Badge variant="outline">{confidence}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <Card>
          <CardContent className="pt-6 flex items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p>Loading lottery data...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-6 w-6" />
                    AI-Generated Predictions
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Statistical analysis using {lotteryHistory.length} historical results
                  </CardDescription>
                </div>
                <Button onClick={regeneratePredictions} variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Regenerate
                </Button>
              </div>
            </CardHeader>
          </Card>

      {/* Disclaimer */}
      <Card className="border-yellow-500/50 bg-yellow-500/5">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">⚠️ Disclaimer:</strong> These predictions are generated using statistical analysis of historical data. 
            Lottery outcomes are random and unpredictable. These numbers should be used for entertainment purposes only. 
            Past frequency does not guarantee future results. Please gamble responsibly.
          </p>
        </CardContent>
      </Card>

      {/* Prediction Sets */}
      {predictionSets.map((set, setIndex) => (
        <Card key={setIndex} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-xl">
                  {set.method}
                </CardTitle>
                <CardDescription>{set.description}</CardDescription>
              </div>
              {getConfidenceBadge(set.confidence)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {set.numbers.map((number, numIndex) => (
                <div
                  key={numIndex}
                  className="group relative p-4 rounded-lg border-2 border-primary/20 bg-gradient-to-br from-card to-card/50 hover:border-primary/50 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        #{numIndex + 1}
                      </p>
                      <p className="font-mono text-2xl font-bold text-black dark:text-white">
                        {number}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => copyToClipboard(number, `${setIndex}-${numIndex}`)}
                    >
                      {copiedIndex === `${setIndex}-${numIndex}` ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
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
                Copy All
              </Button>
            </div>
          </CardContent>
        </Card>
          ))}
        </>
      )}
    </div>
  );
};
