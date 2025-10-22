import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface TrendVisualizationProps {
  historicalValues: { date: string; value: number }[];
  projectedValue: number;
  candidates: { name: string; value: number; color: string }[];
  trendDirection: "upward" | "downward" | "stable";
  confidenceInterval: { lower: number; upper: number };
}

export const TrendVisualization = ({
  historicalValues,
  projectedValue,
  candidates,
  trendDirection,
  confidenceInterval
}: TrendVisualizationProps) => {
  // Prepare chart data
  const chartData = [
    ...historicalValues.map(d => ({ date: d.date, actual: d.value, projected: null })),
    { 
      date: "Oct 18 (Projected)", 
      actual: null, 
      projected: projectedValue,
      ...Object.fromEntries(candidates.map(c => [c.name, c.value]))
    }
  ];

  const TrendIcon = trendDirection === "upward" ? TrendingUp : trendDirection === "downward" ? TrendingDown : Minus;
  const trendColor = trendDirection === "upward" ? "text-green-500" : trendDirection === "downward" ? "text-red-500" : "text-yellow-500";

  return (
    <Card className="shadow-elevated">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendIcon className={`w-5 h-5 ${trendColor}`} />
              October 2025 Trend Analysis
            </CardTitle>
            <CardDescription>
              Historical progression from October 1-17 with projections for October 18
            </CardDescription>
          </div>
          <Badge variant={trendDirection === "upward" ? "default" : trendDirection === "downward" ? "destructive" : "secondary"}>
            {trendDirection.charAt(0).toUpperCase() + trendDirection.slice(1)} Trend
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
                formatter={(value: number) => value.toLocaleString()}
              />
              
              {/* Historical actual values */}
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
                name="Actual Results"
              />
              
              {/* Projected value */}
              <Line 
                type="monotone" 
                dataKey="projected" 
                stroke="hsl(var(--accent))" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "hsl(var(--accent))", r: 6 }}
                name="Trend Projection"
              />
              
              {/* Candidate predictions */}
              {candidates.map(candidate => (
                <Line 
                  key={candidate.name}
                  type="monotone" 
                  dataKey={candidate.name} 
                  stroke={candidate.color}
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  dot={{ fill: candidate.color, r: 5 }}
                  name={candidate.name}
                />
              ))}
              
              {/* Confidence interval */}
              <ReferenceLine 
                y={confidenceInterval.upper} 
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="3 3"
                label={{ value: "Upper CI", position: "right", fill: "hsl(var(--muted-foreground))" }}
              />
              <ReferenceLine 
                y={confidenceInterval.lower} 
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="3 3"
                label={{ value: "Lower CI", position: "right", fill: "hsl(var(--muted-foreground))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-primary rounded" />
            <span className="text-xs text-muted-foreground">Actual Results</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-accent rounded" style={{ borderTop: "2px dashed" }} />
            <span className="text-xs text-muted-foreground">Trend Projection</span>
          </div>
          {candidates.map(candidate => (
            <div key={candidate.name} className="flex items-center gap-2">
              <div className="w-4 h-1 rounded" style={{ backgroundColor: candidate.color, borderTop: "2px dashed" }} />
              <span className="text-xs text-muted-foreground">{candidate.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
