import { lotteryHistory, getLast3Digits, getLast4Digits, type LotteryResult } from "@/data/lotteryHistory";

export interface HistoricalMatch {
  type: "exact" | "last4" | "last3";
  result: LotteryResult;
  matchedDigits: string;
}

export interface PatternStats {
  pattern: string;
  frequency: number;
  lastSeen: string;
  results: LotteryResult[];
}

export interface DigitFrequency {
  digit: string;
  count: number;
  percentage: number;
}

export interface PredictionValidation {
  prediction: string;
  matches: HistoricalMatch[];
  confidenceScore: number;
  hasExactMatch: boolean;
  hasPartialMatch: boolean;
}

// Find historical matches for a prediction
export const findHistoricalMatches = (prediction: string): HistoricalMatch[] => {
  const matches: HistoricalMatch[] = [];
  
  lotteryHistory.forEach(result => {
    // Exact 6-digit match
    if (result.result === prediction) {
      matches.push({
        type: "exact",
        result,
        matchedDigits: prediction
      });
    }
    // Last 4 digits match
    else if (getLast4Digits(result.result) === getLast4Digits(prediction)) {
      matches.push({
        type: "last4",
        result,
        matchedDigits: getLast4Digits(prediction)
      });
    }
    // Last 3 digits match
    else if (getLast3Digits(result.result) === getLast3Digits(prediction)) {
      matches.push({
        type: "last3",
        result,
        matchedDigits: getLast3Digits(prediction)
      });
    }
  });
  
  return matches;
};

// Get frequency analysis for a 3-digit pattern
export const getPatternStats = (pattern: string): PatternStats => {
  const matchingResults = lotteryHistory.filter(r => 
    getLast3Digits(r.result) === pattern || r.result.includes(pattern)
  );
  
  return {
    pattern,
    frequency: matchingResults.length,
    lastSeen: matchingResults[0]?.date || "Never",
    results: matchingResults
  };
};

// Get frequency of all digits (0-9) with time-decay weighting
export const getDigitFrequency = (): DigitFrequency[] => {
  const digitCounts: { [key: string]: number } = {};
  
  // Initialize counts
  for (let i = 0; i <= 9; i++) {
    digitCounts[i.toString()] = 0;
  }
  
  // Sort by date to apply time decay
  const sortedHistory = [...lotteryHistory].sort((a, b) => {
    const dateA = new Date(a.year, a.month - 1, 1).getTime();
    const dateB = new Date(b.year, b.month - 1, 1).getTime();
    return dateA - dateB;
  });
  
  const totalEntries = sortedHistory.length;
  
  // Count occurrences with exponential decay weight (recent = higher weight)
  sortedHistory.forEach((result, index) => {
    // Weight increases exponentially: older entries get 0.3x, newest get 1.0x
    const ageWeight = Math.pow((index + 1) / totalEntries, 2) * 0.7 + 0.3;
    
    result.result.split("").forEach(digit => {
      digitCounts[digit] = (digitCounts[digit] || 0) + ageWeight;
    });
  });
  
  const total = Object.values(digitCounts).reduce((a, b) => a + b, 0);
  
  return Object.entries(digitCounts)
    .map(([digit, count]) => ({
      digit,
      count: Math.round(count),
      percentage: Math.round((count / total) * 100)
    }))
    .sort((a, b) => b.count - a.count);
};

// Get most common last 4-digit patterns
export const getMostCommonLast4Patterns = (): PatternStats[] => {
  const patternCounts: { [key: string]: LotteryResult[] } = {};
  
  lotteryHistory.forEach(result => {
    const last4 = getLast4Digits(result.result);
    if (!patternCounts[last4]) {
      patternCounts[last4] = [];
    }
    patternCounts[last4].push(result);
  });
  
  return Object.entries(patternCounts)
    .map(([pattern, results]) => ({
      pattern,
      frequency: results.length,
      lastSeen: results[0]?.date || "Never",
      results
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10);
};

// Validate predictions against history
export const validatePredictions = (predictions: string[]): PredictionValidation[] => {
  return predictions.map(prediction => {
    const matches = findHistoricalMatches(prediction);
    const hasExactMatch = matches.some(m => m.type === "exact");
    const hasPartialMatch = matches.some(m => m.type === "last4" || m.type === "last3");
    
    // Calculate confidence score (0-100)
    let confidenceScore = 0;
    if (hasExactMatch) confidenceScore = 100;
    else if (matches.some(m => m.type === "last4")) confidenceScore = 75;
    else if (matches.some(m => m.type === "last3")) confidenceScore = 50;
    else confidenceScore = Math.min(matches.length * 10, 40);
    
    return {
      prediction,
      matches,
      confidenceScore,
      hasExactMatch,
      hasPartialMatch
    };
  });
};

// Get hot and cold numbers
export const getHotAndColdNumbers = () => {
  const frequency = getDigitFrequency();
  const hot = frequency.slice(0, 3);
  const cold = frequency.slice(-3).reverse();
  
  return { hot, cold };
};

// Analyze draw number frequency
export const getDrawNumberFrequency = (): { draw: string; count: number }[] => {
  const drawCounts: { [key: string]: number } = {};
  
  lotteryHistory.forEach(result => {
    drawCounts[result.draw] = (drawCounts[result.draw] || 0) + 1;
  });
  
  return Object.entries(drawCounts)
    .map(([draw, count]) => ({ draw, count }))
    .sort((a, b) => b.count - a.count);
};
