import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Target, 
  Brain, 
  Zap, 
  BarChart3,
  CheckCircle2,
  Copy,
  RefreshCw
} from 'lucide-react';
import { useLotteryData } from '@/hooks/useLotteryData';
import { generateAllPredictions, type PredictionSet } from '@/utils/predictionGenerator';
import { generateAllAdvancedPredictions, type AdvancedPredictionSet } from '@/utils/advancedPredictions';
import { validatePredictions } from '@/utils/lotteryAnalysis';
import { toast } from 'sonner';

export const ComprehensivePredictionDashboard = () => {
  const { data: lotteryHistory, isLoading } = useLotteryData();
  const [standardPredictions, setStandardPredictions] = useState<PredictionSet[]>([]);
  const [advancedPredictions, setAdvancedPredictions] = useState<AdvancedPredictionSet[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const generateAllPredictionSets = () => {
    if (lotteryHistory.length < 50) {
      toast.error("Insufficient historical data for predictions");
      return;
    }

    const standard = generateAllPredictions(lotteryHistory);
    const advanced = generateAllAdvancedPredictions(lotteryHistory);
    
    setStandardPredictions(standard);
    setAdvancedPredictions(advanced);
    
    toast.success(`Generated ${standard.length + advanced.length} prediction sets`);
  };

  const copyToClipboard = (text: string, index: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getConfidenceBadge = (confidence: string) => {
    const variants = {
      high: 'default',
      medium: 'secondary',
      low: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[confidence as keyof typeof variants] || 'outline'}>
        {confidence.toUpperCase()} CONFIDENCE
      </Badge>
    );
  };

  const renderPredictionCard = (
    predictions: string[], 
    title: string, 
    description: string, 
    confidence: string,
    icon: React.ReactNode,
    index: string,
    metadataStr?: string
  ) => {
    const validations = lotteryHistory.length > 0 ? validatePredictions(predictions, lotteryHistory) : [];
    const avgConfidence = validations.length > 0 
      ? Math.round(validations.reduce((sum, v) => sum + v.confidenceScore, 0) / validations.length) 
      : 0;

    return (
      <Card key={index} className="hover:border-primary/50 transition-all">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {icon}
              <div>
                <CardTitle className="text-lg">{title}</CardTitle>
                <CardDescription className="text-sm mt-1">{description}</CardDescription>
              </div>
            </div>
            {getConfidenceBadge(confidence)}
          </div>
          {metadataStr && (
            <p className="text-xs text-muted-foreground mt-2">{metadataStr}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {predictions.slice(0, 4).map((pred, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-lg bg-accent/50 border"
                >
                  <span className="font-mono font-bold text-lg">{pred}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(pred, `${index}-${i}`)}
                    className="h-7"
                  >
                    {copiedIndex === `${index}-${i}` ? (
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
            {predictions.length > 4 && (
              <p className="text-xs text-muted-foreground text-center">
                +{predictions.length - 4} more predictions
              </p>
            )}
            {avgConfidence > 0 && (
              <div className="flex items-center gap-2 text-sm pt-2 border-t">
                <Target className="h-4 w-4 text-primary" />
                <span>Historical match score: {avgConfidence}%</span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => copyToClipboard(predictions.join(', '), `${index}-all`)}
            >
              {copiedIndex === `${index}-all` ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy All {predictions.length} Numbers
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <p>Loading prediction system...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Brain className="h-6 w-6 text-primary" />
                Comprehensive Prediction Dashboard
              </CardTitle>
              <CardDescription>
                AI-powered predictions using multiple statistical and mathematical methods
              </CardDescription>
            </div>
            <Button onClick={generateAllPredictionSets} size="lg" className="gap-2">
              <Zap className="h-4 w-4" />
              Generate Predictions
            </Button>
          </div>
        </CardHeader>
      </Card>

      {(standardPredictions.length > 0 || advancedPredictions.length > 0) && (
        <Tabs defaultValue="advanced" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="advanced" className="gap-2">
              <Brain className="h-4 w-4" />
              Advanced AI Models
            </TabsTrigger>
            <TabsTrigger value="statistical" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Statistical Methods
            </TabsTrigger>
          </TabsList>

          <TabsContent value="advanced" className="space-y-4 mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {advancedPredictions.map((pred, idx) => 
                renderPredictionCard(
                  pred.predictions,
                  pred.method,
                  pred.description,
                  pred.confidence,
                  <Brain className="h-5 w-5 text-primary" />,
                  `adv-${idx}`,
                  typeof pred.metadata === 'string' ? pred.metadata : 
                    `Algorithm: ${pred.metadata.algorithm || 'N/A'}`
                )
              )}
            </div>
          </TabsContent>

          <TabsContent value="statistical" className="space-y-4 mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {standardPredictions.map((pred, idx) => 
                renderPredictionCard(
                  pred.numbers,
                  pred.method,
                  pred.description,
                  pred.confidence,
                  <TrendingUp className="h-5 w-5 text-primary" />,
                  `std-${idx}`,
                  undefined
                )
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {standardPredictions.length === 0 && advancedPredictions.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <Target className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="font-semibold text-lg">Ready to Generate Predictions</h3>
              <p className="text-muted-foreground">
                Click "Generate Predictions" to analyze {lotteryHistory.length} historical results
                and create AI-powered number predictions
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
