import { lotteryHistory } from "@/data/lotteryHistory";
import { getDigitFrequency } from "./lotteryAnalysis";

export interface MonteCarloResult {
  simulations: number;
  digitComparison: Array<{
    digit: string;
    actualFrequency: number;
    expectedMean: number;
    confidenceInterval95: { lower: number; upper: number };
    deviationScore: number;
    isAnomaly: boolean;
  }>;
  overallDeviation: number;
  anomalyCount: number;
}

/**
 * Monte Carlo Simulation
 * Simulates thousands of random lottery draws and compares with actual data
 * Identifies statistically significant deviations from pure randomness
 */
export function runMonteCarloSimulation(numSimulations: number = 10000): MonteCarloResult {
  const actualFrequencies = getDigitFrequency();
  const totalDraws = lotteryHistory.length;
  const digitsPerDraw = 6;
  const totalDigits = totalDraws * digitsPerDraw;
  
  // Run simulations
  const simulationResults: number[][] = [];
  
  for (let sim = 0; sim < numSimulations; sim++) {
    const digitCounts = new Array(10).fill(0);
    
    // Simulate random draws
    for (let draw = 0; draw < totalDraws; draw++) {
      for (let pos = 0; pos < digitsPerDraw; pos++) {
        const randomDigit = Math.floor(Math.random() * 10);
        digitCounts[randomDigit]++;
      }
    }
    
    simulationResults.push(digitCounts);
  }
  
  // Calculate statistics from simulations
  const digitComparison = actualFrequencies.map(freq => {
    const digit = parseInt(freq.digit);
    const actualCount = freq.count;
    const actualFrequency = freq.percentage;
    
    // Extract simulation counts for this digit
    const simCounts = simulationResults.map(sim => sim[digit]);
    
    // Calculate mean and standard deviation
    const mean = simCounts.reduce((a, b) => a + b, 0) / numSimulations;
    const variance = simCounts.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) / numSimulations;
    const stdDev = Math.sqrt(variance);
    
    // 95% confidence interval (±1.96 * stdDev)
    const marginOfError = 1.96 * stdDev;
    const confidenceInterval95 = {
      lower: mean - marginOfError,
      upper: mean + marginOfError
    };
    
    // Deviation score (z-score)
    const deviationScore = Math.abs((actualCount - mean) / stdDev);
    
    // Anomaly detection: outside 95% confidence interval
    const isAnomaly = actualCount < confidenceInterval95.lower || actualCount > confidenceInterval95.upper;
    
    return {
      digit: freq.digit,
      actualFrequency,
      expectedMean: (mean / totalDigits) * 100,
      confidenceInterval95: {
        lower: (confidenceInterval95.lower / totalDigits) * 100,
        upper: (confidenceInterval95.upper / totalDigits) * 100
      },
      deviationScore,
      isAnomaly
    };
  });
  
  // Overall deviation metric
  const overallDeviation = digitComparison.reduce((sum, d) => sum + d.deviationScore, 0) / 10;
  const anomalyCount = digitComparison.filter(d => d.isAnomaly).length;
  
  return {
    simulations: numSimulations,
    digitComparison,
    overallDeviation,
    anomalyCount
  };
}

/**
 * Compare actual distribution with simulated confidence bands
 */
export function compareWithConfidenceBands(): {
  digit: string;
  actual: number;
  lowerBound: number;
  upperBound: number;
  status: "within" | "above" | "below";
}[] {
  const mcResult = runMonteCarloSimulation(5000);
  
  return mcResult.digitComparison.map(d => {
    let status: "within" | "above" | "below";
    if (d.actualFrequency > d.confidenceInterval95.upper) status = "above";
    else if (d.actualFrequency < d.confidenceInterval95.lower) status = "below";
    else status = "within";
    
    return {
      digit: d.digit,
      actual: d.actualFrequency,
      lowerBound: d.confidenceInterval95.lower,
      upperBound: d.confidenceInterval95.upper,
      status
    };
  });
}

/**
 * Quick simulation test (100 runs) for performance
 */
export function quickMonteCarloTest(): {
  randomnessScore: number; // 0-100, higher = more random
  interpretation: string;
} {
  const result = runMonteCarloSimulation(100);
  
  // Score based on deviation (lower deviation = more random)
  const randomnessScore = Math.max(0, 100 - (result.overallDeviation * 10));
  
  let interpretation: string;
  if (randomnessScore > 90) interpretation = "Highly random - consistent with fair lottery";
  else if (randomnessScore > 75) interpretation = "Mostly random - minor deviations detected";
  else if (randomnessScore > 60) interpretation = "Moderate randomness - some patterns present";
  else interpretation = "Low randomness - significant deviations from expected";
  
  return {
    randomnessScore: Math.round(randomnessScore),
    interpretation
  };
}
