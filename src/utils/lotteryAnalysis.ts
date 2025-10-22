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

// Get frequency of all digits (0-9)
export const getDigitFrequency = (): DigitFrequency[] => {
  const digitCounts: { [key: string]: number } = {};
  
  // Initialize counts
  for (let i = 0; i <= 9; i++) {
    digitCounts[i.toString()] = 0;
  }
  
  // Count occurrences
  lotteryHistory.forEach(result => {
    result.result.split("").forEach(digit => {
      digitCounts[digit] = (digitCounts[digit] || 0) + 1;
    });
  });
  
  const total = Object.values(digitCounts).reduce((a, b) => a + b, 0);
  
  return Object.entries(digitCounts)
    .map(([digit, count]) => ({
      digit,
      count,
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

/**
 * Triplet Analysis - Analyze 3-digit consecutive patterns
 */
export interface TripletPattern {
  triplet: string;
  frequency: number;
  positions: string[];
  lastSeen: string;
}

export const analyzeTriplets = (): TripletPattern[] => {
  const tripletCounts: Map<string, { count: number; positions: Set<string>; lastDate: string }> = new Map();
  
  lotteryHistory.forEach(result => {
    const digits = result.result;
    
    // Extract all 3-digit sequences
    for (let i = 0; i <= digits.length - 3; i++) {
      const triplet = digits.substring(i, i + 3);
      const positionKey = `${i+1}-${i+3}`;
      
      if (!tripletCounts.has(triplet)) {
        tripletCounts.set(triplet, { count: 0, positions: new Set(), lastDate: result.date });
      }
      
      const data = tripletCounts.get(triplet)!;
      data.count++;
      data.positions.add(positionKey);
      data.lastDate = result.date; // Most recent (history is reverse chronological)
    }
  });
  
  return Array.from(tripletCounts.entries())
    .map(([triplet, data]) => ({
      triplet,
      frequency: data.count,
      positions: Array.from(data.positions),
      lastSeen: data.lastDate
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 20); // Top 20 triplets
};

/**
 * Position Correlation Matrix - Analyze which positions influence each other
 */
export interface PositionCorrelation {
  position1: number;
  position2: number;
  correlation: number;
  strength: "strong" | "moderate" | "weak";
}

export const calculatePositionCorrelation = (): PositionCorrelation[] => {
  const correlations: PositionCorrelation[] = [];
  
  // Build digit sequences for each position
  const positionSequences: number[][] = Array.from({ length: 6 }, () => []);
  
  lotteryHistory.forEach(result => {
    const digits = result.result.split('').map(d => parseInt(d));
    digits.forEach((digit, pos) => {
      positionSequences[pos].push(digit);
    });
  });
  
  // Calculate correlation coefficient between each pair of positions
  for (let i = 0; i < 6; i++) {
    for (let j = i + 1; j < 6; j++) {
      const seq1 = positionSequences[i];
      const seq2 = positionSequences[j];
      
      // Pearson correlation coefficient
      const n = seq1.length;
      const mean1 = seq1.reduce((a, b) => a + b, 0) / n;
      const mean2 = seq2.reduce((a, b) => a + b, 0) / n;
      
      let numerator = 0;
      let sum1Sq = 0;
      let sum2Sq = 0;
      
      for (let k = 0; k < n; k++) {
        const diff1 = seq1[k] - mean1;
        const diff2 = seq2[k] - mean2;
        numerator += diff1 * diff2;
        sum1Sq += diff1 * diff1;
        sum2Sq += diff2 * diff2;
      }
      
      const denominator = Math.sqrt(sum1Sq * sum2Sq);
      const correlation = denominator === 0 ? 0 : numerator / denominator;
      
      let strength: "strong" | "moderate" | "weak";
      const absCorr = Math.abs(correlation);
      if (absCorr > 0.7) strength = "strong";
      else if (absCorr > 0.4) strength = "moderate";
      else strength = "weak";
      
      correlations.push({
        position1: i + 1,
        position2: j + 1,
        correlation,
        strength
      });
    }
  }
  
  return correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
};

/**
 * Sum Distribution Analysis - Analyze total sum patterns
 */
export interface SumDistribution {
  sum: number;
  frequency: number;
  percentage: number;
  examples: string[];
}

export const analyzeSumDistribution = (): SumDistribution[] => {
  const sumCounts: Map<number, string[]> = new Map();
  
  lotteryHistory.forEach(result => {
    const digits = result.result.split('').map(d => parseInt(d));
    const sum = digits.reduce((a, b) => a + b, 0);
    
    if (!sumCounts.has(sum)) {
      sumCounts.set(sum, []);
    }
    sumCounts.get(sum)!.push(result.result);
  });
  
  const total = lotteryHistory.length;
  
  return Array.from(sumCounts.entries())
    .map(([sum, examples]) => ({
      sum,
      frequency: examples.length,
      percentage: (examples.length / total) * 100,
      examples: examples.slice(0, 3) // Show first 3 examples
    }))
    .sort((a, b) => b.frequency - a.frequency);
};

/**
 * Parity Balance Analysis - Track even/odd distributions
 */
export interface ParityAnalysis {
  pattern: string;
  frequency: number;
  percentage: number;
  description: string;
}

export const analyzeParityBalance = (): ParityAnalysis[] => {
  const parityCounts: Map<string, number> = new Map();
  
  lotteryHistory.forEach(result => {
    const digits = result.result.split('').map(d => parseInt(d));
    const evenCount = digits.filter(d => d % 2 === 0).length;
    const oddCount = 6 - evenCount;
    const pattern = `${evenCount}E-${oddCount}O`;
    
    parityCounts.set(pattern, (parityCounts.get(pattern) || 0) + 1);
  });
  
  const total = lotteryHistory.length;
  
  const descriptions: { [key: string]: string } = {
    "6E-0O": "All Even",
    "5E-1O": "Mostly Even",
    "4E-2O": "Even Dominant",
    "3E-3O": "Balanced",
    "2E-4O": "Odd Dominant",
    "1E-5O": "Mostly Odd",
    "0E-6O": "All Odd"
  };
  
  return Array.from(parityCounts.entries())
    .map(([pattern, frequency]) => ({
      pattern,
      frequency,
      percentage: (frequency / total) * 100,
      description: descriptions[pattern] || pattern
    }))
    .sort((a, b) => b.frequency - a.frequency);
};
