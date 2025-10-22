import { lotteryHistory } from "@/data/lotteryHistory";
import { getDigitFrequency } from "./lotteryAnalysis";

export interface ChiSquareResult {
  statistic: number;
  pValue: number;
  degreesOfFreedom: number;
  isUniform: boolean;
  digitDeviations: Array<{
    digit: string;
    observed: number;
    expected: number;
    deviation: number;
    significance: "high" | "medium" | "low";
  }>;
}

export interface RegressionResult {
  digit: string;
  slope: number;
  intercept: number;
  rSquared: number;
  trend: "increasing" | "decreasing" | "stable";
  significance: number;
}

export interface TemporalTrend {
  digit: string;
  movingAvg7Day: number;
  movingAvg30Day: number;
  movingAvg90Day: number;
  momentum: "strong_up" | "up" | "stable" | "down" | "strong_down";
}

/**
 * Chi-Square Goodness-of-Fit Test
 * Tests if lottery digits follow a uniform distribution
 * H0: Distribution is uniform (fair lottery)
 * H1: Distribution is not uniform (biased)
 */
export function chiSquareGoodnessOfFit(): ChiSquareResult {
  const frequencies = getDigitFrequency();
  const totalDraws = lotteryHistory.length * 6; // 6 digits per draw
  const expectedFreq = totalDraws / 10; // Uniform: each digit should appear 10% of time
  
  let chiSquare = 0;
  const digitDeviations = frequencies.map(freq => {
    const observed = freq.count;
    const expected = expectedFreq;
    const deviation = Math.pow(observed - expected, 2) / expected;
    chiSquare += deviation;
    
    // Classify deviation significance
    const deviationPercent = Math.abs((observed - expected) / expected) * 100;
    let significance: "high" | "medium" | "low";
    if (deviationPercent > 10) significance = "high";
    else if (deviationPercent > 5) significance = "medium";
    else significance = "low";
    
    return {
      digit: freq.digit,
      observed,
      expected,
      deviation,
      significance
    };
  });
  
  const degreesOfFreedom = 9; // 10 digits - 1
  
  // Calculate p-value approximation using chi-square distribution
  const pValue = chiSquarePValue(chiSquare, degreesOfFreedom);
  
  // Significance level: 0.05 (95% confidence)
  const isUniform = pValue > 0.05;
  
  return {
    statistic: chiSquare,
    pValue,
    degreesOfFreedom,
    isUniform,
    digitDeviations
  };
}

/**
 * Approximate p-value for chi-square statistic
 * Using gamma function approximation
 */
function chiSquarePValue(chiSquare: number, df: number): number {
  // Simplified approximation for p-value
  // For more accuracy, would need full gamma function implementation
  const criticalValues = [
    { df: 9, cv_005: 16.919, cv_01: 14.684, cv_05: 3.325 }
  ];
  
  const critical = criticalValues.find(c => c.df === df);
  if (!critical) return 0.5;
  
  if (chiSquare > critical.cv_005) return 0.005;
  if (chiSquare > critical.cv_01) return 0.01;
  if (chiSquare > critical.cv_05) return 0.05;
  return 0.5; // Not significant
}

/**
 * Linear Regression Analysis for temporal trends
 * Analyzes if digit frequencies change over time
 */
export function linearRegressionAnalysis(): RegressionResult[] {
  const results: RegressionResult[] = [];
  
  // Group results by month to track frequency over time
  const monthlyData = new Map<string, Map<string, number>>();
  
  lotteryHistory.forEach(result => {
    const monthKey = `${result.year}-${result.month.toString().padStart(2, '0')}`;
    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, new Map());
    }
    
    const digits = result.result.split('');
    digits.forEach(digit => {
      const digitMap = monthlyData.get(monthKey)!;
      digitMap.set(digit, (digitMap.get(digit) || 0) + 1);
    });
  });
  
  // Perform linear regression for each digit (0-9)
  for (let digit = 0; digit <= 9; digit++) {
    const digitStr = digit.toString();
    const timePoints: number[] = [];
    const frequencies: number[] = [];
    
    let timeIndex = 0;
    monthlyData.forEach((digitCounts, monthKey) => {
      timePoints.push(timeIndex++);
      frequencies.push(digitCounts.get(digitStr) || 0);
    });
    
    // Calculate linear regression: y = mx + b
    const n = timePoints.length;
    const sumX = timePoints.reduce((a, b) => a + b, 0);
    const sumY = frequencies.reduce((a, b) => a + b, 0);
    const sumXY = timePoints.reduce((sum, x, i) => sum + x * frequencies[i], 0);
    const sumX2 = timePoints.reduce((sum, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate R-squared
    const meanY = sumY / n;
    const ssTotal = frequencies.reduce((sum, y) => sum + Math.pow(y - meanY, 2), 0);
    const ssResidual = frequencies.reduce((sum, y, i) => {
      const predicted = slope * timePoints[i] + intercept;
      return sum + Math.pow(y - predicted, 2);
    }, 0);
    const rSquared = 1 - (ssResidual / ssTotal);
    
    // Determine trend
    let trend: "increasing" | "decreasing" | "stable";
    if (Math.abs(slope) < 0.1) trend = "stable";
    else if (slope > 0) trend = "increasing";
    else trend = "decreasing";
    
    results.push({
      digit: digitStr,
      slope,
      intercept,
      rSquared,
      trend,
      significance: Math.abs(slope)
    });
  }
  
  return results.sort((a, b) => Math.abs(b.slope) - Math.abs(a.slope));
}

/**
 * Temporal Trend Analysis with Moving Averages
 */
export function temporalTrendAnalysis(): TemporalTrend[] {
  const results: TemporalTrend[] = [];
  const recentResults = lotteryHistory.slice(-90); // Last 90 draws
  
  for (let digit = 0; digit <= 9; digit++) {
    const digitStr = digit.toString();
    
    // Calculate moving averages for different windows
    const counts7 = recentResults.slice(-7).filter(r => r.result.includes(digitStr)).length;
    const counts30 = recentResults.slice(-30).filter(r => r.result.includes(digitStr)).length;
    const counts90 = recentResults.filter(r => r.result.includes(digitStr)).length;
    
    const movingAvg7Day = counts7 / 7;
    const movingAvg30Day = counts30 / 30;
    const movingAvg90Day = counts90 / 90;
    
    // Determine momentum based on moving average convergence
    let momentum: "strong_up" | "up" | "stable" | "down" | "strong_down";
    const shortTermTrend = movingAvg7Day - movingAvg30Day;
    const longTermTrend = movingAvg30Day - movingAvg90Day;
    
    if (shortTermTrend > 0.5 && longTermTrend > 0.2) momentum = "strong_up";
    else if (shortTermTrend > 0.2) momentum = "up";
    else if (shortTermTrend < -0.5 && longTermTrend < -0.2) momentum = "strong_down";
    else if (shortTermTrend < -0.2) momentum = "down";
    else momentum = "stable";
    
    results.push({
      digit: digitStr,
      movingAvg7Day,
      movingAvg30Day,
      movingAvg90Day,
      momentum
    });
  }
  
  return results;
}

/**
 * Uniformity Test - Comprehensive check across all positions
 */
export function uniformityTest(): {
  overallUniform: boolean;
  positionalTests: Array<{
    position: number;
    chiSquare: number;
    isUniform: boolean;
  }>;
} {
  const positionalTests: Array<{ position: number; chiSquare: number; isUniform: boolean }> = [];
  
  // Test each position independently
  for (let pos = 0; pos < 6; pos++) {
    const digitCounts = new Map<string, number>();
    
    lotteryHistory.forEach(result => {
      const digit = result.result[pos];
      digitCounts.set(digit, (digitCounts.get(digit) || 0) + 1);
    });
    
    const totalDraws = lotteryHistory.length;
    const expectedFreq = totalDraws / 10;
    
    let chiSquare = 0;
    for (let d = 0; d <= 9; d++) {
      const observed = digitCounts.get(d.toString()) || 0;
      chiSquare += Math.pow(observed - expectedFreq, 2) / expectedFreq;
    }
    
    const pValue = chiSquarePValue(chiSquare, 9);
    positionalTests.push({
      position: pos + 1,
      chiSquare,
      isUniform: pValue > 0.05
    });
  }
  
  const overallUniform = positionalTests.every(t => t.isUniform);
  
  return {
    overallUniform,
    positionalTests
  };
}
