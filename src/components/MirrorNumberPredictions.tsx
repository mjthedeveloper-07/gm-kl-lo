import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Check, TrendingUp, Target, History, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  generateMirrorPredictions,
  checkMirrorMatch,
  analyzeHistoricalMirrorPatterns,
  getRecentMirrorMatches,
  mirrorMap,
  positionMap,
  monthlyPatterns,
  type MirrorPrediction,
  type MirrorMatchAnalysis
} from '@/utils/mirrorNumberAnalysis';
import { lotteryHistory } from '@/data/lotteryHistory';

export default function MirrorNumberPredictions() {
  const { toast } = useToast();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Prediction tab state
  const [mcNumber, setMcNumber] = useState('');
  const [lotteryType, setLotteryType] = useState('KL');
  const [month, setMonth] = useState(new Date().toISOString().slice(5, 7));
  const [predictions, setPredictions] = useState<MirrorPrediction[]>([]);

  // Validator tab state
  const [validatorMc, setValidatorMc] = useState('');
  const [validatorResult, setValidatorResult] = useState('');
  const [matchAnalysis, setMatchAnalysis] = useState<MirrorMatchAnalysis | null>(null);

  // Performance tab state
  const [performance, setPerformance] = useState(() => analyzeHistoricalMirrorPatterns());
  const [recentMatches, setRecentMatches] = useState(() => getRecentMirrorMatches(20));

  // Auto-fill MC number with latest draw on mount
  useEffect(() => {
    if (lotteryHistory.length > 0) {
      setMcNumber(lotteryHistory[0].draw.toString());
    }
  }, []);

  const handleGeneratePredictions = () => {
    if (!mcNumber) {
      toast({
        title: "MC Number Required",
        description: "Please enter a machine number",
        variant: "destructive"
      });
      return;
    }
    const generated = generateMirrorPredictions(mcNumber, lotteryType, month);
    setPredictions(generated);
    toast({
      title: "Predictions Generated",
      description: `Generated ${generated.length} mirror-based predictions`
    });
  };

  const handleCheckMatch = () => {
    if (!validatorMc || !validatorResult) {
      toast({
        title: "Both Numbers Required",
        description: "Please enter both MC and Result numbers",
        variant: "destructive"
      });
      return;
    }
    const analysis = checkMirrorMatch(validatorMc, validatorResult);
    setMatchAnalysis(analysis);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast({
      title: "Copied!",
      description: `Number ${text} copied to clipboard`
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "bg-green-500";
    if (confidence >= 80) return "bg-blue-500";
    if (confidence >= 70) return "bg-yellow-500";
    return "bg-orange-500";
  };

  const getMatchColor = (percentage: number) => {
    if (percentage === 100) return "text-green-600";
    if (percentage >= 75) return "text-blue-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-orange-600";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-6 h-6" />
          Mirror Number Formula System
        </CardTitle>
        <CardDescription>
          Advanced position-perfected mirror mapping based on 600+ historical results
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="predictions" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="predictions">Mirror Predictions</TabsTrigger>
            <TabsTrigger value="validator">Match Validator</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="reference">Reference</TabsTrigger>
          </TabsList>

          {/* Tab 1: Mirror Predictions */}
          <TabsContent value="predictions" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="mcNumber">MC Number (Machine Number)</Label>
                <Input
                  id="mcNumber"
                  value={mcNumber}
                  onChange={(e) => setMcNumber(e.target.value)}
                  placeholder="Enter MC number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lotteryType">Lottery Type</Label>
                <Select value={lotteryType} onValueChange={setLotteryType}>
                  <SelectTrigger id="lotteryType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KL">Kerala Lottery (KL)</SelectItem>
                    <SelectItem value="DEAR">Dear Lottery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="month">Month</Label>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger id="month">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => {
                      const m = (i + 1).toString().padStart(2, '0');
                      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                      return (
                        <SelectItem key={m} value={m}>
                          {monthNames[i]} ({m})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleGeneratePredictions} className="w-full">
              <TrendingUp className="w-4 h-4 mr-2" />
              Generate Mirror Predictions
            </Button>

            {predictions.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Generated Predictions</h3>
                {predictions.map((pred, index) => (
                  <Card key={index} className={index === 0 ? "border-primary" : ""}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {index === 0 && <Badge variant="default">Primary</Badge>}
                            <Badge variant="outline" className={getConfidenceColor(pred.confidence)}>
                              {pred.confidence}% Confidence
                            </Badge>
                          </div>
                          <div className="text-3xl font-bold mb-2">{pred.number}</div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>Method: {pred.method}</div>
                            <div>Expected Match: {pred.expectedMatch}</div>
                            <div className="flex gap-4">
                              <span>First Digit: <span className="font-semibold">{pred.firstDigit}</span></span>
                              <span>Last 4: <span className="font-semibold">{pred.last4Digits}</span></span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(pred.number, index)}
                        >
                          {copiedIndex === index ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab 2: Mirror Match Validator */}
          <TabsContent value="validator" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="validatorMc">MC Number</Label>
                <Input
                  id="validatorMc"
                  value={validatorMc}
                  onChange={(e) => setValidatorMc(e.target.value)}
                  placeholder="Enter MC number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validatorResult">Result Number</Label>
                <Input
                  id="validatorResult"
                  value={validatorResult}
                  onChange={(e) => setValidatorResult(e.target.value)}
                  placeholder="Enter result number"
                />
              </div>
            </div>

            <Button onClick={handleCheckMatch} className="w-full">
              <Target className="w-4 h-4 mr-2" />
              Check Mirror Match
            </Button>

            {matchAnalysis && (
              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center mb-4">
                      <div className={`text-4xl font-bold mb-2 ${getMatchColor(matchAnalysis.matchPercentage)}`}>
                        {matchAnalysis.matches}
                      </div>
                      <div className="text-2xl font-semibold mb-2">
                        {matchAnalysis.matchPercentage}%
                      </div>
                      <div className="text-muted-foreground">{matchAnalysis.assessment}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Digit-by-Digit Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Position</TableHead>
                          <TableHead>MC Digit</TableHead>
                          <TableHead>Result Digit</TableHead>
                          <TableHead>Match</TableHead>
                          <TableHead>Top 5 Mirror Options</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {matchAnalysis.digitAnalysis.map((detail, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{detail.position}</TableCell>
                            <TableCell className="text-lg font-semibold">{detail.mcDigit}</TableCell>
                            <TableCell className="text-lg font-semibold">{detail.resultDigit}</TableCell>
                            <TableCell>
                              {detail.isMatch ? (
                                <Check className="w-5 h-5 text-green-500" />
                              ) : (
                                <span className="text-red-500">✗</span>
                              )}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {detail.mirrorOptions.join(', ')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Tab 3: Historical Performance */}
          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  System Effectiveness Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Total Pairs Analyzed</div>
                    <div className="text-2xl font-bold">{performance.totalPairsAnalyzed}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Perfect Matches (4/4)</div>
                    <div className="text-2xl font-bold text-green-600">{performance.perfectMatches}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Good Matches (3+/4)</div>
                    <div className="text-2xl font-bold text-blue-600">{performance.goodMatches}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">4-Digit Accuracy</div>
                    <div className="text-2xl font-bold">{performance.accuracy4Digit}%</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">3+ Digit Accuracy</div>
                    <div className="text-2xl font-bold">{performance.accuracy3PlusDigit}%</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">System Rating</div>
                    <div className="text-lg font-bold text-primary">{performance.systemEffectiveness}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Match Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>MC (Draw)</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead>Match</TableHead>
                        <TableHead>%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentMatches.map((match, index) => (
                        <TableRow key={index}>
                          <TableCell className="text-sm">{match.date}</TableCell>
                          <TableCell className="font-mono font-semibold">{match.mcNumber}</TableCell>
                          <TableCell className="font-mono font-semibold">{match.result}</TableCell>
                          <TableCell className={getMatchColor(match.matchPercentage)}>
                            {match.matches}
                          </TableCell>
                          <TableCell className={getMatchColor(match.matchPercentage)}>
                            {match.matchPercentage}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Mirror Mapping Reference */}
          <TabsContent value="reference" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Position-Perfected Mapping (Last 4 Digits)
                </CardTitle>
                <CardDescription>
                  Each position uses a different mapping rule for optimal accuracy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(positionMap).map(([position, mapping]) => (
                  <div key={position}>
                    <h4 className="font-semibold mb-2">Position {parseInt(position) + 3} (Index {position})</h4>
                    <div className="grid grid-cols-10 gap-2">
                      {Object.entries(mapping).map(([digit, mirror]) => (
                        <div key={digit} className="text-center p-2 border rounded">
                          <div className="text-sm text-muted-foreground">{digit}</div>
                          <div className="text-lg font-bold">↓</div>
                          <div className="text-lg font-bold text-primary">{mirror}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly First Digit Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(monthlyPatterns).map(([type, patterns]) => (
                    <div key={type}>
                      <h4 className="font-semibold mb-3">
                        {type === 'KL' ? 'Kerala Lottery' : 'Dear Lottery'}
                      </h4>
                      <div className="grid grid-cols-6 gap-2">
                        {Object.entries(patterns).map(([month, digit]) => (
                          <div key={month} className="text-center p-2 border rounded">
                            <div className="text-xs text-muted-foreground">M{month}</div>
                            <div className="text-xl font-bold text-primary">{digit}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>General Mirror Map (Top 10 Options per Digit)</CardTitle>
                <CardDescription>
                  Alternative strategy showing most probable mirror digits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Digit</TableHead>
                        {Array.from({ length: 10 }, (_, i) => (
                          <TableHead key={i} className="text-center">#{i + 1}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(mirrorMap).map(([digit, mirrors]) => (
                        <TableRow key={digit}>
                          <TableCell className="font-bold text-lg">{digit}</TableCell>
                          {mirrors.map((mirror, index) => (
                            <TableCell key={index} className="text-center font-mono">
                              {mirror}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
