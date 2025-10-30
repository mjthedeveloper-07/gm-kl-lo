import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, AlertCircle, TrendingDown, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import {
  testFormulaAccuracy,
  generateComplexPredictions,
  type FormulaAccuracy
} from "@/utils/complexNumberAnalysis";

export const ComplexFormulaValidator = () => {
  const [results, setResults] = useState<FormulaAccuracy[]>([]);
  const [predictions, setPredictions] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const runAllTests = () => {
    setLoading(true);
    
    setTimeout(() => {
      const conjugateTest = testFormulaAccuracy("conjugate");
      const negateTest = testFormulaAccuracy("negate");
      const additionTest = testFormulaAccuracy("addition");
      const ratioTest = testFormulaAccuracy("ratio");
      
      setResults([conjugateTest, negateTest, additionTest, ratioTest]);
      
      // Generate predictions
      const preds = generateComplexPredictions(12);
      setPredictions(preds);
      
      setLoading(false);
      toast.success("Formula validation complete!");
    }, 500);
  };

  const copyToClipboard = (number: string, index: number) => {
    navigator.clipboard.writeText(number);
    setCopiedIndex(index);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 5) return "text-green-500";
    if (accuracy >= 1) return "text-yellow-500";
    return "text-red-500";
  };

  const getFormulaDescription = (formula: string) => {
    switch (formula) {
      case "conjugate":
        return "z̄ₙ (Conjugate): Flips imaginary part sign";
      case "negate":
        return "-zₙ mod 1000: Negates both real and imaginary parts";
      case "addition":
        return "zₙ + zₙ₋₁: Sum of consecutive draws";
      case "ratio":
        return "zₙ · (zₙ/zₙ₋₁): Ratio extrapolation";
      default:
        return formula;
    }
  };

  return (
    <div className="space-y-4">
      {/* Introduction */}
      <Alert className="border-primary/50 bg-primary/5">
        <AlertCircle className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">
          <strong>Complex Number Formula Testing:</strong> This section tests various mathematical 
          formulas against historical lottery data. Each lottery number is treated as a complex number 
          (first 3 digits = real part, last 3 digits = imaginary part). The accuracy shows how well 
          each formula would have predicted past draws.
        </AlertDescription>
      </Alert>

      {/* Test Button */}
      <div className="flex justify-center">
        <Button 
          onClick={runAllTests} 
          size="lg"
          disabled={loading}
          className="w-full md:w-auto"
        >
          {loading ? (
            <>Testing Formulas...</>
          ) : (
            <>Run Formula Validation Tests</>
          )}
        </Button>
      </div>

      {results.length > 0 && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {results.map((result, idx) => (
              <Card key={idx} className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    {result.formula.charAt(0).toUpperCase() + result.formula.slice(1)}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {getFormulaDescription(result.formula)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className={`text-3xl font-bold ${getAccuracyColor(result.accuracy)}`}>
                      {result.accuracy.toFixed(2)}%
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Exact matches:</span>
                        <Badge variant="outline" className="h-5">
                          {result.exactMatches}/{result.totalTests}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Last 4 digits:</span>
                        <Badge variant="outline" className="h-5">
                          {result.last4Matches}/{result.totalTests}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Last 3 digits:</span>
                        <Badge variant="outline" className="h-5">
                          {result.last3Matches}/{result.totalTests}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Results */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Formula Test Details</CardTitle>
              <CardDescription>
                Example predictions vs actual results for each formula
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="conjugate" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  {results.map((result) => (
                    <TabsTrigger key={result.formula} value={result.formula}>
                      {result.formula.charAt(0).toUpperCase() + result.formula.slice(1)}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {results.map((result) => (
                  <TabsContent key={result.formula} value={result.formula} className="mt-4">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground mb-3">
                        {getFormulaDescription(result.formula)}
                      </div>
                      
                      <div className="space-y-2">
                        {result.examples.map((example, idx) => (
                          <div 
                            key={idx}
                            className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                              example.match 
                                ? "border-green-500/50 bg-green-500/5" 
                                : "border-border bg-muted/30"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              {example.match ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              ) : (
                                <XCircle className="w-5 h-5 text-muted-foreground" />
                              )}
                              <div className="text-sm space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">Predicted:</span>
                                  <span className="font-mono font-bold">{example.predicted}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">Actual:</span>
                                  <span className="font-mono font-bold">{example.actual}</span>
                                </div>
                              </div>
                            </div>
                            {example.match && (
                              <Badge variant="default" className="bg-green-500">
                                Exact Match
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>

                      {result.accuracy === 0 && (
                        <Alert className="mt-4">
                          <TrendingDown className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            This formula shows 0% accuracy. Complex number operations on lottery data 
                            do not reveal deterministic patterns, confirming the random nature of lottery draws.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Predictions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Complex-Based Predictions</CardTitle>
              <CardDescription>
                Generated using statistical patterns from complex number analysis (magnitude/phase constraints)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {predictions.map((pred, idx) => (
                  <div
                    key={idx}
                    className="group relative p-4 rounded-lg border-2 border-border hover:border-primary/50 bg-card transition-all hover:shadow-lg"
                  >
                    <button
                      onClick={() => copyToClipboard(pred, idx)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent rounded"
                      title="Copy to clipboard"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <div className="font-mono text-xl font-bold text-center py-2 tracking-wider text-primary">
                      {pred}
                    </div>
                    <div className="text-xs text-center text-muted-foreground">
                      Prediction #{idx + 1}
                    </div>
                  </div>
                ))}
              </div>

              <Alert className="mt-4 border-yellow-500/50 bg-yellow-500/5">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="text-xs">
                  <strong>Important:</strong> These predictions use statistical constraints (magnitude, phase, 
                  jump distances) derived from complex number analysis. While mathematically interesting, they 
                  cannot overcome the inherent randomness of lottery draws. Use for educational purposes only.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
