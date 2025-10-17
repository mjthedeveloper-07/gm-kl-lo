import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, TrendingUp, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { lotteryHistory } from "@/data/lotteryHistory";

interface AIPrediction {
  number: string;
  confidence: "high" | "medium" | "low";
  reasoning: string;
  patterns: string[];
}

export const AIPredictionView = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [predictions, setPredictions] = useState<AIPrediction[] | null>(null);
  const [fullAnalysis, setFullAnalysis] = useState<string>("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const parseAIResponse = (aiText: string): AIPrediction[] => {
    // Extract predictions from AI response
    // This is a simplified parser - the AI should return structured data
    const predictions: AIPrediction[] = [];
    
    // Look for 6-digit numbers in the response
    const numberRegex = /\b\d{6}\b/g;
    const foundNumbers = aiText.match(numberRegex) || [];
    
    // Extract unique numbers (first 5)
    const uniqueNumbers = [...new Set(foundNumbers)].slice(0, 5);
    
    // Try to extract confidence levels and reasoning
    uniqueNumbers.forEach((number, index) => {
      // Find the section of text around this number
      const numberIndex = aiText.indexOf(number);
      const contextStart = Math.max(0, numberIndex - 200);
      const contextEnd = Math.min(aiText.length, numberIndex + 300);
      const context = aiText.substring(contextStart, contextEnd);
      
      // Determine confidence
      let confidence: "high" | "medium" | "low" = "medium";
      if (context.toLowerCase().includes("high confidence") || context.toLowerCase().includes("strong pattern")) {
        confidence = "high";
      } else if (context.toLowerCase().includes("low confidence") || context.toLowerCase().includes("weak")) {
        confidence = "low";
      }
      
      // Extract reasoning (simplified)
      const reasoningMatch = context.match(/(?:reasoning|because|based on)[:\s]+([^.]+\.)/i);
      const reasoning = reasoningMatch 
        ? reasoningMatch[1].trim() 
        : `Based on pattern analysis of position ${index + 1}`;
      
      predictions.push({
        number,
        confidence,
        reasoning,
        patterns: []
      });
    });
    
    return predictions;
  };

  const generatePredictions = async () => {
    setIsGenerating(true);
    setPredictions(null);
    setFullAnalysis("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lottery-prediction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            historicalData: lotteryHistory,
            currentDate: new Date().toLocaleDateString(),
          }),
        }
      );

      if (response.status === 429) {
        toast.error("Rate limit exceeded. Please try again in a few moments.");
        return;
      }

      if (response.status === 402) {
        toast.error("AI credits exhausted. Please add credits to continue.");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to generate predictions");
      }

      const data = await response.json();
      const aiText = data.choices?.[0]?.message?.content || "";
      
      setFullAnalysis(aiText);
      const parsedPredictions = parseAIResponse(aiText);
      setPredictions(parsedPredictions);
      
      toast.success("AI predictions generated successfully!");
    } catch (error) {
      console.error("Error generating predictions:", error);
      toast.error("Failed to generate predictions. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getConfidenceBadge = (confidence: string) => {
    const variants = {
      high: "default",
      medium: "secondary",
      low: "outline",
    } as const;
    
    const colors = {
      high: "text-green-600 dark:text-green-400",
      medium: "text-yellow-600 dark:text-yellow-400",
      low: "text-gray-600 dark:text-gray-400",
    };

    return (
      <Badge variant={variants[confidence as keyof typeof variants]} className={colors[confidence as keyof typeof colors]}>
        {confidence.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="w-6 h-6 text-primary" />
            AI-Powered Tomorrow's Predictions
          </CardTitle>
          <CardDescription>
            Advanced machine learning analysis of 16+ years of Kerala Lottery data to generate informed predictions for tomorrow's draw
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={generatePredictions} 
            disabled={isGenerating}
            size="lg"
            className="w-full bg-gradient-to-r from-primary via-primary-glow to-accent hover:opacity-90"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing {lotteryHistory.length} Historical Results...
              </>
            ) : (
              <>
                <TrendingUp className="w-5 h-5 mr-2" />
                Generate AI Predictions for Tomorrow
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Predictions Display */}
      {predictions && predictions.length > 0 && (
        <>
          <Card className="border-2 border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                Top 5 AI Predictions for Tomorrow
              </CardTitle>
              <CardDescription>
                Generated from deep pattern analysis of historical lottery data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {predictions.map((pred, index) => (
                <div
                  key={index}
                  className="p-4 border-2 rounded-lg bg-gradient-to-r from-card to-accent/5 hover:border-primary/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                          {index + 1}
                        </div>
                        <div className="text-3xl font-bold font-mono text-primary tracking-wider">
                          {pred.number}
                        </div>
                        {getConfidenceBadge(pred.confidence)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Reasoning:</strong> {pred.reasoning}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(pred.number, index)}
                      className="flex-shrink-0"
                    >
                      {copiedIndex === index ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Full Analysis */}
          {fullAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle>Complete AI Analysis</CardTitle>
                <CardDescription>
                  Detailed breakdown of patterns and reasoning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm bg-muted/50 p-4 rounded-lg">
                    {fullAnalysis}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Disclaimer */}
      <Card className="border-2 border-yellow-500/20 bg-yellow-500/5">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="text-yellow-600 dark:text-yellow-400">⚠️</div>
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-semibold text-foreground">Important Disclaimer:</p>
              <p>
                These AI-generated predictions are based on statistical analysis and pattern recognition from historical data. 
                Lottery draws are random events, and past results do not guarantee future outcomes. 
              </p>
              <p>
                This tool is for entertainment and educational purposes only. Please gamble responsibly and never bet more than you can afford to lose.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
