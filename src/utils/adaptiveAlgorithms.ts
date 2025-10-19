// Advanced Adaptive Algorithms for Kerala Lottery Analysis
import { LotteryResult } from '@/hooks/useLotteryData';

export interface FrequencyData {
  digit: number;
  frequency: number;
  expectedFrequency: number;
  zScore: number;
  status: 'VERY_HOT' | 'HOT' | 'NEUTRAL' | 'COLD' | 'VERY_COLD';
  trend: 'HEATING_UP' | 'COOLING_DOWN' | 'STABLE';
  lastSeen: number; // days ago
}

export interface PositionFrequency {
  position: number;
  digits: FrequencyData[];
  totalDraws: number;
}

export interface TimeframeAnalysis {
  timeframe: '30-day' | '90-day' | '365-day' | 'all-time';
  startDate: Date;
  endDate: Date;
  totalDraws: number;
  positionFrequencies: PositionFrequency[];
}

// Calculate dynamic frequency with decay factor
export const calculateDynamicFrequency = (
  digit: number,
  position: number,
  results: LotteryResult[],
  decayFactor: number = 0.95
): number => {
  let frequency = 0;
  let weight = 1.0;
  
  // Process results from newest to oldest
  const sortedResults = [...results].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  sortedResults.forEach((result) => {
    const digitAtPosition = parseInt(result.result[position]);
    if (digitAtPosition === digit) {
      frequency += weight;
    }
    weight *= decayFactor;
  });
  
  return frequency;
};

// Classify digit status based on statistical analysis
export const classifyDigitStatus = (
  frequency: number,
  expectedFrequency: number,
  standardDeviation: number
): FrequencyData['status'] => {
  const zScore = standardDeviation > 0 
    ? (frequency - expectedFrequency) / standardDeviation 
    : 0;
  
  if (zScore > 1.5) return 'VERY_HOT';
  if (zScore > 0.8) return 'HOT';
  if (zScore < -1.5) return 'VERY_COLD';
  if (zScore < -0.8) return 'COLD';
  return 'NEUTRAL';
};

// Calculate trend direction
export const calculateTrend = (
  currentFrequency: number,
  previousFrequency: number,
  threshold: number = 0.1
): FrequencyData['trend'] => {
  const change = (currentFrequency - previousFrequency) / (previousFrequency || 1);
  
  if (change > threshold) return 'HEATING_UP';
  if (change < -threshold) return 'COOLING_DOWN';
  return 'STABLE';
};

// Filter results by timeframe
export const filterByTimeframe = (
  results: LotteryResult[],
  timeframe: TimeframeAnalysis['timeframe']
): LotteryResult[] => {
  const now = new Date();
  const cutoffDate = new Date();
  
  switch (timeframe) {
    case '30-day':
      cutoffDate.setDate(now.getDate() - 30);
      break;
    case '90-day':
      cutoffDate.setDate(now.getDate() - 90);
      break;
    case '365-day':
      cutoffDate.setDate(now.getDate() - 365);
      break;
    case 'all-time':
      return results;
  }
  
  return results.filter(r => new Date(r.date) >= cutoffDate);
};

// Analyze position frequencies for a given timeframe
export const analyzePositionFrequencies = (
  results: LotteryResult[],
  timeframe: TimeframeAnalysis['timeframe'],
  decayFactor: number = 0.95
): TimeframeAnalysis => {
  const filteredResults = filterByTimeframe(results, timeframe);
  const positionFrequencies: PositionFrequency[] = [];
  
  // Analyze each position (0-5 for 6-digit number)
  for (let position = 0; position < 6; position++) {
    const digitData: FrequencyData[] = [];
    const frequencies: number[] = new Array(10).fill(0);
    
    // Calculate raw frequencies
    filteredResults.forEach(result => {
      const digit = parseInt(result.result[position]);
      if (!isNaN(digit)) frequencies[digit]++;
    });
    
    // Calculate statistics
    const totalDraws = filteredResults.length;
    const expectedFrequency = totalDraws / 10;
    const mean = frequencies.reduce((sum, f) => sum + f, 0) / 10;
    const variance = frequencies.reduce((sum, f) => sum + Math.pow(f - mean, 2), 0) / 10;
    const standardDeviation = Math.sqrt(variance);
    
    // Calculate previous period for trend
    const previousPeriodResults = results.slice(filteredResults.length, filteredResults.length * 2);
    const previousFrequencies: number[] = new Array(10).fill(0);
    previousPeriodResults.forEach(result => {
      const digit = parseInt(result.result[position]);
      if (!isNaN(digit)) previousFrequencies[digit]++;
    });
    
    // Process each digit
    for (let digit = 0; digit < 10; digit++) {
      const frequency = frequencies[digit];
      const previousFrequency = previousFrequencies[digit];
      const dynamicFreq = calculateDynamicFrequency(digit, position, filteredResults, decayFactor);
      const zScore = standardDeviation > 0 ? (frequency - expectedFrequency) / standardDeviation : 0;
      const status = classifyDigitStatus(frequency, expectedFrequency, standardDeviation);
      const trend = calculateTrend(frequency, previousFrequency);
      
      // Calculate last seen
      let lastSeen = -1;
      for (let i = 0; i < filteredResults.length; i++) {
        if (parseInt(filteredResults[i].result[position]) === digit) {
          lastSeen = i;
          break;
        }
      }
      
      digitData.push({
        digit,
        frequency: dynamicFreq,
        expectedFrequency,
        zScore,
        status,
        trend,
        lastSeen
      });
    }
    
    positionFrequencies.push({
      position: position + 1,
      digits: digitData.sort((a, b) => b.frequency - a.frequency),
      totalDraws
    });
  }
  
  const dates = filteredResults.map(r => new Date(r.date)).sort((a, b) => a.getTime() - b.getTime());
  
  return {
    timeframe,
    startDate: dates[0] || new Date(),
    endDate: dates[dates.length - 1] || new Date(),
    totalDraws: filteredResults.length,
    positionFrequencies
  };
};

// Pattern Detection - Consecutive Digits
export const detectConsecutivePatterns = (results: LotteryResult[]): Array<{
  pattern: string;
  frequency: number;
  percentage: number;
}> => {
  const patterns = new Map<string, number>();
  
  results.forEach(result => {
    const digits = result.result.split('').map(Number);
    for (let i = 0; i < digits.length - 1; i++) {
      if (Math.abs(digits[i] - digits[i + 1]) === 1) {
        const pattern = `${digits[i]}-${digits[i + 1]}`;
        patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
      }
    }
  });
  
  const total = results.length;
  return Array.from(patterns.entries())
    .map(([pattern, frequency]) => ({
      pattern,
      frequency,
      percentage: (frequency / total) * 100
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10);
};

// Sum Range Analysis
export const analyzeSumRanges = (results: LotteryResult[]): Array<{
  range: string;
  frequency: number;
  percentage: number;
  probability: number;
}> => {
  const ranges = [
    { min: 0, max: 10, label: '0-10' },
    { min: 11, max: 20, label: '11-20' },
    { min: 21, max: 30, label: '21-30' },
    { min: 31, max: 40, label: '31-40' },
    { min: 41, max: 50, label: '41-50' },
    { min: 51, max: 54, label: '51-54' }
  ];
  
  const rangeCounts = new Map<string, number>();
  ranges.forEach(r => rangeCounts.set(r.label, 0));
  
  results.forEach(result => {
    const sum = result.result.split('').reduce((acc, d) => acc + parseInt(d), 0);
    const range = ranges.find(r => sum >= r.min && sum <= r.max);
    if (range) {
      rangeCounts.set(range.label, (rangeCounts.get(range.label) || 0) + 1);
    }
  });
  
  const total = results.length;
  return ranges.map(r => ({
    range: r.label,
    frequency: rangeCounts.get(r.label) || 0,
    percentage: ((rangeCounts.get(r.label) || 0) / total) * 100,
    probability: ((rangeCounts.get(r.label) || 0) / total)
  }));
};

// Odd/Even Ratio Analysis
export const analyzeOddEvenRatio = (results: LotteryResult[]): {
  ratios: Map<string, number>;
  mostCommon: string;
  trend: 'INCREASING_ODD' | 'INCREASING_EVEN' | 'BALANCED';
} => {
  const ratios = new Map<string, number>();
  
  results.forEach(result => {
    const digits = result.result.split('').map(Number);
    const oddCount = digits.filter(d => d % 2 === 1).length;
    const evenCount = 6 - oddCount;
    const ratio = `${oddCount}:${evenCount}`;
    ratios.set(ratio, (ratios.get(ratio) || 0) + 1);
  });
  
  const mostCommon = Array.from(ratios.entries())
    .sort((a, b) => b[1] - a[1])[0]?.[0] || '3:3';
  
  // Calculate trend from recent 50 draws
  const recentResults = results.slice(0, Math.min(50, results.length));
  let oddSum = 0;
  recentResults.forEach(result => {
    const digits = result.result.split('').map(Number);
    oddSum += digits.filter(d => d % 2 === 1).length;
  });
  const avgOdd = oddSum / recentResults.length;
  
  let trend: 'INCREASING_ODD' | 'INCREASING_EVEN' | 'BALANCED' = 'BALANCED';
  if (avgOdd > 3.3) trend = 'INCREASING_ODD';
  else if (avgOdd < 2.7) trend = 'INCREASING_EVEN';
  
  return { ratios, mostCommon, trend };
};

// Generate adaptive predictions
export const generateAdaptivePredictions = (
  analysis: TimeframeAnalysis,
  count: number = 5
): string[] => {
  const predictions: string[] = [];
  
  for (let i = 0; i < count; i++) {
    let prediction = '';
    
    analysis.positionFrequencies.forEach(posFreq => {
      // Select digit based on status and trend
      const hotDigits = posFreq.digits.filter(d => 
        d.status === 'VERY_HOT' || d.status === 'HOT'
      );
      const heatingDigits = posFreq.digits.filter(d => 
        d.trend === 'HEATING_UP'
      );
      
      let selectedDigit: number;
      
      if (i < 2 && hotDigits.length > 0) {
        // First 2 predictions favor hot digits
        selectedDigit = hotDigits[i % hotDigits.length].digit;
      } else if (i >= 2 && heatingDigits.length > 0) {
        // Later predictions favor trending digits
        selectedDigit = heatingDigits[i % heatingDigits.length].digit;
      } else {
        // Fallback to top frequency
        selectedDigit = posFreq.digits[i % posFreq.digits.length].digit;
      }
      
      prediction += selectedDigit;
    });
    
    predictions.push(prediction);
  }
  
  return predictions;
};
