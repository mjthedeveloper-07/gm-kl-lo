import { lotteryHistory, type LotteryResult } from '@/data/lotteryHistory';

export interface EnhancedValidationResult {
  mcNumber: string;
  resultNumber: string;
  date: string;
  lottery: string;
  matchLevel: 'perfect' | 'strong' | 'moderate' | 'weak' | 'none';
  matchCount: number;
  totalDigits: number;
  matchPercentage: number;
  positionMatches: {
    position: number;
    mcDigit: string;
    resultDigit: string;
    matched: boolean;
  }[];
  firstDigitMatch: boolean;
  drawTime?: string;
}

export interface ValidationStatistics {
  totalValidations: number;
  perfectMatches: number;
  strongMatches: number;
  moderateMatches: number;
  weakMatches: number;
  noMatches: number;
  overallAccuracy: number;
  averageMatchCount: number;
  byDrawTime: {
    [key: string]: {
      total: number;
      perfect: number;
      accuracy: number;
    };
  };
  byLotteryType: {
    [key: string]: {
      total: number;
      perfect: number;
      accuracy: number;
    };
  };
  positionAccuracy: {
    [key: string]: number;
  };
}

// Mirror mapping for validation
const mirrorMap: { [key: string]: string[] } = {
  '0': ['5', '3', '7', '6', '2', '9', '8', '4', '1'],
  '1': ['6', '4', '8', '3', '0', '7', '9', '2', '5'],
  '2': ['7', '5', '9', '4', '1', '8', '0', '3', '6'],
  '3': ['8', '6', '0', '5', '2', '9', '1', '4', '7'],
  '4': ['9', '7', '1', '6', '3', '0', '2', '5', '8'],
  '5': ['0', '8', '2', '7', '4', '1', '3', '6', '9'],
  '6': ['1', '9', '3', '8', '5', '2', '4', '7', '0'],
  '7': ['2', '0', '4', '9', '6', '3', '5', '8', '1'],
  '8': ['3', '1', '5', '0', '7', '4', '6', '9', '2'],
  '9': ['4', '2', '6', '1', '8', '5', '7', '0', '3']
};

/**
 * Enhanced validation that checks MC vs Result using mirror formula
 */
export function validateMCvsResult(
  mcNumber: string,
  resultNumber: string,
  date?: string,
  lottery?: string,
  drawTime?: string
): EnhancedValidationResult {
  // Extract last 4 digits for comparison
  const mcLast4 = mcNumber.slice(-4);
  const resultLast4 = resultNumber.slice(-4);
  
  // Check first digit match
  const firstDigitMatch = mcNumber[0] === resultNumber[0];
  
  // Position-by-position analysis
  const positionMatches = [];
  let matchCount = 0;
  
  for (let i = 0; i < 4; i++) {
    const mcDigit = mcLast4[i];
    const resultDigit = resultLast4[i];
    const mirrorArray = mirrorMap[mcDigit] || [];
    const matched = mirrorArray.includes(resultDigit);
    
    if (matched) matchCount++;
    
    positionMatches.push({
      position: i,
      mcDigit,
      resultDigit,
      matched
    });
  }
  
  const matchPercentage = (matchCount / 4) * 100;
  
  let matchLevel: 'perfect' | 'strong' | 'moderate' | 'weak' | 'none';
  if (matchCount === 4) matchLevel = 'perfect';
  else if (matchCount === 3) matchLevel = 'strong';
  else if (matchCount === 2) matchLevel = 'moderate';
  else if (matchCount === 1) matchLevel = 'weak';
  else matchLevel = 'none';
  
  return {
    mcNumber,
    resultNumber,
    date: date || '',
    lottery: lottery || '',
    matchLevel,
    matchCount,
    totalDigits: 4,
    matchPercentage,
    positionMatches,
    firstDigitMatch,
    drawTime
  };
}

/**
 * Validate against entire historical database
 */
export function validateAgainstHistory(
  dateRange?: { start: string; end: string },
  lotteryType?: string,
  drawTime?: string
): EnhancedValidationResult[] {
  let filteredHistory = lotteryHistory;
  
  // Filter by date range
  if (dateRange) {
    filteredHistory = filteredHistory.filter(item => {
      const itemDate = new Date(item.date);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }
  
  // Filter by lottery type
  if (lotteryType) {
    filteredHistory = filteredHistory.filter(item =>
      item.lottery.toLowerCase().includes(lotteryType.toLowerCase())
    );
  }
  
  // Filter by draw time
  if (drawTime) {
    filteredHistory = filteredHistory.filter(item => item.drawTime === drawTime);
  }
  
  // Validate each entry that has mcNumber
  const results = filteredHistory
    .filter(item => item.mcNumber && item.result)
    .map(item => validateMCvsResult(
      item.mcNumber!,
      item.result,
      item.date,
      item.lottery,
      item.drawTime
    ));
  
  return results;
}

/**
 * Calculate comprehensive statistics from validation results
 */
export function calculateStatistics(
  validations: EnhancedValidationResult[]
): ValidationStatistics {
  const stats: ValidationStatistics = {
    totalValidations: validations.length,
    perfectMatches: 0,
    strongMatches: 0,
    moderateMatches: 0,
    weakMatches: 0,
    noMatches: 0,
    overallAccuracy: 0,
    averageMatchCount: 0,
    byDrawTime: {},
    byLotteryType: {},
    positionAccuracy: {
      '0': 0,
      '1': 0,
      '2': 0,
      '3': 0
    }
  };
  
  if (validations.length === 0) return stats;
  
  let totalMatches = 0;
  const positionCounts = { '0': 0, '1': 0, '2': 0, '3': 0 };
  const positionSuccesses = { '0': 0, '1': 0, '2': 0, '3': 0 };
  
  validations.forEach(v => {
    // Count match levels
    if (v.matchLevel === 'perfect') stats.perfectMatches++;
    else if (v.matchLevel === 'strong') stats.strongMatches++;
    else if (v.matchLevel === 'moderate') stats.moderateMatches++;
    else if (v.matchLevel === 'weak') stats.weakMatches++;
    else stats.noMatches++;
    
    totalMatches += v.matchCount;
    
    // Position accuracy
    v.positionMatches.forEach(pm => {
      const pos = pm.position.toString();
      positionCounts[pos]++;
      if (pm.matched) positionSuccesses[pos]++;
    });
    
    // By draw time
    if (v.drawTime) {
      if (!stats.byDrawTime[v.drawTime]) {
        stats.byDrawTime[v.drawTime] = { total: 0, perfect: 0, accuracy: 0 };
      }
      stats.byDrawTime[v.drawTime].total++;
      if (v.matchLevel === 'perfect') stats.byDrawTime[v.drawTime].perfect++;
    }
    
    // By lottery type
    if (v.lottery) {
      if (!stats.byLotteryType[v.lottery]) {
        stats.byLotteryType[v.lottery] = { total: 0, perfect: 0, accuracy: 0 };
      }
      stats.byLotteryType[v.lottery].total++;
      if (v.matchLevel === 'perfect') stats.byLotteryType[v.lottery].perfect++;
    }
  });
  
  // Calculate percentages
  stats.averageMatchCount = totalMatches / validations.length;
  stats.overallAccuracy = ((stats.perfectMatches + stats.strongMatches) / validations.length) * 100;
  
  // Position accuracy
  for (let i = 0; i < 4; i++) {
    const pos = i.toString();
    stats.positionAccuracy[pos] = (positionSuccesses[pos] / positionCounts[pos]) * 100;
  }
  
  // Draw time accuracy
  Object.keys(stats.byDrawTime).forEach(time => {
    stats.byDrawTime[time].accuracy = 
      (stats.byDrawTime[time].perfect / stats.byDrawTime[time].total) * 100;
  });
  
  // Lottery type accuracy
  Object.keys(stats.byLotteryType).forEach(type => {
    stats.byLotteryType[type].accuracy = 
      (stats.byLotteryType[type].perfect / stats.byLotteryType[type].total) * 100;
  });
  
  return stats;
}

/**
 * Get recent validations for display
 */
export function getRecentValidations(count: number = 20): EnhancedValidationResult[] {
  const recentResults = lotteryHistory
    .filter(item => item.mcNumber && item.result)
    .slice(-count)
    .reverse();
  
  return recentResults.map(item => 
    validateMCvsResult(
      item.mcNumber!,
      item.result,
      item.date,
      item.lottery,
      item.drawTime
    )
  );
}

/**
 * Find best performing patterns
 */
export function findBestPatterns(): {
  bestDrawTime?: string;
  bestLotteryType?: string;
  bestMonth?: number;
  recommendations: string[];
} {
  const validations = validateAgainstHistory();
  const stats = calculateStatistics(validations);
  
  const recommendations: string[] = [];
  
  // Best draw time
  let bestDrawTime = '';
  let bestDrawTimeAccuracy = 0;
  Object.entries(stats.byDrawTime).forEach(([time, data]) => {
    if (data.accuracy > bestDrawTimeAccuracy) {
      bestDrawTime = time;
      bestDrawTimeAccuracy = data.accuracy;
    }
  });
  
  if (bestDrawTime) {
    recommendations.push(
      `${bestDrawTime} draws show highest accuracy at ${bestDrawTimeAccuracy.toFixed(1)}%`
    );
  }
  
  // Best lottery type
  let bestLotteryType = '';
  let bestLotteryAccuracy = 0;
  Object.entries(stats.byLotteryType).forEach(([type, data]) => {
    if (data.accuracy > bestLotteryAccuracy && data.total > 5) {
      bestLotteryType = type;
      bestLotteryAccuracy = data.accuracy;
    }
  });
  
  if (bestLotteryType) {
    recommendations.push(
      `${bestLotteryType} shows best pattern match at ${bestLotteryAccuracy.toFixed(1)}%`
    );
  }
  
  // Position insights
  const bestPosition = Object.entries(stats.positionAccuracy)
    .sort((a, b) => b[1] - a[1])[0];
  
  if (bestPosition) {
    recommendations.push(
      `Position ${bestPosition[0]} has highest accuracy at ${bestPosition[1].toFixed(1)}%`
    );
  }
  
  return {
    bestDrawTime: bestDrawTime || undefined,
    bestLotteryType: bestLotteryType || undefined,
    recommendations
  };
}
