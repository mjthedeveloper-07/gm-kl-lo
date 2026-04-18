import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flame, TrendingUp, Target, Sparkles, Database } from "lucide-react";
import {
  getFrequencyL4Predictions,
  getRecentHotL4Predictions,
  getPositionalL4Predictions,
  getMirrorL4Predictions,
  getL4PositionalFrequency,
  getL4DatasetStats,
  type L4Prediction,
} from "@/utils/last4DigitsAnalysis";

const confidenceVariant = (c: L4Prediction["confidence"]) =>
  c === "high" ? "default" : c === "medium" ? "secondary" : "outline";

const PredictionGrid = ({ items }: { items: L4Prediction[] }) => (
  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
    {items.map((p, i) => (
      <div
        key={`${p.pattern}-${i}`}
        className="p-4 rounded-lg border bg-card hover:bg-accent/40 transition-colors"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-3xl font-bold tracking-wider text-primary">
            {p.pattern}
          </span>
          <Badge variant={confidenceVariant(p.confidence)} className="uppercase text-[10px]">
            {p.confidence}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{p.source}</span>
          <span className="font-medium">
            {p.frequency}× · {p.percentage}%
          </span>
        </div>
        {p.lastSeen && (
          <p className="text-[11px] text-muted-foreground/80 mt-1">Last seen: {p.lastSeen}</p>
        )}
      </div>
    ))}
  </div>
);

export const Last4DigitsPredictions = () => {
  const stats = useMemo(() => getL4DatasetStats(), []);
  const freq = useMemo(() => getFrequencyL4Predictions(12), []);
  const hot = useMemo(() => getRecentHotL4Predictions(12), []);
  const positional = useMemo(() => getPositionalL4Predictions(12), []);
  const mirror = useMemo(() => getMirrorL4Predictions(12), []);
  const posFreq = useMemo(() => getL4PositionalFrequency(), []);

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            Last 4 Digits — Prediction Engine
          </CardTitle>
          <CardDescription>
            Analysis across {stats.total} historical draws · {stats.uniquePatterns} unique L4 patterns ·{" "}
            {stats.repeatedPatterns} repeating
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Positional digit chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Positional Digit Frequency (Last 4)</CardTitle>
          <CardDescription>Top 5 digits at each L4 position</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {posFreq.map((p) => (
              <div key={p.position} className="space-y-2">
                <div className="text-center text-sm font-semibold text-primary">
                  Position {p.position}
                </div>
                {p.digits.slice(0, 5).map((d) => (
                  <div
                    key={d.digit}
                    className="flex items-center justify-between p-2 rounded bg-muted/40 text-sm"
                  >
                    <Badge variant="outline" className="font-mono">
                      {d.digit}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{d.percentage}%</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Methods */}
      <Tabs defaultValue="frequency" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="frequency">
            <TrendingUp className="h-4 w-4 mr-2" /> Frequency
          </TabsTrigger>
          <TabsTrigger value="hot">
            <Flame className="h-4 w-4 mr-2" /> Hot Streak
          </TabsTrigger>
          <TabsTrigger value="positional">
            <Target className="h-4 w-4 mr-2" /> Positional
          </TabsTrigger>
          <TabsTrigger value="mirror">
            <Sparkles className="h-4 w-4 mr-2" /> Mirror
          </TabsTrigger>
        </TabsList>

        <TabsContent value="frequency" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">High-Frequency L4 Patterns</CardTitle>
              <CardDescription>Most repeated last-4 patterns across all history</CardDescription>
            </CardHeader>
            <CardContent>
              <PredictionGrid items={freq} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hot" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Hot Streak (Last 50 Draws)</CardTitle>
              <CardDescription>L4 patterns trending in recent draws</CardDescription>
            </CardHeader>
            <CardContent>
              <PredictionGrid items={hot} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="positional" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Positional High-Frequency Builds</CardTitle>
              <CardDescription>
                Combinations built from the top digits at each L4 position
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PredictionGrid items={positional} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mirror" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mirror Mapping</CardTitle>
              <CardDescription>
                Mirror transformation (0↔5, 1↔6, 2↔7, 3↔8, 4↔9) of recent L4 patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PredictionGrid items={mirror} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
