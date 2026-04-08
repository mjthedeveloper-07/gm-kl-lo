import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { generateAllPredictions, analyzeRecentDraws, type PredictionSet } from "@/utils/predictionGenerator";
import { Sparkles, RefreshCw, Copy, CheckCircle2, Flame, Snowflake } from "lucide-react";
import { toast } from "sonner";

export const PredictionSetsView = () => {
  const [predictionSets, setPredictionSets] = useState<PredictionSet[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const recentInfo = analyzeRecentDraws();
  const recentAnalysis = recentInfo.analysis;
  const hotDigits = recentAnalysis.topFrequentDigits.slice(0, 5);
  const coldDigits = recentAnalysis.topFrequentDigits.slice(-5);
  const lastDraw = recentInfo.data[recentInfo.data.length - 1];
  const last10 = recentInfo.data.slice(-10).reverse();

  // Last 2 digit frequency from recent
  const last2Counts: { [key: string]: number } = {};
  recentInfo.data.forEach(r => {
    const l2 = r.result.slice(-2);
    last2Counts[l2] = (last2Counts[l2] || 0) + 1;
  });
  const topLast2 = Object.entries(last2Counts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  useEffect(() => {
    regeneratePredictions();
  }, []);

  const regeneratePredictions = () => {
    const predictions = generateAllPredictions();
    setPredictionSets(predictions);
    toast.success("Predictions updated with latest 67 draws analysis");
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    toast.success("Copied!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case "high":
        return <Badge className="bg-green-600 text-white">High</Badge>;
      case "medium":
        return <Badge variant="secondary">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{confidence}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Recent Analysis Dashboard */}
      <Card className="border-primary/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Predictions — Last {recentInfo.drawCount} Draws
            </CardTitle>
            <Button onClick={regeneratePredictions} variant="outline" size="sm" className="gap-1">
              <RefreshCw className="h-3 w-3" />
              Refresh
            </Button>
          </div>
          <CardDescription>
            Analysis period: Feb 1 – Apr 8, 2026 | Latest: {lastDraw?.result}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Latest Draw */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">Latest Result ({lastDraw?.date})</p>
            <p className="font-mono text-3xl font-bold tracking-wider text-primary">{lastDraw?.result}</p>
          </div>

          {/* Hot & Cold Digits */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
              <p className="text-xs font-medium flex items-center gap-1 mb-2">
                <Flame className="h-3 w-3 text-red-500" /> Hot Digits (Recent)
              </p>
              <div className="flex gap-1.5 flex-wrap">
                {hotDigits.map(d => (
                  <span key={d.digit} className="font-mono text-sm font-bold bg-red-500/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded">
                    {d.digit} <span className="text-xs opacity-70">{d.percentage}%</span>
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
              <p className="text-xs font-medium flex items-center gap-1 mb-2">
                <Snowflake className="h-3 w-3 text-blue-500" /> Cold Digits (Recent)
              </p>
              <div className="flex gap-1.5 flex-wrap">
                {coldDigits.map(d => (
                  <span key={d.digit} className="font-mono text-sm font-bold bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">
                    {d.digit} <span className="text-xs opacity-70">{d.percentage}%</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Top Last 2 Patterns */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">🎯 Top Last-2 Patterns (Recent)</p>
            <div className="flex gap-1.5 flex-wrap">
              {topLast2.map(([pattern, count]) => (
                <span key={pattern} className="font-mono text-xs bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20">
                  {pattern} <span className="opacity-60">×{count}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Recent Draws Strip */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Recent 10 Draws</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {last10.map((draw, i) => (
                <div key={i} className="flex-shrink-0 text-center">
                  <p className="font-mono text-xs font-bold bg-muted px-2 py-1 rounded">{draw.result}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{draw.date.split(',')[0]}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="border-yellow-500/50 bg-yellow-500/5">
        <CardContent className="py-3">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">⚠️</strong> For entertainment only. Lottery outcomes are random. Gamble responsibly.
          </p>
        </CardContent>
      </Card>

      {/* Prediction Sets */}
      {predictionSets.map((set, setIndex) => (
        <Card key={setIndex} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <CardTitle className="text-base leading-tight">{set.method}</CardTitle>
                <CardDescription className="text-xs">{set.description}</CardDescription>
              </div>
              {getConfidenceBadge(set.confidence)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {set.numbers.map((number, numIndex) => (
                <div
                  key={numIndex}
                  className="group relative p-3 rounded-lg border border-primary/20 bg-gradient-to-br from-card to-card/50 hover:border-primary/50 transition-all cursor-pointer"
                  onClick={() => copyToClipboard(number, `${setIndex}-${numIndex}`)}
                >
                  <p className="text-[10px] text-muted-foreground">#{numIndex + 1}</p>
                  <p className="font-mono text-xl font-bold text-foreground">{number}</p>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {copiedIndex === `${setIndex}-${numIndex}` ? (
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(set.numbers.join(", "), `set-${setIndex}`)}
              className="text-xs mt-2"
            >
              <Copy className="h-3 w-3 mr-1" /> Copy All
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
