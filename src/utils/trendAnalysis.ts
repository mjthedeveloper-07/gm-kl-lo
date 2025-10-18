import type { LotteryResult } from "@/utils/databaseQueries";

export interface TrendMetrics {
  averageDailyIncrease: number;
  volatility: number;
  momentum: number;
  currentTrend: "upward" | "downward" | "stable";
  recentHighs: number[];
  recentLows: number[];
}

export interface OctoberAnalysis {
  trendMetrics: TrendMetrics;
  positionFrequency: { [position: number]: { [digit: string]: number } };
  lastNResults: number[];
  projectedValue: number;
  confidenceInterval: { lower: number; upper: number };
}

/**
 * Calculate linear regression for trend projection
 */
export const calculateLinearRegression = (values: number[]): { slope: number; intercept: number } => {
  const n = values.length;
  const xValues = Array.from({ length: n }, (_, i) => i);
  
  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = xValues.reduce((sum, x, i) => sum + x * values[i], 0);
  const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return { slope, intercept };
};

/**
 * Calculate moving average
 */
export const calculateMovingAverage = (values: number[], window: number): number[] => {
  const result: number[] = [];
  
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - window + 1);
    const subset = values.slice(start, i + 1);
    const avg = subset.reduce((a, b) => a + b, 0) / subset.length;
    result.push(avg);
  }
  
  return result;
};

/**
 * Calculate volatility (standard deviation)
 */
export const calculateVolatility = (values: number[]): number => {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(variance);
};

/**
 * Calculate momentum (rate of change)
 */
export const calculateMomentum = (values: number[], period: number = 5): number => {
  if (values.length < period) return 0;
  
  const recent = values.slice(-period);
  const older = values.slice(-period * 2, -period);
  
  if (older.length === 0) return 0;
  
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
  
  return recentAvg - olderAvg;
};

/**
 * Analyze October 2025 data specifically
 */
export const analyzeOctoberTrend = (lotteryHistory: LotteryResult[]): OctoberAnalysis => {
  // Filter October 2025 data
  const octoberData = lotteryHistory.filter(r => r.year === 2025 && r.month === 10);
  const octoberValues = octoberData.map(r => parseInt(r.result));
  
  // Calculate trend metrics
  const regression = calculateLinearRegression(octoberValues);
  const volatility = calculateVolatility(octoberValues);
  const momentum = calculateMomentum(octoberValues);
  
  // Determine trend direction
  let currentTrend: "upward" | "downward" | "stable" = "stable";
  if (regression.slope > 5000) currentTrend = "upward";
  else if (regression.slope < -5000) currentTrend = "downward";
  
  // Calculate recent highs and lows
  const sortedValues = [...octoberValues].sort((a, b) => b - a);
  const recentHighs = sortedValues.slice(0, 5);
  const recentLows = sortedValues.slice(-5).reverse();
  
  // Project next value using linear regression
  const nextIndex = octoberValues.length;
  const projectedValue = Math.round(regression.slope * nextIndex + regression.intercept);
  
  // Calculate confidence interval (±1 standard deviation)
  const confidenceInterval = {
    lower: Math.round(projectedValue - volatility),
    upper: Math.round(projectedValue + volatility)
  };
  
  // Position frequency analysis for October
  const positionFrequency: { [position: number]: { [digit: string]: number } } = {};
  for (let pos = 0; pos < 6; pos++) {
    positionFrequency[pos] = {};
    for (let d = 0; d <= 9; d++) {
      positionFrequency[pos][d.toString()] = 0;
    }
  }
  
  octoberData.forEach(result => {
    const digits = result.result.split("");
    digits.forEach((digit, pos) => {
      positionFrequency[pos][digit] = (positionFrequency[pos][digit] || 0) + 1;
    });
  });
  
  return {
    trendMetrics: {
      averageDailyIncrease: regression.slope,
      volatility,
      momentum,
      currentTrend,
      recentHighs,
      recentLows
    },
    positionFrequency,
    lastNResults: octoberValues.slice(-10),
    projectedValue,
    confidenceInterval
  };
};

/**
 * Get date-specific historical data (all 18th dates from previous months)
 */
export const getDatePatternAnalysis = (lotteryHistory: LotteryResult[], targetDate: number): {
  historicalValues: number[];
  average: number;
  min: number;
  max: number;
} => {
  const dateResults = lotteryHistory
    .filter(r => {
      // Parse date string (DD.MM.YY format) to get day of month
      const dayOfMonth = parseInt(r.date.split('.')[0]);
      return dayOfMonth === targetDate && r.result !== "";
    })
    .map(r => parseInt(r.result));
  
  if (dateResults.length === 0) {
    return { historicalValues: [], average: 0, min: 0, max: 0 };
  }
  
  return {
    historicalValues: dateResults,
    average: Math.round(dateResults.reduce((a, b) => a + b, 0) / dateResults.length),
    min: Math.min(...dateResults),
    max: Math.max(...dateResults)
  };
};

/**
 * Calculate day-to-day changes (deltas)
 */
export const calculateDeltaAnalysis = (values: number[]): {
  deltas: number[];
  averageDelta: number;
  maxIncrease: number;
  maxDecrease: number;
} => {
  const deltas: number[] = [];
  
  for (let i = 1; i < values.length; i++) {
    deltas.push(values[i] - values[i - 1]);
  }
  
  const averageDelta = deltas.length > 0 
    ? Math.round(deltas.reduce((a, b) => a + b, 0) / deltas.length)
    : 0;
  
  const maxIncrease = deltas.length > 0 ? Math.max(...deltas) : 0;
  const maxDecrease = deltas.length > 0 ? Math.min(...deltas) : 0;
  
  return {
    deltas,
    averageDelta,
    maxIncrease,
    maxDecrease
  };
};
