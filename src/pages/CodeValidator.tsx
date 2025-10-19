import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { codeDatabase, MONTHS, MULTIPLIERS } from "@/data/codeDatabase";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface Match {
  multiplier: number;
  product: number;
  matchingDigits: string[];
}

interface ValidationResult {
  success: boolean;
  matches: Match[];
  error?: string;
  previousCode?: number | string;
  previousDate?: number;
  lastThreeDigits?: number;
}

const CodeValidator = () => {
  const [month, setMonth] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const validateCode = (userMonth: string, userDate: number, userCode: string): ValidationResult => {
    // Check if date is 1
    if (userDate === 1) {
      return {
        success: false,
        matches: [],
        error: "Cannot calculate previous day for the 1st"
      };
    }

    // Get previous day code
    const prevDate = userDate - 1;
    const prevCode = codeDatabase[userMonth]?.[prevDate.toString()];

    if (!prevCode) {
      return {
        success: false,
        matches: [],
        error: `No code available for ${userMonth} ${prevDate}`
      };
    }

    if (prevCode === "******") {
      return {
        success: false,
        matches: [],
        error: `Previous day code (${userMonth} ${prevDate}) is unavailable (******)`
      };
    }

    // Extract last three digits
    const lastThreeDigits = parseInt(userCode.slice(-3));
    const matches: Match[] = [];

    // Calculate products and check for matches
    MULTIPLIERS.forEach(multiplier => {
      const product = lastThreeDigits * multiplier;
      const productDigits = String(product).split('');
      const prevCodeDigits = String(prevCode).split('');

      // Find matching digits
      const matchingDigits = productDigits.filter(digit => 
        prevCodeDigits.includes(digit)
      );

      if (matchingDigits.length > 0) {
        matches.push({
          multiplier,
          product,
          matchingDigits: [...new Set(matchingDigits)] // Remove duplicates
        });
      }
    });

    return {
      success: true,
      matches,
      previousCode: prevCode as number,
      previousDate: prevDate,
      lastThreeDigits
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!month) {
      setResult({
        success: false,
        matches: [],
        error: "Please select a month"
      });
      return;
    }

    if (!date || parseInt(date) < 1 || parseInt(date) > 31) {
      setResult({
        success: false,
        matches: [],
        error: "Please enter a valid date (1-31)"
      });
      return;
    }

    if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
      setResult({
        success: false,
        matches: [],
        error: "Please enter a valid 6-digit code"
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate processing delay for UX
    setTimeout(() => {
      const validationResult = validateCode(month, parseInt(date), code);
      setResult(validationResult);
      setIsProcessing(false);
    }, 300);
  };

  const handleReset = () => {
    setMonth("");
    setDate("");
    setCode("");
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Daily Code Validator
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Validate daily codes by comparing digit matches between calculated products and the previous day's reference code
          </p>
        </div>

        {/* Input Form */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Enter Code Details</CardTitle>
            <CardDescription>
              Select month and date, then enter your 6-digit code for validation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Month Selection */}
                <div className="space-y-2">
                  <Label htmlFor="month">Month</Label>
                  <Select value={month} onValueChange={setMonth}>
                    <SelectTrigger id="month">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Input */}
                <div className="space-y-2">
                  <Label htmlFor="date">Date (1-31)</Label>
                  <Input
                    id="date"
                    type="number"
                    min="1"
                    max="31"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="Enter date"
                  />
                </div>

                {/* Code Input */}
                <div className="space-y-2">
                  <Label htmlFor="code">6-Digit Code</Label>
                  <Input
                    id="code"
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={isProcessing} className="flex-1">
                  {isProcessing ? "Processing..." : "Validate Code"}
                </Button>
                <Button type="button" variant="outline" onClick={handleReset}>
                  Clear
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results Display */}
        {result && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? (
                  result.matches.length > 0 ? (
                    <>
                      <CheckCircle2 className="text-green-500" />
                      <span>Validation Results</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="text-yellow-500" />
                      <span>No Matches Found</span>
                    </>
                  )
                ) : (
                  <>
                    <XCircle className="text-destructive" />
                    <span>Validation Error</span>
                  </>
                )}
              </CardTitle>
              {result.success && result.previousCode && (
                <CardDescription>
                  Previous day ({month} {result.previousDate}): <span className="font-mono font-semibold">{result.previousCode}</span>
                  {" | "}Last 3 digits: <span className="font-mono font-semibold">{result.lastThreeDigits}</span>
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {!result.success ? (
                <Alert variant="destructive">
                  <AlertDescription>{result.error}</AlertDescription>
                </Alert>
              ) : result.matches.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    No products share digits with the previous day's code. All products from multipliers [3, 2, 5, 21, 8, 55, 34] were checked.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <Alert className="bg-green-500/10 border-green-500/20">
                    <AlertDescription className="text-green-700 dark:text-green-400">
                      <span className="font-semibold">{result.matches.length} matches found!</span> The following products share digits with the previous day's code.
                    </AlertDescription>
                  </Alert>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Multiplier</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Matching Digits</TableHead>
                        <TableHead>Calculation</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.matches.map((match, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-semibold">×{match.multiplier}</TableCell>
                          <TableCell className="font-mono text-lg font-bold text-primary">
                            {match.product}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {match.matchingDigits.map((digit, i) => (
                                <span key={i} className="inline-flex items-center justify-center w-7 h-7 rounded bg-green-500/20 text-green-700 dark:text-green-400 font-mono font-semibold">
                                  {digit}
                                </span>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground font-mono text-sm">
                            {result.lastThreeDigits} × {match.multiplier} = {match.product}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex gap-2">
              <span className="font-semibold text-foreground min-w-[30px]">1.</span>
              <p>Select your month and date, then enter your 6-digit code</p>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-foreground min-w-[30px]">2.</span>
              <p>The system retrieves the previous day's reference code from the database</p>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-foreground min-w-[30px]">3.</span>
              <p>Last 3 digits of your code are multiplied by: [3, 2, 5, 21, 8, 55, 34]</p>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-foreground min-w-[30px]">4.</span>
              <p>Each product is checked for matching digits with the previous day's code</p>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-foreground min-w-[30px]">5.</span>
              <p>Results show all products that share at least one digit with the reference code</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CodeValidator;
