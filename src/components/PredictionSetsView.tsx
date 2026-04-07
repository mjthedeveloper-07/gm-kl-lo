import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { generateAllPredictions } from "@/utils/predictionGenerator";
import { lotteryHistory } from "@/data/lotteryHistory";
import { Sparkles, Copy, CheckCircle2, TrendingUp, Calendar, Flame, BarChart3 } from "lucide-react";
import { toast } from "sonner";

export const PredictionSetsView = () => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const predictionSets = useMemo(() => generateAllPredictions(), []);

  // Recent draws (last 10)
  const recentDraws = useMemo(() => {
    return lotteryHistory
      .filter(r => r.lotteryType === "regular")
      .slice(0, 10);
  }, []);

  // Recent frequency stats (last 30 draws)
  const recentStats = useMemo(() => {
    const recent30 = lotteryHistory
      .filter(r => r.lotteryType === "regular")
      .slice(0, 30)
      .map(r => r.result);

    const digitCounts: Record<string, number> = {};
    for (let i = 0; i <= 9; i++) digitCounts[i.toString()] = 0;
    recent30.forEach(num => num.split("").forEach(d => { digitCounts[d]++; }));

    const total = Object.values(digitCounts).reduce((a, b) => a + b, 0);
    const sorted = Object.entries(digitCounts)
      .map(([d, c]) => ({ digit: d, count: c, pct: Math.round((c / total) * 100) }))
      .sort((a, b) => b.count - a.count);

    return { hot: sorted.slice(0, 3), cold: sorted.slice(-3).reverse(), all: sorted };
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case "high":
        return <Badge className="bg-green-600 text-white border-green-600">High</Badge>;
      case "medium":
        return <Badge variant="secondary">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{confidence}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Recent Draws Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Latest Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentDraws[0] && (
              <div>
                <p className="font-mono text-3xl font-bold tracking-wider text-primary">
                  {recentDraws[0].result}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {recentDraws[0].date} • {recentDraws[0].lottery}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-orange-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              Hot Digits (30 draws)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              {recentStats.hot.map(h => (
                <div key={h.digit} className="text-center">
                  <span className="font-mono text-2xl font-bold text-orange-600">{h.digit}</span>
                  <p className="text-xs text-muted-foreground">{h.pct}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              Cold Digits (30 draws)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              {recentStats.cold.map(c => (
                <div key={c.digit} className="text-center">
                  <span className="font-mono text-2xl font-bold text-blue-500">{c.digit}</span>
                  <p className="text-xs text-muted-foreground">{c.pct}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent 10 Draws Strip */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Last 10 Draws
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {recentDraws.map((d, i) => (
              <div key={i} className="text-center p-2 rounded-lg border border-border/50 bg-muted/30">
                <p className="font-mono text-sm font-bold tracking-wider">{d.result}</p>
                <p className="text-[10px] text-muted-foreground">{d.date}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Predictions
          </CardTitle>
          <CardDescription>
            13 methods weighted heavily on recent draws • {lotteryHistory.length} total results analyzed
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Disclaimer */}
      <Card className="border-yellow-500/50 bg-yellow-500/5">
        <CardContent className="pt-4 pb-4">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">⚠️ Disclaimer:</strong> Predictions are for entertainment only. Lottery outcomes are random. Gamble responsibly.
          </p>
        </CardContent>
      </Card>

      {/* Prediction Sets */}
      {predictionSets.map((set, setIndex) => (
        <Card key={setIndex} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-base">{set.method}</CardTitle>
                <CardDescription className="text-xs">{set.description}</CardDescription>
              </div>
              {getConfidenceBadge(set.confidence)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {set.numbers.map((number, numIndex) => (
                <div
                  key={numIndex}
                  className="group relative p-3 rounded-lg border border-primary/20 bg-gradient-to-br from-card to-muted/30 hover:border-primary/40 transition-all cursor-pointer"
                  onClick={() => copyToClipboard(number, `${setIndex}-${numIndex}`)}
                >
                  <div className="flex items-center justify-between gap-1">
                    <div>
                      <p className="text-[10px] text-muted-foreground">#{numIndex + 1}</p>
                      <p className="font-mono text-lg font-bold tracking-wider">{number}</p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      {copiedIndex === `${setIndex}-${numIndex}` ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const allNumbers = set.numbers.join(", ");
                  copyToClipboard(allNumbers, `set-${setIndex}`);
                }}
                className="text-xs h-7 px-2"
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
