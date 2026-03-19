import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Copy, CheckCircle2, Hash, BarChart3, Sparkles, Target } from "lucide-react";
import { toast } from "sonner";
import {
  generateAllLast2Predictions,
  getMostCommonLast2Patterns,
  getPositionalFrequencyLast2,
  validateLast2Prediction,
  type Last2Prediction,
  type Last2Pattern,
} from "@/utils/last2DigitsAnalysis";
import { lotteryHistory } from "@/data/lotteryHistory";

export const Last2DigitsPredictions = () => {
  const [predictions, setPredictions] = useState<ReturnType<typeof generateAllLast2Predictions> | null>(null);
  const [topPatterns, setTopPatterns] = useState<Last2Pattern[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const regenerate = () => {
    setPredictions(generateAllLast2Predictions());
    setTopPatterns(getMostCommonLast2Patterns(20));
    toast.success("Last 2 digits predictions regenerated");
  };

  useEffect(() => { regenerate(); }, []);

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const confidenceBadge = (c: string) => {
    if (c === "high") return <Badge className="bg-green-500/90 text-white">High</Badge>;
    if (c === "medium") return <Badge variant="secondary">Medium</Badge>;
    return <Badge variant="outline">Low</Badge>;
  };

  const latestLast2 = lotteryHistory[0]?.result.slice(-2) || "--";

  const PredictionCard = ({ p, idx, prefix }: { p: Last2Prediction; idx: number; prefix: string }) => {
    const validation = validateLast2Prediction(p.number);
    const id = `${prefix}-${idx}`;
    return (
      <div className="group relative p-4 rounded-lg border-2 border-primary/20 bg-gradient-to-br from-card to-card/50 hover:border-primary/50 hover:shadow-md transition-all">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {confidenceBadge(p.confidence)}
              <span className="text-xs text-muted-foreground truncate">{p.method}</span>
            </div>
            <p className="font-mono text-3xl font-bold text-primary">{p.number}</p>
            <p className="text-xs text-muted-foreground mt-1 truncate">{p.reason}</p>
            {validation.matches > 0 && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                <Target className="h-3 w-3" />
                Matched {validation.matches}x in history
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => copy(p.number, id)}
          >
            {copiedId === id ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    );
  };

  const { pos5, pos6 } = getPositionalFrequencyLast2();
  const top5 = Object.entries(pos5).sort((a, b) => b[1] - a[1]);
  const top6 = Object.entries(pos6).sort((a, b) => b[1] - a[1]);

  if (!predictions) return null;

  const sections: { key: keyof typeof predictions; label: string; icon: React.ReactNode; desc: string }[] = [
    { key: "frequency", label: "Frequency", icon: <BarChart3 className="h-4 w-4" />, desc: "Most common last 2 digit pairs from history" },
    { key: "mirror", label: "Mirror", icon: <Sparkles className="h-4 w-4" />, desc: "Mirror number formula applied to last 2 digits" },
    { key: "positional", label: "Positional", icon: <Hash className="h-4 w-4" />, desc: "Based on digit frequency at positions 5 & 6" },
    { key: "delta", label: "Delta", icon: <Target className="h-4 w-4" />, desc: "Delta differences between consecutive results" },
    { key: "sum", label: "Sum", icon: <BarChart3 className="h-4 w-4" />, desc: "Digit pairs with most common digit sums" },
    { key: "powerMapping", label: "Power Map", icon: <Sparkles className="h-4 w-4" />, desc: "A(x) = (x+5) mod 10 iterations" },
  ];

  return (
    <div className="space-y-6">
      {/* Latest Last 2 */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Latest Last 2 Digits</CardTitle>
          <CardDescription>Current reference from latest result</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {lotteryHistory[0]?.date} — {lotteryHistory[0]?.lottery}
              </p>
              <p className="font-mono text-5xl font-bold text-primary mt-1">{latestLast2}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Full result: {lotteryHistory[0]?.result}
              </p>
            </div>
            <Button onClick={regenerate} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Regenerate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Positional Frequency Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Position 5 & 6 Digit Frequency</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-semibold mb-2">5th Digit (tens)</p>
              <div className="space-y-1">
                {top5.map(([d, c]) => (
                  <div key={d} className="flex items-center gap-2">
                    <span className="font-mono font-bold w-6 text-center">{d}</span>
                    <div className="flex-1 h-4 rounded bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary/60 rounded"
                        style={{ width: `${(c / lotteryHistory.length) * 100 * 5}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">{c}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold mb-2">6th Digit (units)</p>
              <div className="space-y-1">
                {top6.map(([d, c]) => (
                  <div key={d} className="flex items-center gap-2">
                    <span className="font-mono font-bold w-6 text-center">{d}</span>
                    <div className="flex-1 h-4 rounded bg-muted overflow-hidden">
                      <div
                        className="h-full bg-accent/60 rounded"
                        style={{ width: `${(c / lotteryHistory.length) * 100 * 5}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prediction Tabs */}
      <Tabs defaultValue="frequency">
        <TabsList className="grid w-full grid-cols-6">
          {sections.map(s => (
            <TabsTrigger key={s.key} value={s.key} className="text-xs gap-1">
              {s.icon}
              {s.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {sections.map(s => (
          <TabsContent key={s.key} value={s.key}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">{s.icon} {s.label} Predictions</CardTitle>
                <CardDescription>{s.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {predictions[s.key].map((p, i) => (
                    <PredictionCard key={i} p={p} idx={i} prefix={s.key} />
                  ))}
                </div>
                <div className="mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copy(predictions[s.key].map(p => p.number).join(", "), `all-${s.key}`)}
                    className="text-xs"
                  >
                    <Copy className="h-3 w-3 mr-1" /> Copy All
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Top Historical Patterns */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Top 20 Most Common Last 2 Digit Patterns</CardTitle>
          <CardDescription>Historical frequency from {lotteryHistory.length} results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-10 gap-2">
            {topPatterns.map((p, i) => (
              <div
                key={p.pattern}
                className="text-center p-2 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-all"
                onClick={() => copy(p.pattern, `pattern-${i}`)}
              >
                <p className="font-mono text-lg font-bold text-primary">{p.pattern}</p>
                <p className="text-xs text-muted-foreground">{p.frequency}x</p>
                <p className="text-[10px] text-muted-foreground">{p.percentage.toFixed(1)}%</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="border-yellow-500/50 bg-yellow-500/5">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">⚠️ Disclaimer:</strong> These last 2 digit predictions use statistical analysis of historical data.
            Lottery outcomes are random. Use for entertainment only. Gamble responsibly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
