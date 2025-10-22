import { getDigitFrequency } from "./lotteryAnalysis";
import { analyzeHistoricalData } from "./predictionGenerator";

export interface DigitCluster {
  clusterId: number;
  clusterName: "Hot" | "Warm" | "Neutral" | "Cool" | "Cold";
  digits: string[];
  centroid: number[];
  avgFrequency: number;
}

export interface ClusteringResult {
  clusters: DigitCluster[];
  silhouetteScore: number;
  quality: "excellent" | "good" | "fair" | "poor";
}

interface FeatureVector {
  digit: string;
  features: number[];
}

/**
 * K-Means Clustering for lottery digits
 * Clusters digits based on multiple statistical features
 */
export function kMeansClustering(k: number = 5): ClusteringResult {
  const featureVectors = calculateFeatureVectors();
  
  // Initialize centroids randomly
  let centroids = initializeCentroids(featureVectors, k);
  let assignments: number[] = new Array(featureVectors.length);
  let iterations = 0;
  const maxIterations = 100;
  
  // K-means iteration
  while (iterations < maxIterations) {
    const newAssignments = assignToNearestCentroid(featureVectors, centroids);
    
    // Check for convergence
    if (arraysEqual(newAssignments, assignments)) {
      break;
    }
    
    assignments = newAssignments;
    centroids = updateCentroids(featureVectors, assignments, k);
    iterations++;
  }
  
  // Build cluster objects
  const clusters: DigitCluster[] = [];
  const clusterNames: ("Hot" | "Warm" | "Neutral" | "Cool" | "Cold")[] = 
    ["Hot", "Warm", "Neutral", "Cool", "Cold"];
  
  for (let i = 0; i < k; i++) {
    const clusterDigits = featureVectors
      .filter((_, idx) => assignments[idx] === i)
      .map(fv => fv.digit);
    
    const avgFrequency = clusterDigits.reduce((sum, digit) => {
      const freq = getDigitFrequency().find(f => f.digit === digit);
      return sum + (freq?.percentage || 0);
    }, 0) / clusterDigits.length;
    
    clusters.push({
      clusterId: i,
      clusterName: clusterNames[i] || "Neutral",
      digits: clusterDigits,
      centroid: centroids[i],
      avgFrequency
    });
  }
  
  // Sort clusters by average frequency (descending)
  clusters.sort((a, b) => b.avgFrequency - a.avgFrequency);
  
  // Reassign cluster names based on sorted order
  clusters.forEach((cluster, idx) => {
    cluster.clusterId = idx;
    cluster.clusterName = clusterNames[idx] || "Neutral";
  });
  
  // Calculate silhouette score
  const silhouetteScore = calculateSilhouetteScore(featureVectors, assignments, centroids);
  
  let quality: "excellent" | "good" | "fair" | "poor";
  if (silhouetteScore > 0.7) quality = "excellent";
  else if (silhouetteScore > 0.5) quality = "good";
  else if (silhouetteScore > 0.3) quality = "fair";
  else quality = "poor";
  
  return {
    clusters,
    silhouetteScore,
    quality
  };
}

/**
 * Calculate multi-dimensional feature vectors for each digit
 * Features:
 * 1. Overall frequency (normalized)
 * 2. Recent frequency (30-day window)
 * 3. Momentum score
 * 4. Positional dominance
 * 5. Pair association strength
 */
export function calculateFeatureVectors(): FeatureVector[] {
  const digitFreqs = getDigitFrequency();
  const analysis = analyzeHistoricalData();
  
  return digitFreqs.map(freq => {
    const digit = freq.digit;
    
    // Feature 1: Overall frequency (0-1 normalized)
    const overallFreq = freq.percentage / 100;
    
    // Feature 2: Recent frequency (from recentFrequency array)
    const recentData = analysis.recentFrequency.find(rf => rf.digit === digit);
    const recentFreq = recentData ? recentData.weight / 100 : 0;
    
    // Feature 3: Momentum score (from momentumDigits array)
    const momentumData = analysis.momentumDigits.find(m => m.digit === digit);
    const momentum = momentumData ? momentumData.momentum : 0;
    
    // Feature 4: Positional dominance (appears in top 3 of how many positions)
    let positionalDominance = 0;
    analysis.positionalAnalysis.forEach(posData => {
      const topThree = posData.slice(0, 3);
      if (topThree.some(f => f.digit === digit)) {
        positionalDominance++;
      }
    });
    const normalizedDominance = positionalDominance / 6;
    
    // Feature 5: Pair association strength (how many strong pair associations)
    const pairStrength = analysis.digitPairs
      .filter(pair => pair.pair.includes(digit))
      .reduce((sum, pair) => sum + pair.frequency, 0) / 100;
    
    return {
      digit,
      features: [overallFreq, recentFreq, momentum, normalizedDominance, pairStrength]
    };
  });
}

/**
 * Initialize centroids using K-means++ algorithm
 */
function initializeCentroids(vectors: FeatureVector[], k: number): number[][] {
  const centroids: number[][] = [];
  
  // First centroid: random
  const firstIdx = Math.floor(Math.random() * vectors.length);
  centroids.push([...vectors[firstIdx].features]);
  
  // Remaining centroids: probability weighted by distance
  while (centroids.length < k) {
    const distances = vectors.map(v => {
      const minDist = Math.min(...centroids.map(c => euclideanDistance(v.features, c)));
      return minDist * minDist;
    });
    
    const totalDist = distances.reduce((a, b) => a + b, 0);
    const probabilities = distances.map(d => d / totalDist);
    
    const rand = Math.random();
    let cumSum = 0;
    let selectedIdx = 0;
    
    for (let i = 0; i < probabilities.length; i++) {
      cumSum += probabilities[i];
      if (rand <= cumSum) {
        selectedIdx = i;
        break;
      }
    }
    
    centroids.push([...vectors[selectedIdx].features]);
  }
  
  return centroids;
}

/**
 * Assign each vector to nearest centroid
 */
function assignToNearestCentroid(vectors: FeatureVector[], centroids: number[][]): number[] {
  return vectors.map(v => {
    let minDist = Infinity;
    let nearestCluster = 0;
    
    centroids.forEach((centroid, idx) => {
      const dist = euclideanDistance(v.features, centroid);
      if (dist < minDist) {
        minDist = dist;
        nearestCluster = idx;
      }
    });
    
    return nearestCluster;
  });
}

/**
 * Update centroids based on current assignments
 */
function updateCentroids(vectors: FeatureVector[], assignments: number[], k: number): number[][] {
  const newCentroids: number[][] = [];
  
  for (let i = 0; i < k; i++) {
    const clusterVectors = vectors.filter((_, idx) => assignments[idx] === i);
    
    if (clusterVectors.length === 0) {
      // Empty cluster: reinitialize randomly
      const randomIdx = Math.floor(Math.random() * vectors.length);
      newCentroids.push([...vectors[randomIdx].features]);
    } else {
      const featureCount = clusterVectors[0].features.length;
      const centroid = new Array(featureCount).fill(0);
      
      clusterVectors.forEach(v => {
        v.features.forEach((feature, idx) => {
          centroid[idx] += feature;
        });
      });
      
      centroid.forEach((_, idx) => {
        centroid[idx] /= clusterVectors.length;
      });
      
      newCentroids.push(centroid);
    }
  }
  
  return newCentroids;
}

/**
 * Calculate Euclidean distance between two feature vectors
 */
function euclideanDistance(a: number[], b: number[]): number {
  return Math.sqrt(
    a.reduce((sum, val, idx) => sum + Math.pow(val - b[idx], 2), 0)
  );
}

/**
 * Calculate Silhouette score for clustering quality
 */
function calculateSilhouetteScore(
  vectors: FeatureVector[], 
  assignments: number[], 
  centroids: number[][]
): number {
  let totalScore = 0;
  
  vectors.forEach((v, idx) => {
    const clusterIdx = assignments[idx];
    
    // Calculate a(i): average distance to points in same cluster
    const sameCluster = vectors.filter((_, i) => assignments[i] === clusterIdx && i !== idx);
    const a = sameCluster.length === 0 ? 0 : 
      sameCluster.reduce((sum, other) => sum + euclideanDistance(v.features, other.features), 0) / sameCluster.length;
    
    // Calculate b(i): average distance to points in nearest other cluster
    let minAvgDist = Infinity;
    centroids.forEach((_, otherClusterIdx) => {
      if (otherClusterIdx === clusterIdx) return;
      
      const otherCluster = vectors.filter((_, i) => assignments[i] === otherClusterIdx);
      if (otherCluster.length === 0) return;
      
      const avgDist = otherCluster.reduce((sum, other) => 
        sum + euclideanDistance(v.features, other.features), 0) / otherCluster.length;
      
      minAvgDist = Math.min(minAvgDist, avgDist);
    });
    
    const b = minAvgDist;
    
    // Silhouette coefficient for this point
    const s = (b - a) / Math.max(a, b);
    totalScore += s;
  });
  
  return totalScore / vectors.length;
}

/**
 * Helper: check if two arrays are equal
 */
function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, idx) => val === b[idx]);
}
