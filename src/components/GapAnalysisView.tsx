import { useLotteryData } from "@/hooks/useLotteryData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, AlertTriangle, TrendingUp, Copy, CheckCircle2, Flame } from "lucide-react";
import { performGapAnalysis, generateGapBasedPredictions } from "@/utils/gapAnalysis";
import { useState } from "react";
import { toast } from "sonner";

export const GapAnalysisView = () => {
  const { data: lotteryHistory, isLoading } = useLotteryData();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (isLoading || lotteryHistory.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading gap analysis...</p>
        </CardContent>
      </Card>
    );
  }

  const gapAnalysis = performGapAnalysis(lotteryHistory);
  const gapPredictions = generateGapBasedPredictions(gapAnalysis);

  const getOverdueBadge = (level: "normal" | "warning" | "critical") => {
    switch (level) {
      case "critical":
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="w-3 h-3" />Critical</Badge>;
      case "warning":
        return <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" />Warning</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  };

  const copyToClipboard = (number: string, index: number) => {
    navigator.clipboard.writeText(number);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-2 border-destructive/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Overdue Digits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-destructive">
              {gapAnalysis.overdueDigits.length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Across all positions
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Overdue Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">
              {gapAnalysis.overduePatterns.length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Pairs, triplets, last 4
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Hot Zones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-orange-500">
              {gapAnalysis.hotZones.length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Positions with multiple overdue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gap-Based Predictions */}
      {gapPredictions.length > 0 && (
        <Card className="border-2 border-primary/30 shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Clock className="w-6 h-6 text-primary" />
              Gap-Based Predictions
            </CardTitle>
            <CardDescription>
              Predictions generated using overdue digit and pattern analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {gapPredictions.map((prediction, index) => (
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

      {/* Detailed Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Gap Analysis</CardTitle>
          <CardDescription>
            Comprehensive breakdown of overdue digits, patterns, and hot zones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overdue-digits">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overdue-digits">Overdue Digits</TabsTrigger>
              <TabsTrigger value="overdue-patterns">Overdue Patterns</TabsTrigger>
              <TabsTrigger value="hot-zones">Hot Zones</TabsTrigger>
            </TabsList>

            <TabsContent value="overdue-digits" className="space-y-4 mt-4">
              {gapAnalysis.overdueDigits.map((digitGap, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold w-12 text-center">{digitGap.digit}</div>
                    <div>
                      <div className="font-semibold">Position {digitGap.position}</div>
                      <div className="text-sm text-muted-foreground">
                        Last seen: {digitGap.lastSeenDate}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-destructive">
                        {digitGap.daysSinceLastSeen}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        days (avg: {digitGap.averageGap.toFixed(1)})
                      </div>
                    </div>
                    {getOverdueBadge(digitGap.overdueLevel)}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="overdue-patterns" className="space-y-4 mt-4">
              {gapAnalysis.overduePatterns.map((pattern, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-mono font-bold">{pattern.pattern}</div>
                    <div>
                      <Badge variant="outline" className="capitalize">{pattern.type}</Badge>
                      <div className="text-sm text-muted-foreground mt-1">
                        Occurred {pattern.occurrences}x in history
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {pattern.daysSinceLastSeen}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      days (avg: {pattern.averageGap.toFixed(1)})
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="hot-zones" className="space-y-4 mt-4">
              {gapAnalysis.hotZones.length > 0 ? (
                gapAnalysis.hotZones.map((zone, index) => (
                  <Card key={index} className="border-2 border-orange-500/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Flame className="w-5 h-5 text-orange-500" />
                        Position {zone.position} Hot Zone
                      </CardTitle>
                      <CardDescription>{zone.reason}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {zone.digits.map((digit, idx) => (
                          <Badge key={idx} variant="secondary" className="text-lg px-4 py-2">
                            {digit}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No hot zones detected currently
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
