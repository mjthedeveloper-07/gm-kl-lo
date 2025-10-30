import { lotteryHistory, getLast3Digits, getLast4Digits, type LotteryResult } from "@/data/lotteryHistory";

// Seeded random number generator for consistent predictions
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

// Generate seed from current date and latest lottery result
const generateSeed = (): number => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const latestResult = lotteryHistory[0]?.result || '1234567';
  const seedString = today + latestResult;
  
  // Convert string to numeric seed
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    const char = seedString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

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
  const rng = new SeededRandom(generateSeed());
  const predictions: string[] = [];
  const deltas = [3, 5, 7, 9, 11]; // Common delta values
  
  for (let i = 0; i < count; i++) {
    const startNum = Math.floor(rng.next() * 5) + 1; // Start with 1-5
    const delta = deltas[Math.floor(rng.next() * deltas.length)];
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
  const rng = new SeededRandom(generateSeed() + 1000); // Different seed offset
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
      if (rng.next() < 0.7 && hotDigits.length > 0) {
        digit = hotDigits[Math.floor(rng.next() * hotDigits.length)];
      } else {
        const range = Math.max(0, Math.min(9, Math.round(avgNeeded)));
        digit = (Math.max(0, Math.min(9, range + Math.floor(rng.next() * 3) - 1))).toString();
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
  const rng = new SeededRandom(generateSeed() + 2000); // Different seed offset
  const predictions: string[] = [];
  const topPairs = analyzeNumberPairs().slice(0, 10);
  
  for (let i = 0; i < count; i++) {
    const usedDigits = new Set<string>();
    let prediction = "";
    
    // Pick 2-3 random pairs and fill the rest
    const pairsToUse = Math.floor(rng.next() * 2) + 2; // 2 or 3 pairs
    const shuffledPairs = [...topPairs].sort(() => rng.next() - 0.5);
    const selectedPairs = shuffledPairs.slice(0, pairsToUse);
    
    selectedPairs.forEach(p => {
      const [d1, d2] = p.pair.split("-");
      usedDigits.add(d1);
      usedDigits.add(d2);
    });
    
    const digits = Array.from(usedDigits);
    
    // Fill to 6 digits if needed
    while (digits.length < 6) {
      const newDigit = Math.floor(rng.next() * 10).toString();
      if (!digits.includes(newDigit)) {
        digits.push(newDigit);
      }
    }
    
    // Shuffle and take first 6
    prediction = digits
      .sort(() => rng.next() - 0.5)
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

// =============== ADVANCED PREDICTION FORMULAS ===============

// Get positional digit frequency (which digits appear most in each position)
export const getPositionalFrequency = () => {
  const positions = [0, 1, 2, 3, 4, 5]; // 6-digit numbers
  const positionalData: { [key: number]: { [digit: string]: number } } = {};
  
  positions.forEach(pos => {
    positionalData[pos] = {};
  });
  
  lotteryHistory.forEach(result => {
    const digits = result.result.split('');
    digits.forEach((digit, pos) => {
      if (pos < 6) { // Only first 6 digits
        positionalData[pos][digit] = (positionalData[pos][digit] || 0) + 1;
      }
    });
  });
  
  return positionalData;
};

// Combinatorial template analysis (e.g., "3-odd 3-even", "3-low 2-mid 1-high")
export interface CombinatorialTemplate {
  name: string;
  description: string;
  oddCount: number;
  evenCount: number;
  lowCount: number;   // 0-3
  midCount: number;   // 4-6
  highCount: number;  // 7-9
  frequency: number;
  percentage: number;
}

export const analyzeCombinatorialTemplates = (): CombinatorialTemplate[] => {
  const templateCounts = new Map<string, CombinatorialTemplate>();
  
  lotteryHistory.forEach(result => {
    const digits = result.result.substring(0, 6).split('').map(d => parseInt(d));
    
    const oddCount = digits.filter(d => d % 2 !== 0).length;
    const evenCount = 6 - oddCount;
    const lowCount = digits.filter(d => d <= 3).length;
    const midCount = digits.filter(d => d >= 4 && d <= 6).length;
    const highCount = digits.filter(d => d >= 7).length;
    
    const key = `${oddCount}odd-${evenCount}even_${lowCount}low-${midCount}mid-${highCount}high`;
    
    if (!templateCounts.has(key)) {
      templateCounts.set(key, {
        name: key,
        description: `${oddCount} Odd, ${evenCount} Even | ${lowCount} Low (0-3), ${midCount} Mid (4-6), ${highCount} High (7-9)`,
        oddCount,
        evenCount,
        lowCount,
        midCount,
        highCount,
        frequency: 0,
        percentage: 0
      });
    }
    
    const template = templateCounts.get(key)!;
    template.frequency++;
  });
  
  const total = lotteryHistory.length;
  const templates = Array.from(templateCounts.values())
    .map(t => ({
      ...t,
      percentage: parseFloat(((t.frequency / total) * 100).toFixed(2))
    }))
    .sort((a, b) => b.frequency - a.frequency);
  
  return templates;
};

// Generate predictions using combinatorial templates
export const generateCombinatorialPredictions = (count: number = 10): string[] => {
  const predictions: string[] = [];
  const seed = generateSeed();
  const rng = new SeededRandom(seed + 5000);
  const templates = analyzeCombinatorialTemplates().slice(0, 5); // Top 5 templates
  const { hot } = getHotAndColdNumbers();
  const hotDigits = hot.map(h => h.digit);
  
  for (let i = 0; i < count; i++) {
    const template = templates[Math.floor(rng.next() * templates.length)];
    const digits: string[] = [];
    
    // Generate digits following the template
    let oddNeeded = template.oddCount;
    let evenNeeded = template.evenCount;
    let lowNeeded = template.lowCount;
    let midNeeded = template.midCount;
    let highNeeded = template.highCount;
    
    while (digits.length < 6) {
      let digit: number;
      
      // Prioritize hot numbers
      if (rng.next() > 0.3 && hotDigits.length > 0) {
        digit = parseInt(hotDigits[Math.floor(rng.next() * hotDigits.length)]);
      } else {
        // Generate based on remaining needs
        if (lowNeeded > 0 && rng.next() > 0.5) {
          digit = Math.floor(rng.next() * 4); // 0-3
          lowNeeded--;
        } else if (midNeeded > 0 && rng.next() > 0.5) {
          digit = 4 + Math.floor(rng.next() * 3); // 4-6
          midNeeded--;
        } else if (highNeeded > 0) {
          digit = 7 + Math.floor(rng.next() * 3); // 7-9
          highNeeded--;
        } else {
          digit = Math.floor(rng.next() * 10);
        }
      }
      
      // Check odd/even constraint
      const isOdd = digit % 2 !== 0;
      if ((isOdd && oddNeeded > 0) || (!isOdd && evenNeeded > 0)) {
        digits.push(digit.toString());
        if (isOdd) oddNeeded--;
        else evenNeeded--;
      }
    }
    
    predictions.push(digits.join(''));
  }
  
  return predictions;
};

// Advanced sequential pattern recognition
export const findSequentialPatterns = () => {
  const patterns = new Map<string, { count: number; results: LotteryResult[] }>();
  
  lotteryHistory.forEach(result => {
    const digits = result.result.substring(0, 6).split('').map(d => parseInt(d));
    
    // Check for ascending sequences (e.g., 1,2,3 or 5,6,7)
    for (let i = 0; i < digits.length - 2; i++) {
      if (digits[i + 1] === digits[i] + 1 && digits[i + 2] === digits[i] + 2) {
        const pattern = `asc-${digits[i]}-${digits[i+1]}-${digits[i+2]}`;
        if (!patterns.has(pattern)) {
          patterns.set(pattern, { count: 0, results: [] });
        }
        const p = patterns.get(pattern)!;
        p.count++;
        p.results.push(result);
      }
    }
    
    // Check for repeating digits
    const digitCounts = new Map<number, number>();
    digits.forEach(d => {
      digitCounts.set(d, (digitCounts.get(d) || 0) + 1);
    });
    
    digitCounts.forEach((count, digit) => {
      if (count >= 2) {
        const pattern = `repeat-${digit}-x${count}`;
        if (!patterns.has(pattern)) {
          patterns.set(pattern, { count: 0, results: [] });
        }
        const p = patterns.get(pattern)!;
        p.count++;
        if (!p.results.find(r => r.date === result.date)) {
          p.results.push(result);
        }
      }
    });
  });
  
  return Array.from(patterns.entries())
    .map(([pattern, data]) => ({
      pattern,
      ...data
    }))
    .sort((a, b) => b.count - a.count);
};

// Probability-based smart picker using nCr concepts
export const generateProbabilityBasedPredictions = (count: number = 10): string[] => {
  const predictions: string[] = [];
  const seed = generateSeed();
  const rng = new SeededRandom(seed + 6000);
  const positionalFreq = getPositionalFrequency();
  const templates = analyzeCombinatorialTemplates().slice(0, 3);
  
  for (let i = 0; i < count; i++) {
    const digits: string[] = [];
    const template = templates[Math.floor(rng.next() * templates.length)];
    
    // Use positional frequency to pick most likely digits for each position
    for (let pos = 0; pos < 6; pos++) {
      const posFreq = positionalFreq[pos];
      const sortedDigits = Object.entries(posFreq)
        .sort(([, a], [, b]) => b - a)
        .map(([digit]) => digit);
      
      // 70% chance: pick from top 5 most frequent
      // 30% chance: random digit
      if (rng.next() > 0.3 && sortedDigits.length > 0) {
        const topDigits = sortedDigits.slice(0, 5);
        digits.push(topDigits[Math.floor(rng.next() * topDigits.length)]);
      } else {
        digits.push(Math.floor(rng.next() * 10).toString());
      }
    }
    
    predictions.push(digits.join(''));
  }
  
  return predictions;
};

// =============== KL DIVERGENCE ANALYSIS ===============

export interface KLDivergenceResult {
  digit: string;
  actualFrequency: number;
  expectedFrequency: number;
  klDivergence: number;
  divergenceType: 'over-represented' | 'under-represented' | 'balanced';
}

export interface PositionalKLDivergence {
  position: number;
  klDivergence: number;
  topDigits: Array<{ digit: string; probability: number }>;
}

// Calculate KL divergence: D_KL(P || Q) = Σ P(i) log(P(i) / Q(i))
const calculateKLDivergence = (actualDist: number[], expectedDist: number[]): number => {
  const epsilon = 1e-10; // Small constant to prevent log(0)
  let divergence = 0;
  
  for (let i = 0; i < actualDist.length; i++) {
    const p = actualDist[i] + epsilon;
    const q = expectedDist[i] + epsilon;
    divergence += p * Math.log(p / q);
  }
  
  return divergence;
};

// Analyze KL divergence for each digit (0-9)
export const analyzeKLDivergenceByDigit = (): KLDivergenceResult[] => {
  const digitFreq = getDigitFrequency();
  const totalDigits = digitFreq.reduce((sum, d) => sum + d.count, 0);
  const expectedFreq = totalDigits / 10; // Uniform distribution
  
  return digitFreq.map(({ digit, count }) => {
    const actualProb = count / totalDigits;
    const expectedProb = 1 / 10;
    
    // Calculate single-digit KL divergence
    const epsilon = 1e-10;
    const kl = actualProb * Math.log((actualProb + epsilon) / (expectedProb + epsilon));
    
    let divergenceType: 'over-represented' | 'under-represented' | 'balanced';
    if (count > expectedFreq * 1.1) {
      divergenceType = 'over-represented';
    } else if (count < expectedFreq * 0.9) {
      divergenceType = 'under-represented';
    } else {
      divergenceType = 'balanced';
    }
    
    return {
      digit,
      actualFrequency: count,
      expectedFrequency: expectedFreq,
      klDivergence: kl,
      divergenceType
    };
  }).sort((a, b) => Math.abs(b.klDivergence) - Math.abs(a.klDivergence));
};

// Analyze KL divergence for each position (0-5)
export const analyzeKLDivergenceByPosition = (): PositionalKLDivergence[] => {
  const positionalFreq = getPositionalFrequency();
  const totalDraws = lotteryHistory.length;
  const results: PositionalKLDivergence[] = [];
  
  for (let pos = 0; pos < 6; pos++) {
    const posData = positionalFreq[pos];
    const actualDist: number[] = [];
    const expectedDist: number[] = [];
    
    // Build distributions for digits 0-9
    for (let digit = 0; digit <= 9; digit++) {
      const count = posData[digit.toString()] || 0;
      actualDist.push(count / totalDraws);
      expectedDist.push(1 / 10); // Uniform
    }
    
    const kl = calculateKLDivergence(actualDist, expectedDist);
    
    // Get top 3 digits for this position
    const topDigits = Object.entries(posData)
      .map(([digit, count]) => ({
        digit,
        probability: count / totalDraws
      }))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 3);
    
    results.push({
      position: pos,
      klDivergence: kl,
      topDigits
    });
  }
  
  return results.sort((a, b) => b.klDivergence - a.klDivergence);
};

// Generate predictions using KL divergence insights
export const generateKLDivergencePredictions = (count: number = 10): string[] => {
  const predictions: string[] = [];
  const seed = generateSeed();
  const rng = new SeededRandom(seed + 7000);
  
  const digitDivergence = analyzeKLDivergenceByDigit();
  const positionalDivergence = analyzeKLDivergenceByPosition();
  
  // Get high-divergence digits (both over and under-represented)
  const overRepresented = digitDivergence
    .filter(d => d.divergenceType === 'over-represented')
    .slice(0, 4)
    .map(d => d.digit);
  
  const underRepresented = digitDivergence
    .filter(d => d.divergenceType === 'under-represented')
    .slice(0, 3)
    .map(d => d.digit);
  
  for (let i = 0; i < count; i++) {
    const digits: string[] = [];
    
    for (let pos = 0; pos < 6; pos++) {
      const posDiv = positionalDivergence.find(p => p.position === pos);
      
      // Strategy alternates:
      // - 50% use high-KL position's top digits
      // - 30% use over-represented digits from global analysis
      // - 20% use under-represented (contrarian approach)
      const strategy = rng.next();
      
      if (strategy < 0.5 && posDiv && posDiv.topDigits.length > 0) {
        // Use position-specific high-probability digits
        const topDigit = posDiv.topDigits[Math.floor(rng.next() * Math.min(3, posDiv.topDigits.length))];
        digits.push(topDigit.digit);
      } else if (strategy < 0.8 && overRepresented.length > 0) {
        // Use globally over-represented digits
        digits.push(overRepresented[Math.floor(rng.next() * overRepresented.length)]);
      } else if (underRepresented.length > 0) {
        // Contrarian: use under-represented digits
        digits.push(underRepresented[Math.floor(rng.next() * underRepresented.length)]);
      } else {
        // Fallback: random digit
        digits.push(Math.floor(rng.next() * 10).toString());
      }
    }
    
    predictions.push(digits.join(''));
  }
  
  return predictions;
};

// Calculate symmetric KL divergence for comparison
export const calculateSymmetricKL = (): number => {
  const digitFreq = getDigitFrequency();
  const totalDigits = digitFreq.reduce((sum, d) => sum + d.count, 0);
  
  const actualDist: number[] = [];
  const expectedDist: number[] = [];
  
  for (let i = 0; i <= 9; i++) {
    const digit = digitFreq.find(d => d.digit === i.toString());
    actualDist.push((digit?.count || 0) / totalDigits);
    expectedDist.push(1 / 10);
  }
  
  const klPQ = calculateKLDivergence(actualDist, expectedDist);
  const klQP = calculateKLDivergence(expectedDist, actualDist);
  
  return (klPQ + klQP) / 2;
};

// ==================== POWER MAPPING PREDICTION METHOD ====================

export interface PowerMappingResult {
  original: string;
  corrected: string;
  isValid: boolean;
  firstDigit: number;
  lastDigit: number;
  expectedLastDigit: number;
  wasModified: boolean;
}

export interface PowerMappingCompliance {
  totalResults: number;
  compliantResults: number;
  complianceRate: number;
  mappingFrequency: { [key: string]: number };
}

// Power Mapping Function: A(x) = (x + 5) mod 10
const applyPowerMapping = (firstDigit: number): number => {
  return (firstDigit + 5) % 10;
};

// Validate and correct a 6-digit lottery number using power mapping
export const applyPowerMappingCorrection = (number: string): PowerMappingResult => {
  if (number.length !== 6 || !/^\d+$/.test(number)) {
    throw new Error("Invalid input: Number must be exactly 6 digits");
  }

  const firstDigit = parseInt(number[0]);
  const lastDigit = parseInt(number[5]);
  const expectedLastDigit = applyPowerMapping(firstDigit);
  const isValid = lastDigit === expectedLastDigit;

  let corrected = number;
  if (!isValid) {
    corrected = number.slice(0, 5) + expectedLastDigit.toString();
  }

  return {
    original: number,
    corrected,
    isValid,
    firstDigit,
    lastDigit,
    expectedLastDigit,
    wasModified: !isValid
  };
};

// Analyze historical lottery results for power mapping compliance
export const analyzePowerMappingCompliance = (): PowerMappingCompliance => {
  let compliantCount = 0;
  const mappingFrequency: { [key: string]: number } = {};

  // Initialize mapping frequency counters
  for (let i = 0; i <= 9; i++) {
    const expected = applyPowerMapping(i);
    const key = `${i}→${expected}`;
    mappingFrequency[key] = 0;
  }

  lotteryHistory.forEach(result => {
    const number = result.result;
    if (number.length >= 6) {
      const firstDigit = parseInt(number[0]);
      const lastDigit = parseInt(number[number.length - 1]);
      const expectedLastDigit = applyPowerMapping(firstDigit);
      
      const key = `${firstDigit}→${lastDigit}`;
      mappingFrequency[key] = (mappingFrequency[key] || 0) + 1;

      if (lastDigit === expectedLastDigit) {
        compliantCount++;
      }
    }
  });

  return {
    totalResults: lotteryHistory.length,
    compliantResults: compliantCount,
    complianceRate: (compliantCount / lotteryHistory.length) * 100,
    mappingFrequency
  };
};

// Generate predictions that follow power mapping rules
export const generatePowerMappedPredictions = (count: number = 12): string[] => {
  const predictions: string[] = [];
  const rng = new SeededRandom(generateSeed());
  const { hot } = getHotAndColdNumbers();
  const hotDigits = hot.map(h => parseInt(h.digit));
  const sumStats = getSumStatistics();

  let attempts = 0;
  const maxAttempts = count * 50;

  while (predictions.length < count && attempts < maxAttempts) {
    attempts++;
    
    // Start with a first digit (favor hot numbers 60% of the time)
    let firstDigit: number;
    if (rng.next() < 0.6 && hotDigits.length > 0) {
      firstDigit = hotDigits[Math.floor(rng.next() * hotDigits.length)];
    } else {
      firstDigit = Math.floor(rng.next() * 10);
    }

    // Calculate required last digit based on power mapping
    const lastDigit = applyPowerMapping(firstDigit);

    // Generate middle 4 digits (favor hot numbers)
    const middleDigits: number[] = [];
    for (let i = 0; i < 4; i++) {
      if (rng.next() < 0.5 && hotDigits.length > 0) {
        middleDigits.push(hotDigits[Math.floor(rng.next() * hotDigits.length)]);
      } else {
        middleDigits.push(Math.floor(rng.next() * 10));
      }
    }

    // Construct the prediction
    const prediction = `${firstDigit}${middleDigits.join('')}${lastDigit}`;

    // Verify it follows power mapping (should always be true by construction)
    const validation = applyPowerMappingCorrection(prediction);
    
    // Check if sum is in reasonable range
    const sum = calculateSum(prediction);
    const inRange = sum >= sumStats.commonRange.lower - 5 && sum <= sumStats.commonRange.upper + 5;

    // Avoid duplicates and ensure valid
    if (!predictions.includes(prediction) && validation.isValid && inRange) {
      predictions.push(prediction);
    }
  }

  // If we didn't generate enough, fill with any valid power-mapped numbers
  while (predictions.length < count) {
    const firstDigit = Math.floor(Math.random() * 10);
    const lastDigit = applyPowerMapping(firstDigit);
    const middle = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join('');
    const prediction = `${firstDigit}${middle}${lastDigit}`;
    
    if (!predictions.includes(prediction)) {
      predictions.push(prediction);
    }
  }

  return predictions;
};
