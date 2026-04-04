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

// === Utility: Weighted random sampling without replacement ===
const weightedRandomPick = <T>(items: T[], weights: number[], count: number): T[] => {
  const result: T[] = [];
  const availableItems = [...items];
  const availableWeights = [...weights];

  for (let i = 0; i < count && availableItems.length > 0; i++) {
    const totalWeight = availableWeights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;

    for (let j = 0; j < availableItems.length; j++) {
      random -= availableWeights[j];
      if (random <= 0) {
        result.push(availableItems[j]);
        availableItems.splice(j, 1);
        availableWeights.splice(j, 1);
        break;
      }
    }
  }

  return result;
};

// === Recency-weighted analysis ===
const getRecencyWeight = (year: number, month: number): number => {
  const now = new Date();
  const resultDate = new Date(year, month - 1);
  const monthsAgo = (now.getFullYear() - resultDate.getFullYear()) * 12 + (now.getMonth() - resultDate.getMonth());
  // Last 6 months get 2x weight, older data gets 1x
  return monthsAgo <= 6 ? 2 : 1;
};

// Perform comprehensive statistical analysis with recency weighting
export const analyzeHistoricalData = (): StatisticalAnalysis => {
  const allNumbers = lotteryHistory.map(r => r.result);

  // Overall digit frequency with recency weighting
  const digitCounts: { [key: string]: number } = {};
  for (let i = 0; i <= 9; i++) digitCounts[i.toString()] = 0;

  lotteryHistory.forEach(entry => {
    const weight = getRecencyWeight(entry.year, entry.month);
    entry.result.split("").forEach(digit => {
      digitCounts[digit] = (digitCounts[digit] || 0) + weight;
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

  // Positional analysis with recency weighting
  const positionCounts: { [pos: number]: { [digit: string]: number } } = {};
  for (let pos = 0; pos < 6; pos++) {
    positionCounts[pos] = {};
    for (let d = 0; d <= 9; d++) positionCounts[pos][d.toString()] = 0;
  }

  lotteryHistory.forEach(entry => {
    const weight = getRecencyWeight(entry.year, entry.month);
    for (let pos = 0; pos < 6; pos++) {
      const digit = entry.result[pos];
      if (digit) {
        positionCounts[pos][digit] = (positionCounts[pos][digit] || 0) + weight;
      }
    }
  });

  const weightedTotal = lotteryHistory.reduce((sum, e) => sum + getRecencyWeight(e.year, e.month), 0);

  const positionalAnalysis: PositionalFrequency[][] = [];
  for (let pos = 0; pos < 6; pos++) {
    const posData = Object.entries(positionCounts[pos])
      .map(([digit, frequency]) => ({
        position: pos + 1,
        digit,
        frequency,
        percentage: Math.round((frequency / weightedTotal) * 100)
      }))
      .sort((a, b) => b.frequency - a.frequency);
    positionalAnalysis.push(posData);
  }

  // Digit pairs analysis with recency weighting
  const pairCounts: { [pair: string]: { count: number; positions: Set<string> } } = {};
  lotteryHistory.forEach(entry => {
    const weight = getRecencyWeight(entry.year, entry.month);
    const num = entry.result;
    for (let i = 0; i < 5; i++) {
      const pair = num[i] + num[i + 1];
      if (!pairCounts[pair]) {
        pairCounts[pair] = { count: 0, positions: new Set() };
      }
      pairCounts[pair].count += weight;
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

// Method 1: Frequency-Based Predictions (now with weighted random from top 5)
export const generateFrequencyBasedPredictions = (analysis: StatisticalAnalysis): string[] => {
  const predictions: string[] = [];

  for (let variant = 0; variant < 5; variant++) {
    let number = "";
    for (let pos = 0; pos < 6; pos++) {
      const posData = analysis.positionalAnalysis[pos];
      const top5 = posData.slice(0, 5);
      const picked = weightedRandomPick(
        top5.map(d => d.digit),
        top5.map(d => d.frequency),
        1
      );
      number += picked[0] || posData[0].digit;
    }
    predictions.push(number);
  }

  return predictions;
};

// Method 2: Probability-Weighted Predictions (already random)
export const generateProbabilityWeightedPredictions = (analysis: StatisticalAnalysis): string[] => {
  const predictions: string[] = [];

  for (let i = 0; i < 10; i++) {
    let number = "";
    for (let pos = 0; pos < 6; pos++) {
      const posData = analysis.positionalAnalysis[pos];
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
        number += posData[0].digit;
      }
    }
    predictions.push(number);
  }

  return [...new Set(predictions)];
};

// Method 3: Trend-Based Predictions (randomized start digit + weighted pairs)
export const generateTrendBasedPredictions = (analysis: StatisticalAnalysis): string[] => {
  const predictions: string[] = [];
  const currentMonth = new Date().getMonth() + 1;

  const topPairs = analysis.digitPairs.slice(0, 10);
  const top3Start = analysis.positionalAnalysis[0].slice(0, 3);

  for (let i = 0; i < 5; i++) {
    let number = "";

    // Randomly pick from top 3 start digits
    const startPick = weightedRandomPick(
      top3Start.map(d => d.digit),
      top3Start.map(d => d.frequency),
      1
    );
    number += startPick[0] || analysis.mostCommonStartDigit;

    // Weighted random pair selection
    const selectedPairs = weightedRandomPick(
      topPairs.map(p => p.pair),
      topPairs.map(p => p.frequency),
      1
    );
    number += selectedPairs[0] || topPairs[0].pair;

    // Fill remaining with weighted random from top digits
    while (number.length < 6) {
      const topDigits = analysis.topFrequentDigits.slice(0, 5);
      const pick = weightedRandomPick(
        topDigits.map(d => d.digit),
        topDigits.map(d => d.count),
        1
      );
      number += pick[0] || analysis.topFrequentDigits[0].digit;
    }

    predictions.push(number.slice(0, 6));
  }

  return predictions;
};

// Method 4: Hot-Cold Balanced (random mix ratio)
export const generateBalancedPredictions = (analysis: StatisticalAnalysis): string[] => {
  const predictions: string[] = [];
  const hot = analysis.topFrequentDigits.slice(0, 5);
  const cold = analysis.leastFrequentDigits.slice(0, 5);

  for (let i = 0; i < 5; i++) {
    let number = "";
    // Random mix ratio: 60-80% hot
    const hotRatio = 0.6 + Math.random() * 0.2;

    for (let pos = 0; pos < 6; pos++) {
      if (Math.random() < hotRatio) {
        const pick = weightedRandomPick(
          hot.map(d => d.digit),
          hot.map(d => d.count),
          1
        );
        number += pick[0] || hot[0].digit;
      } else {
        const pick = weightedRandomPick(
          cold.map(d => d.digit),
          cold.map(d => d.count + 1),
          1
        );
        number += pick[0] || cold[0].digit;
      }
    }

    predictions.push(number);
  }

  return predictions;
};

// Method 5: Pattern Matching (weighted random from top 15 pairs)
export const generatePatternMatchingPredictions = (analysis: StatisticalAnalysis): string[] => {
  const predictions: string[] = [];
  const topPairs = analysis.digitPairs.slice(0, 15);

  for (let i = 0; i < 5; i++) {
    const selectedPairs = weightedRandomPick(
      topPairs.map(p => p.pair),
      topPairs.map(p => p.frequency),
      3
    );

    const number = selectedPairs.join("").slice(0, 6);
    if (number.length === 6) {
      predictions.push(number);
    } else {
      // Pad if needed
      let padded = number;
      while (padded.length < 6) {
        padded += analysis.topFrequentDigits[padded.length % 5].digit;
      }
      predictions.push(padded.slice(0, 6));
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

// Random perturbation helpers for complex methods
const perturbAngle = (angle: number): number => angle + (Math.random() - 0.5) * 0.3;
const perturbMagnitude = (mag: number): number => mag * (0.9 + Math.random() * 0.2);

// Method 6: Complex Number Analysis (with perturbations)
export const generateComplexNumberPredictions = (analysis: StatisticalAnalysis): string[] => {
  const predictions: string[] = [];
  const allNumbers = lotteryHistory.map(r => r.result);
  const recentNumbers = allNumbers.slice(-50);
  const complexNumbers: ComplexNumber[] = recentNumbers.map(num => {
    const digits = num.split("").map(Number);
    const real = digits.slice(0, 3).reduce((sum, d) => sum * 10 + d, 0);
    const imaginary = digits.slice(3, 6).reduce((sum, d) => sum * 10 + d, 0);
    return createComplex(real, imaginary);
  });

  const avgReal = complexNumbers.reduce((sum, z) => sum + z.real, 0) / complexNumbers.length;
  const avgImag = complexNumbers.reduce((sum, z) => sum + z.imaginary, 0) / complexNumbers.length;
  const avgComplex = createComplex(avgReal, avgImag);

  for (let i = 0; i < 5; i++) {
    let resultComplex: ComplexNumber;

    if (i === 0) {
      const conj = complexConjugate(avgComplex);
      resultComplex = createComplex(conj.real + (Math.random() - 0.5) * 50, conj.imaginary + (Math.random() - 0.5) * 50);
    } else if (i === 1) {
      const mag = perturbMagnitude(complexMagnitude(avgComplex));
      const angle = perturbAngle(complexAngle(avgComplex) + Math.PI / 4);
      resultComplex = createComplex(mag * Math.cos(angle), mag * Math.sin(angle));
    } else if (i === 2) {
      const factor = createComplex(0.7 + Math.random() * 0.2, 0.5 + Math.random() * 0.2);
      resultComplex = complexMultiply(avgComplex, factor);
    } else if (i === 3) {
      const recent = complexNumbers[complexNumbers.length - 1];
      const w = 0.2 + Math.random() * 0.2;
      resultComplex = complexAdd(avgComplex, complexMultiply(recent, createComplex(w, w)));
    } else {
      const divisor = createComplex(1.3 + Math.random() * 0.4, 1.0 + Math.random() * 0.4);
      resultComplex = complexDivide(avgComplex, divisor);
    }

    const realPart = Math.abs(Math.round(resultComplex.real)) % 1000;
    const imagPart = Math.abs(Math.round(resultComplex.imaginary)) % 1000;
    const number = realPart.toString().padStart(3, '0') + imagPart.toString().padStart(3, '0');
    predictions.push(number);
  }

  return predictions;
};

// Method 7: Phase and Magnitude Analysis (with perturbations)
export const generatePhaseBasedPredictions = (analysis: StatisticalAnalysis): string[] => {
  const predictions: string[] = [];
  const allNumbers = lotteryHistory.map(r => r.result);
  const recentNumbers = allNumbers.slice(-30);
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

  const avgPhase = phases.reduce((sum, p) => sum + p, 0) / phases.length;
  const avgMagnitude = magnitudes.reduce((sum, m) => sum + m, 0) / magnitudes.length;

  for (let i = 0; i < 5; i++) {
    const phaseShift = perturbAngle(avgPhase + (i * Math.PI / 6));
    const magVariation = perturbMagnitude(avgMagnitude * (0.9 + i * 0.05));

    const real = Math.abs(Math.round(magVariation * Math.cos(phaseShift))) % 1000;
    const imaginary = Math.abs(Math.round(magVariation * Math.sin(phaseShift))) % 1000;
    const number = real.toString().padStart(3, '0') + imaginary.toString().padStart(3, '0');
    predictions.push(number);
  }

  return predictions;
};

// Method 8: Exponential Form Analysis (with perturbations)
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
    const magnitude = perturbMagnitude(complexMagnitude(baseComplex));
    const angle = perturbAngle(complexAngle(baseComplex));

    const newAngle = angle + (i * Math.PI / 8) + Math.PI / 4;
    const newMagnitude = magnitude * (0.85 + i * 0.075);

    const real = Math.abs(Math.round(newMagnitude * Math.cos(newAngle))) % 1000;
    const imaginary = Math.abs(Math.round(newMagnitude * Math.sin(newAngle))) % 1000;
    const number = real.toString().padStart(3, '0') + imaginary.toString().padStart(3, '0');
    predictions.push(number);
  }

  return predictions;
};

// Method 9: Complex Roots Analysis (with perturbations)
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

  for (let k = 0; k < 5; k++) {
    const baseComplex = complexNumbers[complexNumbers.length - 1];
    const magnitude = perturbMagnitude(complexMagnitude(baseComplex));
    const angle = perturbAngle(complexAngle(baseComplex));

    const n = 2 + (k % 3);
    const rootMagnitude = Math.pow(magnitude, 1 / n);
    const rootAngle = (angle + 2 * k * Math.PI) / n;

    const real = Math.abs(Math.round(rootMagnitude * Math.cos(rootAngle) * 10)) % 1000;
    const imaginary = Math.abs(Math.round(rootMagnitude * Math.sin(rootAngle) * 10)) % 1000;
    const number = real.toString().padStart(3, '0') + imaginary.toString().padStart(3, '0');
    predictions.push(number);
  }

  return predictions;
};

// Method 10: Exponentiation Analysis (with perturbations)
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
    const magnitude = perturbMagnitude(complexMagnitude(baseComplex));
    const angle = perturbAngle(complexAngle(baseComplex));

    const n = 1.5 + (i * 0.2) + (Math.random() - 0.5) * 0.1;
    const newMagnitude = Math.pow(magnitude, n) / 100;
    const newAngle = n * angle;

    const real = Math.abs(Math.round(newMagnitude * Math.cos(newAngle))) % 1000;
    const imaginary = Math.abs(Math.round(newMagnitude * Math.sin(newAngle))) % 1000;
    const number = real.toString().padStart(3, '0') + imaginary.toString().padStart(3, '0');
    predictions.push(number);
  }

  return predictions;
};

// Method 11: Real and Imaginary Decomposition (with perturbations)
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

  const avgReal = complexNumbers.reduce((sum, z) => sum + z.real, 0) / complexNumbers.length;
  const avgImag = complexNumbers.reduce((sum, z) => sum + z.imaginary, 0) / complexNumbers.length;
  const avgComplex = createComplex(avgReal, avgImag);
  const conjugate = complexConjugate(avgComplex);

  for (let i = 0; i < 5; i++) {
    const weight = 0.7 + (i * 0.15) + (Math.random() - 0.5) * 0.1;

    const realPart = Math.abs(Math.round((avgComplex.real + conjugate.real) / 2 * weight)) % 1000;
    const imagPart = Math.abs(Math.round((avgComplex.imaginary - conjugate.imaginary) / 2 * weight)) % 1000;

    const recentIdx = Math.min(i, complexNumbers.length - 1);
    const recent = complexNumbers[complexNumbers.length - 1 - recentIdx];
    const mixWeight = 0.2 + Math.random() * 0.2;
    const mixedReal = Math.round((realPart + recent.real * mixWeight)) % 1000;
    const mixedImag = Math.round((imagPart + recent.imaginary * mixWeight)) % 1000;

    const number = mixedReal.toString().padStart(3, '0') + mixedImag.toString().padStart(3, '0');
    predictions.push(number);
  }

  return predictions;
};

// Generate all prediction sets
export const generateAllPredictions = (): PredictionSet[] => {
  const analysis = analyzeHistoricalData();

  return [
    {
      method: "High-Frequency Based",
      description: "Weighted random selection from top 5 most frequent digits per position (recency-weighted)",
      numbers: generateFrequencyBasedPredictions(analysis),
      confidence: "high"
    },
    {
      method: "Probability-Weighted",
      description: "Random selection weighted by historical frequency distribution",
      numbers: generateProbabilityWeightedPredictions(analysis),
      confidence: "medium"
    },
    {
      method: "Trend-Based",
      description: "Based on temporal patterns, hot pairs, and recent trends",
      numbers: generateTrendBasedPredictions(analysis),
      confidence: "medium"
    },
    {
      method: "Hot-Cold Balanced",
      description: "Dynamic mix of hot (60-80%) and cold digits with random variation",
      numbers: generateBalancedPredictions(analysis),
      confidence: "low"
    },
    {
      method: "Pattern Matching",
      description: "Weighted random selection from top 15 adjacent digit pairs",
      numbers: generatePatternMatchingPredictions(analysis),
      confidence: "medium"
    },
    {
      method: "Complex Number Analysis",
      description: "Complex operations with random perturbations on historical data",
      numbers: generateComplexNumberPredictions(analysis),
      confidence: "high"
    },
    {
      method: "Phase & Magnitude Based",
      description: "Phase angles and magnitudes with random variation",
      numbers: generatePhaseBasedPredictions(analysis),
      confidence: "medium"
    },
    {
      method: "Exponential Form (z=|z|e^iθ)",
      description: "Exponential form with perturbed angle and magnitude transformations",
      numbers: generateExponentialFormPredictions(analysis),
      confidence: "high"
    },
    {
      method: "Complex Roots (nth roots)",
      description: "nth root formula with random perturbations for pattern extraction",
      numbers: generateComplexRootsPredictions(analysis),
      confidence: "medium"
    },
    {
      method: "Exponentiation (z^n)",
      description: "Power formula with randomized fractional exponents",
      numbers: generateExponentiationPredictions(analysis),
      confidence: "medium"
    },
    {
      method: "Real/Imaginary Decomposition",
      description: "Component analysis with randomized weights and mixing",
      numbers: generateRealImaginaryDecompositionPredictions(analysis),
      confidence: "high"
    }
  ];
};
