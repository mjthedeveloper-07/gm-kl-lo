import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Calculator, TrendingUp, Search } from "lucide-react";
import { toast } from "sonner";

type MathFunction = "COS" | "SIN" | "TAN" | "√";
type DigitExtraction = ".3 NOS" | "L3 NOS" | ".2 NOS";
type ArithmeticOp = "multiply" | "divide" | "add" | "subtract";
type Position = "F2" | "F3" | "L2" | "L3";

interface Prediction {
  label: string;
  mathFunction: string;
  inputNumber: number;
  result: string;
  extraction: string;
  timestamp: Date;
  formulaType?: "trig" | "arithmetic";
  combinedResult?: string;
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

interface ArithmeticFormula {
  operation: ArithmeticOp;
  value: number;
  positions: Position[];
}

const ARITHMETIC_FORMULAS: ArithmeticFormula[] = [
  { operation: "multiply", value: 75, positions: ["F3"] },
  { operation: "multiply", value: 89, positions: ["F3"] },
  { operation: "multiply", value: 67, positions: ["L3"] },
  { operation: "multiply", value: 398, positions: ["F3"] },
  { operation: "divide", value: 8, positions: ["L3"] },
  { operation: "add", value: 315, positions: ["L3"] },
  { operation: "multiply", value: 951, positions: ["L3"] },
  { operation: "multiply", value: 961, positions: ["F3"] },
  { operation: "multiply", value: 761, positions: ["F3"] },
  { operation: "multiply", value: 364, positions: ["L3"] },
  { operation: "multiply", value: 852, positions: ["L3"] },
  { operation: "multiply", value: 625, positions: ["F3"] },
  { operation: "multiply", value: 974, positions: ["F3"] },
  { operation: "multiply", value: 858, positions: ["F3"] },
  { operation: "multiply", value: 275, positions: ["F3"] },
  { operation: "multiply", value: 669, positions: ["L3"] },
  { operation: "multiply", value: 257, positions: ["L3"] },
  { operation: "multiply", value: 591, positions: ["L3"] },
  { operation: "multiply", value: 641, positions: ["L3"] },
  { operation: "multiply", value: 639, positions: ["L3"] },
  { operation: "multiply", value: 951, positions: ["L3"] },
  { operation: "multiply", value: 958, positions: ["F3"] },
  { operation: "multiply", value: 968, positions: ["F3", "L3"] },
  { operation: "multiply", value: 962, positions: ["F3"] },
  { operation: "multiply", value: 427, positions: ["L3"] },
  { operation: "multiply", value: 952, positions: ["F3"] },
  { operation: "multiply", value: 859, positions: ["L3"] },
  { operation: "multiply", value: 719, positions: ["F3"] },
  { operation: "multiply", value: 669, positions: ["L3"] },
  { operation: "multiply", value: 871, positions: ["F3"] },
  { operation: "multiply", value: 348, positions: ["F3"] },
  { operation: "multiply", value: 592, positions: ["F3"] },
  { operation: "multiply", value: 946, positions: ["F3"] },
  { operation: "multiply", value: 328, positions: ["F3"] },
  { operation: "multiply", value: 427, positions: ["L3"] },
  { operation: "multiply", value: 871, positions: ["F3"] },
  { operation: "multiply", value: 274, positions: ["L3"] },
  { operation: "multiply", value: 864, positions: ["F3"] },
  { operation: "multiply", value: 928, positions: ["F3"] },
  { operation: "multiply", value: 618, positions: ["L3"] },
  { operation: "multiply", value: 386, positions: ["L3"] },
  { operation: "multiply", value: 234, positions: ["L3"] },
  { operation: "multiply", value: 746, positions: ["F3"] },
  { operation: "multiply", value: 759, positions: ["F3"] },
  { operation: "multiply", value: 398, positions: ["F3"] },
  { operation: "multiply", value: 394, positions: ["L3"] },
  { operation: "multiply", value: 478, positions: ["F3"] },
  { operation: "multiply", value: 473, positions: ["F3"] },
  { operation: "multiply", value: 479, positions: ["F3"] },
  { operation: "multiply", value: 254, positions: ["F3", "L3"] },
  { operation: "multiply", value: 297, positions: ["F3", "L3"] },
  { operation: "multiply", value: 273, positions: ["F3", "L3"] },
  { operation: "multiply", value: 219, positions: ["F3", "L3"] },
  { operation: "multiply", value: 298, positions: ["F3", "L3"] },
  { operation: "multiply", value: 796, positions: ["F3", "L3"] },
  { operation: "multiply", value: 0.9227, positions: ["F3", "L3"] },
];

const Index = () => {
  const [drawNumber, setDrawNumber] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

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

  const extractDigits = (num: string, pos: Position): string => {
    const cleanNum = num.replace(/\D/g, "");
    
    switch (pos) {
      case "F2":
        return cleanNum.slice(0, 2);
      case "F3":
        return cleanNum.slice(0, 3);
      case "L2":
        return cleanNum.slice(-2);
      case "L3":
        return cleanNum.slice(-3);
      default:
        return cleanNum;
    }
  };

  const performArithmeticOp = (digits: string, op: ArithmeticOp, value: number): number => {
    const num = parseInt(digits);
    
    switch (op) {
      case "multiply":
        return num * value;
      case "divide":
        return Math.floor(num / value);
      case "add":
        return num + value;
      case "subtract":
        return num - value;
      default:
        return num;
    }
  };

  const formatResult = (result: number): string => {
    const resultStr = Math.abs(result).toString();
    return resultStr.slice(-3).padStart(3, "0");
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

    const f3Value = parseInt(extractDigits(cleanDraw, "F3"));
    const l3Value = parseInt(extractDigits(cleanDraw, "L3"));
    const newPredictions: Prediction[] = [];

    // Run trigonometric formulas - apply to both F3 and L3
    TRIG_FORMULAS.forEach((formula, index) => {
      // Apply to F3 value
      const f3Result = applyMathFunction(formula.mathFunction, f3Value);
      const f3Extracted = extractDigitsFromResult(f3Result, formula.extraction);

      // Apply to L3 value
      const l3Result = applyMathFunction(formula.mathFunction, l3Value);
      const l3Extracted = extractDigitsFromResult(l3Result, formula.extraction);

      // Combine results
      const combined = f3Extracted + l3Extracted;

      newPredictions.push({
        label: `T${index + 1}`,
        mathFunction: `${formula.mathFunction}(F3,L3)`,
        inputNumber: formula.number,
        result: combined,
        extraction: formula.extraction,
        formulaType: "trig",
        combinedResult: combined,
        timestamp: new Date()
      });
    });

    // Run arithmetic formulas - apply to both F3 and L3
    ARITHMETIC_FORMULAS.forEach((formula, index) => {
      const operationSymbol = {
        multiply: "×",
        divide: "÷",
        add: "+",
        subtract: "-"
      }[formula.operation];

      // Apply to F3
      const f3Extracted = extractDigits(cleanDraw, "F3");
      const f3Result = performArithmeticOp(f3Extracted, formula.operation, formula.value);
      const f3Formatted = formatResult(f3Result);

      // Apply to L3
      const l3Extracted = extractDigits(cleanDraw, "L3");
      const l3Result = performArithmeticOp(l3Extracted, formula.operation, formula.value);
      const l3Formatted = formatResult(l3Result);

      // Combine results
      const combined = f3Formatted + l3Formatted;

      newPredictions.push({
        label: `A${index + 1}`,
        mathFunction: `${operationSymbol}${formula.value} F3+L3`,
        inputNumber: formula.value,
        result: combined,
        extraction: "F3+L3",
        formulaType: "arithmetic",
        combinedResult: combined,
        timestamp: new Date()
      });
    });

    setPredictions(newPredictions);
    toast.success(`Generated ${newPredictions.length} 6-digit predictions (all formulas applied to F3+L3)`);
  };

  const filteredPredictions = predictions.filter(pred => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      pred.result.includes(query) ||
      pred.label.toLowerCase().includes(query) ||
      pred.mathFunction.toLowerCase().includes(query)
    );
  });

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

              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">Trigonometric Formulas ({TRIG_FORMULAS.length}):</p>
                  <ul className="text-xs text-muted-foreground space-y-0.5">
                    <li>• COS, SIN, TAN, √</li>
                    <li>• .3 NOS, L3 NOS, .2 NOS</li>
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">Arithmetic Formulas ({ARITHMETIC_FORMULAS.length}):</p>
                  <ul className="text-xs text-muted-foreground space-y-0.5">
                    <li>• ×, ÷, +, − operations</li>
                    <li>• F3, L3 positions</li>
                  </ul>
                </div>
              </div>

              <Button
                onClick={runAllFormulas}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary via-primary-glow to-accent hover:opacity-90 transition-opacity shadow-glow"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Run All {TRIG_FORMULAS.length + ARITHMETIC_FORMULAS.length} Formulas
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="shadow-card border-2 border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <TrendingUp className="w-6 h-6 text-accent" />
                Predictions {predictions.length > 0 && `(${filteredPredictions.length}/${predictions.length})`}
              </CardTitle>
              <CardDescription>Your calculated lottery predictions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {predictions.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="search" className="text-sm font-semibold">
                    Search Results
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="search"
                      type="text"
                      placeholder="Search by result number, label, or formula..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && setSearchQuery(searchQuery)}
                      className="h-10"
                    />
                    <Button
                      onClick={() => setSearchQuery(searchQuery)}
                      variant="secondary"
                      className="h-10 px-4 whitespace-nowrap"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                    {searchQuery && (
                      <Button
                        onClick={() => setSearchQuery("")}
                        variant="outline"
                        className="h-10 px-4"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              )}
              {predictions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No predictions yet</p>
                  <p className="text-sm">Enter draw number and run formulas</p>
                </div>
              ) : filteredPredictions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg">No results found</p>
                  <p className="text-sm">Try a different search term</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                  {filteredPredictions.map((pred, idx) => (
                    <div
                      key={idx}
                      className={`bg-gradient-to-br from-card to-card/50 p-3 rounded-lg border transition-all ${
                        pred.combinedResult 
                          ? 'border-accent border-2 hover:border-accent shadow-md' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className={`text-xs font-bold px-2 py-1 rounded whitespace-nowrap ${
                            pred.formulaType === "trig" 
                              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400" 
                              : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          }`}>
                            {pred.label}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono whitespace-nowrap truncate">
                            {pred.mathFunction}
                          </span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {pred.extraction}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold tabular-nums ${
                            pred.combinedResult 
                              ? 'text-3xl bg-gradient-to-r from-accent via-primary to-primary-glow bg-clip-text text-transparent' 
                              : 'text-2xl bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent'
                          }`}>
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
