import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { Activity, TrendingUp, Target } from "lucide-react";
import {
  getAllComplexNumbers,
  analyzeMagnitudeDistribution,
  analyzePhaseDistribution,
  analyzeComplexJumpDistances,
  analyzeConsecutiveRatios,
  type ComplexNumber
} from "@/utils/complexNumberAnalysis";

export const ComplexPlaneAnalysis = () => {
  const allComplexNumbers = getAllComplexNumbers();
  const magnitudeStats = analyzeMagnitudeDistribution();
  const phaseStats = analyzePhaseDistribution();
  const jumpStats = analyzeComplexJumpDistances();
  const ratioStats = analyzeConsecutiveRatios();

  // Prepare scatter plot data (sample for performance)
  const scatterData = allComplexNumbers.slice(0, 100).map((num, idx) => ({
    x: num.real,
    y: num.imag,
    magnitude: num.magnitude.toFixed(0),
    phase: num.phase.toFixed(1),
    index: idx
  }));

  // Prepare magnitude histogram
  const magnitudeHistData = magnitudeStats.histogram.map(h => ({
    bin: h.bin,
    count: h.count
  }));

  // Prepare jump distance histogram
  const jumpHistData = jumpStats.histogram.map(h => ({
    bin: h.bin,
    count: h.count
  }));

  // Prepare quadrant data
  const quadrantData = [
    { name: "Q1 (0°-90°)", value: phaseStats.quadrantDistribution[0] },
    { name: "Q2 (90°-180°)", value: phaseStats.quadrantDistribution[1] },
    { name: "Q3 (-180°--90°)", value: phaseStats.quadrantDistribution[2] },
    { name: "Q4 (-90°-0°)", value: phaseStats.quadrantDistribution[3] }
  ];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

  return (
    <div className="space-y-4">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Magnitude Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mean:</span>
                <span className="font-bold">{magnitudeStats.mean.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Std Dev:</span>
                <span className="font-bold">{magnitudeStats.stdDev.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Range:</span>
                <span className="font-bold">{magnitudeStats.range[0].toFixed(0)} - {magnitudeStats.range[1].toFixed(0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Phase Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mean Phase:</span>
                <span className="font-bold">{phaseStats.mean.toFixed(1)}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Std Dev:</span>
                <span className="font-bold">{phaseStats.stdDev.toFixed(1)}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Most Common:</span>
                <span className="font-bold">Q{phaseStats.quadrantDistribution.indexOf(Math.max(...phaseStats.quadrantDistribution)) + 1}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Jump Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mean Distance:</span>
                <span className="font-bold">{jumpStats.meanDistance.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max Distance:</span>
                <span className="font-bold">{jumpStats.maxDistance.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Min Distance:</span>
                <span className="font-bold">{jumpStats.minDistance.toFixed(1)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Complex Plane Scatter Plot */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Complex Plane Visualization</CardTitle>
          <CardDescription>
            Lottery numbers plotted as complex numbers (Real = first 3 digits, Imaginary = last 3 digits)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Real Part" 
                  domain={[0, 999]}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Imaginary Part" 
                  domain={[0, 999]}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                          <p className="text-xs text-muted-foreground mb-1">Draw #{data.index + 1}</p>
                          <p className="text-sm font-medium">Complex: {data.x} + {data.y}i</p>
                          <p className="text-xs text-muted-foreground">Magnitude: {data.magnitude}</p>
                          <p className="text-xs text-muted-foreground">Phase: {data.phase}°</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter data={scatterData} fill="hsl(var(--primary))" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Histograms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Magnitude Distribution</CardTitle>
            <CardDescription>
              Frequency of different magnitude ranges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={magnitudeHistData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="bin" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem"
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Phase Quadrant Distribution</CardTitle>
            <CardDescription>
              Distribution across 4 quadrants of the complex plane
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quadrantData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem"
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {quadrantData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jump Distance Histogram */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Complex Jump Distance Distribution</CardTitle>
          <CardDescription>
            Distance between consecutive lottery numbers in complex plane (|z<sub>n+1</sub> - z<sub>n</sub>|)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={jumpHistData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="bin" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 10 }}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem"
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Ratio Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Consecutive Ratio Analysis</CardTitle>
          <CardDescription>
            Analysis of z<sub>n+1</sub> / z<sub>n</sub> ratios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Average Magnitude:</span>
                <Badge variant="outline">{ratioStats.avgMagnitude.toFixed(3)}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Average Phase:</span>
                <Badge variant="outline">{ratioStats.avgPhase.toFixed(2)}°</Badge>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border">
              <h4 className="text-sm font-semibold mb-2">Cluster Center</h4>
              {ratioStats.clusterCenter && (
                <div className="text-xs space-y-1 text-muted-foreground">
                  <div>Real: <span className="font-bold text-foreground">{ratioStats.clusterCenter.real.toFixed(3)}</span></div>
                  <div>Imaginary: <span className="font-bold text-foreground">{ratioStats.clusterCenter.imag.toFixed(3)}</span></div>
                  <div>Magnitude: <span className="font-bold text-foreground">{ratioStats.clusterCenter.magnitude.toFixed(3)}</span></div>
                  <div>Phase: <span className="font-bold text-foreground">{ratioStats.clusterCenter.phase.toFixed(2)}°</span></div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
