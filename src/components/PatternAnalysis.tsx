import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPatternStats, getDigitFrequency, getMostCommonLast4Patterns, getHotAndColdNumbers } from "@/utils/lotteryAnalysis";
import { Badge } from "@/components/ui/badge";
import { useLotteryData } from "@/hooks/useLotteryData";
import { Flame, Snowflake, TrendingUp, Loader2 } from "lucide-react";

interface PatternAnalysisProps {
  pattern?: string;
}

export const PatternAnalysis = ({ pattern }: PatternAnalysisProps) => {
  const { data: lotteryHistory, isLoading } = useLotteryData();

  if (isLoading || lotteryHistory.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p>Loading pattern analysis...</p>
        </CardContent>
      </Card>
    );
  }

  const patternStats = pattern ? getPatternStats(pattern, lotteryHistory) : null;
  const { hot, cold } = getHotAndColdNumbers(lotteryHistory);
  const commonPatterns = getMostCommonLast4Patterns(lotteryHistory);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Pattern Stats */}
      {patternStats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pattern "{pattern}" Analysis</CardTitle>
            <CardDescription>Historical frequency and occurrences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Total Appearances</p>
                <p className="text-3xl font-bold text-primary">{patternStats.frequency}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Seen</p>
                <p className="text-lg font-medium">{patternStats.lastSeen}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <Badge variant={patternStats.frequency > 3 ? "default" : "secondary"}>
                  {patternStats.frequency > 3 ? "High" : patternStats.frequency > 1 ? "Medium" : "Low"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hot Numbers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Hot Numbers
          </CardTitle>
          <CardDescription>Most frequently drawn digits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {hot.map((item, index) => (
              <div key={item.digit} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-lg">
                    {item.digit}
                  </Badge>
                  <span className="text-xs text-muted-foreground">#{index + 1}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{item.count} times</p>
                  <p className="text-xs text-muted-foreground">{item.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cold Numbers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Snowflake className="h-5 w-5 text-blue-500" />
            Cold Numbers
          </CardTitle>
          <CardDescription>Least frequently drawn digits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {cold.map((item) => (
              <div key={item.digit} className="flex items-center justify-between">
                <Badge variant="outline" className="font-mono text-lg">
                  {item.digit}
                </Badge>
                <div className="text-right">
                  <p className="text-sm font-medium">{item.count} times</p>
                  <p className="text-xs text-muted-foreground">{item.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Most Common Last 4 Patterns */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top 10 Last-4 Digit Patterns
          </CardTitle>
          <CardDescription>Most frequently occurring last 4-digit combinations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {commonPatterns.map((pattern, index) => (
              <div key={pattern.pattern} className="rounded-lg border p-3 hover:bg-accent/50 transition-colors">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-mono text-lg font-bold">{pattern.pattern}</span>
                  <Badge variant="secondary" className="text-xs">#{index + 1}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {pattern.frequency} occurrence{pattern.frequency !== 1 ? "s" : ""}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
