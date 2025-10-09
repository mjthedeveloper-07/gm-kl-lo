import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Calculator, TrendingUp } from "lucide-react";
import { toast } from "sonner";

type MathFunction = "COS" | "SIN" | "TAN" | "√";
type DigitExtraction = ".3 NOS" | "L3 NOS" | ".2 NOS";

interface Prediction {
  label: string;
  mathFunction: string;
  inputNumber: number;
  result: string;
  extraction: string;
  timestamp: Date;
}

interface TrigFormula {
  label: string;
  mathFunction: MathFunction;
  number: number;
  extraction: DigitExtraction;
}

const TRIG_FORMULAS: TrigFormula[] = [
  { label: "A", mathFunction: "COS", number: 685, extraction: ".3 NOS" },
  { label: "B", mathFunction: "COS", number: 256, extraction: "L3 NOS" },
  { label: "ALL", mathFunction: "SIN", number: 629, extraction: "L3 NOS" },
  { label: "ALL", mathFunction: "SIN", number: 698, extraction: "L3 NOS" },
  { label: "ALL", mathFunction: "SIN", number: 489, extraction: "L3 NOS" },
  { label: "ALL", mathFunction: "SIN", number: 361, extraction: "L3 NOS" },
  { label: "ALL", mathFunction: "SIN", number: 692, extraction: ".3 NOS" },
  { label: "ALL", mathFunction: "TAN", number: 651, extraction: "L3 NOS" },
  { label: "ALL", mathFunction: "TAN", number: 896, extraction: ".3 NOS" },
  { label: "ALL", mathFunction: "TAN", number: 562, extraction: "L3 NOS" },
  { label: "ALL", mathFunction: "TAN", number: 263, extraction: "L3 NOS" },
  { label: "ALL", mathFunction: "TAN", number: 682, extraction: ".3 NOS" },
  { label: "ALL", mathFunction: "√", number: 698, extraction: "L3 NOS" },
  { label: "ALL", mathFunction: "TAN", number: 618, extraction: ".3 NOS" },
  { label: "ALL", mathFunction: "TAN", number: 468, extraction: "L3 NOS" },
  { label: "ALL", mathFunction: "SIN", number: 626, extraction: ".3 NOS" },
  { label: "ALL", mathFunction: "TAN", number: 394, extraction: "L3 NOS" },
  { label: "ALL", mathFunction: "SIN", number: 315, extraction: ".3 NOS" },
  { label: "ALL", mathFunction: "SIN", number: 691, extraction: ".3 NOS" },
  { label: "ALL", mathFunction: "√", number: 13, extraction: ".3 NOS" },
  { label: "6D F3", mathFunction: "SIN", number: 256, extraction: ".3 NOS" },
  { label: "6D F3", mathFunction: "SIN", number: 745, extraction: ".3 NOS" },
  { label: "6D F2", mathFunction: "√", number: 631, extraction: "L3 NOS" },
  { label: "ALL", mathFunction: "SIN", number: 396, extraction: "L3 NOS" },
  { label: "6D 83", mathFunction: "SIN", number: 586, extraction: ".3 NOS" },
  { label: "ALL", mathFunction: "SIN", number: 115, extraction: "L3 NOS" },
  { label: "ALL", mathFunction: "SIN", number: 694, extraction: ".3 NOS" },
  { label: "ALL", mathFunction: "SIN", number: 154, extraction: ".3 NOS" },
  { label: "ALL", mathFunction: "SIN", number: 643, extraction: "L3 NOS" },
  { label: "ALL", mathFunction: "SIN", number: 254, extraction: "L3 NOS" },
  { label: "ALL", mathFunction: "SIN", number: 179, extraction: "L3 NOS" },
  { label: "ALL", mathFunction: "SIN", number: 194, extraction: ".3 NOS" },
  { label: "ALL", mathFunction: "SIN", number: 945, extraction: "L3 NOS" },
  { label: "ALL", mathFunction: "COS", number: 461, extraction: ".3 NOS" },
  { label: "ALL", mathFunction: "SIN", number: 246, extraction: ".3 NOS" },
  { label: "ALL", mathFunction: "SIN", number: 289, extraction: "L3 NOS" },
  { label: "ALL", mathFunction: "SIN", number: 393, extraction: "L3 NOS" },
  { label: "ALL", mathFunction: "SIN", number: 516, extraction: "L3 NOS" },
  { label: "ALL", mathFunction: "SIN", number: 684, extraction: ".3 NOS" },
  { label: "ALL", mathFunction: "COS", number: 545, extraction: ".3 NOS" },
  { label: "ALL", mathFunction: "SIN", number: 691, extraction: ".3 NOS" },
  { label: "ALL", mathFunction: "SIN", number: 326, extraction: ".3 NOS" },
  { label: "ALL", mathFunction: "SIN", number: 358, extraction: ".3 NOS" },
  { label: "ALL", mathFunction: "SIN", number: 457, extraction: "L3 NOS" },
  { label: "ALL", mathFunction: "TAN", number: 843, extraction: ".3 NOS" },
  { label: "ALL", mathFunction: "SIN", number: 253, extraction: ".3 NOS" },
  { label: "ALL", mathFunction: "TAN", number: 268, extraction: ".3 NOS" },
  { label: "ALL", mathFunction: "TAN", number: 245, extraction: ".3 NOS" },
  { label: "ALL", mathFunction: "SIN", number: 248, extraction: ".3 NOS" },
  { label: "ALL", mathFunction: "TAN", number: 259, extraction: ".2 NOS" },
];

const Index = () => {
  const [drawNumber, setDrawNumber] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);

  const applyMathFunction = (func: MathFunction, num: number): number => {
    // Convert degrees to radians for trigonometric functions
    const radians = (num * Math.PI) / 180;
    
    switch (func) {
      case "COS":
        return Math.cos(radians);
      case "SIN":
        return Math.sin(radians);
      case "TAN":
        return Math.tan(radians);
      case "√":
        return Math.sqrt(num);
      default:
        return num;
    }
  };

  const extractDigitsFromResult = (result: number, extraction: DigitExtraction): string => {
    const absResult = Math.abs(result);
    
    switch (extraction) {
      case ".3 NOS": {
        // Take first 3 digits after decimal point
        const decimalPart = absResult.toString().split('.')[1] || '0';
        return decimalPart.substring(0, 3).padEnd(3, '0');
      }
      case "L3 NOS": {
        // Take last 3 digits of the whole number part
        const wholePart = Math.floor(absResult);
        const wholeStr = wholePart.toString();
        return wholeStr.slice(-3).padStart(3, '0');
      }
      case ".2 NOS": {
        // Take first 2 digits after decimal point
        const decimalPart = absResult.toString().split('.')[1] || '0';
        return decimalPart.substring(0, 2).padEnd(2, '0');
      }
      default:
        return '000';
    }
  };

  const runAllFormulas = () => {
    if (!drawNumber) {
      toast.error("Please enter a draw number");
      return;
    }

    const cleanDraw = drawNumber.replace(/\D/g, "");
    if (cleanDraw.length < 3) {
      toast.error("Draw number must be at least 3 digits");
      return;
    }

    const newPredictions: Prediction[] = [];

    TRIG_FORMULAS.forEach((formula) => {
      const result = applyMathFunction(formula.mathFunction, formula.number);
      const extracted = extractDigitsFromResult(result, formula.extraction);

      newPredictions.push({
        label: formula.label,
        mathFunction: `${formula.mathFunction}(${formula.number})`,
        inputNumber: formula.number,
        result: extracted,
        extraction: formula.extraction,
        timestamp: new Date()
      });
    });

    setPredictions(newPredictions);
    toast.success(`Generated ${newPredictions.length} predictions using trigonometric formulas`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-glow shadow-glow mb-4">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
            Lottery Number Predictor
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Apply mathematical formulas to old draw numbers and predict winning combinations
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="shadow-card border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Calculator className="w-6 h-6 text-primary" />
                Input Draw Number
              </CardTitle>
              <CardDescription>Enter draw number to apply trigonometric formulas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="drawNumber" className="text-base font-semibold">
                  Draw Number
                </Label>
                <Input
                  id="drawNumber"
                  type="text"
                  placeholder="Enter draw number (e.g., 823274)"
                  value={drawNumber}
                  onChange={(e) => setDrawNumber(e.target.value)}
                  className="text-lg h-12"
                />
              </div>

              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="text-sm font-semibold text-foreground">Formula System:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• COS, SIN, TAN (trigonometric functions)</li>
                  <li>• √ (square root)</li>
                  <li>• .3 NOS = first 3 digits after decimal</li>
                  <li>• L3 NOS = last 3 digits</li>
                  <li>• .2 NOS = first 2 digits after decimal</li>
                </ul>
              </div>

              <Button
                onClick={runAllFormulas}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary via-primary-glow to-accent hover:opacity-90 transition-opacity shadow-glow"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Run All {TRIG_FORMULAS.length} Formulas
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="shadow-card border-2 border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <TrendingUp className="w-6 h-6 text-accent" />
                Predictions
              </CardTitle>
              <CardDescription>Your calculated lottery predictions</CardDescription>
            </CardHeader>
            <CardContent>
              {predictions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No predictions yet</p>
                  <p className="text-sm">Enter draw number and run formulas</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                  {predictions.map((pred, idx) => (
                    <div
                      key={idx}
                      className="bg-gradient-to-br from-card to-card/50 p-3 rounded-lg border border-border hover:border-primary/50 transition-all"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded whitespace-nowrap">
                            {pred.label}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                            {pred.mathFunction}
                          </span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {pred.extraction}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent tabular-nums">
                            {pred.result}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="mt-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2 text-primary">Position Notation</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><strong>F2:</strong> First 2 digits of the number</li>
                <li><strong>F3:</strong> First 3 digits of the number</li>
                <li><strong>L2:</strong> Last 2 digits of the number</li>
                <li><strong>L3:</strong> Last 3 digits of the number</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 text-accent">Operations</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><strong>Multiply (×):</strong> Multiply selected digits by value</li>
                <li><strong>Divide (÷):</strong> Divide selected digits by value</li>
                <li><strong>Add (+):</strong> Add value to selected digits</li>
                <li><strong>Subtract (-):</strong> Subtract value from selected digits</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
