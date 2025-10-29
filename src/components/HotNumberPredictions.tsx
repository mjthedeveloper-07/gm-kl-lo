import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, RefreshCw, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { getHotAndColdNumbers } from "@/utils/lotteryAnalysis";

interface HotPrediction {
  number: string;
  method: string;
  confidence: "high" | "medium";
}

export const HotNumberPredictions = () => {
  const [predictions, setPredictions] = useState<HotPrediction[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const hotNumbers = getHotAndColdNumbers().hot.map(item => item.digit);

  const generateHotPredictions = () => {
    const newPredictions: HotPrediction[] = [];
    const hot = hotNumbers; // [7, 9, 8, 6, 5] or similar based on current data

    // Method 1: Pure hot number combinations (high confidence)
    for (let i = 0; i < 15; i++) {
      const shuffled = [...hot].sort(() => Math.random() - 0.5);
      const selection = shuffled.slice(0, 6);
      newPredictions.push({
        number: selection.join(""),
        method: "Hot Mix",
        confidence: "high"
      });
    }

    // Method 2: Hot numbers with repetition (medium confidence)
    for (let i = 0; i < 10; i++) {
      let number = "";
      for (let j = 0; j < 6; j++) {
        number += hot[Math.floor(Math.random() * hot.length)];
      }
      newPredictions.push({
        number,
        method: "Hot Repeat",
        confidence: "medium"
      });
    }

    // Method 3: Sequential hot patterns (high confidence)
    for (let i = 0; i < 8; i++) {
      const start = hot[Math.floor(Math.random() * hot.length)];
      let number = start.toString();
      for (let j = 1; j < 6; j++) {
        number += hot[(hot.indexOf(start) + j) % hot.length];
      }
      newPredictions.push({
        number,
        method: "Hot Sequence",
        confidence: "high"
      });
    }

    // Method 4: Mirror patterns with hot numbers
    for (let i = 0; i < 7; i++) {
      const first3 = [hot[0], hot[1], hot[2]];
      const shuffled = first3.sort(() => Math.random() - 0.5);
      const number = shuffled.join("") + shuffled.reverse().join("");
      newPredictions.push({
        number,
        method: "Hot Mirror",
        confidence: "medium"
      });
    }

    // Method 5: Top 3 hot dominance (very high confidence)
    for (let i = 0; i < 10; i++) {
      let number = "";
      for (let j = 0; j < 6; j++) {
        // 80% chance to use top 3 hot numbers
        const useTop3 = Math.random() < 0.8;
        if (useTop3) {
          number += hot[Math.floor(Math.random() * 3)];
        } else {
          number += hot[Math.floor(Math.random() * hot.length)];
        }
      }
      newPredictions.push({
        number,
        method: "Top 3 Hot",
        confidence: "high"
      });
    }

    setPredictions(newPredictions);
    toast.success(`Generated ${newPredictions.length} hot number predictions`);
  };

  useEffect(() => {
    generateHotPredictions();
  }, []);

  const copyToClipboard = (number: string, index: number) => {
    navigator.clipboard.writeText(number);
    setCopiedIndex(index);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Card className="shadow-elegant border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-red-500/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">🔥 Hot Number Predictions</CardTitle>
              <CardDescription className="mt-1">
                {predictions.length} predictions using top {hotNumbers.length} most frequent digits: {hotNumbers.join(", ")}
              </CardDescription>
            </div>
          </div>
          <Button onClick={generateHotPredictions} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerate
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {predictions.map((pred, idx) => (
            <div
              key={idx}
              className="group relative p-4 rounded-lg border-2 border-border hover:border-orange-500/50 bg-card transition-all hover:shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <Badge 
                  variant={pred.confidence === "high" ? "default" : "secondary"}
                  className={pred.confidence === "high" ? "bg-orange-500 hover:bg-orange-600" : ""}
                >
                  {pred.method}
                </Badge>
                <button
                  onClick={() => copyToClipboard(pred.number, idx)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent rounded"
                  title="Copy to clipboard"
                >
                  {copiedIndex === idx ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="font-mono text-2xl font-bold text-center py-2 tracking-wider text-orange-500">
                {pred.number}
              </div>
              <div className="text-xs text-center text-muted-foreground">
                Confidence: {pred.confidence}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
