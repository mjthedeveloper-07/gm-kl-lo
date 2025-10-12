import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target, Calendar } from "lucide-react";
import { analyzeHistoricalData } from "@/utils/predictionGenerator";

export const KeyFindingsSummary = () => {
  const analysis = analyzeHistoricalData();
  
  const top3Frequent = analysis.topFrequentDigits.slice(0, 3);
  const top3Least = analysis.leastFrequentDigits.slice(0, 3);
  
  return (
    <Card className="shadow-card border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Target className="w-6 h-6 text-primary" />
          Summary of Key Findings
        </CardTitle>
        <CardDescription>
          Deep statistical insights from {analysis.topFrequentDigits[0]?.count * 6 / analysis.topFrequentDigits[0]?.percentage || 0} historical lottery results
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Top 3 Most Frequent Digits */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold">Top 3 Most Frequent Digits (Hot Numbers)</h3>
          </div>
          <div className="flex gap-3">
            {top3Frequent.map((item, index) => (
              <div 
                key={item.digit}
                className="flex-1 bg-gradient-to-br from-green-500/10 to-green-600/5 border-2 border-green-500/30 rounded-lg p-4 text-center"
              >
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {item.digit}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {item.count} times
                </div>
                <Badge variant="secondary" className="mt-2">
                  {item.percentage}% frequency
                </Badge>
                {index === 0 && (
                  <Badge className="mt-1 bg-green-500">Hottest</Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Top 3 Least Frequent Digits */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold">Top 3 Least Frequent Digits (Cold Numbers)</h3>
          </div>
          <div className="flex gap-3">
            {top3Least.map((item, index) => (
              <div 
                key={item.digit}
                className="flex-1 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-2 border-blue-500/30 rounded-lg p-4 text-center"
              >
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {item.digit}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {item.count} times
                </div>
                <Badge variant="secondary" className="mt-2">
                  {item.percentage}% frequency
                </Badge>
                {index === 0 && (
                  <Badge className="mt-1 bg-blue-500">Coldest</Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Most Common Starting and Ending Digits */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-2 border-purple-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-purple-500" />
              <h4 className="font-semibold">Most Common Starting Digit</h4>
            </div>
            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 text-center">
              {analysis.mostCommonStartDigit}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Position 1 leader with {analysis.positionalAnalysis[0][0].frequency} occurrences
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-2 border-orange-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              <h4 className="font-semibold">Most Common Ending Digit</h4>
            </div>
            <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 text-center">
              {analysis.mostCommonEndDigit}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Position 6 leader with {analysis.positionalAnalysis[5][0].frequency} occurrences
            </p>
          </div>
        </div>

        {/* Additional Insights */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h4 className="font-semibold text-sm">Quick Insights:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Most common digit pair: <span className="font-mono font-bold text-foreground">{analysis.digitPairs[0].pair}</span> ({analysis.digitPairs[0].frequency} times)</li>
            <li>• Analyzed temporal patterns: {analysis.temporalPatterns.filter(p => p.type === "monthly").length} monthly, {analysis.temporalPatterns.filter(p => p.type === "daily").length} daily</li>
            <li>• Position-specific analysis available for all 6 digit positions</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
