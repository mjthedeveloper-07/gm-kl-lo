import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, TrendingUp, Copy, Check, RefreshCw, Target, Sigma, Link2, Brain, Calculator, Lightbulb, Sparkles, Trophy } from "lucide-react";
import { toast } from "sonner";
import {
  generateDeltaPredictions,
  generateSumBasedPredictions,
  generatePairBasedPredictions,
  generateCombinatorialPredictions,
  generateProbabilityBasedPredictions,
  generateKLDivergencePredictions,
  generatePowerMappedPredictions,
  getSumStatistics,
  analyzeNumberPairs,
  analyzeCombinatorialTemplates,
  getHotAndColdNumbers,
  calculateSum,
  analyzeKLDivergenceByDigit,
  analyzeKLDivergenceByPosition,
  calculateSymmetricKL,
  applyPowerMappingCorrection,
  analyzePowerMappingCompliance,
  getTopPowerMappedNumbers,
  type CombinatorialTemplate,
  type KLDivergenceResult,
  type PositionalKLDivergence,
  type PowerMappingResult,
  type PowerMappingCompliance,
  type TopPowerMappedNumber
} from "@/utils/lotteryAnalysis";
import { ComplexPlaneAnalysis } from "@/components/ComplexPlaneAnalysis";
import { ComplexFormulaValidator } from "@/components/ComplexFormulaValidator";
import MirrorNumberPredictions from "@/components/MirrorNumberPredictions";

interface Prediction {
  number: string;
  method: string;
  confidence: "high" | "medium" | "low";
  sum?: number;
  inRange?: boolean;
  template?: string;
}

export const AdvancedFormulasPredictions = () => {
  const [deltaPredictions, setDeltaPredictions] = useState<Prediction[]>([]);
  const [sumPredictions, setSumPredictions] = useState<Prediction[]>([]);
  const [pairPredictions, setPairPredictions] = useState<Prediction[]>([]);
  const [combinatorialPreds, setCombinatorialPreds] = useState<Prediction[]>([]);
  const [probabilityPreds, setProbabilityPreds] = useState<Prediction[]>([]);
  const [klDivergencePreds, setKLDivergencePreds] = useState<Prediction[]>([]);
  const [powerMappingPreds, setPowerMappingPreds] = useState<Prediction[]>([]);
  const [templates, setTemplates] = useState<CombinatorialTemplate[]>([]);
  const [digitDivergence, setDigitDivergence] = useState<KLDivergenceResult[]>([]);
  const [positionalDivergence, setPositionalDivergence] = useState<PositionalKLDivergence[]>([]);
  const [symmetricKL, setSymmetricKL] = useState<number>(0);
  const [powerMappingCompliance, setPowerMappingCompliance] = useState<PowerMappingCompliance | null>(null);
  const [topPowerMappedNumbers, setTopPowerMappedNumbers] = useState<TopPowerMappedNumber[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [sumStats, setSumStats] = useState(getSumStatistics());
  const [topPairs, setTopPairs] = useState(analyzeNumberPairs().slice(0, 5));
  const { hot, cold } = getHotAndColdNumbers();

  const generateAllPredictions = () => {
    // Analyze templates first
    const analysisTemplates = analyzeCombinatorialTemplates().slice(0, 10);
    setTemplates(analysisTemplates);

    // Delta System Predictions
    const deltaResults: Prediction[] = generateDeltaPredictions(12).map(num => ({
      number: num,
      method: "Delta System",
      confidence: "medium",
      sum: calculateSum(num),
      inRange: false
    }));

    // Sum Analysis Predictions
    const sumResults: Prediction[] = generateSumBasedPredictions(12).map(num => {
      const sum = calculateSum(num);
      const inRange = sum >= sumStats.commonRange.lower && sum <= sumStats.commonRange.upper;
      return {
        number: num,
        method: "Sum Analysis",
        confidence: inRange ? "high" : "medium",
        sum,
        inRange
      };
    });

    // Pair-Based Predictions
    const pairResults: Prediction[] = generatePairBasedPredictions(12).map(num => ({
      number: num,
      method: "Number Pairing",
      confidence: "high",
      sum: calculateSum(num),
      inRange: false
    }));

    // Combinatorial Template Predictions (NEW)
    const combResults: Prediction[] = generateCombinatorialPredictions(12).map(num => {
      const digits = num.split('').map(d => parseInt(d));
      const oddCount = digits.filter(d => d % 2 !== 0).length;
      const evenCount = 6 - oddCount;
      const lowCount = digits.filter(d => d <= 3).length;
      const midCount = digits.filter(d => d >= 4 && d <= 6).length;
      const highCount = digits.filter(d => d >= 7).length;
      
      return {
        number: num,
        method: "Combinatorial Template",
        confidence: "high",
        sum: calculateSum(num),
        template: `${oddCount}O-${evenCount}E | ${lowCount}L-${midCount}M-${highCount}H`
      };
    });

    // Probability-Based Predictions (NEW)
    const probResults: Prediction[] = generateProbabilityBasedPredictions(12).map(num => ({
      number: num,
      method: "Positional Probability",
      confidence: "high",
      sum: calculateSum(num)
    }));

    // KL Divergence Predictions (NEW)
    const klResults: Prediction[] = generateKLDivergencePredictions(12).map(num => ({
      number: num,
      method: "KL Divergence",
      confidence: "high",
      sum: calculateSum(num)
    }));

    // Power Mapping Predictions (NEW)
    const powerResults: Prediction[] = generatePowerMappedPredictions(12).map(num => {
      const validation = applyPowerMappingCorrection(num);
      return {
        number: num,
        method: "Power Mapping",
        confidence: validation.isValid ? "high" : "medium",
        sum: calculateSum(num)
      };
    });

    // Analyze KL divergence
    const digitDiv = analyzeKLDivergenceByDigit();
    const posDiv = analyzeKLDivergenceByPosition();
    const symKL = calculateSymmetricKL();

    // Analyze power mapping compliance
    const pmCompliance = analyzePowerMappingCompliance();
    const topPMNumbers = getTopPowerMappedNumbers(5);

    setDeltaPredictions(deltaResults);
    setSumPredictions(sumResults);
    setPairPredictions(pairResults);
    setCombinatorialPreds(combResults);
    setProbabilityPreds(probResults);
    setKLDivergencePreds(klResults);
    setPowerMappingPreds(powerResults);
    setDigitDivergence(digitDiv);
    setPositionalDivergence(posDiv);
    setSymmetricKL(symKL);
    setPowerMappingCompliance(pmCompliance);
    setTopPowerMappedNumbers(topPMNumbers);
    
    toast.success("Generated predictions using advanced formulas");
  };

  useEffect(() => {
    generateAllPredictions();
  }, []);

  const copyToClipboard = (number: string, index: string) => {
    navigator.clipboard.writeText(number);
    setCopiedIndex(index);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const PredictionCard = ({ pred, index, type }: { pred: Prediction; index: number; type: string }) => (
    <div className="group relative p-4 rounded-lg border-2 border-border hover:border-primary/50 bg-card transition-all hover:shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <Badge 
          variant={pred.confidence === "high" ? "default" : pred.confidence === "medium" ? "secondary" : "outline"}
          className={pred.confidence === "high" ? "bg-primary" : ""}
        >
          {pred.method}
        </Badge>
        <button
          onClick={() => copyToClipboard(pred.number, `${type}-${index}`)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent rounded"
          title="Copy to clipboard"
        >
          {copiedIndex === `${type}-${index}` ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
      <div className="font-mono text-2xl font-bold text-center py-2 tracking-wider text-primary">
        {pred.number}
      </div>
      <div className="text-xs text-center space-y-1">
        {pred.template && (
          <div className="text-muted-foreground font-medium">
            {pred.template}
          </div>
        )}
        <div className="text-muted-foreground">
          Confidence: {pred.confidence}
        </div>
        {pred.sum && (
          <div className={`font-medium ${pred.inRange ? "text-green-500" : "text-muted-foreground"}`}>
            Sum: {pred.sum} {pred.inRange && "✓ In Range"}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Card className="shadow-elegant border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/70">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl">🎯 Advanced Formula Predictions</CardTitle>
              <CardDescription className="mt-1">
                Combinatorial Templates, Positional Probability & Statistical Methods
              </CardDescription>
            </div>
          </div>
          <Button onClick={generateAllPredictions} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerate All
          </Button>
        </div>

        {/* Top Templates Display */}
        <div className="mt-4 p-4 rounded-lg bg-muted/30 border">
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold">Most Common Combinatorial Templates</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {templates.slice(0, 6).map((template, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded bg-background/50 text-xs">
                <span className="font-medium text-muted-foreground">{template.description}</span>
                <Badge variant="outline" className="ml-2">
                  {template.percentage}%
                </Badge>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            <strong>O</strong> = Odd, <strong>E</strong> = Even | <strong>L</strong> = Low (0-3), 
            <strong>M</strong> = Mid (4-6), <strong>H</strong> = High (7-9)
          </p>
        </div>

        {/* Statistics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <div className="p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-2 mb-2">
              <Sigma className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Sum Statistics</span>
            </div>
            <div className="text-xs space-y-1 text-muted-foreground">
              <div>Average: <span className="font-bold text-foreground">{sumStats.average}</span></div>
              <div>Common Range: <span className="font-bold text-foreground">{sumStats.commonRange.lower}-{sumStats.commonRange.upper}</span></div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Hot Numbers</span>
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-bold text-foreground">{hot.map(h => h.digit).join(", ")}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-2 mb-2">
              <Link2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Top Pairs</span>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              {topPairs.slice(0, 3).map((pair, idx) => (
                <div key={idx}>
                  <span className="font-bold text-foreground">{pair.pair}</span> ({pair.frequency})
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="complex-analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9">
            <TabsTrigger value="complex-analysis">
              <Sparkles className="w-4 h-4 mr-2" />
              Complex
            </TabsTrigger>
            <TabsTrigger value="mirror-number">
              <Trophy className="w-4 h-4 mr-2" />
              Mirror
            </TabsTrigger>
            <TabsTrigger value="power-mapping">
              <LineChart className="w-4 h-4 mr-2" />
              Power Map
            </TabsTrigger>
            <TabsTrigger value="kl-divergence">
              <Brain className="w-4 h-4 mr-2" />
              KL Div
            </TabsTrigger>
            <TabsTrigger value="combinatorial">
              <Calculator className="w-4 h-4 mr-2" />
              Comb
            </TabsTrigger>
            <TabsTrigger value="probability">
              <TrendingUp className="w-4 h-4 mr-2" />
              Prob
            </TabsTrigger>
            <TabsTrigger value="sum">
              <Sigma className="w-4 h-4 mr-2" />
              Sum
            </TabsTrigger>
            <TabsTrigger value="pair">
              <Link2 className="w-4 h-4 mr-2" />
              Pairs
            </TabsTrigger>
            <TabsTrigger value="delta">
              <Target className="w-4 h-4 mr-2" />
              Delta
            </TabsTrigger>
          </TabsList>

          <TabsContent value="complex-analysis" className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/30 border-l-4 border-primary">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground">
                  <strong>Complex Number Analysis:</strong> Treats each lottery number as a complex number 
                  (first 3 digits = real part, last 3 digits = imaginary part). This advanced mathematical 
                  approach analyzes magnitude, phase, ratios, and jump distances in the complex plane. It also 
                  validates various complex formulas against historical data to explore mathematical patterns.
                </div>
              </div>
            </div>

            <ComplexPlaneAnalysis />
            <ComplexFormulaValidator />
          </TabsContent>

          <TabsContent value="mirror-number" className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/30 border-l-4 border-primary">
              <div className="flex items-start gap-2">
                <Trophy className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground">
                  <strong>Mirror Number Formula:</strong> Position-perfected mirror mapping system based on 600+ historical results. 
                  Uses MC (Machine Number/Draw) to predict lottery results through sophisticated digit transformation rules 
                  that vary by position, lottery type, and month. Achieves high accuracy through multi-strategy prediction approach.
                </div>
              </div>
            </div>

            <MirrorNumberPredictions />
          </TabsContent>

          <TabsContent value="power-mapping" className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/30 border-l-4 border-primary">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground">
                  <strong>Power Mapping Method A(x) = (x + 5) mod 10:</strong> Enforces a mathematical relationship 
                  between the first and last digits. Each first digit maps to a specific last digit: 0→5, 1→6, 2→7, 
                  3→8, 4→9, 5→0, 6→1, 7→2, 8→3, 9→4. All predictions are validated and corrected to follow this constraint.
                </div>
              </div>
            </div>

            {/* Power Mapping Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-2 mb-3">
                  <LineChart className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold">Power Mapping Table</span>
                </div>
                <div className="grid grid-cols-5 gap-2 text-xs">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(digit => {
                    const mapped = (digit + 5) % 10;
                    return (
                      <div key={digit} className="p-2 rounded bg-background text-center border">
                        <div className="font-bold text-primary">{digit}</div>
                        <div className="text-muted-foreground">→</div>
                        <div className="font-bold text-foreground">{mapped}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-semibold">Historical Compliance</span>
                </div>
                {powerMappingCompliance && (
                  <div className="space-y-2">
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {powerMappingCompliance.complianceRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {powerMappingCompliance.compliantResults} of {powerMappingCompliance.totalResults} results follow the pattern
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-3">
                      <strong>Note:</strong> This is a mathematical constraint applied to predictions. 
                      Historical compliance shows how often winning numbers naturally followed this pattern.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Top 5 High-Frequency Power-Mapped Numbers */}
            {topPowerMappedNumbers.length > 0 && (
              <div className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">Top 5 High-Frequency Power-Mapped Numbers</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Historical winning numbers that naturally followed the A(x) = (x+5) mod 10 rule, sorted by frequency
                </p>
                <div className="space-y-2">
                  {topPowerMappedNumbers.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-card border flex items-center justify-between hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Badge variant="default" className="bg-primary text-primary-foreground font-bold text-sm w-8 h-8 flex items-center justify-center rounded-full">
                          #{idx + 1}
                        </Badge>
                        <div>
                          <div className="font-mono text-lg font-bold text-primary">{item.number}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                            <span className="flex items-center gap-1">
                              <span className="font-semibold text-foreground">{item.firstDigit}</span>
                              <span>→</span>
                              <span className="font-semibold text-primary">{item.lastDigit}</span>
                              <Check className="w-3 h-3 text-green-500 ml-1" />
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-foreground">
                          {item.frequency} {item.frequency === 1 ? 'time' : 'times'}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Last: {item.lastSeen}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {powerMappingPreds.map((pred, idx) => {
                const validation = applyPowerMappingCorrection(pred.number);
                return (
                  <div key={idx} className="group relative p-4 rounded-lg border-2 border-border hover:border-primary/50 bg-card transition-all hover:shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="default" className="bg-primary">
                        Power Mapped
                      </Badge>
                      <button
                        onClick={() => copyToClipboard(pred.number, `power-${idx}`)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent rounded"
                        title="Copy to clipboard"
                      >
                        {copiedIndex === `power-${idx}` ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="font-mono text-2xl font-bold text-center py-2 tracking-wider text-primary">
                      {pred.number}
                    </div>
                    <div className="text-xs text-center space-y-1">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <span className="font-bold text-foreground">{validation.firstDigit}</span>
                        <span>→</span>
                        <span className="font-bold text-primary">{validation.expectedLastDigit}</span>
                        <Check className="w-3 h-3 text-green-500" />
                      </div>
                      <div className="text-muted-foreground">
                        Sum: <span className="font-medium text-foreground">{pred.sum}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="kl-divergence" className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/30 border-l-4 border-primary">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground">
                  <strong>Kullback-Leibler Divergence Method:</strong> Measures how actual digit distributions diverge from expected 
                  uniform distribution. Formula: D<sub>KL</sub>(P || Q) = Σ P(i) log(P(i) / Q(i)). High divergence indicates digits 
                  that appear significantly more/less than random chance. Predictions use both over-represented digits (hot trends) 
                  and under-represented digits (contrarian "due" strategy).
                </div>
              </div>
            </div>

            {/* KL Divergence Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Symmetric KL Divergence</span>
                </div>
                <div className="text-2xl font-bold text-primary">{symmetricKL.toFixed(6)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Overall deviation from uniform distribution
                </p>
              </div>

              <div className="p-3 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Top Divergent Digits</span>
                </div>
                <div className="text-xs space-y-1">
                  {digitDivergence.slice(0, 5).map((d, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{d.digit}</span>
                      <Badge variant={d.divergenceType === 'over-represented' ? 'default' : 'secondary'} className="text-xs">
                        {d.divergenceType === 'over-represented' ? '↑ Over' : '↓ Under'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Positional Divergence */}
            <div className="p-3 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-2 mb-2">
                <LineChart className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Positional KL Divergence (Highest to Lowest)</span>
              </div>
              <div className="grid grid-cols-6 gap-2 text-xs">
                {positionalDivergence.map((pos) => (
                  <div key={pos.position} className="p-2 rounded bg-background/50 text-center">
                    <div className="font-bold text-foreground">Pos {pos.position + 1}</div>
                    <div className="text-muted-foreground text-xs mt-1">{pos.klDivergence.toFixed(4)}</div>
                    <div className="text-primary font-medium mt-1">
                      {pos.topDigits[0]?.digit}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {klDivergencePreds.map((pred, idx) => (
                <PredictionCard key={idx} pred={pred} index={idx} type="kl" />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="combinatorial" className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/30 border-l-4 border-primary">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground">
                  <strong>Combinatorial Template Method:</strong> Based on proven mathematical templates like "3-Odd 3-Even" 
                  or "3-Low 2-Mid 1-High". Analyzes historical draws to identify which digit distributions appear most frequently. 
                  Uses nCr probability theory to generate combinations that match high-occurrence patterns.
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {combinatorialPreds.map((pred, idx) => (
                <PredictionCard key={idx} pred={pred} index={idx} type="comb" />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="probability" className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/30 border-l-4 border-primary">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground">
                  <strong>Positional Probability Method:</strong> Analyzes which specific digits appear most frequently 
                  in each of the 6 positions. Generates predictions by selecting high-probability digits for each position with 70% weight 
                  on top-5 frequent digits and 30% randomness for diversity.
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {probabilityPreds.map((pred, idx) => (
                <PredictionCard key={idx} pred={pred} index={idx} type="prob" />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sum" className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/30 border-l-4 border-primary">
              <p className="text-sm text-muted-foreground">
                <strong>Sum Analysis:</strong> Generates numbers whose digit sum falls within the historical common range ({sumStats.commonRange.lower}-{sumStats.commonRange.upper}). 
                Numbers marked with ✓ are within this optimal range.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sumPredictions.map((pred, idx) => (
                <PredictionCard key={idx} pred={pred} index={idx} type="sum" />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pair" className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/30 border-l-4 border-primary">
              <p className="text-sm text-muted-foreground">
                <strong>Number Pairing:</strong> Uses frequently appearing digit combinations from historical data. 
                Top pairs: {topPairs.slice(0, 3).map(p => p.pair).join(", ")}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {pairPredictions.map((pred, idx) => (
                <PredictionCard key={idx} pred={pred} index={idx} type="pair" />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="delta" className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/30 border-l-4 border-primary">
              <p className="text-sm text-muted-foreground">
                <strong>Delta System:</strong> Generates sequential patterns by adding a fixed interval (delta) between digits. 
                Uses deltas: 3, 5, 7, 9, 11 starting from low numbers.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {deltaPredictions.map((pred, idx) => (
                <PredictionCard key={idx} pred={pred} index={idx} type="delta" />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Mathematical Formula Reference */}
        <div className="mt-6 p-4 rounded-lg bg-primary/5 border-2 border-primary/20">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Mathematical Foundations
          </h3>
          <div className="text-xs text-muted-foreground space-y-2">
            <p>
              <strong>Combinatorial Formula:</strong> Total combinations = nCr = n! / (r!(n-r)!) 
              where n = available digits (10), r = selection size (6)
            </p>
            <p>
              <strong>Template Probability:</strong> P(template) = (Template frequency) / (Total historical draws) × 100%
            </p>
            <p>
              <strong>Positional Frequency:</strong> For each position i, P(digit d) = Count(d at position i) / Total draws
            </p>
            <p>
              <strong>KL Divergence:</strong> D<sub>KL</sub>(P || Q) = Σ P(i) log(P(i) / Q(i)) measures distribution deviation. 
              Symmetric KL = [D<sub>KL</sub>(P||Q) + D<sub>KL</sub>(Q||P)] / 2 for bidirectional comparison.
            </p>
            <p className="pt-2 text-xs italic">
              These formulas organize selection strategy statistically but cannot guarantee wins in random draws.
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 rounded-lg bg-destructive/10 border-2 border-destructive/30">
          <p className="text-sm font-medium text-destructive mb-2">⚠️ Important Disclaimer</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Kerala lottery draws are completely random. There is <strong>no proven scientific method</strong> to predict winning numbers. 
            These analyses are for <strong>informational and entertainment purposes only</strong> and do not guarantee a win. 
            The lottery is designed with odds heavily in favor of the state. <strong>Play responsibly and within your means.</strong> Never spend money meant for essentials. 
            Treat this as entertainment, not an investment strategy.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
