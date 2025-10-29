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

// Calculate sum of a lottery result
export const calculateSum = (result: string): number => {
  return result.split("").reduce((sum, digit) => sum + parseInt(digit), 0);
};

// Get sum statistics from historical data
export const getSumStatistics = () => {
  const sums = lotteryHistory.map(r => calculateSum(r.result));
  const average = sums.reduce((a, b) => a + b, 0) / sums.length;
  const sorted = [...sums].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const median = sorted[Math.floor(sorted.length / 2)];
  
  // Calculate standard deviation
  const variance = sums.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / sums.length;
  const stdDev = Math.sqrt(variance);
  
  return {
    average: Math.round(average),
    min,
    max,
    median,
    stdDev: Math.round(stdDev),
    commonRange: {
      lower: Math.round(average - stdDev),
      upper: Math.round(average + stdDev)
    }
  };
};

// Analyze number pairs (which numbers appear together)
export const analyzeNumberPairs = (): { pair: string; frequency: number; results: LotteryResult[] }[] => {
  const pairCounts: { [key: string]: LotteryResult[] } = {};
  
  lotteryHistory.forEach(result => {
    const digits = result.result.split("");
    // Check all pairs of digits
    for (let i = 0; i < digits.length - 1; i++) {
      for (let j = i + 1; j < digits.length; j++) {
        const pair = [digits[i], digits[j]].sort().join("-");
        if (!pairCounts[pair]) {
          pairCounts[pair] = [];
        }
        pairCounts[pair].push(result);
      }
    }
  });
  
  return Object.entries(pairCounts)
    .map(([pair, results]) => ({
      pair,
      frequency: results.length,
      results
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 20);
};

// Generate predictions using Delta System
export const generateDeltaPredictions = (count: number = 10): string[] => {
  const predictions: string[] = [];
  const deltas = [3, 5, 7, 9, 11]; // Common delta values
  
  for (let i = 0; i < count; i++) {
    const startNum = Math.floor(Math.random() * 5) + 1; // Start with 1-5
    const delta = deltas[Math.floor(Math.random() * deltas.length)];
    let prediction = "";
    let current = startNum;
    
    for (let j = 0; j < 6; j++) {
      prediction += (current % 10).toString();
      current += delta;
    }
    
    predictions.push(prediction);
  }
  
  return predictions;
};

// Generate predictions based on sum analysis
export const generateSumBasedPredictions = (count: number = 10): string[] => {
  const predictions: string[] = [];
  const { commonRange } = getSumStatistics();
  const { hot } = getHotAndColdNumbers();
  const hotDigits = hot.map(h => h.digit);
  
  for (let i = 0; i < count; i++) {
    let prediction = "";
    let currentSum = 0;
    
    // Generate 6 digits trying to stay within common sum range
    for (let j = 0; j < 6; j++) {
      const remainingDigits = 6 - j;
      const targetSum = (commonRange.lower + commonRange.upper) / 2;
      const avgNeeded = (targetSum - currentSum) / remainingDigits;
      
      // Choose digit close to average needed, preferring hot numbers
      let digit: string;
      if (Math.random() < 0.7 && hotDigits.length > 0) {
        digit = hotDigits[Math.floor(Math.random() * hotDigits.length)];
      } else {
        const range = Math.max(0, Math.min(9, Math.round(avgNeeded)));
        digit = (Math.max(0, Math.min(9, range + Math.floor(Math.random() * 3) - 1))).toString();
      }
      
      prediction += digit;
      currentSum += parseInt(digit);
    }
    
    predictions.push(prediction);
  }
  
  return predictions;
};

// Generate predictions based on number pairs
export const generatePairBasedPredictions = (count: number = 10): string[] => {
  const predictions: string[] = [];
  const topPairs = analyzeNumberPairs().slice(0, 10);
  
  for (let i = 0; i < count; i++) {
    const usedDigits = new Set<string>();
    let prediction = "";
    
    // Pick 2-3 random pairs and fill the rest
    const pairsToUse = Math.floor(Math.random() * 2) + 2; // 2 or 3 pairs
    const selectedPairs = topPairs
      .sort(() => Math.random() - 0.5)
      .slice(0, pairsToUse);
    
    selectedPairs.forEach(p => {
      const [d1, d2] = p.pair.split("-");
      usedDigits.add(d1);
      usedDigits.add(d2);
    });
    
    const digits = Array.from(usedDigits);
    
    // Fill to 6 digits if needed
    while (digits.length < 6) {
      const newDigit = Math.floor(Math.random() * 10).toString();
      if (!digits.includes(newDigit)) {
        digits.push(newDigit);
      }
    }
    
    // Shuffle and take first 6
    prediction = digits
      .sort(() => Math.random() - 0.5)
      .slice(0, 6)
      .join("");
    
    predictions.push(prediction);
  }
  
  return predictions;
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
