import type { LotteryResult } from "@/utils/databaseQueries";

export interface DigitGap {
  digit: string;
  position: number;
  daysSinceLastSeen: number;
  lastSeenDate: string;
  averageGap: number;
  isOverdue: boolean;
  overdueLevel: "normal" | "warning" | "critical";
}

export interface PatternGap {
  pattern: string;
  type: "pair" | "triplet" | "last4";
  daysSinceLastSeen: number;
  lastSeenDate: string;
  occurrences: number;
  averageGap: number;
  isOverdue: boolean;
}

export interface GapAnalysisResult {
  digitGaps: DigitGap[][];
  patternGaps: PatternGap[];
  overdueDigits: DigitGap[];
  overduePatterns: PatternGap[];
  hotZones: {
    position: number;
    digits: string[];
    reason: string;
  }[];
}

// Calculate gap statistics for each digit in each position
export const analyzeDigitGaps = (lotteryHistory: LotteryResult[]): DigitGap[][] => {
  const sortedHistory = [...lotteryHistory].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const positionGaps: DigitGap[][] = [];

  for (let position = 0; position < 6; position++) {
    const digitGaps: DigitGap[] = [];

    for (let digit = 0; digit <= 9; digit++) {
      const digitStr = digit.toString();
      let lastSeenIndex = -1;
      const gaps: number[] = [];
      let lastGapStart = 0;

      // Find all occurrences of this digit in this position
      sortedHistory.forEach((result, index) => {
        if (result.result[position] === digitStr) {
          if (lastSeenIndex >= 0) {
            gaps.push(index - lastSeenIndex);
          }
          lastSeenIndex = index;
          lastGapStart = index;
        }
      });

      const currentGap = lastSeenIndex >= 0 ? lastSeenIndex : sortedHistory.length;
      const averageGap = gaps.length > 0 
        ? gaps.reduce((sum, g) => sum + g, 0) / gaps.length 
        : 30;

      const stdDev = gaps.length > 1
        ? Math.sqrt(gaps.reduce((sum, g) => sum + Math.pow(g - averageGap, 2), 0) / gaps.length)
        : 10;

      const overdueThreshold = averageGap + stdDev;
      const isOverdue = currentGap > overdueThreshold;

      let overdueLevel: "normal" | "warning" | "critical" = "normal";
      if (currentGap > averageGap + (2 * stdDev)) {
        overdueLevel = "critical";
      } else if (isOverdue) {
        overdueLevel = "warning";
      }

      digitGaps.push({
        digit: digitStr,
        position: position + 1,
        daysSinceLastSeen: currentGap,
        lastSeenDate: lastSeenIndex >= 0 ? sortedHistory[lastSeenIndex].date : "Never",
        averageGap,
        isOverdue,
        overdueLevel
      });
    }

    positionGaps.push(digitGaps.sort((a, b) => b.daysSinceLastSeen - a.daysSinceLastSeen));
  }

  return positionGaps;
};

// Analyze pattern gaps (pairs, triplets, last 4 digits)
export const analyzePatternGaps = (lotteryHistory: LotteryResult[]): PatternGap[] => {
  const sortedHistory = [...lotteryHistory].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const patternMap = new Map<string, { lastSeen: number; occurrences: number[]; type: "pair" | "triplet" | "last4" }>();

  // Track pairs
  sortedHistory.forEach((result, index) => {
    for (let i = 0; i < 5; i++) {
      const pair = result.result.slice(i, i + 2);
      const key = `pair_${pair}`;
      if (!patternMap.has(key)) {
        patternMap.set(key, { lastSeen: -1, occurrences: [], type: "pair" });
      }
      const data = patternMap.get(key)!;
      if (data.lastSeen >= 0) {
        data.occurrences.push(index - data.lastSeen);
      }
      data.lastSeen = index;
    }

    // Track triplets
    for (let i = 0; i < 4; i++) {
      const triplet = result.result.slice(i, i + 3);
      const key = `triplet_${triplet}`;
      if (!patternMap.has(key)) {
        patternMap.set(key, { lastSeen: -1, occurrences: [], type: "triplet" });
      }
      const data = patternMap.get(key)!;
      if (data.lastSeen >= 0) {
        data.occurrences.push(index - data.lastSeen);
      }
      data.lastSeen = index;
    }

    // Track last 4 digits
    const last4 = result.result.slice(-4);
    const key = `last4_${last4}`;
    if (!patternMap.has(key)) {
      patternMap.set(key, { lastSeen: -1, occurrences: [], type: "last4" });
    }
    const data = patternMap.get(key)!;
    if (data.lastSeen >= 0) {
      data.occurrences.push(index - data.lastSeen);
    }
    data.lastSeen = index;
  });

  // Convert to PatternGap array
  const patternGaps: PatternGap[] = [];
  patternMap.forEach((data, key) => {
    const [type, pattern] = key.split('_');
    const currentGap = data.lastSeen >= 0 ? data.lastSeen : sortedHistory.length;
    const averageGap = data.occurrences.length > 0
      ? data.occurrences.reduce((sum, g) => sum + g, 0) / data.occurrences.length
      : 50;

    const stdDev = data.occurrences.length > 1
      ? Math.sqrt(data.occurrences.reduce((sum, g) => sum + Math.pow(g - averageGap, 2), 0) / data.occurrences.length)
      : 15;

    const isOverdue = currentGap > (averageGap + stdDev);

    patternGaps.push({
      pattern,
      type: data.type,
      daysSinceLastSeen: currentGap,
      lastSeenDate: data.lastSeen >= 0 ? sortedHistory[data.lastSeen].date : "Never",
      occurrences: data.occurrences.length,
      averageGap,
      isOverdue
    });
  });

  return patternGaps.sort((a, b) => b.daysSinceLastSeen - a.daysSinceLastSeen);
};

// Generate comprehensive gap analysis
export const performGapAnalysis = (lotteryHistory: LotteryResult[]): GapAnalysisResult => {
  const digitGaps = analyzeDigitGaps(lotteryHistory);
  const patternGaps = analyzePatternGaps(lotteryHistory);

  // Find overdue digits (top 10)
  const overdueDigits = digitGaps
    .flat()
    .filter(d => d.isOverdue)
    .sort((a, b) => {
      if (a.overdueLevel === b.overdueLevel) {
        return b.daysSinceLastSeen - a.daysSinceLastSeen;
      }
      return a.overdueLevel === "critical" ? -1 : 1;
    })
    .slice(0, 15);

  // Find overdue patterns (top 20)
  const overduePatterns = patternGaps
    .filter(p => p.isOverdue && p.occurrences >= 3)
    .slice(0, 20);

  // Identify hot zones (positions with multiple overdue digits)
  const hotZones: { position: number; digits: string[]; reason: string }[] = [];
  for (let pos = 0; pos < 6; pos++) {
    const posOverdue = digitGaps[pos].filter(d => d.isOverdue);
    if (posOverdue.length >= 3) {
      hotZones.push({
        position: pos + 1,
        digits: posOverdue.slice(0, 5).map(d => d.digit),
        reason: `${posOverdue.length} overdue digits in position ${pos + 1}`
      });
    }
  }

  return {
    digitGaps,
    patternGaps,
    overdueDigits,
    overduePatterns,
    hotZones
  };
};

// Generate predictions based on gap analysis
export const generateGapBasedPredictions = (gapAnalysis: GapAnalysisResult): string[] => {
  const predictions: string[] = [];

  // Method 1: Use most overdue digit per position
  let prediction1 = "";
  for (let pos = 0; pos < 6; pos++) {
    const mostOverdue = gapAnalysis.digitGaps[pos]
      .filter(d => d.isOverdue)
      .sort((a, b) => b.daysSinceLastSeen - a.daysSinceLastSeen)[0];
    
    prediction1 += mostOverdue?.digit || gapAnalysis.digitGaps[pos][0].digit;
  }
  predictions.push(prediction1);

  // Method 2: Mix overdue and hot digits
  let prediction2 = "";
  for (let pos = 0; pos < 6; pos++) {
    const overdue = gapAnalysis.digitGaps[pos].filter(d => d.isOverdue);
    const hotDigit = overdue[Math.floor(Math.random() * Math.min(3, overdue.length))]?.digit;
    prediction2 += hotDigit || gapAnalysis.digitGaps[pos][0].digit;
  }
  predictions.push(prediction2);

  // Method 3: Use overdue patterns
  const overduePairs = gapAnalysis.overduePatterns.filter(p => p.type === "pair").slice(0, 3);
  if (overduePairs.length >= 3) {
    const prediction3 = (overduePairs[0].pattern + overduePairs[1].pattern + overduePairs[2].pattern).slice(0, 6);
    predictions.push(prediction3.padEnd(6, '0'));
  }

  // Method 4: Hot zone focus
  if (gapAnalysis.hotZones.length > 0) {
    let prediction4 = "";
    for (let pos = 0; pos < 6; pos++) {
      const hotZone = gapAnalysis.hotZones.find(hz => hz.position === pos + 1);
      if (hotZone) {
        prediction4 += hotZone.digits[Math.floor(Math.random() * hotZone.digits.length)];
      } else {
        const overdue = gapAnalysis.digitGaps[pos].filter(d => d.isOverdue)[0];
        prediction4 += overdue?.digit || gapAnalysis.digitGaps[pos][0].digit;
      }
    }
    predictions.push(prediction4);
  }

  // Method 5: Critical overdue focus
  const criticalDigits = gapAnalysis.overdueDigits.filter(d => d.overdueLevel === "critical");
  if (criticalDigits.length >= 4) {
    let prediction5 = "";
    for (let pos = 0; pos < 6; pos++) {
      const critical = criticalDigits.find(d => d.position === pos + 1);
      prediction5 += critical?.digit || gapAnalysis.digitGaps[pos][0].digit;
    }
    predictions.push(prediction5);
  }

  return [...new Set(predictions)].slice(0, 5);
};
