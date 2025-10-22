import { StatisticalAnalysis } from "./predictionGenerator";
import { chiSquareGoodnessOfFit, linearRegressionAnalysis, temporalTrendAnalysis } from "./statisticalTests";
import { runMonteCarloSimulation } from "./monteCarloSimulation";
import { calculateAutocorrelation } from "./timeSeriesAnalysis";
import { kMeansClustering } from "./advancedClustering";

/**
 * Statistical Consensus Predictions
 * Combines Chi-Square, Monte Carlo, and Regression analysis
 * Weights digits based on multiple statistical tests
 */
export function generateStatisticalConsensusPredictions(analysis: StatisticalAnalysis): string[] {
  const predictions: string[] = [];
  
  // Get statistical test results
  const chiSquare = chiSquareGoodnessOfFit();
  const monteCarlo = runMonteCarloSimulation(1000); // Quick simulation
  const regression = linearRegressionAnalysis();
  const temporal = temporalTrendAnalysis();
  
  // Score each digit based on multiple criteria
  const digitScores = new Map<string, number>();
  
  for (let digit = 0; digit <= 9; digit++) {
    const digitStr = digit.toString();
    let score = 0;
    
    // 1. Chi-Square deviation (favor digits that deviate from uniformity)
    const chiDev = chiSquare.digitDeviations.find(d => d.digit === digitStr);
    if (chiDev && chiDev.significance === "high") {
      score += 3;
    } else if (chiDev && chiDev.significance === "medium") {
      score += 2;
    }
    
    // 2. Monte Carlo anomaly detection
    const mcData = monteCarlo.digitComparison.find(d => d.digit === digitStr);
    if (mcData) {
      // Favor digits above expected frequency
      if (mcData.actualFrequency > mcData.expectedMean) {
        score += (mcData.actualFrequency - mcData.expectedMean) * 10;
      }
    }
    
    // 3. Regression trend (favor increasing trends)
    const regData = regression.find(r => r.digit === digitStr);
    if (regData) {
      if (regData.trend === "increasing") {
        score += regData.significance * 5;
      }
    }
    
    // 4. Temporal momentum
    const tempData = temporal.find(t => t.digit === digitStr);
    if (tempData) {
      if (tempData.momentum === "strong_up") score += 4;
      else if (tempData.momentum === "up") score += 2;
    }
    
    // 5. Base frequency from analysis
    const freqData = analysis.topFrequentDigits.find(f => f.digit === digitStr);
    if (freqData) {
      score += freqData.percentage / 10;
    }
    
    digitScores.set(digitStr, score);
  }
  
  // Sort digits by score
  const rankedDigits = Array.from(digitScores.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([digit]) => digit);
  
  // Generate 5 predictions using different strategies
  for (let i = 0; i < 5; i++) {
    let prediction = "";
    
    // Strategy varies by index
    if (i === 0) {
      // Pure consensus: top 6 digits by statistical agreement
      prediction = rankedDigits.slice(0, 6).join("");
    } else if (i === 1) {
      // High scorers with position weighting
      const positions = analysis.positionalAnalysis;
      for (let pos = 0; pos < 6; pos++) {
        const topAtPos = positions[pos].slice(0, 3).map(p => p.digit);
        const highScorer = rankedDigits.find(d => topAtPos.includes(d));
        prediction += highScorer || rankedDigits[pos];
      }
    } else if (i === 2) {
      // Mix high and medium scorers
      const top3 = rankedDigits.slice(0, 3);
      const mid3 = rankedDigits.slice(3, 6);
      prediction = shuffleArray([...top3, ...mid3]).join("");
    } else if (i === 3) {
      // Weighted random selection
      prediction = generateWeightedRandom(digitScores, 6);
    } else {
      // Temporal momentum focused
      const momentumDigits = temporal
        .filter(t => t.momentum === "strong_up" || t.momentum === "up")
        .map(t => t.digit)
        .slice(0, 6);
      
      if (momentumDigits.length >= 6) {
        prediction = momentumDigits.join("");
      } else {
        prediction = [...momentumDigits, ...rankedDigits]
          .filter((d, idx, arr) => arr.indexOf(d) === idx)
          .slice(0, 6)
          .join("");
      }
    }
    
    predictions.push(prediction.padEnd(6, rankedDigits[0]));
  }
  
  return predictions;
}

/**
 * Hybrid Statistical-ML Predictions
 * Combines all 7 statistical methods with ML clustering
 * Ensemble voting with confidence weighting
 */
export function generateHybridStatisticalMLPredictions(analysis: StatisticalAnalysis): string[] {
  const predictions: string[] = [];
  
  // Get all statistical and ML results
  const chiSquare = chiSquareGoodnessOfFit();
  const monteCarlo = runMonteCarloSimulation(1000);
  const regression = linearRegressionAnalysis();
  const temporal = temporalTrendAnalysis();
  const autocorr = calculateAutocorrelation();
  const clustering = kMeansClustering(5);
  
  // Build comprehensive digit profiles
  const digitProfiles = new Map<string, {
    chiSquareScore: number;
    monteCarloScore: number;
    regressionScore: number;
    temporalScore: number;
    autocorrScore: number;
    clusterScore: number;
    frequencyScore: number;
    totalScore: number;
  }>();
  
  for (let digit = 0; digit <= 9; digit++) {
    const digitStr = digit.toString();
    
    // Chi-Square score
    const chiDev = chiSquare.digitDeviations.find(d => d.digit === digitStr);
    const chiSquareScore = chiDev ? chiDev.deviation : 0;
    
    // Monte Carlo score
    const mcData = monteCarlo.digitComparison.find(d => d.digit === digitStr);
    const monteCarloScore = mcData ? mcData.deviationScore : 0;
    
    // Regression score
    const regData = regression.find(r => r.digit === digitStr);
    const regressionScore = regData ? Math.abs(regData.slope) * regData.rSquared * 10 : 0;
    
    // Temporal score
    const tempData = temporal.find(t => t.digit === digitStr);
    let temporalScore = 0;
    if (tempData) {
      if (tempData.momentum === "strong_up") temporalScore = 5;
      else if (tempData.momentum === "up") temporalScore = 3;
      else if (tempData.momentum === "stable") temporalScore = 1;
    }
    
    // Autocorrelation score
    const autocorrData = autocorr.find(a => a.digit === digitStr);
    const autocorrScore = autocorrData && autocorrData.hasSignificantCorrelation ? 3 : 0;
    
    // Cluster score (Hot cluster = high score)
    const cluster = clustering.clusters.find(c => c.digits.includes(digitStr));
    let clusterScore = 0;
    if (cluster) {
      if (cluster.clusterName === "Hot") clusterScore = 5;
      else if (cluster.clusterName === "Warm") clusterScore = 4;
      else if (cluster.clusterName === "Neutral") clusterScore = 2;
    }
    
    // Frequency score
    const freqData = analysis.topFrequentDigits.find(f => f.digit === digitStr);
    const frequencyScore = freqData ? freqData.percentage / 10 : 0;
    
    // Weighted total score (ensemble voting)
    const totalScore = 
      chiSquareScore * 0.15 +
      monteCarloScore * 0.20 +
      regressionScore * 0.15 +
      temporalScore * 0.15 +
      autocorrScore * 0.10 +
      clusterScore * 0.15 +
      frequencyScore * 0.10;
    
    digitProfiles.set(digitStr, {
      chiSquareScore,
      monteCarloScore,
      regressionScore,
      temporalScore,
      autocorrScore,
      clusterScore,
      frequencyScore,
      totalScore
    });
  }
  
  // Rank digits by ensemble score
  const rankedDigits = Array.from(digitProfiles.entries())
    .sort((a, b) => b[1].totalScore - a[1].totalScore)
    .map(([digit]) => digit);
  
  // Generate 5 diverse predictions
  for (let i = 0; i < 5; i++) {
    let prediction = "";
    
    if (i === 0) {
      // Pure ensemble: top 6 by total score
      prediction = rankedDigits.slice(0, 6).join("");
      
    } else if (i === 1) {
      // Cluster-aware selection: prioritize hot cluster
      const hotCluster = clustering.clusters.find(c => c.clusterName === "Hot");
      const warmCluster = clustering.clusters.find(c => c.clusterName === "Warm");
      
      const hotDigits = hotCluster ? hotCluster.digits : [];
      const warmDigits = warmCluster ? warmCluster.digits : [];
      
      const selected = [...hotDigits.slice(0, 4), ...warmDigits.slice(0, 2)]
        .filter((d, idx, arr) => arr.indexOf(d) === idx)
        .slice(0, 6);
      
      prediction = selected.join("").padEnd(6, rankedDigits[0]);
      
    } else if (i === 2) {
      // Position-optimized: use positional analysis + ensemble scores
      for (let pos = 0; pos < 6; pos++) {
        const topAtPos = analysis.positionalAnalysis[pos]
          .slice(0, 5)
          .map(p => p.digit);
        
        // Find highest ensemble score digit that's top at this position
        const bestDigit = rankedDigits.find(d => 
          topAtPos.includes(d) && !prediction.includes(d)
        ) || rankedDigits.find(d => !prediction.includes(d)) || rankedDigits[pos];
        
        prediction += bestDigit;
      }
      
    } else if (i === 3) {
      // Momentum + Regression focused
      const trendingUp = regression
        .filter(r => r.trend === "increasing")
        .sort((a, b) => b.significance - a.significance)
        .map(r => r.digit)
        .slice(0, 6);
      
      prediction = trendingUp.join("").padEnd(6, rankedDigits[0]);
      
    } else {
      // Monte Carlo + Chi-Square focused (statistical purity)
      const mcTop = monteCarlo.digitComparison
        .sort((a, b) => b.actualFrequency - a.actualFrequency)
        .map(d => d.digit)
        .slice(0, 6);
      
      prediction = mcTop.join("");
    }
    
    predictions.push(prediction);
  }
  
  return predictions;
}

// Helper functions
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateWeightedRandom(scores: Map<string, number>, count: number): string {
  const digits: string[] = [];
  const weights = Array.from(scores.entries());
  const totalWeight = weights.reduce((sum, [, weight]) => sum + weight, 0);
  
  while (digits.length < count) {
    const random = Math.random() * totalWeight;
    let cumulative = 0;
    
    for (const [digit, weight] of weights) {
      cumulative += weight;
      if (random <= cumulative && !digits.includes(digit)) {
        digits.push(digit);
        break;
      }
    }
    
    // Fallback if no digit selected
    if (digits.length === digits.filter(d => d).length) {
      const available = Array.from(scores.keys()).find(d => !digits.includes(d));
      if (available) digits.push(available);
    }
  }
  
  return digits.join("");
}
