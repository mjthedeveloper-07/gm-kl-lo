import { Fragment, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { runBacktest, type BacktestReport, type MethodScore } from "@/utils/backtestEngine";
import {
  History,
  Trophy,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  Sparkles,
  Calendar,
} from "lucide-react";

const fmtPct = (v: number) => `${(v * 100).toFixed(2)}%`;

const liftBadge = (lift: number) => {
  if (lift >= 1.5) {
    return (
      <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/40 gap-1">
        <TrendingUp className="h-3 w-3" />
        {lift.toFixed(2)}×
      </Badge>
    );
  }
  if (lift >= 1.0) {
    return (
      <Badge variant="outline" className="gap-1">
        <Minus className="h-3 w-3" />
        {lift.toFixed(2)}×
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/40 gap-1">
      <TrendingDown className="h-3 w-3" />
      {lift.toFixed(2)}×
    </Badge>
  );
};

const confBadge = (c: MethodScore["confidence"]) => {
  switch (c) {
    case "high":
      return <Badge className="bg-green-500">High</Badge>;
    case "medium":
      return <Badge variant="secondary">Medium</Badge>;
    default:
      return <Badge variant="outline">Low</Badge>;
  }
};

const HighlightedNumber = ({ value, matchLen }: { value: string; matchLen: 3 | 4 }) => {
  const head = value.slice(0, value.length - matchLen);
  const tail = value.slice(-matchLen);
  return (
    <span className="font-mono">
      <span className="text-muted-foreground">{head}</span>
      <span className="text-yellow-500 font-bold">{tail}</span>
    </span>
  );
};

export const BacktestReportView = () => {
  const [report, setReport] = useState<BacktestReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [openMethod, setOpenMethod] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    // Defer so the loading skeleton paints first
    const id = setTimeout(() => {
      try {
        const r = runBacktest(365);
        setReport(r);
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const timelineMax = useMemo(
    () => (report ? Math.max(1, ...report.timeline.map(t => t.methodsWithL4Hit.length)) : 1),
    [report],
  );

  if (loading || !report) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-6 w-6" />
              Backtest Report
            </CardTitle>
            <CardDescription>
              Replaying the last 365 draws across all 11 AI prediction methods…
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-6 w-6" />
            Backtest Report
          </CardTitle>
          <CardDescription>
            Each method is re-run against every draw in the last 365 results using only the data
            available <em>before</em> that draw — no look-ahead bias. We then score how often each
            method's predictions matched the actual winning number on the last 4 (L4) and last 3
            (L3) digits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {report.startDate} → {report.endDate}
            </span>
            <span>· {report.evaluatedDraws} draws evaluated</span>
            <span>· {report.methodScores.length} methods tested</span>
          </div>
        </CardContent>
      </Card>

      {/* Headline scoreboard */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-primary/30">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Draws evaluated
            </p>
            <p className="text-3xl font-bold mt-2">{report.evaluatedDraws}</p>
            <p className="text-xs text-muted-foreground mt-1">over the past year</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/40 bg-yellow-500/5">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              Best for L4
            </p>
            <p className="text-lg font-bold mt-2 truncate" title={report.overall.bestMethodForL4}>
              {report.overall.bestMethodForL4}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {fmtPct(report.methodScores.find(m => m.method === report.overall.bestMethodForL4)?.l4HitRate ?? 0)} hit-rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-accent/40">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
              <Target className="h-3 w-3" />
              Best for L3
            </p>
            <p className="text-lg font-bold mt-2 truncate" title={report.overall.bestMethodForL3}>
              {report.overall.bestMethodForL3}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {fmtPct(report.methodScores.find(m => m.method === report.overall.bestMethodForL3)?.l3HitRate ?? 0)} hit-rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Any-method L4 hit-rate
            </p>
            <p className="text-3xl font-bold mt-2 text-primary">
              {fmtPct(report.evaluatedDraws > 0 ? report.overall.anyMethodL4Hits / report.evaluatedDraws : 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {report.overall.anyMethodL4Hits} draws with ≥1 method nailing L4
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent L4 wins highlight */}
      {report.topL4Hits.length > 0 && (
        <Card className="border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 via-card to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Recent L4 Wins
            </CardTitle>
            <CardDescription>
              Most recent draws where at least one prediction method matched the last 4 digits of the actual result.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.topL4Hits.map((hit, idx) => (
                <div
                  key={idx}
                  className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-yellow-500/20 bg-card/60"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold">
                      {hit.date} — {hit.lottery}
                    </span>
                    <span className="text-xs text-muted-foreground">{hit.method}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Predicted</p>
                      <HighlightedNumber value={hit.matched} matchLen={4} />
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Actual</p>
                      <HighlightedNumber value={hit.actual} matchLen={4} />
                    </div>
                    <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/40">
                      L4
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Method leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Method Leaderboard</CardTitle>
          <CardDescription>
            Sorted by L4 hits. <strong>Lift</strong> compares actual hit-rate against what random
            guessing would produce given the same number of predictions per draw. Anything above
            1.0× means the method is genuinely beating chance.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Method</TableHead>
                <TableHead className="text-center">Confidence</TableHead>
                <TableHead className="text-right">L4 Hits</TableHead>
                <TableHead className="text-right">L3 Hits</TableHead>
                <TableHead className="text-center">Lift L4</TableHead>
                <TableHead className="text-center">Lift L3</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.methodScores.map(m => {
                const isOpen = openMethod === m.method;
                return (
                  <Fragment key={m.method}>
                    <TableRow>
                      <TableCell className="font-medium">{m.method}</TableCell>
                      <TableCell className="text-center">{confBadge(m.confidence)}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        <span className="font-bold">{m.l4Hits}</span>
                        <span className="text-muted-foreground"> / {m.totalDraws}</span>
                        <div className="text-xs text-muted-foreground">{fmtPct(m.l4HitRate)}</div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        <span className="font-bold">{m.l3Hits}</span>
                        <span className="text-muted-foreground"> / {m.totalDraws}</span>
                        <div className="text-xs text-muted-foreground">{fmtPct(m.l3HitRate)}</div>
                      </TableCell>
                      <TableCell className="text-center">{liftBadge(m.liftL4)}</TableCell>
                      <TableCell className="text-center">{liftBadge(m.liftL3)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setOpenMethod(isOpen ? null : m.method)}
                          aria-label="Expand"
                        >
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                          />
                        </Button>
                      </TableCell>
                    </TableRow>
                    {isOpen && (
                      <TableRow key={`${m.method}-detail`}>
                        <TableCell colSpan={7} className="bg-muted/30">
                          <div className="py-2 space-y-3">
                            <p className="text-sm text-muted-foreground italic">{m.description}</p>
                            <div className="grid sm:grid-cols-2 gap-3 text-xs">
                              <div>
                                <span className="text-muted-foreground">Predictions per draw: </span>
                                <span className="font-mono">{m.predictionsPerDraw}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">L4 baseline (random): </span>
                                <span className="font-mono">{fmtPct(m.l4Baseline)}</span>
                                <span className="text-muted-foreground"> · L3 baseline: </span>
                                <span className="font-mono">{fmtPct(m.l3Baseline)}</span>
                              </div>
                            </div>
                            {m.recentHits.length > 0 ? (
                              <div>
                                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                                  Last {m.recentHits.length} hits
                                </p>
                                <div className="space-y-1">
                                  {m.recentHits.map((h, hi) => (
                                    <div
                                      key={hi}
                                      className="flex flex-wrap items-center justify-between gap-2 text-xs px-3 py-2 rounded border bg-card"
                                    >
                                      <span className="font-medium">
                                        {h.date} · {h.lottery}
                                      </span>
                                      <div className="flex items-center gap-3">
                                        <span>
                                          <span className="text-muted-foreground">pred </span>
                                          <HighlightedNumber
                                            value={h.matched}
                                            matchLen={h.matchType === "L4" ? 4 : 3}
                                          />
                                        </span>
                                        <span>
                                          <span className="text-muted-foreground">actual </span>
                                          <HighlightedNumber
                                            value={h.actual}
                                            matchLen={h.matchType === "L4" ? 4 : 3}
                                          />
                                        </span>
                                        <Badge
                                          variant="outline"
                                          className={
                                            h.matchType === "L4"
                                              ? "bg-yellow-500/15 border-yellow-500/40"
                                              : ""
                                          }
                                        >
                                          {h.matchType}
                                        </Badge>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground">
                                No L4 or L3 hits recorded for this method in the backtest window.
                              </p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Hit timeline */}
      <Card>
        <CardHeader>
          <CardTitle>L4 Hit Timeline (last 60 draws)</CardTitle>
          <CardDescription>
            Bar height = number of methods that scored an L4 hit on that draw.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-32 overflow-x-auto">
            {report.timeline.map((t, i) => {
              const h = t.methodsWithL4Hit.length;
              const heightPct = (h / timelineMax) * 100;
              return (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1 min-w-[8px]"
                  title={`${t.date} · ${t.lottery} · ${h} L4 / ${t.methodsWithL3Hit.length} L3`}
                >
                  <div
                    className={`w-2 rounded-t ${
                      h > 0 ? "bg-gradient-to-t from-primary to-yellow-500" : "bg-muted"
                    }`}
                    style={{ height: `${Math.max(heightPct, h > 0 ? 12 : 4)}%` }}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="border-yellow-500/50 bg-yellow-500/5">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">⚠️ Disclaimer:</strong> Backtest results show
            historical performance only. Past hit-rates do not guarantee future results. Lottery
            outcomes are random; please use these insights for entertainment and play responsibly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
