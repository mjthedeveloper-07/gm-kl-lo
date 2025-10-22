import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Copy, CheckCircle2, TrendingUp, Target } from "lucide-react";
import { toast } from "sonner";
import { useLotteryData } from "@/hooks/useLotteryData";

export const SeedNumberAnalyzer = () => {
  const { data: lotteryHistory, isLoading } = useLotteryData();
  const [seedNumber, setSeedNumber] = useState("");
  const [analysis, setAnalysis] = useState<{
    digitFrequency: { [key: string]: number };
    patterns: {
      last2: { value: string; count: number };
      last3: { value: string; count: number };
      last4: { value: string; count: number };
      first3: { value: string; count: number };
    };
    positionalRarity: number[];
    avgRarity: number;
  } | null>(null);
  const [predictions, setPredictions] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const analyzeSeedNumber = () => {
    if (seedNumber.length !== 6) {
      toast.error("Please enter a 6-digit number");
      return;
    }

    // Digit frequency breakdown
    const digitFrequency: { [key: string]: number } = {};
    seedNumber.split("").forEach(digit => {
      digitFrequency[digit] = (digitFrequency[digit] || 0) + 1;
    });

    // Analyze patterns
    const last2 = seedNumber.slice(-2);
    const last3 = seedNumber.slice(-3);
    const last4 = seedNumber.slice(-4);
    const first3 = seedNumber.slice(0, 3);

    // Count occurrences in history
    const last2Count = lotteryHistory.filter(r => r.result.endsWith(last2)).length;
    const last3Count = lotteryHistory.filter(r => r.result.endsWith(last3)).length;
    const last4Count = lotteryHistory.filter(r => r.result.endsWith(last4)).length;
    const first3Count = lotteryHistory.filter(r => r.result.startsWith(first3)).length;

    // Positional rarity
    const positionalRarity: number[] = [];
    for (let pos = 0; pos < 6; pos++) {
      const digit = seedNumber[pos];
      const count = lotteryHistory.filter(r => r.result[pos] === digit).length;
      const rarity = (count / lotteryHistory.length) * 100;
      positionalRarity.push(rarity);
    }

    const analysisResult = {
      digitFrequency,
      patterns: {
        last2: { value: last2, count: last2Count },
        last3: { value: last3, count: last3Count },
        last4: { value: last4, count: last4Count },
        first3: { value: first3, count: first3Count }
      },
      positionalRarity,
      avgRarity: positionalRarity.reduce((a, b) => a + b, 0) / 6
    };

    setAnalysis(analysisResult);
    generateSeedBasedPredictions(analysisResult);
    toast.success("Analysis complete!");
  };

  const generateSeedBasedPredictions = (analysisData: any) => {
    const newPredictions: string[] = [];

    // Method 1: Use last 2 digits + hot first 4
    const positionFreq: string[][] = Array(6).fill(null).map(() => []);
    lotteryHistory.forEach(result => {
      for (let pos = 0; pos < 6; pos++) {
        positionFreq[pos].push(result.result[pos]);
      }
    });

    const hotDigitsPerPosition = positionFreq.map(digits => {
      const freq: { [key: string]: number } = {};
      digits.forEach(d => freq[d] = (freq[d] || 0) + 1);
      return Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .map(([digit]) => digit);
    });

    // Prediction 1: Hot digits + seed last 2
    const pred1 = hotDigitsPerPosition.slice(0, 4).map(d => d[0]).join("") + analysisData.patterns.last2.value;
    newPredictions.push(pred1);

    // Prediction 2: Seed first 3 + hot last 3
    const pred2 = analysisData.patterns.first3.value + hotDigitsPerPosition.slice(3, 6).map(d => d[0]).join("");
    newPredictions.push(pred2);

    // Prediction 3: Alternate seed digits with hot digits
    let pred3 = "";
    for (let i = 0; i < 6; i++) {
      if (i % 2 === 0) {
        pred3 += seedNumber[i];
      } else {
        pred3 += hotDigitsPerPosition[i][0];
      }
    }
    newPredictions.push(pred3);

    // Prediction 4: Use seed digit frequency weights
    let pred4 = "";
    for (let i = 0; i < 6; i++) {
      const seedDigit = seedNumber[i];
      const freq = analysisData.digitFrequency[seedDigit] || 1;
      // If digit appears more in seed, use hot digit, else use seed digit
      if (freq > 1) {
        pred4 += hotDigitsPerPosition[i][0];
      } else {
        pred4 += seedDigit;
      }
    }
    newPredictions.push(pred4);

    // Prediction 5: Mirror seed and adjust by 1
    const pred5 = seedNumber.split("").map((d, i) => {
      const num = parseInt(d);
      return ((num + 1 + i) % 10).toString();
    }).join("");
    newPredictions.push(pred5);

    setPredictions([...new Set(newPredictions)]);
  };

  const copyToClipboard = (number: string, index: number) => {
    navigator.clipboard.writeText(number);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast.success("Copied to clipboard!");
  };

  const loadLatestResult = () => {
    if (lotteryHistory.length > 0) {
      setSeedNumber(lotteryHistory[0].result);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20 shadow-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Target className="w-6 h-6 text-primary" />
            Seed Number Analyzer
          </CardTitle>
          <CardDescription>
            Enter today's result or any 6-digit number to generate related predictions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter 6-digit number (e.g., 708982)"
              value={seedNumber}
              onChange={(e) => setSeedNumber(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              className="text-lg"
            />
            <Button onClick={loadLatestResult} variant="outline">
              Load Latest
            </Button>
            <Button onClick={analyzeSeedNumber} className="gap-2">
              <Sparkles className="w-4 h-4" />
              Analyze
            </Button>
          </div>

          {analysis && (
            <div className="space-y-4 animate-fade-in">
              {/* Digit Frequency */}
              <div className="p-4 bg-secondary/20 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Digit Frequency in Seed
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(analysis.digitFrequency).map(([digit, count]) => (
                    <Badge key={digit} variant="secondary">
                      {digit}: {count}x
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Pattern Analysis */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Last 2 Digits</div>
                  <div className="text-xl font-bold">{analysis.patterns.last2.value}</div>
                  <div className="text-xs text-primary">Seen {analysis.patterns.last2.count}x in history</div>
                </div>
                <div className="p-3 bg-accent/10 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Last 3 Digits</div>
                  <div className="text-xl font-bold">{analysis.patterns.last3.value}</div>
                  <div className="text-xs text-primary">Seen {analysis.patterns.last3.count}x in history</div>
                </div>
                <div className="p-3 bg-accent/10 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Last 4 Digits</div>
                  <div className="text-xl font-bold">{analysis.patterns.last4.value}</div>
                  <div className="text-xs text-primary">Seen {analysis.patterns.last4.count}x in history</div>
                </div>
                <div className="p-3 bg-accent/10 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">First 3 Digits</div>
                  <div className="text-xl font-bold">{analysis.patterns.first3.value}</div>
                  <div className="text-xs text-primary">Seen {analysis.patterns.first3.count}x in history</div>
                </div>
              </div>

              {/* Positional Rarity */}
              <div className="p-4 bg-secondary/20 rounded-lg">
                <h3 className="font-semibold mb-3">Positional Rarity Analysis</h3>
                <div className="space-y-2">
                  {seedNumber.split("").map((digit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-20 text-sm font-medium">Pos {index + 1}:</div>
                      <div className="w-12 text-center font-bold">{digit}</div>
                      <div className="flex-1">
                        <div className="h-4 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${analysis.positionalRarity[index]}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-20 text-sm text-right">
                        {analysis.positionalRarity[index].toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  Average Rarity: {analysis.avgRarity.toFixed(1)}%
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {predictions.length > 0 && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Seed-Based Predictions
            </CardTitle>
            <CardDescription>
              Generated predictions based on seed number: {seedNumber}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {predictions.map((prediction, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <span className="text-2xl font-mono font-bold tracking-wider">
                      {prediction}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(prediction, index)}
                    className="gap-2"
                  >
                    {copiedIndex === index ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
