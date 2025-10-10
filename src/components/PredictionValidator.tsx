import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { validatePredictions, type PredictionValidation } from "@/utils/lotteryAnalysis";
import { CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";

interface PredictionValidatorProps {
  predictions: string[];
}

export const PredictionValidator = ({ predictions }: PredictionValidatorProps) => {
  if (predictions.length === 0) {
    return null;
  }

  const validations = validatePredictions(predictions);
  const withMatches = validations.filter(v => v.matches.length > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Historical Validation
        </CardTitle>
        <CardDescription>
          {withMatches.length} of {predictions.length} predictions have historical matches
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-auto">
          {validations.map((validation, index) => (
            <div key={index} className="rounded-lg border p-3 hover:bg-accent/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-bold">{validation.prediction}</span>
                  {validation.hasExactMatch && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                  {!validation.hasExactMatch && validation.hasPartialMatch && (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={
                      validation.confidenceScore >= 75 ? "default" :
                      validation.confidenceScore >= 50 ? "secondary" :
                      "outline"
                    }
                  >
                    {validation.confidenceScore}% confidence
                  </Badge>
                </div>
              </div>
              
              {validation.matches.length > 0 && (
                <div className="space-y-1 mt-2 text-sm">
                  <p className="text-muted-foreground font-medium">
                    {validation.matches.length} historical match{validation.matches.length !== 1 ? "es" : ""}:
                  </p>
                  {validation.matches.slice(0, 3).map((match, mIndex) => (
                    <div key={mIndex} className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="text-xs">
                        {match.type === "exact" ? "Exact" : match.type === "last4" ? "Last 4" : "Last 3"}
                      </Badge>
                      <span className="font-mono">{match.result.result}</span>
                      <span className="text-muted-foreground">({match.result.date})</span>
                    </div>
                  ))}
                  {validation.matches.length > 3 && (
                    <p className="text-xs text-muted-foreground italic">
                      +{validation.matches.length - 3} more matches...
                    </p>
                  )}
                </div>
              )}
              
              {validation.matches.length === 0 && (
                <p className="text-xs text-muted-foreground">No historical matches found</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
