import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { generateAllPredictions, type PredictionSet } from "@/utils/predictionGenerator";
import { lotteryHistory } from "@/data/lotteryHistory";
import { Sparkles, RefreshCw, Copy, CheckCircle2, Target, TrendingUp } from "lucide-react";
import { toast } from "sonner";

// Score a 6-digit prediction against the latest actual draw.
// Returns matching-digit count (positional) for F3 and L3 separately + total.
const scorePrediction = (predicted: string, actual: string) => {
  const f3p = predicted.slice(0, 3);
  const l3p = predicted.slice(3, 6);
  const f3a = actual.slice(0, 3);
  const l3a = actual.slice(3, 6);
  let f3Match = 0;
  let l3Match = 0;
  for (let i = 0; i < 3; i++) {
    if (f3p[i] === f3a[i]) f3Match++;
    if (l3p[i] === l3a[i]) l3Match++;
  }
  return { f3Match, l3Match, total: f3Match + l3Match };
};

export const PredictionSetsView = () => {
  const [predictionSets, setPredictionSets] = useState<PredictionSet[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const latestDraw = useMemo(() => {
    const r = lotteryHistory[0];
    return r ? { result: r.result, date: r.date, lottery: r.lottery } : null;
  }, []);

  useEffect(() => {
    regeneratePredictions();
  }, []);

  const regeneratePredictions = () => {
    setPredictionSets(generateAllPredictions());
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
        return <Badge className="bg-primary text-primary-foreground">High Confidence</Badge>;
      case "medium":
        return <Badge variant="secondary">Medium Confidence</Badge>;
      case "low":
        return <Badge variant="outline">Low Confidence</Badge>;
      default:
        return <Badge variant="outline">{confidence}</Badge>;
    }
  };

  const methodScore = (numbers: string[]) => {
    if (!latestDraw) return { total: 0, f3: 0, l3: 0, max: numbers.length * 6 };
    let total = 0, f3 = 0, l3 = 0;
    numbers.forEach(n => {
      const s = scorePrediction(n, latestDraw.result);
      total += s.total; f3 += s.f3Match; l3 += s.l3Match;
    });
    return { total, f3, l3, max: numbers.length * 6 };
  };

  const ranked = useMemo(() => {
    return predictionSets
      .map((s, i) => ({ i, score: methodScore(s.numbers).total }))
      .sort((a, b) => b.score - a.score);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [predictionSets, latestDraw]);

  const rankOf = (i: number) => ranked.findIndex(r => r.i === i) + 1;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6" />
                AI Predictions — 10+ Methods Compared
              </CardTitle>
              <CardDescription className="mt-2">
                Each method shown separately with F3 / L3 split and a score against the latest actual draw.
              </CardDescription>
            </div>
            <Button onClick={regeneratePredictions} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Regenerate
            </Button>
          </div>

          {latestDraw && (
            <div className="mt-4 p-3 rounded-lg border bg-muted/40 flex flex-wrap items-center gap-3 text-sm">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Scoring against latest draw:</span>
              <span className="font-semibold">{latestDraw.lottery} • {latestDraw.date}</span>
              <span className="font-mono text-base font-bold tracking-wider">
                <span className="text-primary">{latestDraw.result.slice(0, 3)}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-foreground">{latestDraw.result.slice(3, 6)}</span>
              </span>
            </div>
          )}
        </CardHeader>
      </Card>

      <Card className="border-yellow-500/50 bg-yellow-500/5">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">⚠️ Disclaimer:</strong> Predictions use statistical analysis of historical data.
            Lottery outcomes are random. For entertainment only. Past frequency does not guarantee future results.
          </p>
        </CardContent>
      </Card>

      {predictionSets.map((set, setIndex) => {
        const score = methodScore(set.numbers);
        const rank = rankOf(setIndex);
        return (
          <Card key={setIndex} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="space-y-2">
                  <CardTitle className="text-xl flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="font-mono">#{setIndex + 1}</Badge>
                    {set.method}
                    {rank === 1 && (
                      <Badge className="bg-primary text-primary-foreground gap-1">
                        <TrendingUp className="h-3 w-3" />Top Match
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{set.description}</CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getConfidenceBadge(set.confidence)}
                  <div className="flex gap-2 text-xs">
                    <Badge variant="outline">Rank {rank}/{predictionSets.length}</Badge>
                    <Badge variant="secondary" className="font-mono">
                      Score {score.total}/{score.max}
                    </Badge>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <Badge variant="outline" className="font-mono">F3: {score.f3}</Badge>
                    <Badge variant="outline" className="font-mono">L3: {score.l3}</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {set.numbers.map((number, numIndex) => {
                  const f3 = number.slice(0, 3);
                  const l3 = number.slice(3, 6);
                  const s = latestDraw
                    ? scorePrediction(number, latestDraw.result)
                    : { f3Match: 0, l3Match: 0, total: 0 };
                  return (
                    <div
                      key={numIndex}
                      className="group relative p-4 rounded-lg border-2 border-primary/20 bg-gradient-to-br from-card to-card/50 hover:border-primary/50 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-xs text-muted-foreground">#{numIndex + 1}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => copyToClipboard(number, `${setIndex}-${numIndex}`)}
                        >
                          {copiedIndex === `${setIndex}-${numIndex}` ? (
                            <CheckCircle2 className="h-3 w-3 text-primary" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>

                      <div className="flex items-baseline justify-center gap-2">
                        <div className="text-center">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">F3</p>
                          <p className="font-mono text-xl font-bold text-primary">{f3}</p>
                        </div>
                        <span className="text-muted-foreground text-xl font-bold">·</span>
                        <div className="text-center">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">L3</p>
                          <p className="font-mono text-3xl font-bold text-foreground">{l3}</p>
                        </div>
                      </div>

                      {latestDraw && (
                        <div className="mt-3 flex justify-center gap-1.5 text-[10px]">
                          <Badge variant="outline" className="font-mono py-0">F:{s.f3Match}</Badge>
                          <Badge variant="outline" className="font-mono py-0">L:{s.l3Match}</Badge>
                          <Badge
                            variant={s.total >= 3 ? "default" : "secondary"}
                            className="font-mono py-0"
                          >
                            ={s.total}
                          </Badge>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(set.numbers.join(", "), `set-${setIndex}`)}
                  className="text-xs"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy All
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
