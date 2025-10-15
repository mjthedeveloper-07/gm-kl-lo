import { lotteryHistory } from "@/data/lotteryHistory";

export interface WeightedFrequency {
  digit: string;
  frequency: number;
  weightedFrequency: number;
  percentage: number;
}

export interface DigitGapAnalysis {
  digit: string;
  avgGap: number;
  currentGap: number;
  isDue: boolean;
  weight: number;
}

export interface SumRangeAnalysis {
  optimalMin: number;
  optimalMax: number;
  avgSum: number;
}

// Calculate weighted frequency with exponential decay for recency
export const getWeightedPositionalFrequency = (position: number, days: number = 90): WeightedFrequency[] => {
  const allNumbers = lotteryHistory.map(r => r.result).reverse(); // Most recent first
  const digitCounts: { [key: string]: { count: number; weightedCount: number } } = {};
  
  for (let i = 0; i <= 9; i++) {
    digitCounts[i.toString()] = { count: 0, weightedCount: 0 };
  }
  
  const relevantNumbers = allNumbers.slice(0, days);
  
  relevantNumbers.forEach((num, index) => {
    const digit = num[position];
    if (digit) {
      // Exponential decay: most recent has weight 1.0, oldest has weight ~0.25
      const recencyWeight = Math.exp(-index / (days / 3));
      digitCounts[digit].count++;
      digitCounts[digit].weightedCount += recencyWeight;
    }
  });
  
  const totalWeighted = Object.values(digitCounts).reduce((sum, d) => sum + d.weightedCount, 0);
  
  return Object.entries(digitCounts)
    .map(([digit, data]) => ({
      digit,
      frequency: data.count,
      weightedFrequency: data.weightedCount,
      percentage: Math.round((data.weightedCount / totalWeighted) * 100)
    }))
    .sort((a, b) => b.weightedFrequency - a.weightedFrequency);
};

// Analyze gaps between digit appearances
export const analyzeDigitGaps = (position: number): DigitGapAnalysis[] => {
  const allNumbers = lotteryHistory.map(r => r.result).reverse();
  const lastSeen: { [key: string]: number } = {};
  const gaps: { [key: string]: number[] } = {};
  
  for (let i = 0; i <= 9; i++) {
    gaps[i.toString()] = [];
    lastSeen[i.toString()] = -1;
  }
  
  allNumbers.forEach((num, index) => {
    const digit = num[position];
    if (digit) {
      if (lastSeen[digit] !== -1) {
        gaps[digit].push(index - lastSeen[digit]);
      }
      lastSeen[digit] = index;
    }
  });
  
  return Object.entries(gaps)
    .map(([digit, gapArray]) => {
      const avgGap = gapArray.length > 0 
        ? gapArray.reduce((sum, g) => sum + g, 0) / gapArray.length 
        : 999;
      const currentGap = lastSeen[digit] !== -1 ? allNumbers.length - lastSeen[digit] : 999;
      const isDue = currentGap > avgGap * 1.2; // 20% threshold
      const weight = isDue ? Math.min(currentGap / avgGap, 3) : 0.5;
      
      return { digit, avgGap, currentGap, isDue, weight };
    })
    .sort((a, b) => b.weight - a.weight);
};

// Analyze optimal sum ranges
export const analyzeSumRanges = (): SumRangeAnalysis => {
  const allNumbers = lotteryHistory.map(r => r.result).slice(-100); // Last 100 draws
  const sums = allNumbers.map(num => 
    num.split("").reduce((sum, d) => sum + parseInt(d), 0)
  );
  
  const avgSum = sums.reduce((sum, s) => sum + s, 0) / sums.length;
  const stdDev = Math.sqrt(
    sums.reduce((sum, s) => sum + Math.pow(s - avgSum, 2), 0) / sums.length
  );
  
  return {
    optimalMin: Math.round(avgSum - stdDev),
    optimalMax: Math.round(avgSum + stdDev),
    avgSum: Math.round(avgSum)
  };
};

// Method 8: Positional Hot/Cold Analysis
export const generatePositionalHotColdPredictions = (): string[] => {
  const predictions: string[] = [];
  
  for (let variant = 0; variant < 5; variant++) {
    let number = "";
    for (let pos = 0; pos < 6; pos++) {
      const weighted = getWeightedPositionalFrequency(pos, 60);
      const gapAnalysis = analyzeDigitGaps(pos);
      
      // Alternate between hot and due digits
      if (variant === 0) {
        // All hot digits
        number += weighted[0].digit;
      } else if (variant === 1) {
        // All due digits
        const dueDigits = gapAnalysis.filter(d => d.isDue);
        number += dueDigits.length > 0 ? dueDigits[0].digit : weighted[0].digit;
      } else {
        // Mix hot and due
        if (pos % 2 === 0) {
          number += weighted[variant % weighted.length].digit;
        } else {
          const dueDigits = gapAnalysis.filter(d => d.isDue);
          number += dueDigits.length > pos ? dueDigits[pos].digit : weighted[0].digit;
        }
      }
    }
    predictions.push(number);
  }
  
  return predictions;
};

// Method 9: Gap Analysis Based Predictions
export const generateGapBasedPredictions = (): string[] => {
  const predictions: string[] = [];
  
  for (let variant = 0; variant < 5; variant++) {
    let number = "";
    for (let pos = 0; pos < 6; pos++) {
      const gapAnalysis = analyzeDigitGaps(pos);
      const weighted = getWeightedPositionalFrequency(pos, 60);
      
      // Select digit based on gap weight and variant
      const dueDigits = gapAnalysis.filter(d => d.isDue);
      if (dueDigits.length > variant) {
        number += dueDigits[variant].digit;
      } else {
        number += weighted[variant % weighted.length].digit;
      }
    }
    predictions.push(number);
  }
  
  return predictions;
};

// Method 10: Sum Range Optimization
export const generateSumOptimizedPredictions = (): string[] => {
  const predictions: string[] = [];
  const sumAnalysis = analyzeSumRanges();
  const maxAttempts = 100;
  
  for (let variant = 0; variant < 5; variant++) {
    let attempts = 0;
    let number = "";
    
    while (attempts < maxAttempts) {
      number = "";
      for (let pos = 0; pos < 6; pos++) {
        const weighted = getWeightedPositionalFrequency(pos, 60);
        // Use weighted random selection
        const totalWeight = weighted.reduce((sum, d) => sum + d.weightedFrequency, 0);
        let random = Math.random() * totalWeight;
        
        for (const digitData of weighted) {
          random -= digitData.weightedFrequency;
          if (random <= 0) {
            number += digitData.digit;
            break;
          }
        }
        
        if (number.length !== pos + 1) {
          number += weighted[0].digit;
        }
      }
      
      // Check if sum is in optimal range
      const sum = number.split("").reduce((s, d) => s + parseInt(d), 0);
      if (sum >= sumAnalysis.optimalMin && sum <= sumAnalysis.optimalMax) {
        break;
      }
      attempts++;
    }
    
    if (number.length === 6) {
      predictions.push(number);
    }
  }
  
  // Fill remaining with weighted predictions if needed
  while (predictions.length < 5) {
    let number = "";
    for (let pos = 0; pos < 6; pos++) {
      const weighted = getWeightedPositionalFrequency(pos, 60);
      number += weighted[predictions.length % weighted.length].digit;
    }
    predictions.push(number);
  }
  
  return [...new Set(predictions)].slice(0, 5);
};

// Enhanced Complex Number Predictions with Weighted Recency
export const generateEnhancedComplexPredictions = (): string[] => {
  const predictions: string[] = [];
  const allNumbers = lotteryHistory.map(r => r.result).reverse();
  
  // Use only recent 30 draws with exponential weighting
  const recentNumbers = allNumbers.slice(0, 30);
  const weights = recentNumbers.map((_, i) => Math.exp(-i / 10));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  
  // Calculate weighted average complex number
  let avgReal = 0;
  let avgImag = 0;
  
  recentNumbers.forEach((num, i) => {
    const digits = num.split("").map(Number);
    const real = digits.slice(0, 3).reduce((sum, d) => sum * 10 + d, 0);
    const imaginary = digits.slice(3, 6).reduce((sum, d) => sum * 10 + d, 0);
    const weight = weights[i] / totalWeight;
    
    avgReal += real * weight;
    avgImag += imaginary * weight;
  });
  
  // Generate predictions using weighted average
  for (let i = 0; i < 5; i++) {
    let real: number, imag: number;
    
    if (i === 0) {
      // Weighted average
      real = Math.round(avgReal);
      imag = Math.round(avgImag);
    } else if (i === 1) {
      // Phase shift
      const mag = Math.sqrt(avgReal * avgReal + avgImag * avgImag);
      const angle = Math.atan2(avgImag, avgReal) + Math.PI / 6;
      real = Math.round(mag * Math.cos(angle));
      imag = Math.round(mag * Math.sin(angle));
    } else if (i === 2) {
      // Conjugate with momentum
      const momentum = (recentNumbers[0].split("").reduce((s, d) => s + parseInt(d), 0)) / 30;
      real = Math.round(avgReal * (1 + momentum * 0.1));
      imag = Math.round(-avgImag);
    } else if (i === 3) {
      // Golden ratio scaling
      const phi = 1.618033988749895;
      real = Math.round(avgReal / phi);
      imag = Math.round(avgImag * phi);
    } else {
      // Harmonic mean
      real = Math.round(avgReal * 0.8);
      imag = Math.round(avgImag * 1.2);
    }
    
    const realPart = Math.abs(real) % 1000;
    const imagPart = Math.abs(imag) % 1000;
    const number = realPart.toString().padStart(3, '0') + imagPart.toString().padStart(3, '0');
    predictions.push(number);
  }
  
  return predictions;
};

// Calculate confidence score based on multiple factors
export const calculateConfidence = (prediction: string, method: string): "high" | "medium" | "low" => {
  const digits = prediction.split("");
  const sum = digits.reduce((s, d) => s + parseInt(d), 0);
  const sumAnalysis = analyzeSumRanges();
  const unique = new Set(digits).size;
  
  let score = 50; // Base score
  
  // Sum in optimal range: +20 points
  if (sum >= sumAnalysis.optimalMin && sum <= sumAnalysis.optimalMax) {
    score += 20;
  } else if (sum >= sumAnalysis.optimalMin - 3 && sum <= sumAnalysis.optimalMax + 3) {
    score += 10;
  }
  
  // Digit diversity: +15 points for 5-6 unique digits
  if (unique >= 5) score += 15;
  else if (unique === 4) score += 10;
  else if (unique === 3) score += 5;
  
  // Method-specific adjustments
  if (method.includes("Gap") || method.includes("Hot/Cold")) {
    score += 10; // These methods track patterns well
  }
  if (method.includes("Complex") || method.includes("Sum")) {
    score += 5; // Mathematical rigor
  }
  
  if (score >= 75) return "high";
  if (score >= 55) return "medium";
  return "low";
};