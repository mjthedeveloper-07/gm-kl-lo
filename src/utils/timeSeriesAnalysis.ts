import { lotteryHistory } from "@/data/lotteryHistory";

export interface AutocorrelationResult {
  digit: string;
  lag1: number;
  lag7: number;
  lag30: number;
  hasSignificantCorrelation: boolean;
  interpretation: string;
}

export interface DurbinWatsonResult {
  statistic: number;
  interpretation: "positive_correlation" | "no_correlation" | "negative_correlation";
  isRandom: boolean;
}

/**
 * Calculate Autocorrelation for digit sequences
 * Tests if recent appearances predict future appearances
 * Lag-1: immediate next draw correlation
 * Lag-7: weekly correlation
 * Lag-30: monthly correlation
 */
export function calculateAutocorrelation(): AutocorrelationResult[] {
  const results: AutocorrelationResult[] = [];
  
  for (let digit = 0; digit <= 9; digit++) {
    const digitStr = digit.toString();
    
    // Create binary sequence: 1 if digit appears, 0 if not
    const sequence = lotteryHistory.map(result => 
      result.result.includes(digitStr) ? 1 : 0
    );
    
    const n = sequence.length;
    const mean = sequence.reduce((a, b) => a + b, 0) / n;
    
    // Calculate autocorrelation for different lags
    const lag1 = calculateLagCorrelation(sequence, 1, mean);
    const lag7 = calculateLagCorrelation(sequence, 7, mean);
    const lag30 = calculateLagCorrelation(sequence, 30, mean);
    
    // Significant if |correlation| > 0.1
    const hasSignificantCorrelation = Math.abs(lag1) > 0.1 || 
                                       Math.abs(lag7) > 0.1 || 
                                       Math.abs(lag30) > 0.1;
    
    let interpretation: string;
    if (hasSignificantCorrelation) {
      interpretation = "Past appearances may influence future occurrences";
    } else {
      interpretation = "No significant correlation - random behavior";
    }
    
    results.push({
      digit: digitStr,
      lag1,
      lag7,
      lag30,
      hasSignificantCorrelation,
      interpretation
    });
  }
  
  return results;
}

/**
 * Helper function to calculate correlation at specific lag
 */
function calculateLagCorrelation(sequence: number[], lag: number, mean: number): number {
  const n = sequence.length;
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n - lag; i++) {
    numerator += (sequence[i] - mean) * (sequence[i + lag] - mean);
  }
  
  for (let i = 0; i < n; i++) {
    denominator += Math.pow(sequence[i] - mean, 2);
  }
  
  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Durbin-Watson Test
 * Tests for independence of residuals in time series
 * DW ≈ 2 indicates no autocorrelation (random)
 * DW < 2 indicates positive autocorrelation
 * DW > 2 indicates negative autocorrelation
 */
export function durbinWatsonTest(): DurbinWatsonResult {
  // Use overall digit sequence across all draws
  const digitSequence: number[] = [];
  
  lotteryHistory.forEach(result => {
    const digits = result.result.split('').map(d => parseInt(d));
    digitSequence.push(...digits);
  });
  
  const n = digitSequence.length;
  let sumSquaredDiff = 0;
  let sumSquaredResiduals = 0;
  
  const mean = digitSequence.reduce((a, b) => a + b, 0) / n;
  
  for (let i = 1; i < n; i++) {
    const diff = digitSequence[i] - digitSequence[i - 1];
    sumSquaredDiff += diff * diff;
  }
  
  for (let i = 0; i < n; i++) {
    const residual = digitSequence[i] - mean;
    sumSquaredResiduals += residual * residual;
  }
  
  const dwStatistic = sumSquaredResiduals === 0 ? 2 : sumSquaredDiff / sumSquaredResiduals;
  
  let interpretation: "positive_correlation" | "no_correlation" | "negative_correlation";
  let isRandom: boolean;
  
  if (dwStatistic < 1.5) {
    interpretation = "positive_correlation";
    isRandom = false;
  } else if (dwStatistic > 2.5) {
    interpretation = "negative_correlation";
    isRandom = false;
  } else {
    interpretation = "no_correlation";
    isRandom = true;
  }
  
  return {
    statistic: dwStatistic,
    interpretation,
    isRandom
  };
}

/**
 * Lag Analysis - identify optimal lag periods
 */
export function analyzeLagPeriods(): {
  optimalLag: number;
  lagCorrelations: Array<{ lag: number; correlation: number }>;
} {
  const digitSequence: number[] = [];
  
  lotteryHistory.forEach(result => {
    const digits = result.result.split('').map(d => parseInt(d));
    digitSequence.push(...digits);
  });
  
  const mean = digitSequence.reduce((a, b) => a + b, 0) / digitSequence.length;
  const lagCorrelations: Array<{ lag: number; correlation: number }> = [];
  
  // Test lags from 1 to 30
  for (let lag = 1; lag <= 30; lag++) {
    const correlation = calculateLagCorrelation(digitSequence, lag, mean);
    lagCorrelations.push({ lag, correlation });
  }
  
  // Find lag with highest absolute correlation
  const optimalLag = lagCorrelations.reduce((max, curr) => 
    Math.abs(curr.correlation) > Math.abs(max.correlation) ? curr : max
  , lagCorrelations[0]).lag;
  
  return {
    optimalLag,
    lagCorrelations
  };
}
