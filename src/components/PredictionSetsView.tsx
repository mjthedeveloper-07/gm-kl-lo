import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { generateEnhancedPredictions, type EnhancedPredictionSet, savePredictionToDatabase } from "@/utils/enhancedPredictionGenerator";
import { Sparkles, RefreshCw, Copy, CheckCircle2, TrendingUp, Brain } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const PredictionSetsView = () => {
  const [predictionSets, setPredictionSets] = useState<EnhancedPredictionSet[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [includeAI, setIncludeAI] = useState(false);

  useEffect(() => {
    regeneratePredictions();
  }, []);

  const regeneratePredictions = async () => {
    setIsLoading(true);
    try {
      const newPredictions = await generateEnhancedPredictions();
      
      // Save predictions to database
      for (const pred of newPredictions) {
        await savePredictionToDatabase(pred);
      }

      // Optionally fetch AI predictions
      if (includeAI) {
        const { data: aiPred, error } = await supabase.functions.invoke('generate-ml-predictions');
        if (!error && aiPred) {
          newPredictions.push(aiPred);
        }
      }

      setPredictionSets(newPredictions);
      toast.success(`Generated ${newPredictions.length} enhanced prediction sets with accuracy tracking`);
    } catch (error) {
      console.error('Error generating predictions:', error);
      toast.error("Failed to generate predictions");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getConfidenceBadge = (confidence: string) => {
    const variants = {
      "very_high": { variant: "default" as const, label: "Very High", color: "bg-green-500" },
      "high": { variant: "default" as const, label: "High", color: "bg-blue-500" },
      "medium": { variant: "secondary" as const, label: "Medium", color: "" },
      "low": { variant: "outline" as const, label: "Low", color: "" },
      "very_low": { variant: "outline" as const, label: "Very Low", color: "bg-red-500" },
    };
    const conf = variants[confidence as keyof typeof variants] || variants.medium;
    return (
      <Badge variant={conf.variant} className={conf.color}>
        {conf.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6" />
                Enhanced AI Predictions
              </CardTitle>
              <CardDescription className="mt-2">
                8 advanced methods with database-backed accuracy tracking and weighted recency analysis
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  setIncludeAI(!includeAI);
                  toast.info(includeAI ? "AI predictions disabled" : "AI predictions enabled");
                }} 
                variant={includeAI ? "default" : "outline"}
                size="sm"
              >
                <Brain className="h-4 w-4 mr-2" />
                {includeAI ? "AI Active" : "Enable AI"}
              </Button>
              <Button 
                onClick={regeneratePredictions} 
                variant="outline" 
                className="gap-2"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? "Generating..." : "Regenerate"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Disclaimer */}
      <Card className="border-yellow-500/50 bg-yellow-500/5">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">⚠️ Disclaimer:</strong> These predictions use advanced statistical analysis with database-backed accuracy tracking. 
            Lottery outcomes are random and unpredictable. These numbers should be used for entertainment purposes only. 
            Past performance does not guarantee future results. Please gamble responsibly.
          </p>
        </CardContent>
      </Card>

      {/* Prediction Sets */}
      {predictionSets.map((set, setIndex) => (
        <Card key={setIndex} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <CardTitle className="text-xl flex items-center gap-2 flex-wrap">
                  {set.method}
                  {set.accuracy && (
                    <Badge variant="outline" className="text-xs font-normal">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {set.accuracy.avgMatchingDigits.toFixed(1)} avg match
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>{set.description}</CardDescription>
                {set.accuracy && set.accuracy.exactMatches + set.accuracy.last4Matches > 0 && (
                  <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      Exact: {set.accuracy.exactMatches}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      Last 4: {set.accuracy.last4Matches}
                    </span>
                  </div>
                )}
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
    </div>
  );
};
