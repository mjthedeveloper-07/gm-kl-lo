import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, Copy, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  analyzePositionalFrequency,
  getHotDigits,
  getColdDigits,
  type PositionalAnalysisReport,
} from "@/utils/positionalFrequencyAnalysis";

export const PositionalFrequencyView = () => {
  const [analysis, setAnalysis] = useState<PositionalAnalysisReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    runAnalysis();
  }, []);

  const runAnalysis = () => {
    setIsLoading(true);
    try {
      const result = analyzePositionalFrequency();
      setAnalysis(result);
    } catch (error) {
      toast.error("Failed to analyze frequency data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, index?: number) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
    if (index !== undefined) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const hotDigits = getHotDigits();
  const coldDigits = getColdDigits();

  if (!analysis) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  const positions = [
    { key: 'position1', label: 'Position 1', data: analysis.positionalFrequency.position1 },
    { key: 'position2', label: 'Position 2', data: analysis.positionalFrequency.position2 },
    { key: 'position3', label: 'Position 3', data: analysis.positionalFrequency.position3 },
    { key: 'position4', label: 'Position 4', data: analysis.positionalFrequency.position4 },
    { key: 'position5', label: 'Position 5', data: analysis.positionalFrequency.position5 },
    { key: 'position6', label: 'Position 6', data: analysis.positionalFrequency.position6 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">Positional Frequency Analysis</h2>
          <p className="text-muted-foreground mt-1">
            Comprehensive analysis of digit frequencies by position
          </p>
        </div>
        <Button onClick={runAnalysis} disabled={isLoading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Analysis
        </Button>
      </div>

      {/* Analysis Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Summary</CardTitle>
          <CardDescription>Latest analysis results and status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col space-y-1">
              <span className="text-sm text-muted-foreground">Last Updated</span>
              <span className="text-lg font-semibold">{analysis.lastUpdated}</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm text-muted-foreground">Records Analyzed</span>
              <span className="text-lg font-semibold">{analysis.totalRecordsAnalyzed}</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm text-muted-foreground">Update Trigger</span>
              <span className="text-sm font-mono">{analysis.updateTrigger.split(': ')[1]}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hot and Cold Digits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Hot Digits
            </CardTitle>
            <CardDescription>Most frequent digits across all positions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {hotDigits.map((item) => (
                <div key={item.digit} className="flex flex-col items-center p-3 bg-green-500/10 rounded-lg">
                  <span className="text-2xl font-bold text-green-600">{item.digit}</span>
                  <span className="text-xs text-muted-foreground">{item.totalFrequency}x</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-blue-500" />
              Cold Digits
            </CardTitle>
            <CardDescription>Least frequent digits across all positions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {coldDigits.map((item) => (
                <div key={item.digit} className="flex flex-col items-center p-3 bg-blue-500/10 rounded-lg">
                  <span className="text-2xl font-bold text-blue-600">{item.digit}</span>
                  <span className="text-xs text-muted-foreground">{item.totalFrequency}x</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Significant Changes Alert */}
      {analysis.significantChanges.length > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertCircle className="h-5 w-5" />
              Significant Patterns Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.significantChanges.map((change, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <span className="text-yellow-600 mt-0.5">•</span>
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Positional Frequency Details */}
      <Card>
        <CardHeader>
          <CardTitle>Positional Frequency Analysis</CardTitle>
          <CardDescription>Top 3 most frequent digits for each position</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {positions.map((position, posIndex) => (
              <div key={position.key}>
                {posIndex > 0 && <Separator className="my-4" />}
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">{position.label}</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {position.data.slice(0, 3).map((digit, rank) => (
                      <div
                        key={digit.digit}
                        className="flex flex-col items-center p-4 bg-secondary/50 rounded-lg border"
                      >
                        <Badge variant={rank === 0 ? "default" : "secondary"} className="mb-2">
                          #{rank + 1}
                        </Badge>
                        <span className="text-3xl font-bold mb-1">{digit.digit}</span>
                        <span className="text-sm text-muted-foreground">
                          {digit.frequency} times
                        </span>
                        <span className="text-xs font-semibold text-primary">
                          {digit.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generated Predictions */}
      <Card>
        <CardHeader>
          <CardTitle>Frequency-Based Predictions</CardTitle>
          <CardDescription>
            5 intelligent predictions based on positional frequency analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.predictions.map((prediction, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg border hover:border-primary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Badge variant={index === 0 ? "default" : "outline"}>
                    {index === 0 ? "Primary" : `Variant ${index}`}
                  </Badge>
                  <span className="text-xl font-mono font-bold tracking-wider">
                    {prediction}
                  </span>
                  {index === 0 && (
                    <span className="text-xs text-muted-foreground">
                      (All top 1 digits)
                    </span>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(prediction, index)}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  {copiedIndex === index ? "Copied!" : "Copy"}
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Method:</strong> Predictions are generated by selecting the top 3 most
              frequent digits for each position and creating variations by cycling through
              them. The primary prediction uses all #1 ranked digits, while variants
              systematically substitute with #2 and #3 ranked digits.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
