import { getAllNonNullResults } from "@/data/lotteryResultsJSON";

export interface PositionalDigitFrequency {
  digit: string;
  frequency: number;
  percentage: string;
}

export interface PositionalAnalysisReport {
  lastUpdated: string;
  totalRecordsAnalyzed: number;
  positionalFrequency: {
    position1: PositionalDigitFrequency[];
    position2: PositionalDigitFrequency[];
    position3: PositionalDigitFrequency[];
    position4: PositionalDigitFrequency[];
    position5: PositionalDigitFrequency[];
    position6: PositionalDigitFrequency[];
  };
  predictions: string[];
  significantChanges: string[];
  updateTrigger: string;
}

/**
 * Performs comprehensive positional frequency analysis on all historical lottery data
 * Analyzes which digits appear most frequently in each of the 6 positions
 */
export const analyzePositionalFrequency = (): PositionalAnalysisReport => {
  const allResults = getAllNonNullResults();
  const totalRecords = allResults.length;

  // Initialize frequency counters for each position (6 positions, 10 digits each)
  const positionFrequencies: Record<number, Record<string, number>> = {};
  for (let pos = 0; pos < 6; pos++) {
    positionFrequencies[pos] = {};
    for (let digit = 0; digit <= 9; digit++) {
      positionFrequencies[pos][digit.toString()] = 0;
    }
  }

  // Count digit frequencies for each position
  allResults.forEach(result => {
    if (result.length === 6) {
      for (let pos = 0; pos < 6; pos++) {
        const digit = result[pos];
        if (digit && digit >= '0' && digit <= '9') {
          positionFrequencies[pos][digit]++;
        }
      }
    }
  });

  // Convert to sorted arrays with percentages
  const createPositionalArray = (posIndex: number): PositionalDigitFrequency[] => {
    return Object.entries(positionFrequencies[posIndex])
      .map(([digit, freq]) => ({
        digit,
        frequency: freq,
        percentage: ((freq / totalRecords) * 100).toFixed(2)
      }))
      .sort((a, b) => b.frequency - a.frequency);
  };

  const positionalFrequency = {
    position1: createPositionalArray(0),
    position2: createPositionalArray(1),
    position3: createPositionalArray(2),
    position4: createPositionalArray(3),
    position5: createPositionalArray(4),
    position6: createPositionalArray(5),
  };

  // Generate predictions based on top 3 digits for each position
  const predictions = generatePositionalPredictions(positionalFrequency);

  // Detect significant changes (close frequency margins)
  const significantChanges: string[] = [];
  Object.entries(positionalFrequency).forEach(([posKey, freqs]) => {
    const posNum = posKey.replace('position', '');
    if (freqs.length >= 2) {
      const top1 = freqs[0];
      const top2 = freqs[1];
      const margin = top1.frequency - top2.frequency;
      const marginPercent = (margin / totalRecords) * 100;
      
      if (marginPercent < 2) {
        significantChanges.push(
          `Position ${posNum}: Digit '${top1.digit}' (${top1.percentage}%) and '${top2.digit}' (${top2.percentage}%) are very close`
        );
      }
    }
  });

  // Find the most recent result for update trigger
  const latestResult = allResults[allResults.length - 1];

  return {
    lastUpdated: new Date().toISOString().split('T')[0],
    totalRecordsAnalyzed: totalRecords,
    positionalFrequency,
    predictions,
    significantChanges,
    updateTrigger: `Analysis includes latest result: ${latestResult}`
  };
};

/**
 * Generates 5 intelligent predictions by cycling through top 3 digits for each position
 */
const generatePositionalPredictions = (
  positionalFrequency: PositionalAnalysisReport['positionalFrequency']
): string[] => {
  const predictions: string[] = [];
  const positions = [
    positionalFrequency.position1,
    positionalFrequency.position2,
    positionalFrequency.position3,
    positionalFrequency.position4,
    positionalFrequency.position5,
    positionalFrequency.position6,
  ];

  // Prediction 1: All top 1 digits
  predictions.push(
    positions.map(pos => pos[0].digit).join('')
  );

  // Prediction 2: Vary position 1 (use top 2)
  const pred2 = [...positions.map(pos => pos[0].digit)];
  pred2[0] = positions[0][1]?.digit || positions[0][0].digit;
  predictions.push(pred2.join(''));

  // Prediction 3: Vary position 2 (use top 2)
  const pred3 = [...positions.map(pos => pos[0].digit)];
  pred3[1] = positions[1][1]?.digit || positions[1][0].digit;
  predictions.push(pred3.join(''));

  // Prediction 4: Vary position 3 (use top 2)
  const pred4 = [...positions.map(pos => pos[0].digit)];
  pred4[2] = positions[2][1]?.digit || positions[2][0].digit;
  predictions.push(pred4.join(''));

  // Prediction 5: Mix of top 2 and top 3 for multiple positions
  const pred5 = [
    positions[0][1]?.digit || positions[0][0].digit,
    positions[1][2]?.digit || positions[1][0].digit,
    positions[2][1]?.digit || positions[2][0].digit,
    positions[3][0].digit,
    positions[4][1]?.digit || positions[4][0].digit,
    positions[5][0].digit,
  ];
  predictions.push(pred5.join(''));

  return predictions;
};

/**
 * Gets hot digits (most frequent) across all positions
 */
export const getHotDigits = (): { digit: string; totalFrequency: number }[] => {
  const allResults = getAllNonNullResults();
  const digitCounts: Record<string, number> = {};
  
  for (let d = 0; d <= 9; d++) {
    digitCounts[d.toString()] = 0;
  }

  allResults.forEach(result => {
    result.split('').forEach(digit => {
      if (digit >= '0' && digit <= '9') {
        digitCounts[digit]++;
      }
    });
  });

  return Object.entries(digitCounts)
    .map(([digit, count]) => ({ digit, totalFrequency: count }))
    .sort((a, b) => b.totalFrequency - a.totalFrequency)
    .slice(0, 5);
};

/**
 * Gets cold digits (least frequent) across all positions
 */
export const getColdDigits = (): { digit: string; totalFrequency: number }[] => {
  const allResults = getAllNonNullResults();
  const digitCounts: Record<string, number> = {};
  
  for (let d = 0; d <= 9; d++) {
    digitCounts[d.toString()] = 0;
  }

  allResults.forEach(result => {
    result.split('').forEach(digit => {
      if (digit >= '0' && digit <= '9') {
        digitCounts[digit]++;
      }
    });
  });

  return Object.entries(digitCounts)
    .map(([digit, count]) => ({ digit, totalFrequency: count }))
    .sort((a, b) => a.totalFrequency - b.totalFrequency)
    .slice(0, 3);
};
