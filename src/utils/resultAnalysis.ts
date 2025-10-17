import { generateAllPredictions } from './predictionGenerator';

export interface PredictionMatch {
  method: string;
  predictedNumbers: string[];
  bestPredictedNumber: string;
  exactMatch: boolean;
  last4Match: boolean;
  last3Match: boolean;
  matchingDigits: number;
  matchedPositions: number[];
}

export const analyzeResultAgainstPredictions = (actualResult: string): PredictionMatch[] => {
  const predictions = generateAllPredictions();
  
  return predictions.map(set => {
    const matches = set.numbers.map(predicted => {
      // Check exact match
      const exactMatch = predicted === actualResult;
      
      // Check last 4 digits match
      const last4Match = predicted.slice(-4) === actualResult.slice(-4);
      
      // Check last 3 digits match
      const last3Match = predicted.slice(-3) === actualResult.slice(-3);
      
      // Count matching digits at each position
      let matchingDigits = 0;
      const matchedPositions: number[] = [];
      for (let i = 0; i < 6; i++) {
        if (predicted[i] === actualResult[i]) {
          matchingDigits++;
          matchedPositions.push(i + 1);
        }
      }
      
      return {
        predicted,
        exactMatch,
        last4Match,
        last3Match,
        matchingDigits,
        matchedPositions
      };
    });
    
    // Find the best match for this method
    const bestMatch = matches.reduce((best, current) => {
      if (current.exactMatch) return current;
      if (current.last4Match && !best.last4Match) return current;
      if (current.last3Match && !best.last3Match) return current;
      if (current.matchingDigits > best.matchingDigits) return current;
      return best;
    });
    
    return {
      method: set.method,
      predictedNumbers: set.numbers,
      bestPredictedNumber: bestMatch.predicted,
      exactMatch: bestMatch.exactMatch,
      last4Match: bestMatch.last4Match,
      last3Match: bestMatch.last3Match,
      matchingDigits: bestMatch.matchingDigits,
      matchedPositions: bestMatch.matchedPositions
    };
  });
};

export const getRankings = (matches: PredictionMatch[]): PredictionMatch[] => {
  return [...matches].sort((a, b) => {
    // First, check for exact match
    if (a.exactMatch !== b.exactMatch) return a.exactMatch ? -1 : 1;
    // Then, check for last 4 match
    if (a.last4Match !== b.last4Match) return a.last4Match ? -1 : 1;
    // Then, check for last 3 match
    if (a.last3Match !== b.last3Match) return a.last3Match ? -1 : 1;
    // Finally, sort by number of matching digits
    return b.matchingDigits - a.matchingDigits;
  });
};
