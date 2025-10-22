// Advanced Pattern Analysis Engine
import type { LotteryResult } from './databaseQueries';

// Temporal Pattern Analysis
export interface DayOfWeekAnalysis {
  day: string;
  totalDraws: number;
  averageDigitSum: number;
  mostFrequentDigits: string[];
  hotNumbers: string[];
  confidence: number;
}

export interface MonthlySeasonality {
  month: string;
  totalDraws: number;
  averageFirstDigit: number;
  averageLastDigit: number;
  seasonalIndex: number;
  trendDirection: 'up' | 'down' | 'neutral';
  significantPatterns: string[];
}

export interface DigitDistribution {
  digit: string;
  overallFrequency: number;
  positionalFrequency: Record<number, number>;
  expectedFrequency: number;
  chiSquareDeviation: number;
  hotOrCold: 'hot' | 'neutral' | 'cold';
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface GapAnalysis {
  number: string;
  lastAppearance: string;
  daysSinceLastSeen: number;
  averageGap: number;
  standardDeviation: number;
  isPastDue: boolean;
  urgencyScore: number;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Analyze day-of-week patterns
export const analyzeDayOfWeekPatterns = (history: LotteryResult[]): DayOfWeekAnalysis[] => {
  const dayGroups: Record<string, LotteryResult[]> = {};
  
  history.forEach(result => {
    const date = new Date(result.date);
    const day = DAYS[date.getDay()];
    if (!dayGroups[day]) dayGroups[day] = [];
    dayGroups[day].push(result);
  });

  return Object.entries(dayGroups).map(([day, results]) => {
    const digitSums = results.map(r => 
      r.result.split('').reduce((sum, digit) => sum + parseInt(digit), 0)
    );
    const avgSum = digitSums.reduce((a, b) => a + b, 0) / digitSums.length;
    
    // Count digit frequencies
    const digitFreq: Record<string, number> = {};
    results.forEach(r => {
      r.result.split('').forEach(digit => {
        digitFreq[digit] = (digitFreq[digit] || 0) + 1;
      });
    });
    
    const mostFrequent = Object.entries(digitFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([digit]) => digit);

    const hotNumbers = results
      .map(r => r.result)
      .filter((v, i, a) => a.indexOf(v) !== i)
      .slice(0, 3);

    return {
      day,
      totalDraws: results.length,
      averageDigitSum: avgSum,
      mostFrequentDigits: mostFrequent,
      hotNumbers,
      confidence: Math.min(results.length / 100, 1)
    };
  });
};

// Analyze monthly seasonality
export const analyzeMonthlySeasonality = (history: LotteryResult[]): MonthlySeasonality[] => {
  const monthGroups: Record<string, LotteryResult[]> = {};
  
  history.forEach(result => {
    const date = new Date(result.date);
    const month = MONTHS[date.getMonth()];
    if (!monthGroups[month]) monthGroups[month] = [];
    monthGroups[month].push(result);
  });

  const yearlyAvg = history.length / 12;

  return Object.entries(monthGroups).map(([month, results]) => {
    const firstDigits = results.map(r => parseInt(r.result[0]));
    const lastDigits = results.map(r => parseInt(r.result[r.result.length - 1]));
    
    const avgFirst = firstDigits.reduce((a, b) => a + b, 0) / firstDigits.length;
    const avgLast = lastDigits.reduce((a, b) => a + b, 0) / lastDigits.length;
    
    const seasonalIndex = results.length / yearlyAvg;
    const trendDirection: 'up' | 'down' | 'neutral' = 
      seasonalIndex > 1.1 ? 'up' : seasonalIndex < 0.9 ? 'down' : 'neutral';

    // Find significant patterns (last 3 digits appearing multiple times)
    const last3Patterns: Record<string, number> = {};
    results.forEach(r => {
      const pattern = r.result.slice(-3);
      last3Patterns[pattern] = (last3Patterns[pattern] || 0) + 1;
    });
    
    const significantPatterns = Object.entries(last3Patterns)
      .filter(([, count]) => count > 2)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([pattern]) => pattern);

    return {
      month,
      totalDraws: results.length,
      averageFirstDigit: avgFirst,
      averageLastDigit: avgLast,
      seasonalIndex,
      trendDirection,
      significantPatterns
    };
  });
};

// Analyze digit distribution with statistical testing
export const analyzeDigitDistribution = (history: LotteryResult[]): DigitDistribution[] => {
  const totalDigits = history.length * 6;
  const expectedFreq = totalDigits / 10;
  
  const digitStats: Record<string, { total: number; positions: Record<number, number> }> = {};
  
  // Initialize
  for (let i = 0; i <= 9; i++) {
    digitStats[i.toString()] = { total: 0, positions: {} };
  }
  
  // Count occurrences
  history.forEach(result => {
    result.result.split('').forEach((digit, position) => {
      digitStats[digit].total += 1;
      digitStats[digit].positions[position] = (digitStats[digit].positions[position] || 0) + 1;
    });
  });

  return Object.entries(digitStats).map(([digit, stats]) => {
    const chiSquare = Math.pow(stats.total - expectedFreq, 2) / expectedFreq;
    const deviation = stats.total - expectedFreq;
    
    let hotOrCold: 'hot' | 'neutral' | 'cold' = 'neutral';
    if (deviation > expectedFreq * 0.1) hotOrCold = 'hot';
    else if (deviation < -expectedFreq * 0.1) hotOrCold = 'cold';

    // Simple trend analysis (compare first half vs second half of history)
    const midpoint = Math.floor(history.length / 2);
    const firstHalfCount = history.slice(0, midpoint).reduce((count, r) => 
      count + r.result.split('').filter(d => d === digit).length, 0
    );
    const secondHalfCount = history.slice(midpoint).reduce((count, r) => 
      count + r.result.split('').filter(d => d === digit).length, 0
    );
    
    const trend: 'increasing' | 'decreasing' | 'stable' = 
      secondHalfCount > firstHalfCount * 1.1 ? 'increasing' :
      secondHalfCount < firstHalfCount * 0.9 ? 'decreasing' : 'stable';

    return {
      digit,
      overallFrequency: stats.total,
      positionalFrequency: stats.positions,
      expectedFrequency: expectedFreq,
      chiSquareDeviation: chiSquare,
      hotOrCold,
      trend
    };
  });
};

// Analyze gaps between number appearances
export const analyzeNumberGaps = (history: LotteryResult[]): GapAnalysis[] => {
  const numberAppearances: Record<string, string[]> = {};
  
  history.forEach(result => {
    if (!numberAppearances[result.result]) {
      numberAppearances[result.result] = [];
    }
    numberAppearances[result.result].push(result.date);
  });

  const today = new Date();
  const analyses: GapAnalysis[] = [];

  Object.entries(numberAppearances).forEach(([number, dates]) => {
    if (dates.length < 2) return;

    const gaps: number[] = [];
    for (let i = 1; i < dates.length; i++) {
      const gap = Math.floor(
        (new Date(dates[i]).getTime() - new Date(dates[i - 1]).getTime()) / (1000 * 60 * 60 * 24)
      );
      gaps.push(gap);
    }

    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const variance = gaps.reduce((sum, gap) => sum + Math.pow(gap - avgGap, 2), 0) / gaps.length;
    const stdDev = Math.sqrt(variance);

    const lastDate = new Date(dates[dates.length - 1]);
    const daysSinceLast = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const isPastDue = daysSinceLast > avgGap + stdDev;
    const urgencyScore = Math.min(100, (daysSinceLast / (avgGap + stdDev)) * 100);

    analyses.push({
      number,
      lastAppearance: dates[dates.length - 1],
      daysSinceLastSeen: daysSinceLast,
      averageGap: avgGap,
      standardDeviation: stdDev,
      isPastDue,
      urgencyScore: Math.round(urgencyScore)
    });
  });

  return analyses.sort((a, b) => b.urgencyScore - a.urgencyScore).slice(0, 20);
};

// Calculate entropy (measure of randomness)
export const calculateEntropy = (history: LotteryResult[]): number => {
  const digitCounts: Record<string, number> = {};
  let totalDigits = 0;

  history.forEach(result => {
    result.result.split('').forEach(digit => {
      digitCounts[digit] = (digitCounts[digit] || 0) + 1;
      totalDigits++;
    });
  });

  let entropy = 0;
  Object.values(digitCounts).forEach(count => {
    const probability = count / totalDigits;
    entropy -= probability * Math.log2(probability);
  });

  return entropy;
};

// Detect anomalies (unusual patterns)
export const detectAnomalies = (history: LotteryResult[]): Array<{ date: string; result: string; anomalyType: string; score: number }> => {
  const anomalies: Array<{ date: string; result: string; anomalyType: string; score: number }> = [];

  history.forEach(result => {
    const digits = result.result.split('').map(Number);
    
    // Check for repeating digits
    const uniqueDigits = new Set(digits);
    if (uniqueDigits.size <= 2) {
      anomalies.push({
        date: result.date,
        result: result.result,
        anomalyType: 'Repeating Digits',
        score: 85
      });
    }

    // Check for sequential patterns
    const isSequential = digits.every((digit, i) => i === 0 || Math.abs(digit - digits[i - 1]) === 1);
    if (isSequential) {
      anomalies.push({
        date: result.date,
        result: result.result,
        anomalyType: 'Sequential Pattern',
        score: 90
      });
    }

    // Check for palindromes
    const isPalindrome = result.result === result.result.split('').reverse().join('');
    if (isPalindrome) {
      anomalies.push({
        date: result.date,
        result: result.result,
        anomalyType: 'Palindrome',
        score: 75
      });
    }

    // Check for extreme digit sums
    const digitSum = digits.reduce((a, b) => a + b, 0);
    if (digitSum < 10 || digitSum > 45) {
      anomalies.push({
        date: result.date,
        result: result.result,
        anomalyType: 'Extreme Digit Sum',
        score: 70
      });
    }
  });

  return anomalies.sort((a, b) => b.score - a.score).slice(0, 20);
};
