import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, TrendingUp, Copy, Check, RefreshCw, Target, Sigma, Link2 } from "lucide-react";
import { toast } from "sonner";
import {
  generateDeltaPredictions,
  generateSumBasedPredictions,
  generatePairBasedPredictions,
  getSumStatistics,
  analyzeNumberPairs,
  getHotAndColdNumbers,
  calculateSum
} from "@/utils/lotteryAnalysis";

interface Prediction {
  number: string;
  method: string;
  confidence: "high" | "medium" | "low";
  sum?: number;
  inRange?: boolean;
}

export const AdvancedFormulasPredictions = () => {
  const [deltaPredictions, setDeltaPredictions] = useState<Prediction[]>([]);
  const [sumPredictions, setSumPredictions] = useState<Prediction[]>([]);
  const [pairPredictions, setPairPredictions] = useState<Prediction[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [sumStats, setSumStats] = useState(getSumStatistics());
  const [topPairs, setTopPairs] = useState(analyzeNumberPairs().slice(0, 5));
  const { hot, cold } = getHotAndColdNumbers();

  const generateAllPredictions = () => {
    // Delta System Predictions
    const deltaResults: Prediction[] = generateDeltaPredictions(15).map(num => ({
      number: num,
      method: "Delta System",
      confidence: "medium",
      sum: calculateSum(num),
      inRange: false
    }));

    // Sum Analysis Predictions
    const sumResults: Prediction[] = generateSumBasedPredictions(15).map(num => {
      const sum = calculateSum(num);
      const inRange = sum >= sumStats.commonRange.lower && sum <= sumStats.commonRange.upper;
      return {
        number: num,
        method: "Sum Analysis",
        confidence: inRange ? "high" : "medium",
        sum,
        inRange
      };
    });

    // Pair-Based Predictions
    const pairResults: Prediction[] = generatePairBasedPredictions(15).map(num => ({
      number: num,
      method: "Number Pairing",
      confidence: "high",
      sum: calculateSum(num),
      inRange: false
    }));

    setDeltaPredictions(deltaResults);
    setSumPredictions(sumResults);
    setPairPredictions(pairResults);
    
    toast.success("Generated predictions using advanced formulas");
  };

  useEffect(() => {
    generateAllPredictions();
  }, []);

  const copyToClipboard = (number: string, index: string) => {
    navigator.clipboard.writeText(number);
    setCopiedIndex(index);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const PredictionCard = ({ pred, index, type }: { pred: Prediction; index: number; type: string }) => (
    <div className="group relative p-4 rounded-lg border-2 border-border hover:border-primary/50 bg-card transition-all hover:shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <Badge 
          variant={pred.confidence === "high" ? "default" : pred.confidence === "medium" ? "secondary" : "outline"}
          className={pred.confidence === "high" ? "bg-primary" : ""}
        >
          {pred.method}
        </Badge>
        <button
          onClick={() => copyToClipboard(pred.number, `${type}-${index}`)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent rounded"
          title="Copy to clipboard"
        >
          {copiedIndex === `${type}-${index}` ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
      <div className="font-mono text-2xl font-bold text-center py-2 tracking-wider text-primary">
        {pred.number}
      </div>
      <div className="text-xs text-center space-y-1">
        <div className="text-muted-foreground">
          Confidence: {pred.confidence}
        </div>
        {pred.sum && (
          <div className={`font-medium ${pred.inRange ? "text-green-500" : "text-muted-foreground"}`}>
            Sum: {pred.sum} {pred.inRange && "✓ In Range"}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Card className="shadow-elegant border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/70">
              <LineChart className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl">📊 Advanced Formula Predictions</CardTitle>
              <CardDescription className="mt-1">
                Using Sum Analysis, Delta System & Number Pairing methods
              </CardDescription>
            </div>
          </div>
          <Button onClick={generateAllPredictions} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerate All
          </Button>
        </div>

        {/* Statistics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <div className="p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-2 mb-2">
              <Sigma className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Sum Statistics</span>
            </div>
            <div className="text-xs space-y-1 text-muted-foreground">
              <div>Average: <span className="font-bold text-foreground">{sumStats.average}</span></div>
              <div>Common Range: <span className="font-bold text-foreground">{sumStats.commonRange.lower}-{sumStats.commonRange.upper}</span></div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Hot Numbers</span>
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-bold text-foreground">{hot.map(h => h.digit).join(", ")}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-2 mb-2">
              <Link2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Top Pairs</span>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              {topPairs.slice(0, 3).map((pair, idx) => (
                <div key={idx}>
                  <span className="font-bold text-foreground">{pair.pair}</span> ({pair.frequency})
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="sum" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sum">
              <Sigma className="w-4 h-4 mr-2" />
              Sum Analysis
            </TabsTrigger>
            <TabsTrigger value="pair">
              <Link2 className="w-4 h-4 mr-2" />
              Number Pairs
            </TabsTrigger>
            <TabsTrigger value="delta">
              <Target className="w-4 h-4 mr-2" />
              Delta System
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sum" className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/30 border-l-4 border-primary">
              <p className="text-sm text-muted-foreground">
                <strong>Sum Analysis:</strong> Generates numbers whose digit sum falls within the historical common range ({sumStats.commonRange.lower}-{sumStats.commonRange.upper}). 
                Numbers marked with ✓ are within this optimal range.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sumPredictions.map((pred, idx) => (
                <PredictionCard key={idx} pred={pred} index={idx} type="sum" />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pair" className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/30 border-l-4 border-primary">
              <p className="text-sm text-muted-foreground">
                <strong>Number Pairing:</strong> Uses frequently appearing digit combinations from historical data. 
                Top pairs: {topPairs.slice(0, 3).map(p => p.pair).join(", ")}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {pairPredictions.map((pred, idx) => (
                <PredictionCard key={idx} pred={pred} index={idx} type="pair" />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="delta" className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/30 border-l-4 border-primary">
              <p className="text-sm text-muted-foreground">
                <strong>Delta System:</strong> Generates sequential patterns by adding a fixed interval (delta) between digits. 
                Uses deltas: 3, 5, 7, 9, 11 starting from low numbers.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {deltaPredictions.map((pred, idx) => (
                <PredictionCard key={idx} pred={pred} index={idx} type="delta" />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Disclaimer */}
        <div className="mt-6 p-4 rounded-lg bg-destructive/10 border-2 border-destructive/30">
          <p className="text-sm font-medium text-destructive mb-2">⚠️ Important Disclaimer</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Kerala lottery draws are completely random. There is <strong>no proven scientific method</strong> to predict winning numbers. 
            These analyses are for <strong>informational and entertainment purposes only</strong> and do not guarantee a win. 
            The lottery is designed with odds heavily in favor of the state. <strong>Play responsibly and within your means.</strong> Never spend money meant for essentials. 
            Treat this as entertainment, not an investment strategy.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
