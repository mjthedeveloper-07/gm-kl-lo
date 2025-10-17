import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Target, TrendingUp } from "lucide-react";
import { analyzeResultAgainstPredictions, getRankings, PredictionMatch } from "@/utils/resultAnalysis";
import { toast } from "sonner";

export const ResultAnalysisView = () => {
  const [actualResult, setActualResult] = useState("");
  const [analysis, setAnalysis] = useState<PredictionMatch[] | null>(null);

  const handleAnalyze = () => {
    const clean = actualResult.replace(/\D/g, "");
    
    if (clean.length !== 6) {
      toast.error("Please enter exactly 6 digits");
      return;
    }

    const matches = analyzeResultAgainstPredictions(clean);
    const ranked = getRankings(matches);
    setAnalysis(ranked);
    toast.success("Analysis complete!");
  };

  const getMatchBadge = (match: PredictionMatch) => {
    if (match.exactMatch) {
      return <Badge variant="default" className="bg-green-600">🎯 Exact Match!</Badge>;
    }
    if (match.last4Match) {
      return <Badge variant="secondary">✅ Last 4 Match</Badge>;
    }
    if (match.last3Match) {
      return <Badge variant="secondary">🎲 Last 3 Match</Badge>;
    }
    if (match.matchingDigits >= 3) {
      return <Badge variant="outline">{match.matchingDigits} Digits Match</Badge>;
    }
    return <Badge variant="outline" className="opacity-50">{match.matchingDigits} Digits</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Result Validation
          </CardTitle>
          <CardDescription>
            Enter today's actual lottery result to validate prediction accuracy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="actualResult">Actual Result (6 digits)</Label>
            <div className="flex gap-2">
              <Input
                id="actualResult"
                type="text"
                placeholder="e.g., 749913"
                value={actualResult}
                onChange={(e) => setActualResult(e.target.value)}
                maxLength={6}
                className="text-lg"
              />
              <Button onClick={handleAnalyze} className="whitespace-nowrap">
                <TrendingUp className="w-4 h-4 mr-2" />
                Analyze
              </Button>
            </div>
          </div>

          {actualResult.replace(/\D/g, "").length === 6 && (
            <div className="p-4 bg-primary/10 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-1">Analyzing Result:</p>
              <p className="text-3xl font-bold text-primary font-mono tracking-wider">
                {actualResult.replace(/\D/g, "")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {analysis && (
        <>
          {/* Top Performers */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Top Performing Methods
              </CardTitle>
              <CardDescription>
                Methods ranked by prediction accuracy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.slice(0, 5).map((match, index) => (
                  <div
                    key={match.method}
                    className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{match.method}</p>
                        <p className="text-sm text-muted-foreground font-mono">
                          Best: {match.bestPredictedNumber}
                        </p>
                        {match.matchedPositions.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Matched positions: {match.matchedPositions.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getMatchBadge(match)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* All Methods Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Complete Analysis</CardTitle>
              <CardDescription>
                Performance breakdown for all {analysis.length} prediction methods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analysis.map((match) => (
                  <div
                    key={match.method}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        {match.exactMatch ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : match.last4Match || match.last3Match ? (
                          <Target className="w-5 h-5 text-primary" />
                        ) : (
                          <XCircle className="w-5 h-5 text-muted-foreground opacity-30" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{match.method}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {match.bestPredictedNumber}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getMatchBadge(match)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Summary Statistics */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle>Summary Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {analysis.filter(m => m.exactMatch).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Exact Matches</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {analysis.filter(m => m.last4Match).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Last 4 Matches</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {analysis.filter(m => m.last3Match).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Last 3 Matches</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {analysis.filter(m => m.matchingDigits >= 3).length}
                  </p>
                  <p className="text-xs text-muted-foreground">3+ Digit Matches</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
