import { lotteryHistory, type LotteryResult } from "@/data/lotteryHistory";

export interface ComplexNumber {
  real: number;
  imag: number;
  magnitude: number;
  phase: number;
  original: string;
}

export interface MagnitudeDistribution {
  mean: number;
  stdDev: number;
  range: [number, number];
  histogram: { bin: string; count: number }[];
}

export interface PhaseDistribution {
  mean: number;
  stdDev: number;
  quadrantDistribution: number[];
}

export interface ComplexRatioAnalysis {
  ratios: ComplexNumber[];
  avgMagnitude: number;
  avgPhase: number;
  clusterCenter: ComplexNumber | null;
}

export interface ComplexJumpAnalysis {
  distances: number[];
  meanDistance: number;
  maxDistance: number;
  minDistance: number;
  histogram: { bin: string; count: number }[];
}

export interface FormulaAccuracy {
  formula: string;
  exactMatches: number;
  last4Matches: number;
  last3Matches: number;
  totalTests: number;
  accuracy: number;
  examples: { predicted: string; actual: string; match: boolean }[];
}

// Convert lottery result to complex number (first 3 digits = real, last 3 = imaginary)
export function toComplexNumber(result: string): ComplexNumber {
  const cleaned = result.replace(/\D/g, "");
  const real = parseInt(cleaned.slice(0, 3)) || 0;
  const imag = parseInt(cleaned.slice(3, 6)) || 0;
  
  const magnitude = Math.sqrt(real * real + imag * imag);
  const phase = Math.atan2(imag, real) * (180 / Math.PI);
  
  return { real, imag, magnitude, phase, original: result };
}

// Complex number multiplication
export function complexMultiply(z1: ComplexNumber, z2: ComplexNumber): ComplexNumber {
  const real = z1.real * z2.real - z1.imag * z2.imag;
  const imag = z1.real * z2.imag + z1.imag * z2.real;
  const magnitude = Math.sqrt(real * real + imag * imag);
  const phase = Math.atan2(imag, real) * (180 / Math.PI);
  
  return { 
    real: Math.round(real) % 1000, 
    imag: Math.round(imag) % 1000, 
    magnitude, 
    phase,
    original: `${Math.abs(Math.round(real) % 1000).toString().padStart(3, '0')}${Math.abs(Math.round(imag) % 1000).toString().padStart(3, '0')}`
  };
}

// Complex number division
export function complexDivide(z1: ComplexNumber, z2: ComplexNumber): ComplexNumber {
  const denominator = z2.real * z2.real + z2.imag * z2.imag;
  if (denominator === 0) {
    return { real: 0, imag: 0, magnitude: 0, phase: 0, original: "000000" };
  }
  
  const real = (z1.real * z2.real + z1.imag * z2.imag) / denominator;
  const imag = (z1.imag * z2.real - z1.real * z2.imag) / denominator;
  const magnitude = Math.sqrt(real * real + imag * imag);
  const phase = Math.atan2(imag, real) * (180 / Math.PI);
  
  return { real, imag, magnitude, phase, original: `${real.toFixed(3)}+${imag.toFixed(3)}i` };
}

// Complex conjugate
export function complexConjugate(z: ComplexNumber): ComplexNumber {
  const magnitude = z.magnitude;
  const phase = -z.phase;
  
  return {
    real: z.real,
    imag: -z.imag,
    magnitude,
    phase,
    original: `${z.real.toString().padStart(3, '0')}${Math.abs(z.imag).toString().padStart(3, '0')}`
  };
}

// Complex negation (mod 1000)
export function complexNegate(z: ComplexNumber): ComplexNumber {
  const real = (1000 - z.real) % 1000;
  const imag = (1000 - z.imag) % 1000;
  const magnitude = Math.sqrt(real * real + imag * imag);
  const phase = Math.atan2(imag, real) * (180 / Math.PI);
  
  return {
    real,
    imag,
    magnitude,
    phase,
    original: `${real.toString().padStart(3, '0')}${imag.toString().padStart(3, '0')}`
  };
}

// Complex addition
export function complexAdd(z1: ComplexNumber, z2: ComplexNumber): ComplexNumber {
  const real = (z1.real + z2.real) % 1000;
  const imag = (z1.imag + z2.imag) % 1000;
  const magnitude = Math.sqrt(real * real + imag * imag);
  const phase = Math.atan2(imag, real) * (180 / Math.PI);
  
  return {
    real,
    imag,
    magnitude,
    phase,
    original: `${real.toString().padStart(3, '0')}${imag.toString().padStart(3, '0')}`
  };
}

// Analyze magnitude distribution
export function analyzeMagnitudeDistribution(): MagnitudeDistribution {
  const complexNumbers = lotteryHistory.map(r => toComplexNumber(r.result));
  const magnitudes = complexNumbers.map(c => c.magnitude);
  
  const mean = magnitudes.reduce((a, b) => a + b, 0) / magnitudes.length;
  const variance = magnitudes.reduce((sum, m) => sum + Math.pow(m - mean, 2), 0) / magnitudes.length;
  const stdDev = Math.sqrt(variance);
  const range: [number, number] = [Math.min(...magnitudes), Math.max(...magnitudes)];
  
  // Create histogram
  const bins = 10;
  const binSize = (range[1] - range[0]) / bins;
  const histogram = Array.from({ length: bins }, (_, i) => {
    const binStart = range[0] + i * binSize;
    const binEnd = binStart + binSize;
    const count = magnitudes.filter(m => m >= binStart && m < binEnd).length;
    return {
      bin: `${Math.round(binStart)}-${Math.round(binEnd)}`,
      count
    };
  });
  
  return { mean, stdDev, range, histogram };
}

// Analyze phase distribution
export function analyzePhaseDistribution(): PhaseDistribution {
  const complexNumbers = lotteryHistory.map(r => toComplexNumber(r.result));
  const phases = complexNumbers.map(c => c.phase);
  
  const mean = phases.reduce((a, b) => a + b, 0) / phases.length;
  const variance = phases.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / phases.length;
  const stdDev = Math.sqrt(variance);
  
  // Quadrant distribution
  const q1 = phases.filter(p => p >= 0 && p < 90).length;
  const q2 = phases.filter(p => p >= 90 && p < 180).length;
  const q3 = phases.filter(p => p >= -180 && p < -90).length;
  const q4 = phases.filter(p => p >= -90 && p < 0).length;
  
  return {
    mean,
    stdDev,
    quadrantDistribution: [q1, q2, q3, q4]
  };
}

// Analyze consecutive complex number ratios
export function analyzeConsecutiveRatios(): ComplexRatioAnalysis {
  const complexNumbers = lotteryHistory.map(r => toComplexNumber(r.result));
  const ratios: ComplexNumber[] = [];
  
  for (let i = 0; i < complexNumbers.length - 1; i++) {
    const ratio = complexDivide(complexNumbers[i + 1], complexNumbers[i]);
    ratios.push(ratio);
  }
  
  const avgMagnitude = ratios.reduce((sum, r) => sum + r.magnitude, 0) / ratios.length;
  const avgPhase = ratios.reduce((sum, r) => sum + r.phase, 0) / ratios.length;
  
  // Find cluster center (average ratio)
  const avgReal = ratios.reduce((sum, r) => sum + r.real, 0) / ratios.length;
  const avgImag = ratios.reduce((sum, r) => sum + r.imag, 0) / ratios.length;
  const clusterCenter = {
    real: avgReal,
    imag: avgImag,
    magnitude: Math.sqrt(avgReal * avgReal + avgImag * avgImag),
    phase: Math.atan2(avgImag, avgReal) * (180 / Math.PI),
    original: `${avgReal.toFixed(2)}+${avgImag.toFixed(2)}i`
  };
  
  return { ratios, avgMagnitude, avgPhase, clusterCenter };
}

// Analyze complex jump distances (|z_{n+1} - z_n|)
export function analyzeComplexJumpDistances(): ComplexJumpAnalysis {
  const complexNumbers = lotteryHistory.map(r => toComplexNumber(r.result));
  const distances: number[] = [];
  
  for (let i = 0; i < complexNumbers.length - 1; i++) {
    const deltaReal = complexNumbers[i + 1].real - complexNumbers[i].real;
    const deltaImag = complexNumbers[i + 1].imag - complexNumbers[i].imag;
    const distance = Math.sqrt(deltaReal * deltaReal + deltaImag * deltaImag);
    distances.push(distance);
  }
  
  const meanDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
  const maxDistance = Math.max(...distances);
  const minDistance = Math.min(...distances);
  
  // Create histogram
  const bins = 10;
  const binSize = (maxDistance - minDistance) / bins;
  const histogram = Array.from({ length: bins }, (_, i) => {
    const binStart = minDistance + i * binSize;
    const binEnd = binStart + binSize;
    const count = distances.filter(d => d >= binStart && d < binEnd).length;
    return {
      bin: `${Math.round(binStart)}-${Math.round(binEnd)}`,
      count
    };
  });
  
  return { distances, meanDistance, maxDistance, minDistance, histogram };
}

// Test formula accuracy
export function testFormulaAccuracy(
  formulaType: "conjugate" | "negate" | "addition" | "ratio" | "custom",
  customFormula?: (z: ComplexNumber, zPrev?: ComplexNumber) => ComplexNumber
): FormulaAccuracy {
  const complexNumbers = lotteryHistory.map(r => toComplexNumber(r.result));
  let exactMatches = 0;
  let last4Matches = 0;
  let last3Matches = 0;
  const examples: { predicted: string; actual: string; match: boolean }[] = [];
  
  for (let i = 1; i < Math.min(complexNumbers.length, 50); i++) {
    let predicted: ComplexNumber;
    
    switch (formulaType) {
      case "conjugate":
        predicted = complexConjugate(complexNumbers[i - 1]);
        break;
      case "negate":
        predicted = complexNegate(complexNumbers[i - 1]);
        break;
      case "addition":
        if (i >= 2) {
          predicted = complexAdd(complexNumbers[i - 1], complexNumbers[i - 2]);
        } else {
          continue;
        }
        break;
      case "ratio":
        if (i >= 2) {
          const ratio = complexDivide(complexNumbers[i - 1], complexNumbers[i - 2]);
          predicted = complexMultiply(complexNumbers[i - 1], ratio);
        } else {
          continue;
        }
        break;
      case "custom":
        if (customFormula) {
          predicted = customFormula(complexNumbers[i - 1], i >= 2 ? complexNumbers[i - 2] : undefined);
        } else {
          continue;
        }
        break;
      default:
        continue;
    }
    
    const predictedStr = `${predicted.real.toString().padStart(3, '0')}${predicted.imag.toString().padStart(3, '0')}`;
    const actualStr = complexNumbers[i].original;
    
    if (predictedStr === actualStr) {
      exactMatches++;
      last4Matches++;
      last3Matches++;
    } else if (predictedStr.slice(-4) === actualStr.slice(-4)) {
      last4Matches++;
      last3Matches++;
    } else if (predictedStr.slice(-3) === actualStr.slice(-3)) {
      last3Matches++;
    }
    
    if (examples.length < 10) {
      examples.push({
        predicted: predictedStr,
        actual: actualStr,
        match: predictedStr === actualStr
      });
    }
  }
  
  const totalTests = Math.min(complexNumbers.length - 1, 50);
  const accuracy = (exactMatches / totalTests) * 100;
  
  return {
    formula: formulaType,
    exactMatches,
    last4Matches,
    last3Matches,
    totalTests,
    accuracy,
    examples
  };
}

// Get all complex numbers for visualization
export function getAllComplexNumbers(): ComplexNumber[] {
  return lotteryHistory.map(r => toComplexNumber(r.result));
}

// Generate predictions based on complex patterns
export function generateComplexPredictions(count: number = 10): string[] {
  const complexNumbers = lotteryHistory.slice(-20).map(r => toComplexNumber(r.result));
  const predictions: string[] = [];
  
  // Use various complex number patterns
  const lastNum = complexNumbers[complexNumbers.length - 1];
  const secondLast = complexNumbers[complexNumbers.length - 2];
  
  // Pattern 1: Ratio-based
  const ratio = complexDivide(lastNum, secondLast);
  let pred1 = complexMultiply(lastNum, ratio);
  predictions.push(`${pred1.real.toString().padStart(3, '0')}${pred1.imag.toString().padStart(3, '0')}`);
  
  // Pattern 2: Average jump
  const jumpAnalysis = analyzeComplexJumpDistances();
  const avgJump = jumpAnalysis.meanDistance;
  const randomAngle = Math.random() * 2 * Math.PI;
  const jumpReal = Math.round(Math.cos(randomAngle) * avgJump) % 1000;
  const jumpImag = Math.round(Math.sin(randomAngle) * avgJump) % 1000;
  const pred2Real = (lastNum.real + Math.abs(jumpReal)) % 1000;
  const pred2Imag = (lastNum.imag + Math.abs(jumpImag)) % 1000;
  predictions.push(`${pred2Real.toString().padStart(3, '0')}${pred2Imag.toString().padStart(3, '0')}`);
  
  // Pattern 3-10: Use magnitude and phase constraints
  const magDist = analyzeMagnitudeDistribution();
  const phaseDist = analyzePhaseDistribution();
  
  for (let i = 0; i < count - 2; i++) {
    // Generate within 1 std dev of mean magnitude
    const magnitude = magDist.mean + (Math.random() - 0.5) * magDist.stdDev;
    const phase = (phaseDist.mean + (Math.random() - 0.5) * phaseDist.stdDev) * (Math.PI / 180);
    
    const real = Math.abs(Math.round(magnitude * Math.cos(phase))) % 1000;
    const imag = Math.abs(Math.round(magnitude * Math.sin(phase))) % 1000;
    
    predictions.push(`${real.toString().padStart(3, '0')}${imag.toString().padStart(3, '0')}`);
  }
  
  return predictions.slice(0, count);
}
