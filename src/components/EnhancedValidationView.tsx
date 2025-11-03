import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  validateMCvsResult,
  validateAgainstHistory,
  calculateStatistics,
  getRecentValidations,
  findBestPatterns,
  type EnhancedValidationResult,
  type ValidationStatistics
} from '@/utils/enhancedValidation';
import { CheckCircle2, XCircle, AlertCircle, TrendingUp, Target, Award } from 'lucide-react';

export function EnhancedValidationView() {
  const [mcNumber, setMcNumber] = useState('');
  const [resultNumber, setResultNumber] = useState('');
  const [singleValidation, setSingleValidation] = useState<EnhancedValidationResult | null>(null);
  const [recentValidations, setRecentValidations] = useState<EnhancedValidationResult[]>([]);
  const [statistics, setStatistics] = useState<ValidationStatistics | null>(null);
  const [bestPatterns, setBestPatterns] = useState<ReturnType<typeof findBestPatterns> | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const recent = getRecentValidations(50);
    setRecentValidations(recent);
    
    const allValidations = validateAgainstHistory();
    const stats = calculateStatistics(allValidations);
    setStatistics(stats);
    
    const patterns = findBestPatterns();
    setBestPatterns(patterns);
  };

  const handleValidate = () => {
    if (!mcNumber || !resultNumber) return;
    const result = validateMCvsResult(mcNumber, resultNumber);
    setSingleValidation(result);
  };

  const getMatchBadge = (level: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      perfect: { variant: 'default', label: '4/4 Perfect' },
      strong: { variant: 'secondary', label: '3/4 Strong' },
      moderate: { variant: 'outline', label: '2/4 Moderate' },
      weak: { variant: 'outline', label: '1/4 Weak' },
      none: { variant: 'destructive', label: '0/4 None' }
    };
    const config = variants[level] || variants.none;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getMatchIcon = (matched: boolean) => {
    return matched ? (
      <CheckCircle2 className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-6 w-6" />
          Enhanced Validation System
        </CardTitle>
        <CardDescription>
          Real chart data validation with comprehensive accuracy analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="validator" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="validator">Validator</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
          </TabsList>

          {/* Single Validation Tab */}
          <TabsContent value="validator" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mc">MC Number</Label>
                <Input
                  id="mc"
                  placeholder="Enter MC number"
                  value={mcNumber}
                  onChange={(e) => setMcNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="result">Result Number</Label>
                <Input
                  id="result"
                  placeholder="Enter result number"
                  value={resultNumber}
                  onChange={(e) => setResultNumber(e.target.value)}
                />
              </div>
            </div>
            
            <Button onClick={handleValidate} className="w-full">
              Validate Match
            </Button>

            {singleValidation && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Validation Result</CardTitle>
                    {getMatchBadge(singleValidation.matchLevel)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">MC Number</p>
                      <p className="text-xl font-bold">{singleValidation.mcNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Result Number</p>
                      <p className="text-xl font-bold">{singleValidation.resultNumber}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Match Accuracy</p>
                    <Progress value={singleValidation.matchPercentage} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-1">
                      {singleValidation.matchPercentage.toFixed(0)}% - {singleValidation.matchCount}/{singleValidation.totalDigits} digits matched
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Position Analysis</p>
                    <div className="grid grid-cols-4 gap-2">
                      {singleValidation.positionMatches.map((pm) => (
                        <Card key={pm.position} className="p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">Pos {pm.position}</span>
                            {getMatchIcon(pm.matched)}
                          </div>
                          <p className="text-lg font-bold">{pm.mcDigit} → {pm.resultDigit}</p>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    {singleValidation.firstDigitMatch ? (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        First Digit Match
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <AlertCircle className="h-3 w-3" />
                        First Digit Different
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="space-y-4">
            {statistics && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{statistics.totalValidations}</div>
                      <p className="text-xs text-muted-foreground">Total Validations</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-green-600">{statistics.perfectMatches}</div>
                      <p className="text-xs text-muted-foreground">Perfect Matches</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{statistics.overallAccuracy.toFixed(1)}%</div>
                      <p className="text-xs text-muted-foreground">Overall Accuracy</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{statistics.averageMatchCount.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">Avg Match Count</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Match Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Perfect (4/4)</span>
                        <span className="font-medium">{statistics.perfectMatches}</span>
                      </div>
                      <Progress value={(statistics.perfectMatches / statistics.totalValidations) * 100} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Strong (3/4)</span>
                        <span className="font-medium">{statistics.strongMatches}</span>
                      </div>
                      <Progress value={(statistics.strongMatches / statistics.totalValidations) * 100} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Moderate (2/4)</span>
                        <span className="font-medium">{statistics.moderateMatches}</span>
                      </div>
                      <Progress value={(statistics.moderateMatches / statistics.totalValidations) * 100} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Position Accuracy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-3">
                      {Object.entries(statistics.positionAccuracy).map(([pos, accuracy]) => (
                        <div key={pos} className="text-center">
                          <div className="text-2xl font-bold">{accuracy.toFixed(1)}%</div>
                          <p className="text-xs text-muted-foreground">Position {pos}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Recent Validations Tab */}
          <TabsContent value="recent" className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>MC</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Match</TableHead>
                  <TableHead>Accuracy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentValidations.slice(0, 20).map((v, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="text-sm">{v.date}</TableCell>
                    <TableCell className="font-mono">{v.mcNumber}</TableCell>
                    <TableCell className="font-mono">{v.resultNumber}</TableCell>
                    <TableCell>{getMatchBadge(v.matchLevel)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={v.matchPercentage} className="h-1 w-16" />
                        <span className="text-xs">{v.matchCount}/4</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns" className="space-y-4">
            {bestPatterns && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Best Performing Patterns
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {bestPatterns.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                        <p className="text-sm">{rec}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {statistics && Object.keys(statistics.byDrawTime).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Draw Time Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Perfect</TableHead>
                            <TableHead>Accuracy</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(statistics.byDrawTime)
                            .sort((a, b) => b[1].accuracy - a[1].accuracy)
                            .map(([time, data]) => (
                              <TableRow key={time}>
                                <TableCell className="font-medium">{time}</TableCell>
                                <TableCell>{data.total}</TableCell>
                                <TableCell>{data.perfect}</TableCell>
                                <TableCell>
                                  <Badge variant="secondary">
                                    {data.accuracy.toFixed(1)}%
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
