import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Calculator, TrendingUp } from "lucide-react";
import { toast } from "sonner";

type Operation = "multiply" | "divide" | "add" | "subtract";
type Position = "F2" | "F3" | "L2" | "L3";

interface Prediction {
  operation: string;
  operationValue: number;
  position: string;
  result: string;
  timestamp: Date;
}

const Index = () => {
  const [drawNumber, setDrawNumber] = useState("");
  const [operation, setOperation] = useState<Operation>("multiply");
  const [operationValue, setOperationValue] = useState("");
  const [position, setPosition] = useState<Position>("F3");
  const [predictions, setPredictions] = useState<Prediction[]>([]);

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

  const performOperation = (digits: string, op: Operation, value: number): number => {
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
    return result.toString().padStart(3, "0");
  };

  const calculatePrediction = () => {
    if (!drawNumber || !operationValue) {
      toast.error("Please enter both draw number and operation value");
      return;
    }

    const cleanDraw = drawNumber.replace(/\D/g, "");
    if (cleanDraw.length < 3) {
      toast.error("Draw number must be at least 3 digits");
      return;
    }

    const opValue = parseInt(operationValue);
    if (isNaN(opValue) || opValue === 0) {
      toast.error("Please enter a valid operation value");
      return;
    }

    const extracted = extractDigits(cleanDraw, position);
    const result = performOperation(extracted, operation, opValue);
    const formattedResult = formatResult(result);

    const operationSymbol = {
      multiply: "×",
      divide: "÷",
      add: "+",
      subtract: "-"
    }[operation];

    const newPrediction: Prediction = {
      operation: `${operationSymbol} ${opValue} ${position}`,
      operationValue: opValue,
      position,
      result: formattedResult,
      timestamp: new Date()
    };

    setPredictions([newPrediction, ...predictions]);
    toast.success(`Prediction generated: ${formattedResult}`);
  };

  const calculateAllOperations = () => {
    if (!drawNumber || !operationValue) {
      toast.error("Please enter both draw number and operation value");
      return;
    }

    const cleanDraw = drawNumber.replace(/\D/g, "");
    if (cleanDraw.length < 3) {
      toast.error("Draw number must be at least 3 digits");
      return;
    }

    const opValue = parseInt(operationValue);
    if (isNaN(opValue) || opValue === 0) {
      toast.error("Please enter a valid operation value");
      return;
    }

    const operations: Operation[] = ["multiply", "divide", "add", "subtract"];
    const newPredictions: Prediction[] = [];

    operations.forEach(op => {
      const extracted = extractDigits(cleanDraw, position);
      const result = performOperation(extracted, op, opValue);
      const formattedResult = formatResult(result);

      const operationSymbol = {
        multiply: "×",
        divide: "÷",
        add: "+",
        subtract: "-"
      }[op];

      newPredictions.push({
        operation: `${operationSymbol} ${opValue} ${position}`,
        operationValue: opValue,
        position,
        result: formattedResult,
        timestamp: new Date()
      });
    });

    setPredictions([...newPredictions, ...predictions]);
    toast.success(`Generated ${newPredictions.length} predictions`);
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
                Input Parameters
              </CardTitle>
              <CardDescription>Enter the draw number and formula parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="drawNumber" className="text-base font-semibold">
                  Old Draw Number
                </Label>
                <Input
                  id="drawNumber"
                  type="text"
                  placeholder="Enter draw number (e.g., 75892)"
                  value={drawNumber}
                  onChange={(e) => setDrawNumber(e.target.value)}
                  className="text-lg h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="operation" className="text-base font-semibold">
                  Operation Type
                </Label>
                <Select value={operation} onValueChange={(value) => setOperation(value as Operation)}>
                  <SelectTrigger id="operation" className="h-12 text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiply" className="text-lg">× Multiply</SelectItem>
                    <SelectItem value="divide" className="text-lg">÷ Divide</SelectItem>
                    <SelectItem value="add" className="text-lg">+ Add</SelectItem>
                    <SelectItem value="subtract" className="text-lg">- Subtract</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="operationValue" className="text-base font-semibold">
                  Operation Value
                </Label>
                <Input
                  id="operationValue"
                  type="number"
                  placeholder="Enter number (e.g., 75)"
                  value={operationValue}
                  onChange={(e) => setOperationValue(e.target.value)}
                  className="text-lg h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position" className="text-base font-semibold">
                  Position
                </Label>
                <Select value={position} onValueChange={(value) => setPosition(value as Position)}>
                  <SelectTrigger id="position" className="h-12 text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="F2" className="text-lg">F2 - First 2 digits</SelectItem>
                    <SelectItem value="F3" className="text-lg">F3 - First 3 digits</SelectItem>
                    <SelectItem value="L2" className="text-lg">L2 - Last 2 digits</SelectItem>
                    <SelectItem value="L3" className="text-lg">L3 - Last 3 digits</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={calculatePrediction}
                  className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
                >
                  Calculate
                </Button>
                <Button
                  onClick={calculateAllOperations}
                  variant="secondary"
                  className="flex-1 h-12 text-base font-semibold"
                >
                  All Operations
                </Button>
              </div>
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
                  <p className="text-sm">Enter parameters and calculate to see results</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {predictions.map((pred, idx) => (
                    <div
                      key={idx}
                      className="bg-gradient-to-br from-card to-muted p-4 rounded-lg border border-border hover:border-accent/50 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          {pred.operation}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {pred.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                        {pred.result}
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
