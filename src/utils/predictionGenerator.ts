import { lotteryHistory, type LotteryResult } from "@/data/lotteryHistory";

export interface PositionalFrequency {
  position: number;
  digit: string;
  frequency: number;
  percentage: number;
}

export interface DigitPairFrequency {
  pair: string;
  frequency: number;
  positions: string;
}

export interface TemporalPattern {
  period: string;
  digit: string;
  frequency: number;
}

export interface PredictionSet {
  method: string;
  description: string;
  numbers: string[];
  confidence: "high" | "medium" | "low";
}

export interface StatisticalAnalysis {
  topFrequentDigits: { digit: string; count: number; percentage: number }[];
  leastFrequentDigits: { digit: string; count: number; percentage: number }[];
  positionalAnalysis: PositionalFrequency[][];
  mostCommonStartDigit: string;
  mostCommonEndDigit: string;
  digitPairs: DigitPairFrequency[];
  temporalPatterns: TemporalPattern[];
}

// Perform comprehensive statistical analysis
export const analyzeHistoricalData = (history: LotteryResult[] = lotteryHistory): StatisticalAnalysis => {
  const allNumbers = history.map(r => r.result);
  
  // Overall digit frequency
  const digitCounts: { [key: string]: number } = {};
  for (let i = 0; i <= 9; i++) digitCounts[i.toString()] = 0;
  
  allNumbers.forEach(num => {
    num.split("").forEach(digit => {
      digitCounts[digit] = (digitCounts[digit] || 0) + 1;
    });
  });
  
  const totalDigits = Object.values(digitCounts).reduce((a, b) => a + b, 0);
  const sortedDigits = Object.entries(digitCounts)
    .map(([digit, count]) => ({
      digit,
      count,
      percentage: Math.round((count / totalDigits) * 100)
    }))
    .sort((a, b) => b.count - a.count);
  
  // Positional analysis (0-5 for 6-digit numbers)
  const positionCounts: { [pos: number]: { [digit: string]: number } } = {};
  for (let pos = 0; pos < 6; pos++) {
    positionCounts[pos] = {};
    for (let d = 0; d <= 9; d++) positionCounts[pos][d.toString()] = 0;
  }
  
  allNumbers.forEach(num => {
    for (let pos = 0; pos < 6; pos++) {
      const digit = num[pos];
      if (digit) {
        positionCounts[pos][digit] = (positionCounts[pos][digit] || 0) + 1;
      }
    }
  });
  
  const positionalAnalysis: PositionalFrequency[][] = [];
  for (let pos = 0; pos < 6; pos++) {
    const posData = Object.entries(positionCounts[pos])
      .map(([digit, frequency]) => ({
        position: pos + 1,
        digit,
        frequency,
        percentage: Math.round((frequency / allNumbers.length) * 100)
      }))
      .sort((a, b) => b.frequency - a.frequency);
    positionalAnalysis.push(posData);
  }
  
  // Digit pairs analysis
  const pairCounts: { [pair: string]: { count: number; positions: Set<string> } } = {};
  allNumbers.forEach(num => {
    for (let i = 0; i < 5; i++) {
      const pair = num[i] + num[i + 1];
      if (!pairCounts[pair]) {
        pairCounts[pair] = { count: 0, positions: new Set() };
      }
      pairCounts[pair].count++;
      pairCounts[pair].positions.add(`${i + 1}-${i + 2}`);
    }
  });
  
  const digitPairs = Object.entries(pairCounts)
    .map(([pair, data]) => ({
      pair,
      frequency: data.count,
      positions: Array.from(data.positions).join(", ")
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 20);
  
  // Temporal patterns (by month)
  const monthPatterns: { [month: number]: { [digit: string]: number } } = {};
  history.forEach(result => {
    if (!monthPatterns[result.month]) {
      monthPatterns[result.month] = {};
    }
    result.result.split("").forEach(digit => {
      monthPatterns[result.month][digit] = (monthPatterns[result.month][digit] || 0) + 1;
    });
  });
  
  const temporalPatterns: TemporalPattern[] = [];
  Object.entries(monthPatterns).forEach(([month, digits]) => {
    const topDigit = Object.entries(digits)
      .sort((a, b) => b[1] - a[1])[0];
    if (topDigit) {
      temporalPatterns.push({
        period: new Date(2000, parseInt(month) - 1).toLocaleString('default', { month: 'long' }),
        digit: topDigit[0],
        frequency: topDigit[1]
      });
    }
  });
  
  return {
    topFrequentDigits: sortedDigits.slice(0, 10),
    leastFrequentDigits: sortedDigits.slice(-10).reverse(),
    positionalAnalysis,
    mostCommonStartDigit: positionalAnalysis[0][0].digit,
    mostCommonEndDigit: positionalAnalysis[5][0].digit,
    digitPairs,
    temporalPatterns
  };
};

// Method 1: Frequency-Based Predictions
export const generateFrequencyBasedPredictions = (analysis: StatisticalAnalysis): string[] => {
  const predictions: string[] = [];
  
  // Use top 3 from each position
  for (let variant = 0; variant < 5; variant++) {
    let number = "";
    for (let pos = 0; pos < 6; pos++) {
      const posData = analysis.positionalAnalysis[pos];
      const digitIndex = variant % 3;
      number += posData[digitIndex].digit;
    }
    predictions.push(number);
  }
  
  return predictions;
};

// Method 2: Probability-Weighted Predictions
export const generateProbabilityWeightedPredictions = (analysis: StatisticalAnalysis): string[] => {
  const predictions: string[] = [];
  
  for (let i = 0; i < 10; i++) {
    let number = "";
    for (let pos = 0; pos < 6; pos++) {
      const posData = analysis.positionalAnalysis[pos];
      
      // Weighted random selection
      const totalFreq = posData.reduce((sum, d) => sum + d.frequency, 0);
      let random = Math.random() * totalFreq;
      
      for (const digitData of posData) {
        random -= digitData.frequency;
        if (random <= 0) {
          number += digitData.digit;
          break;
        }
      }
      
      if (number.length !== pos + 1) {
        number += posData[0].digit; // Fallback
      }
    }
    predictions.push(number);
  }
  
  return [...new Set(predictions)]; // Remove duplicates
};

// Method 3: Trend-Based Predictions
export const generateTrendBasedPredictions = (analysis: StatisticalAnalysis): string[] => {
  const predictions: string[] = [];
  const currentMonth = new Date().getMonth() + 1;
  
  // Get current month's top digits
  const monthPattern = analysis.temporalPatterns.find(
    p => p.period === new Date(2000, currentMonth - 1).toLocaleString('default', { month: 'long' })
  );
  
  // Use hot digit pairs
  const topPairs = analysis.digitPairs.slice(0, 5);
  
  for (let i = 0; i < 5; i++) {
    let number = "";
    
    // Start with common start digit
    number += analysis.mostCommonStartDigit;
    
    // Use hot pairs
    const pair = topPairs[i % topPairs.length];
    number += pair.pair;
    
    // Fill remaining with top frequent digits
    while (number.length < 6) {
      const topDigit = analysis.topFrequentDigits[number.length % 5];
      number += topDigit.digit;
    }
    
    predictions.push(number.slice(0, 6));
  }
  
  return predictions;
};

// Method 4: Hot-Cold Balanced
export const generateBalancedPredictions = (analysis: StatisticalAnalysis): string[] => {
  const predictions: string[] = [];
  const hot = analysis.topFrequentDigits.slice(0, 5);
  const cold = analysis.leastFrequentDigits.slice(0, 3);
  
  for (let i = 0; i < 5; i++) {
    let number = "";
    for (let pos = 0; pos < 6; pos++) {
      // Alternate hot and cold
      if (pos % 2 === 0) {
        number += hot[pos / 2 % hot.length].digit;
      } else {
        number += cold[Math.floor(pos / 2) % cold.length].digit;
      }
    }
    
    // Shuffle slightly
    const arr = number.split("");
    if (i > 0) {
      [arr[i % 5], arr[(i + 1) % 6]] = [arr[(i + 1) % 6], arr[i % 5]];
    }
    predictions.push(arr.join(""));
  }
  
  return predictions;
};

// Method 5: Pattern Matching
export const generatePatternMatchingPredictions = (analysis: StatisticalAnalysis): string[] => {
  const predictions: string[] = [];
  
  // Use most common digit pairs and build numbers
  for (let i = 0; i < 5; i++) {
    const pair1 = analysis.digitPairs[i * 2 % 10];
    const pair2 = analysis.digitPairs[(i * 2 + 1) % 10];
    const pair3 = analysis.digitPairs[(i * 2 + 2) % 10];
    
    const number = (pair1.pair + pair2.pair + pair3.pair).slice(0, 6);
    if (number.length === 6) {
      predictions.push(number);
    }
  }
  
  return predictions;
};

// Complex Number Utilities
interface ComplexNumber {
  real: number;
  imaginary: number;
}

const createComplex = (real: number, imaginary: number): ComplexNumber => ({ real, imaginary });

const complexMagnitude = (z: ComplexNumber): number => 
  Math.sqrt(z.real * z.real + z.imaginary * z.imaginary);

const complexAngle = (z: ComplexNumber): number => 
  Math.atan2(z.imaginary, z.real);

const complexConjugate = (z: ComplexNumber): ComplexNumber => 
  createComplex(z.real, -z.imaginary);

const complexMultiply = (z1: ComplexNumber, z2: ComplexNumber): ComplexNumber => 
  createComplex(
    z1.real * z2.real - z1.imaginary * z2.imaginary,
    z1.real * z2.imaginary + z1.imaginary * z2.real
  );

const complexAdd = (z1: ComplexNumber, z2: ComplexNumber): ComplexNumber => 
  createComplex(z1.real + z2.real, z1.imaginary + z2.imaginary);

const complexDivide = (z1: ComplexNumber, z2: ComplexNumber): ComplexNumber => {
  const denominator = z2.real * z2.real + z2.imaginary * z2.imaginary;
  return createComplex(
    (z1.real * z2.real + z1.imaginary * z2.imaginary) / denominator,
    (z1.imaginary * z2.real - z1.real * z2.imaginary) / denominator
  );
};

// Method 6: Complex Number Analysis
export const generateComplexNumberPredictions = (analysis: StatisticalAnalysis, history: LotteryResult[] = lotteryHistory): string[] => {
  const predictions: string[] = [];
  const allNumbers = history.map(r => r.result);
  
  // Convert recent lottery numbers to complex numbers
  const recentNumbers = allNumbers.slice(-50);
  const complexNumbers: ComplexNumber[] = recentNumbers.map(num => {
    const digits = num.split("").map(Number);
    const real = digits.slice(0, 3).reduce((sum, d) => sum * 10 + d, 0);
    const imaginary = digits.slice(3, 6).reduce((sum, d) => sum * 10 + d, 0);
    return createComplex(real, imaginary);
  });
  
  // Calculate average complex number
  const avgReal = complexNumbers.reduce((sum, z) => sum + z.real, 0) / complexNumbers.length;
  const avgImag = complexNumbers.reduce((sum, z) => sum + z.imaginary, 0) / complexNumbers.length;
  const avgComplex = createComplex(avgReal, avgImag);
  
  // Generate predictions using complex operations
  for (let i = 0; i < 5; i++) {
    let resultComplex: ComplexNumber;
    
    if (i === 0) {
      // Use conjugate
      resultComplex = complexConjugate(avgComplex);
    } else if (i === 1) {
      // Use magnitude and angle transformation
      const mag = complexMagnitude(avgComplex);
      const angle = complexAngle(avgComplex) + Math.PI / 4;
      resultComplex = createComplex(mag * Math.cos(angle), mag * Math.sin(angle));
    } else if (i === 2) {
      // Multiply with recent trend
      const recentTrend = complexNumbers[complexNumbers.length - 1];
      resultComplex = complexMultiply(avgComplex, createComplex(0.8, 0.6));
    } else if (i === 3) {
      // Add weighted recent values
      const recent = complexNumbers[complexNumbers.length - 1];
      resultComplex = complexAdd(avgComplex, complexMultiply(recent, createComplex(0.3, 0.3)));
    } else {
      // Division pattern
      const divisor = createComplex(1.5, 1.2);
      resultComplex = complexDivide(avgComplex, divisor);
    }
    
    // Convert back to 6-digit number
    const realPart = Math.abs(Math.round(resultComplex.real)) % 1000;
    const imagPart = Math.abs(Math.round(resultComplex.imaginary)) % 1000;
    
    const number = realPart.toString().padStart(3, '0') + imagPart.toString().padStart(3, '0');
    predictions.push(number);
  }
  
  return predictions;
};

// Method 7: Phase and Magnitude Analysis
export const generatePhaseBasedPredictions = (analysis: StatisticalAnalysis, history: LotteryResult[] = lotteryHistory): string[] => {
  const predictions: string[] = [];
  const allNumbers = history.map(r => r.result);
  const recentNumbers = allNumbers.slice(-30);
  
  // Convert to complex numbers and analyze phase patterns
  const phases: number[] = [];
  const magnitudes: number[] = [];
  
  recentNumbers.forEach(num => {
    const digits = num.split("").map(Number);
    const real = digits.slice(0, 3).reduce((sum, d) => sum * 10 + d, 0);
    const imaginary = digits.slice(3, 6).reduce((sum, d) => sum * 10 + d, 0);
    const complex = createComplex(real, imaginary);
    
    phases.push(complexAngle(complex));
    magnitudes.push(complexMagnitude(complex));
  });
  
  // Calculate phase and magnitude trends
  const avgPhase = phases.reduce((sum, p) => sum + p, 0) / phases.length;
  const avgMagnitude = magnitudes.reduce((sum, m) => sum + m, 0) / magnitudes.length;
  
  // Generate predictions based on phase shifts
  for (let i = 0; i < 5; i++) {
    const phaseShift = avgPhase + (i * Math.PI / 6);
    const magVariation = avgMagnitude * (0.9 + i * 0.05);
    
    const real = Math.abs(Math.round(magVariation * Math.cos(phaseShift))) % 1000;
    const imaginary = Math.abs(Math.round(magVariation * Math.sin(phaseShift))) % 1000;
    
    const number = real.toString().padStart(3, '0') + imaginary.toString().padStart(3, '0');
    predictions.push(number);
  }
  
  return predictions;
};

// Method 8: Exponential Form Analysis (z = |z|e^(iθ))
export const generateExponentialFormPredictions = (analysis: StatisticalAnalysis, history: LotteryResult[] = lotteryHistory): string[] => {
  const predictions: string[] = [];
  const allNumbers = history.map(r => r.result);
  const recentNumbers = allNumbers.slice(-20);
  
  const complexNumbers: ComplexNumber[] = recentNumbers.map(num => {
    const digits = num.split("").map(Number);
    const real = digits.slice(0, 3).reduce((sum, d) => sum * 10 + d, 0);
    const imaginary = digits.slice(3, 6).reduce((sum, d) => sum * 10 + d, 0);
    return createComplex(real, imaginary);
  });
  
  for (let i = 0; i < 5; i++) {
    const baseComplex = complexNumbers[complexNumbers.length - 1 - (i % 5)];
    const magnitude = complexMagnitude(baseComplex);
    const angle = complexAngle(baseComplex);
    
    // Apply exponential transformations: z = |z|·e^(iθ)
    const newAngle = angle + (i * Math.PI / 8) + Math.PI / 4;
    const newMagnitude = magnitude * (0.85 + i * 0.075);
    
    // Convert back: z = |z|(cos θ + i sin θ)
    const real = Math.abs(Math.round(newMagnitude * Math.cos(newAngle))) % 1000;
    const imaginary = Math.abs(Math.round(newMagnitude * Math.sin(newAngle))) % 1000;
    
    const number = real.toString().padStart(3, '0') + imaginary.toString().padStart(3, '0');
    predictions.push(number);
  }
  
  return predictions;
};

// Method 9: Complex Roots Analysis (nth roots)
export const generateComplexRootsPredictions = (analysis: StatisticalAnalysis, history: LotteryResult[] = lotteryHistory): string[] => {
  const predictions: string[] = [];
  const allNumbers = history.map(r => r.result);
  const recentNumbers = allNumbers.slice(-15);
  
  const complexNumbers: ComplexNumber[] = recentNumbers.map(num => {
    const digits = num.split("").map(Number);
    const real = digits.slice(0, 3).reduce((sum, d) => sum * 10 + d, 0);
    const imaginary = digits.slice(3, 6).reduce((sum, d) => sum * 10 + d, 0);
    return createComplex(real, imaginary);
  });
  
  // Use formula: ⁿ√|z|·e^(i(θ+2kπ)/n)
  for (let k = 0; k < 5; k++) {
    const baseComplex = complexNumbers[complexNumbers.length - 1];
    const magnitude = complexMagnitude(baseComplex);
    const angle = complexAngle(baseComplex);
    
    const n = 2 + (k % 3); // 2nd, 3rd, or 4th root
    const rootMagnitude = Math.pow(magnitude, 1 / n);
    const rootAngle = (angle + 2 * k * Math.PI) / n;
    
    const real = Math.abs(Math.round(rootMagnitude * Math.cos(rootAngle) * 10)) % 1000;
    const imaginary = Math.abs(Math.round(rootMagnitude * Math.sin(rootAngle) * 10)) % 1000;
    
    const number = real.toString().padStart(3, '0') + imaginary.toString().padStart(3, '0');
    predictions.push(number);
  }
  
  return predictions;
};

// Method 10: Exponentiation Analysis (z^n = |z|^n·e^(inθ))
export const generateExponentiationPredictions = (analysis: StatisticalAnalysis, history: LotteryResult[] = lotteryHistory): string[] => {
  const predictions: string[] = [];
  const allNumbers = history.map(r => r.result);
  const recentNumbers = allNumbers.slice(-10);
  
  const complexNumbers: ComplexNumber[] = recentNumbers.map(num => {
    const digits = num.split("").map(Number);
    const real = digits.slice(0, 3).reduce((sum, d) => sum * 10 + d, 0);
    const imaginary = digits.slice(3, 6).reduce((sum, d) => sum * 10 + d, 0);
    return createComplex(real, imaginary);
  });
  
  for (let i = 0; i < 5; i++) {
    const baseComplex = complexNumbers[complexNumbers.length - 1 - i];
    const magnitude = complexMagnitude(baseComplex);
    const angle = complexAngle(baseComplex);
    
    // Apply z^n formula
    const n = 1.5 + (i * 0.2); // fractional powers
    const newMagnitude = Math.pow(magnitude, n) / 100; // scale down
    const newAngle = n * angle;
    
    const real = Math.abs(Math.round(newMagnitude * Math.cos(newAngle))) % 1000;
    const imaginary = Math.abs(Math.round(newMagnitude * Math.sin(newAngle))) % 1000;
    
    const number = real.toString().padStart(3, '0') + imaginary.toString().padStart(3, '0');
    predictions.push(number);
  }
  
  return predictions;
};

// Method 11: Real and Imaginary Decomposition (Re(z) = (z+z̄)/2, Im(z) = (z-z̄)/2i)
export const generateRealImaginaryDecompositionPredictions = (analysis: StatisticalAnalysis, history: LotteryResult[] = lotteryHistory): string[] => {
  const predictions: string[] = [];
  const allNumbers = history.map(r => r.result);
  const recentNumbers = allNumbers.slice(-25);
  
  const complexNumbers: ComplexNumber[] = recentNumbers.map(num => {
    const digits = num.split("").map(Number);
    const real = digits.slice(0, 3).reduce((sum, d) => sum * 10 + d, 0);
    const imaginary = digits.slice(3, 6).reduce((sum, d) => sum * 10 + d, 0);
    return createComplex(real, imaginary);
  });
  
  // Calculate average
  const avgReal = complexNumbers.reduce((sum, z) => sum + z.real, 0) / complexNumbers.length;
  const avgImag = complexNumbers.reduce((sum, z) => sum + z.imaginary, 0) / complexNumbers.length;
  const avgComplex = createComplex(avgReal, avgImag);
  const conjugate = complexConjugate(avgComplex);
  
  for (let i = 0; i < 5; i++) {
    // Apply Re(z) = (z + z̄)/2 and Im(z) = (z - z̄)/(2i) transformations
    const weight = 0.7 + (i * 0.15);
    
    // Real part decomposition
    const realPart = Math.abs(Math.round((avgComplex.real + conjugate.real) / 2 * weight)) % 1000;
    
    // Imaginary part decomposition  
    const imagPart = Math.abs(Math.round((avgComplex.imaginary - conjugate.imaginary) / 2 * weight)) % 1000;
    
    // Mix with recent trends
    const recent = complexNumbers[complexNumbers.length - 1 - i];
    const mixedReal = Math.round((realPart + recent.real * 0.3)) % 1000;
    const mixedImag = Math.round((imagPart + recent.imaginary * 0.3)) % 1000;
    
    const number = mixedReal.toString().padStart(3, '0') + mixedImag.toString().padStart(3, '0');
    predictions.push(number);
  }
  
  return predictions;
};

// ============================================================
// L4-Focused Methods (Methods 12-15)
// These are optimized specifically for the LAST 4 DIGITS (positions 2-5)
// of the 6-digit draw, where the lottery prize structure pays out.
// ============================================================

// Helper: parse "dd.mm.yy" into a sortable timestamp
const parseDateTs = (d: string): number => {
  const [dd, mm, yy] = d.split(".").map(Number);
  if (!dd || !mm || yy === undefined) return 0;
  const year = yy < 50 ? 2000 + yy : 1900 + yy;
  return new Date(year, mm - 1, dd).getTime();
};

// Helper: take the latest N draws sorted newest-first (history may already be either order)
const latestN = (history: LotteryResult[], n: number): LotteryResult[] => {
  const sorted = [...history].sort((a, b) => parseDateTs(b.date) - parseDateTs(a.date));
  return sorted.slice(0, n);
};

// Method 12: L4 Positional Top-K
// Build the L4 tail from the top-3 most frequent digits at each of positions 2-5
// using only the last 200 draws, then prefix with the most common pos-0/pos-1 digits.
export const generateL4PositionalTopKPredictions = (history: LotteryResult[] = lotteryHistory): string[] => {
  const recent = latestN(history, 200);
  if (recent.length === 0) return [];

  const top: string[][] = [];
  for (let pos = 0; pos < 6; pos++) {
    const counts: Record<string, number> = {};
    for (let d = 0; d <= 9; d++) counts[d.toString()] = 0;
    recent.forEach(r => {
      const ch = r.result[pos];
      if (ch) counts[ch] = (counts[ch] || 0) + 1;
    });
    top.push(
      Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, pos < 2 ? 1 : 3) // 1 prefix, 3 per L4 position
        .map(([d]) => d),
    );
  }

  const out = new Set<string>();
  for (const p0 of top[0]) {
    for (const p1 of top[1]) {
      for (const p2 of top[2]) {
        for (const p3 of top[3]) {
          for (const p4 of top[4]) {
            for (const p5 of top[5]) {
              out.add(p0 + p1 + p2 + p3 + p4 + p5);
              if (out.size >= 20) break;
            }
            if (out.size >= 20) break;
          }
          if (out.size >= 20) break;
        }
        if (out.size >= 20) break;
      }
      if (out.size >= 20) break;
    }
    if (out.size >= 20) break;
  }
  return Array.from(out);
};

// Method 13: L4 Markov Tail
// 1st-order Markov chain over positions 2->3, 3->4, 4->5 across all history.
// Sample 20 chains seeded from the top-5 most likely pos-2 starters.
export const generateL4MarkovTailPredictions = (history: LotteryResult[] = lotteryHistory): string[] => {
  if (history.length === 0) return [];

  // Transition counts: trans[fromPos][fromDigit][toDigit]
  const trans: number[][][] = [2, 3, 4].map(() =>
    Array.from({ length: 10 }, () => new Array(10).fill(0)),
  );
  const startCounts = new Array(10).fill(0);

  history.forEach(r => {
    const s = r.result;
    if (s.length < 6) return;
    const d2 = +s[2], d3 = +s[3], d4 = +s[4], d5 = +s[5];
    startCounts[d2]++;
    trans[0][d2][d3]++;
    trans[1][d3][d4]++;
    trans[2][d4][d5]++;
  });

  // Pick most-likely transition deterministically (peak of distribution)
  const argmaxRow = (row: number[]): number => {
    let best = 0, bestVal = -1;
    for (let i = 0; i < 10; i++) if (row[i] > bestVal) { bestVal = row[i]; best = i; }
    return best;
  };

  // Top-5 starters by frequency
  const starters = startCounts
    .map((c, d) => ({ d, c }))
    .sort((a, b) => b.c - a.c)
    .slice(0, 5)
    .map(x => x.d);

  // Pick most common pos-0 and pos-1
  const p0Counts = new Array(10).fill(0);
  const p1Counts = new Array(10).fill(0);
  history.forEach(r => { p0Counts[+r.result[0]]++; p1Counts[+r.result[1]]++; });
  const p0 = argmaxRow(p0Counts);
  const p1 = argmaxRow(p1Counts);

  const out = new Set<string>();
  // For each starter, generate 4 variants by also taking the 2nd-best transition at each step
  for (const seed of starters) {
    const rankRow = (row: number[]): number[] =>
      row.map((c, i) => ({ c, i })).sort((a, b) => b.c - a.c).map(x => x.i);
    const next3 = rankRow(trans[0][seed]);
    for (const t3 of next3.slice(0, 2)) {
      const next4 = rankRow(trans[1][t3]);
      for (const t4 of next4.slice(0, 2)) {
        const next5 = rankRow(trans[2][t4]);
        for (const t5 of next5.slice(0, 1)) {
          out.add(`${p0}${p1}${seed}${t3}${t4}${t5}`);
        }
      }
    }
    if (out.size >= 20) break;
  }
  return Array.from(out).slice(0, 20);
};

// Method 14: Recency-Weighted L4 Bigrams
// Weight every L4 bigram (positions 2-3, 3-4, 4-5) by exp(-age_days/365),
// then build candidates from the heaviest pos2-3 + pos4-5 bigram pairs.
export const generateL4RecencyBigramPredictions = (history: LotteryResult[] = lotteryHistory): string[] => {
  if (history.length === 0) return [];
  const sorted = [...history].sort((a, b) => parseDateTs(b.date) - parseDateTs(a.date));
  const newestTs = parseDateTs(sorted[0].date);

  const bg23: Record<string, number> = {};
  const bg45: Record<string, number> = {};

  sorted.forEach(r => {
    const ageDays = Math.max(0, (newestTs - parseDateTs(r.date)) / (1000 * 60 * 60 * 24));
    const w = Math.exp(-ageDays / 365);
    const t = r.result;
    if (t.length < 6) return;
    const a = t.slice(2, 4);
    const b = t.slice(4, 6);
    bg23[a] = (bg23[a] || 0) + w;
    bg45[b] = (bg45[b] || 0) + w;
  });

  const top23 = Object.entries(bg23).sort((a, b) => b[1] - a[1]).slice(0, 5).map(x => x[0]);
  const top45 = Object.entries(bg45).sort((a, b) => b[1] - a[1]).slice(0, 4).map(x => x[0]);

  // Most common pos-0/1 from recent 200 draws as the prefix
  const recent = sorted.slice(0, 200);
  const p0c = new Array(10).fill(0), p1c = new Array(10).fill(0);
  recent.forEach(r => { p0c[+r.result[0]]++; p1c[+r.result[1]]++; });
  const p0 = p0c.indexOf(Math.max(...p0c));
  const p1 = p1c.indexOf(Math.max(...p1c));

  const out = new Set<string>();
  for (const a of top23) {
    for (const b of top45) {
      out.add(`${p0}${p1}${a}${b}`);
      if (out.size >= 20) break;
    }
    if (out.size >= 20) break;
  }
  return Array.from(out);
};

// Method 15: L3 Anchor + Frequent L4-Prefix
// Since L3 recurs ~61% of the time, use the top-10 most frequent L3 tails from
// the last 500 draws and prepend the top-2 most frequent pos-2 digits.
export const generateL3AnchorPredictions = (history: LotteryResult[] = lotteryHistory): string[] => {
  if (history.length === 0) return [];
  const recent = latestN(history, 500);

  // Top L3 tails
  const l3Counts: Record<string, number> = {};
  recent.forEach(r => {
    const t = r.result.slice(-3);
    l3Counts[t] = (l3Counts[t] || 0) + 1;
  });
  const topL3 = Object.entries(l3Counts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(x => x[0]);

  // Top-2 pos-2 digits from same window
  const pos2 = new Array(10).fill(0);
  recent.forEach(r => { pos2[+r.result[2]]++; });
  const topPos2 = pos2
    .map((c, d) => ({ c, d }))
    .sort((a, b) => b.c - a.c)
    .slice(0, 2)
    .map(x => x.d.toString());

  // Most common pos-0 and pos-1
  const p0c = new Array(10).fill(0), p1c = new Array(10).fill(0);
  recent.forEach(r => { p0c[+r.result[0]]++; p1c[+r.result[1]]++; });
  const p0 = p0c.indexOf(Math.max(...p0c));
  const p1 = p1c.indexOf(Math.max(...p1c));

  const out = new Set<string>();
  for (const pre of topPos2) {
    for (const tail of topL3) {
      out.add(`${p0}${p1}${pre}${tail}`);
      if (out.size >= 20) break;
    }
    if (out.size >= 20) break;
  }
  return Array.from(out);
};

// Method 16: L4 Stable Positional
// Blends "all-time" positional frequency with "last-200" recency.
// For each L4 position (2-5), take the intersection of:
//   - top-3 from last-200 draws (recency signal)
//   - top-5 from all-time history (stability signal)
// If the intersection is empty for a position, fall back to the last-200 top-3.
// This filters out short-term noise without losing recent trends.
export const generateL4StablePositionalPredictions = (history: LotteryResult[] = lotteryHistory): string[] => {
  if (history.length === 0) return [];
  const recent = latestN(history, 200);

  const topAtPos = (records: LotteryResult[], pos: number, k: number): string[] => {
    const counts: Record<string, number> = {};
    for (let d = 0; d <= 9; d++) counts[d.toString()] = 0;
    records.forEach(r => {
      const ch = r.result[pos];
      if (ch) counts[ch] = (counts[ch] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, k)
      .map(([d]) => d);
  };

  // Build per-position digit sets
  const top: string[][] = [];
  for (let pos = 0; pos < 6; pos++) {
    if (pos < 2) {
      // Prefix: just take the single most-common digit (any prefix is fine for L4 scoring)
      top.push(topAtPos(recent, pos, 1));
    } else {
      const recentTop = topAtPos(recent, pos, 3);
      const allTimeTop = new Set(topAtPos(history, pos, 5));
      const stable = recentTop.filter(d => allTimeTop.has(d));
      top.push(stable.length > 0 ? stable : recentTop);
    }
  }

  const out = new Set<string>();
  for (const p0 of top[0]) {
    for (const p1 of top[1]) {
      for (const p2 of top[2]) {
        for (const p3 of top[3]) {
          for (const p4 of top[4]) {
            for (const p5 of top[5]) {
              out.add(p0 + p1 + p2 + p3 + p4 + p5);
              if (out.size >= 20) break;
            }
            if (out.size >= 20) break;
          }
          if (out.size >= 20) break;
        }
        if (out.size >= 20) break;
      }
      if (out.size >= 20) break;
    }
    if (out.size >= 20) break;
  }
  return Array.from(out);
};

// ============================================================
// L4-Optimized Complex-Number Methods (Methods 17-20)
// Derived from the standard complex-number identity sheet.
// Unlike Methods 6-11 (which split into F3 real / L3 imaginary and
// predict the full 6-digit number), these target the L4 tail directly:
// L4 "abcd" → real = ab, imaginary = cd. Output = 4-digit tail
// prefixed with the most-common pos-0/pos-1 from the last 200 draws.
// ============================================================

// Helper: get most-common pos-0 / pos-1 prefix from recent history
const recentPrefix = (history: LotteryResult[]): string => {
  const recent = latestN(history, 200);
  if (recent.length === 0) return "00";
  const p0c = new Array(10).fill(0);
  const p1c = new Array(10).fill(0);
  recent.forEach(r => { p0c[+r.result[0]]++; p1c[+r.result[1]]++; });
  return `${p0c.indexOf(Math.max(...p0c))}${p1c.indexOf(Math.max(...p1c))}`;
};

// Helper: convert L4 tail "abcd" -> complex (ab + cd·i)
const l4ToComplex = (tail: string): { r: number; i: number } => ({
  r: parseInt(tail.slice(0, 2), 10) || 0,
  i: parseInt(tail.slice(2, 4), 10) || 0,
});

// Helper: convert (r, i) back to a 4-digit tail (each clamped 0-99)
const complexToL4 = (r: number, i: number): string => {
  const ri = ((Math.abs(Math.round(r)) % 100) + 100) % 100;
  const ii = ((Math.abs(Math.round(i)) % 100) + 100) % 100;
  return ri.toString().padStart(2, "0") + ii.toString().padStart(2, "0");
};

// Method 17: L4 Complex Polar Drift
// Track polar (|z|, θ) of the last 50 L4 tails. Compute mean drift
// per step, project the next 5 tails by stepping forward in (r, θ).
export const generateL4ComplexPolarDriftPredictions = (history: LotteryResult[] = lotteryHistory): string[] => {
  const recent = latestN(history, 50).filter(r => r.result.length === 6);
  if (recent.length < 5) return [];
  const prefix = recentPrefix(history);

  // Newest -> oldest. Reverse to chronological for drift.
  const chrono = recent.slice().reverse();
  const polars = chrono.map(r => {
    const z = l4ToComplex(r.result.slice(-4));
    return { r: Math.sqrt(z.r * z.r + z.i * z.i), th: Math.atan2(z.i, z.r) };
  });

  // Mean step in (r, θ)
  let dr = 0, dth = 0;
  for (let k = 1; k < polars.length; k++) {
    dr += polars[k].r - polars[k - 1].r;
    let d = polars[k].th - polars[k - 1].th;
    // unwrap
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    dth += d;
  }
  dr /= (polars.length - 1);
  dth /= (polars.length - 1);

  const last = polars[polars.length - 1];
  const out: string[] = [];
  const seen = new Set<string>();
  for (let step = 1; step <= 8 && out.length < 5; step++) {
    const r = Math.max(0, last.r + dr * step);
    const th = last.th + dth * step;
    const tail = complexToL4(r * Math.cos(th), r * Math.sin(th));
    if (!seen.has(tail)) {
      seen.add(tail);
      out.push(prefix + tail);
    }
  }
  return out;
};

// Method 18: L4 Conjugate Mirror
// Identity: z̄ = a − bi, −z = (−a) + (−b)i.
// For each of the top-5 hottest recent L4 tails, emit its conjugate
// (top-2-digit / bottom-2-digit swap of sign via mod-100 mirror).
export const generateL4ConjugateMirrorPredictions = (history: LotteryResult[] = lotteryHistory): string[] => {
  const recent = latestN(history, 200).filter(r => r.result.length === 6);
  if (recent.length === 0) return [];
  const prefix = recentPrefix(history);

  // Recency-weighted top L4 tails
  const newest = parseDateTs(recent[0].date);
  const w: Record<string, number> = {};
  recent.forEach(r => {
    const tail = r.result.slice(-4);
    const ageDays = Math.max(0, (newest - parseDateTs(r.date)) / (1000 * 60 * 60 * 24));
    w[tail] = (w[tail] || 0) + Math.exp(-ageDays / 180);
  });
  const hot = Object.entries(w).sort((a, b) => b[1] - a[1]).slice(0, 5).map(x => x[0]);

  const out: string[] = [];
  const seen = new Set<string>();
  for (const tail of hot) {
    const z = l4ToComplex(tail);
    // z̄: negate imag → mod-100 mirror = (100 - i) % 100
    const conj = complexToL4(z.r, (100 - z.i) % 100);
    // −z: negate real and imag
    const neg = complexToL4((100 - z.r) % 100, (100 - z.i) % 100);
    for (const t of [conj, neg]) {
      if (!seen.has(t) && out.length < 5) {
        seen.add(t);
        out.push(prefix + t);
      }
    }
    if (out.length >= 5) break;
  }
  return out;
};

// Method 19: L4 nth-Roots Generator
// Identity: ⁿ√z = ⁿ√|z|·e^(i(θ+2kπ)/n), k ∈ {0…n−1}.
// Take the most-recent L4 tail as z, generate its 5 fifth-roots.
export const generateL4NthRootsPredictions = (history: LotteryResult[] = lotteryHistory): string[] => {
  const recent = latestN(history, 1).filter(r => r.result.length === 6);
  if (recent.length === 0) return [];
  const prefix = recentPrefix(history);

  const tail = recent[0].result.slice(-4);
  const z = l4ToComplex(tail);
  const r = Math.sqrt(z.r * z.r + z.i * z.i);
  const th = Math.atan2(z.i, z.r);
  const n = 5;

  // Scale roots so the resulting (real, imag) span the 0-99 grid usefully.
  // r^(1/n) is small for r<100, so multiply by sqrt(r) to map back into range.
  const rRoot = Math.pow(r, 1 / n) * Math.sqrt(r);

  const out: string[] = [];
  const seen = new Set<string>();
  for (let k = 0; k < n; k++) {
    const angle = (th + 2 * k * Math.PI) / n;
    const cand = complexToL4(rRoot * Math.cos(angle), rRoot * Math.sin(angle));
    if (!seen.has(cand)) {
      seen.add(cand);
      out.push(prefix + cand);
    }
  }
  return out;
};

// Method 20: L4 z₁·z₂ Angular Drift
// Identity: z₁·z₂ = |z₁||z₂|·e^i(θ₁+θ₂).
// Multiply the last 2 L4 tails as complex numbers, then rotate by
// k·30° (k=0..4) around that result to fan out 5 candidates.
export const generateL4ProductDriftPredictions = (history: LotteryResult[] = lotteryHistory): string[] => {
  const recent = latestN(history, 2).filter(r => r.result.length === 6);
  if (recent.length < 2) return [];
  const prefix = recentPrefix(history);

  const z1 = l4ToComplex(recent[0].result.slice(-4));
  const z2 = l4ToComplex(recent[1].result.slice(-4));
  const r1 = Math.sqrt(z1.r * z1.r + z1.i * z1.i);
  const r2 = Math.sqrt(z2.r * z2.r + z2.i * z2.i);
  const th1 = Math.atan2(z1.i, z1.r);
  const th2 = Math.atan2(z2.i, z2.r);

  // Product magnitude scaled back into range so |z₁|·|z₂| doesn't blow up.
  const rProd = Math.sqrt(r1 * r2);
  const thProd = th1 + th2;

  const out: string[] = [];
  const seen = new Set<string>();
  for (let k = 0; k < 5; k++) {
    const ang = thProd + (k * Math.PI) / 6;
    const cand = complexToL4(rProd * Math.cos(ang), rProd * Math.sin(ang));
    if (!seen.has(cand)) {
      seen.add(cand);
      out.push(prefix + cand);
    }
  }
  return out;
};

// Generate all prediction sets
export const generateAllPredictions = (): PredictionSet[] => generateAllPredictionsFor(lotteryHistory);

// Backtest-friendly variant: generate all 11 method sets using a specific history slice
export const generateAllPredictionsFor = (history: LotteryResult[]): PredictionSet[] => {
  const analysis = analyzeHistoricalData(history);
  
  return [
    {
      method: "High-Frequency Based",
      description: "Uses most frequent digits from each position",
      numbers: generateFrequencyBasedPredictions(analysis),
      confidence: "high"
    },
    {
      method: "Probability-Weighted",
      description: "Random selection weighted by historical frequency",
      numbers: generateProbabilityWeightedPredictions(analysis),
      confidence: "medium"
    },
    {
      method: "Trend-Based",
      description: "Based on temporal patterns and hot pairs",
      numbers: generateTrendBasedPredictions(analysis),
      confidence: "medium"
    },
    {
      method: "Hot-Cold Balanced",
      description: "Balances most and least frequent digits",
      numbers: generateBalancedPredictions(analysis),
      confidence: "low"
    },
    {
      method: "Pattern Matching",
      description: "Built from most common adjacent digit pairs",
      numbers: generatePatternMatchingPredictions(analysis),
      confidence: "medium"
    },
    {
      method: "Complex Number Analysis",
      description: "Uses complex number operations (conjugate, magnitude, multiplication) on historical data",
      numbers: generateComplexNumberPredictions(analysis, history),
      confidence: "high"
    },
    {
      method: "Phase & Magnitude Based",
      description: "Analyzes phase angles and magnitudes of complex representations",
      numbers: generatePhaseBasedPredictions(analysis, history),
      confidence: "medium"
    },
    {
      method: "Exponential Form (z=|z|e^iθ)",
      description: "Uses exponential form conversions with angle and magnitude transformations",
      numbers: generateExponentialFormPredictions(analysis, history),
      confidence: "high"
    },
    {
      method: "Complex Roots (nth roots)",
      description: "Applies nth root formula: ⁿ√|z|·e^(i(θ+2kπ)/n) for pattern extraction",
      numbers: generateComplexRootsPredictions(analysis, history),
      confidence: "medium"
    },
    {
      method: "Exponentiation (z^n)",
      description: "Uses power formula: z^n = |z|^n·e^(inθ) with fractional exponents",
      numbers: generateExponentiationPredictions(analysis, history),
      confidence: "medium"
    },
    {
      method: "Real/Imaginary Decomposition",
      description: "Applies Re(z)=(z+z̄)/2 and Im(z)=(z-z̄)/2i formulas for component analysis",
      numbers: generateRealImaginaryDecompositionPredictions(analysis, history),
      confidence: "high"
    },
    {
      method: "L4 Positional Top-K",
      description: "L4-focused: top-3 most frequent digits per tail position from last 200 draws (Cartesian product)",
      numbers: generateL4PositionalTopKPredictions(history),
      confidence: "high"
    },
    {
      method: "L4 Markov Tail",
      description: "L4-focused: 1st-order Markov chain over positions 2→3→4→5 transitions",
      numbers: generateL4MarkovTailPredictions(history),
      confidence: "low"
    },
    {
      method: "L4 Recency Bigrams",
      description: "L4-focused: positions 2-3 + 4-5 bigrams weighted by exp(-age_days/365)",
      numbers: generateL4RecencyBigramPredictions(history),
      confidence: "medium"
    },
    {
      method: "L3 Anchor + L4 Prefix",
      description: "L3 recurs ~61% — top-10 L3 tails (last 500 draws) prepended with top-2 pos-2 digits",
      numbers: generateL3AnchorPredictions(history),
      confidence: "high"
    },
    {
      method: "L4 Stable Positional",
      description: "L4-focused: intersection of last-200 top-3 and all-time top-5 per position (filters short-term noise)",
      numbers: generateL4StablePositionalPredictions(history),
      confidence: "high"
    },
    {
      method: "L4 Complex Polar Drift",
      description: "L4-focused: tracks (|z|, θ) drift of last 50 L4 tails and projects forward in polar coordinates",
      numbers: generateL4ComplexPolarDriftPredictions(history),
      confidence: "medium"
    },
    {
      method: "L4 Conjugate Mirror",
      description: "L4-focused: applies z̄ = a − bi and −z reflections to the hottest recent L4 tails",
      numbers: generateL4ConjugateMirrorPredictions(history),
      confidence: "medium"
    },
    {
      method: "L4 nth-Roots Generator",
      description: "L4-focused: generates the 5 fifth-roots of the most recent L4 tail using ⁿ√z = ⁿ√|z|·e^(i(θ+2kπ)/n)",
      numbers: generateL4NthRootsPredictions(history),
      confidence: "medium"
    },
    {
      method: "L4 z₁·z₂ Angular Drift",
      description: "L4-focused: multiplies the last two L4 tails (z₁·z₂ = |z₁||z₂|·e^i(θ₁+θ₂)) and rotates around the product",
      numbers: generateL4ProductDriftPredictions(history),
      confidence: "medium"
    }
  ];
};
