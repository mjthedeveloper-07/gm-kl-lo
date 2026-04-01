import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { analyzeHistoricalData } from "@/utils/predictionGenerator";
import { getYearRange, lotteryHistory, getBumperResults, getRegularResults } from "@/data/lotteryHistory";
import { TrendingUp, TrendingDown, BarChart3, Database, Calendar, Flame } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DigitFrequencyChart = ({ analysis, label }: { analysis: ReturnType<typeof analyzeHistoricalData>; label: string }) => (
  <div className="space-y-3">
    {analysis.topFrequentDigits.map((item, index) => {
      const isHot = index < 3;
      const isCold = index >= 7;
      return (
        <div key={item.digit} className="flex items-center gap-4">
          <div className="w-8 text-center">
            <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
          </div>
          <Badge variant={isHot ? "default" : isCold ? "secondary" : "outline"} className="font-mono text-xl w-12 justify-center">
            {item.digit}
          </Badge>
          <div className="flex-1">
            <div className="h-8 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full flex items-center px-3 text-xs font-medium text-white transition-all ${
                  isHot ? "bg-gradient-to-r from-green-500 to-green-600" :
                  isCold ? "bg-gradient-to-r from-blue-400 to-blue-500" :
                  "bg-gradient-to-r from-primary to-accent"
                }`}
                style={{ width: `${Math.max(item.percentage * 1.5, 15)}%` }}
              >
                {item.count} occurrences
              </div>
            </div>
          </div>
          <div className="w-16 text-right">
            <span className="text-lg font-bold">{item.percentage}%</span>
          </div>
          {isHot && <TrendingUp className="h-5 w-5 text-green-500" />}
          {isCold && <TrendingDown className="h-5 w-5 text-blue-500" />}
        </div>
      );
    })}
  </div>
);

const KeyFindings = ({ analysis, totalResults }: { analysis: ReturnType<typeof analyzeHistoricalData>; totalResults: number }) => (
  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
      <p className="text-sm text-muted-foreground mb-1">Most Frequent Digits</p>
      <div className="flex gap-2 flex-wrap">
        {analysis.topFrequentDigits.slice(0, 3).map(d => (
          <Badge key={d.digit} variant="default" className="text-lg font-mono">
            {d.digit} <span className="text-xs ml-1">({d.percentage}%)</span>
          </Badge>
        ))}
      </div>
    </div>
    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
      <p className="text-sm text-muted-foreground mb-1">Least Frequent Digits</p>
      <div className="flex gap-2 flex-wrap">
        {analysis.leastFrequentDigits.slice(0, 3).map(d => (
          <Badge key={d.digit} variant="outline" className="text-lg font-mono">
            {d.digit} <span className="text-xs ml-1">({d.percentage}%)</span>
          </Badge>
        ))}
      </div>
    </div>
    <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
      <p className="text-sm text-muted-foreground mb-1">Most Common Start</p>
      <Badge variant="default" className="text-3xl font-mono px-4 py-2">
        {analysis.mostCommonStartDigit}
      </Badge>
    </div>
    <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
      <p className="text-sm text-muted-foreground mb-1">Most Common End</p>
      <Badge variant="default" className="text-3xl font-mono px-4 py-2">
        {analysis.mostCommonEndDigit}
      </Badge>
    </div>
  </div>
);

const PositionalAnalysis = ({ analysis }: { analysis: ReturnType<typeof analyzeHistoricalData> }) => (
  <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
    {analysis.positionalAnalysis.map((posData, index) => (
      <div key={index} className="space-y-2">
        <div className="text-center font-semibold text-primary">Position {index + 1}</div>
        <div className="space-y-1">
          {posData.slice(0, 5).map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm p-2 rounded bg-muted/50">
              <Badge variant="outline" className="font-mono">{item.digit}</Badge>
              <span className="text-xs text-muted-foreground">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);