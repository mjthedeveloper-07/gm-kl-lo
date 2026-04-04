import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Hash, TrendingUp, Flame, Zap } from "lucide-react";
import {
  getTopLast2Patterns,
  getPositionalFrequency,
  getAllLast2Predictions,
  type Last2Prediction,
} from "@/utils/last2DigitsAnalysis";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const confidenceBadge = (c: number) => {
  if (c >= 75) return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">High {c}%</Badge>;
  if (c >= 50) return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Med {c}%</Badge>;
  return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Low {c}%</Badge>;
};

export const Last2DigitsPredictions = () => {
  const [inputLast2, setInputLast2] = useState("");

  const topPatterns = useMemo(() => getTopLast2Patterns(30), []);
  const positional = useMemo(() => getPositionalFrequency(), []);
  const predictions = useMemo(() => getAllLast2Predictions(inputLast2 || undefined), [inputLast2]);

  const tensData = Object.entries(positional.tens)
    .map(([digit, count]) => ({ digit, count }))
    .sort((a, b) => b.count - a.count);

  const unitsData = Object.entries(positional.units)
    .map(([digit, count]) => ({ digit, count }))
    .sort((a, b) => b.count - a.count);

  const maxCount = topPatterns[0]?.count || 1;
  const COLORS = ["#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#ef4444", "#6366f1", "#a855f7"];

  return (
    <div className="space-y-6">
      {/* Input for mirror predictions */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-primary" />
            Last 2 Digits Prediction Engine
          </CardTitle>
          <CardDescription>
            Analyzing {topPatterns.reduce((s, p) => s + p.count, 0)}+ results • Enter last 2 digits for mirror predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Enter last 2 digits (e.g. 05)"
              value={inputLast2}
              onChange={(e) => setInputLast2(e.target.value.replace(/\D/g, "").slice(0, 2))}
              maxLength={2}
              className="max-w-[200px] text-lg font-mono"
            />
            <Button variant="outline" onClick={() => setInputLast2("")}>Clear</Button>
          </div>
        </CardContent>
      </Card>

      {/* Positional Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tens Place (Position 5)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={tensData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="digit" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {tensData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Units Place (Position 6)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={unitsData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="digit" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {unitsData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Prediction Methods */}
      <Tabs defaultValue="High Frequency">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="High Frequency">
            <Flame className="h-4 w-4 mr-1" /> Frequency
          </TabsTrigger>
          <TabsTrigger value="Mirror Power Map">
            <Zap className="h-4 w-4 mr-1" /> Mirror
          </TabsTrigger>
          <TabsTrigger value="Delta Pattern">Delta</TabsTrigger>
          <TabsTrigger value="Sum Pattern">Sum</TabsTrigger>
        </TabsList>

        {Object.entries(predictions).map(([method, preds]) => (
          <TabsContent key={method} value={method}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  {method} Predictions
                </CardTitle>
                <CardDescription>
                  {preds.length} predictions
                  {method === "Mirror Power Map" && !inputLast2 && " — Enter last 2 digits above to generate"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {preds.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    Enter last 2 digits above to generate mirror predictions
                  </p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {preds.map((p, i) => (
                      <PredictionCard key={i} prediction={p} rank={i + 1} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Top Patterns Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Top 30 High-Frequency Last 2-Digit Patterns
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {topPatterns.map((p, i) => (
            <div key={p.pattern} className="flex items-center gap-3">
              <span className="w-8 text-sm font-bold text-muted-foreground">#{i + 1}</span>
              <span className="text-2xl font-mono font-bold text-primary w-12">{p.pattern}</span>
              <Progress value={(p.count / maxCount) * 100} className="flex-1 h-3" />
              <span className="text-sm font-semibold w-16 text-right">{p.count}×</span>
              <span className="text-xs text-muted-foreground w-16 text-right">{p.percentage}%</span>
              <span className="text-xs text-muted-foreground w-24 text-right truncate">{p.lastSeen}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

const PredictionCard = ({ prediction, rank }: { prediction: Last2Prediction; rank: number }) => (
  <div className="bg-card border rounded-lg p-3 text-center hover:border-primary/50 transition-colors">
    <div className="text-xs text-muted-foreground mb-1">#{rank}</div>
    <div className="text-3xl font-mono font-bold text-primary">{prediction.digits}</div>
    <div className="mt-2">{confidenceBadge(prediction.confidence)}</div>
    {prediction.frequency && (
      <div className="text-xs text-muted-foreground mt-1">{prediction.frequency}× seen</div>
    )}
  </div>
);
