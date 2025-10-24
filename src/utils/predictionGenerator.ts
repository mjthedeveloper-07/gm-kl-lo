import { lotteryHistory } from "@/data/lotteryHistory";

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

// Get the latest result for trigger-based predictions
export const getLatestResult = () => {
  return lotteryHistory[0];
};

// Perform comprehensive statistical analysis with emphasis on latest result
export const analyzeHistoricalData = (): StatisticalAnalysis => {
  const allNumbers = lotteryHistory.map(r => r.result);
  const latestResult = getLatestResult();
  
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
  lotteryHistory.forEach(result => {
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

// Method 1: Frequency-Based Predictions (with latest result influence)
export const generateFrequencyBasedPredictions = (analysis: StatisticalAnalysis): string[] => {
  const predictions: string[] = [];
  const latestResult = getLatestResult();
  const latestDigits = latestResult.result.split("");
  
  // Use top 3 from each position, influenced by latest result
  for (let variant = 0; variant < 5; variant++) {
    let number = "";
    for (let pos = 0; pos < 6; pos++) {
      const posData = analysis.positionalAnalysis[pos];
      
      // 30% chance to use digit from same position in latest result
      if (variant > 0 && Math.random() < 0.3) {
        number += latestDigits[pos];
      } else {
        const digitIndex = variant % 3;
        number += posData[digitIndex].digit;
      }
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
export const generateComplexNumberPredictions = (analysis: StatisticalAnalysis): string[] => {
  const predictions: string[] = [];
  const allNumbers = lotteryHistory.map(r => r.result);
  
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
export const generatePhaseBasedPredictions = (analysis: StatisticalAnalysis): string[] => {
  const predictions: string[] = [];
  const allNumbers = lotteryHistory.map(r => r.result);
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
export const generateExponentialFormPredictions = (analysis: StatisticalAnalysis): string[] => {
  const predictions: string[] = [];
  const allNumbers = lotteryHistory.map(r => r.result);
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
export const generateComplexRootsPredictions = (analysis: StatisticalAnalysis): string[] => {
  const predictions: string[] = [];
  const allNumbers = lotteryHistory.map(r => r.result);
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
export const generateExponentiationPredictions = (analysis: StatisticalAnalysis): string[] => {
  const predictions: string[] = [];
  const allNumbers = lotteryHistory.map(r => r.result);
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

// Method 11: Ultra High Frequency Based (Top 5 Numbers from Pure Frequency Analysis)
export const generateUltraHighFrequencyPredictions = (analysis: StatisticalAnalysis): string[] => {
  const predictions: string[] = [];
  
  // Get top 3 most frequent digits for each position
  const topDigitsPerPosition = analysis.positionalAnalysis.map(posData => 
    posData.slice(0, 3).map(d => d.digit)
  );
  
  // Generate 5 ultra-high-frequency numbers using top 3 from each position
  for (let i = 0; i < 5; i++) {
    let number = "";
    for (let pos = 0; pos < 6; pos++) {
      // For first prediction use #1 from each position
      // For second prediction use mix of #1 and #2
      // For third prediction use #2 from each position
      // For fourth prediction use mix of #2 and #3
      // For fifth prediction use #3 from each position
      const digitIndex = Math.floor(i / 2); // 0, 0, 1, 1, 2
      const altIndex = (digitIndex + (i % 2)) % 3; // Alternate between indices
      
      number += topDigitsPerPosition[pos][altIndex];
    }
    predictions.push(number);
  }
  
  return predictions;
};

// Method 12: Real and Imaginary Decomposition (Re(z) = (z+z̄)/2, Im(z) = (z-z̄)/2i)
export const generateRealImaginaryDecompositionPredictions = (analysis: StatisticalAnalysis): string[] => {
  const predictions: string[] = [];
  const allNumbers = lotteryHistory.map(r => r.result);
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

// Method 13: Day of Week AB-BC-AC Pattern Analysis
export const generateDayOfWeekABCPredictions = (analysis: StatisticalAnalysis): string[] => {
  const predictions: string[] = [];
  
  // Day-of-week AB, BC, AC values based on user's chart
  const dayPatterns = {
    0: { AB: 0, BC: 1, AC: 7 }, // Sunday (using SAT pattern as fallback)
    1: { AB: 5, BC: 4, AC: 2 }, // Monday
    2: { AB: 6, BC: 0, AC: 6 }, // Tuesday
    3: { AB: 7, BC: 1, AC: 8 }, // Wednesday
    4: { AB: 0, BC: 4, AC: 5 }, // Thursday
    5: { AB: 3, BC: 2, AC: 7 }, // Friday
    6: { AB: 0, BC: 1, AC: 7 }, // Saturday
  };
  
  // Get top frequent digits for each position
  const topDigitsPerPosition = analysis.positionalAnalysis.map(posData => 
    posData.slice(0, 5).map(d => d.digit)
  );
  
  // Generate predictions for next 5 days
  const today = new Date();
  for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + dayOffset);
    const dayOfWeek = targetDate.getDay();
    const pattern = dayPatterns[dayOfWeek as keyof typeof dayPatterns];
    
    let number = "";
    
    // Position 0: Use AB value as index into top digits
    const pos0Index = pattern.AB % topDigitsPerPosition[0].length;
    number += topDigitsPerPosition[0][pos0Index];
    
    // Position 1: Use BC value as index
    const pos1Index = pattern.BC % topDigitsPerPosition[1].length;
    number += topDigitsPerPosition[1][pos1Index];
    
    // Position 2: Use AC value as index
    const pos2Index = pattern.AC % topDigitsPerPosition[2].length;
    number += topDigitsPerPosition[2][pos2Index];
    
    // Position 3: Use (AB + BC) as index
    const pos3Index = (pattern.AB + pattern.BC) % topDigitsPerPosition[3].length;
    number += topDigitsPerPosition[3][pos3Index];
    
    // Position 4: Use (BC + AC) as index
    const pos4Index = (pattern.BC + pattern.AC) % topDigitsPerPosition[4].length;
    number += topDigitsPerPosition[4][pos4Index];
    
    // Position 5: Use (AB + AC) as index
    const pos5Index = (pattern.AB + pattern.AC) % topDigitsPerPosition[5].length;
    number += topDigitsPerPosition[5][pos5Index];
    
    predictions.push(number);
  }
  
  return predictions;
};

// Generate all prediction sets
export const generateAllPredictions = (): PredictionSet[] => {
  const analysis = analyzeHistoricalData();
  
  return [
    {
      method: "📅 Day-of-Week AB-BC-AC",
      description: "NEXT 5 DAYS: Uses day-specific AB, BC, AC patterns (MON: 5-4-2, TUE: 6-0-6, WED: 7-1-8, THU: 0-4-5, FRI: 3-2-7, SAT: 0-1-7)",
      numbers: generateDayOfWeekABCPredictions(analysis),
      confidence: "high"
    },
    {
      method: "🔥 Ultra High Frequency",
      description: "TOP 5 NUMBERS: Pure frequency analysis using the most frequently occurring digits from each position",
      numbers: generateUltraHighFrequencyPredictions(analysis),
      confidence: "high"
    },
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
      numbers: generateComplexNumberPredictions(analysis),
      confidence: "high"
    },
    {
      method: "Phase & Magnitude Based",
      description: "Analyzes phase angles and magnitudes of complex representations",
      numbers: generatePhaseBasedPredictions(analysis),
      confidence: "medium"
    },
    {
      method: "Exponential Form (z=|z|e^iθ)",
      description: "Uses exponential form conversions with angle and magnitude transformations",
      numbers: generateExponentialFormPredictions(analysis),
      confidence: "high"
    },
    {
      method: "Complex Roots (nth roots)",
      description: "Applies nth root formula: ⁿ√|z|·e^(i(θ+2kπ)/n) for pattern extraction",
      numbers: generateComplexRootsPredictions(analysis),
      confidence: "medium"
    },
    {
      method: "Exponentiation (z^n)",
      description: "Uses power formula: z^n = |z|^n·e^(inθ) with fractional exponents",
      numbers: generateExponentiationPredictions(analysis),
      confidence: "medium"
    },
    {
      method: "Real/Imaginary Decomposition",
      description: "Applies Re(z)=(z+z̄)/2 and Im(z)=(z-z̄)/2i formulas for component analysis",
      numbers: generateRealImaginaryDecompositionPredictions(analysis),
      confidence: "high"
    }
  ];
};
