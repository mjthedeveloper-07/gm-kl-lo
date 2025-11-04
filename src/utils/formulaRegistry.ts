import { lotteryHistory } from "@/data/lotteryHistory";
import { analyzeHistoricalData, type PredictionSet } from "./predictionGenerator";
import { generateComplexPredictions } from "./complexNumberAnalysis";
import { generateMirrorPredictions } from "./mirrorNumberAnalysis";
import * as predictionGenerator from "./predictionGenerator";

/**
 * Centralized Formula Registry
 * All lottery prediction formulas are registered here for easy management
 */

export type FormulaCategory = 
  | "mirror" 
  | "complex" 
  | "frequency" 
  | "pattern" 
  | "statistical" 
  | "advanced" 
  | "temporal";

export interface Formula {
  id: string;
  name: string;
  category: FormulaCategory;
  description: string;
  confidence: "high" | "medium" | "low";
  requiresInput?: boolean;
  inputType?: "mcNumber" | "none";
  execute: (input?: any) => string[] | PredictionSet[];
}

// ============= FORMULA REGISTRY =============

export const FORMULAS: Formula[] = [
  // MIRROR NUMBER FORMULAS
  {
    id: "mirror-basic",
    name: "Mirror Number (Power Numbers)",
    category: "mirror",
    description: "Uses power number mapping with position-specific patterns and draw time analysis",
    confidence: "high",
    requiresInput: true,
    inputType: "mcNumber",
    execute: (mcNumber: string) => {
      if (!mcNumber) return [];
      const predictions = generateMirrorPredictions(mcNumber, undefined, undefined, 10);
      return predictions.map(p => p.number);
    }
  },

  // COMPLEX NUMBER FORMULAS
  {
    id: "complex-general",
    name: "Complex Number Analysis",
    category: "complex",
    description: "Applies complex number operations (conjugate, negate, ratio, addition)",
    confidence: "high",
    execute: () => generateComplexPredictions(10)
  },
  {
    id: "complex-phase",
    name: "Phase-Based Complex Analysis",
    category: "complex",
    description: "Analyzes phase and magnitude of complex numbers",
    confidence: "medium",
    execute: () => {
      const analysis = analyzeHistoricalData();
      return predictionGenerator.generatePhaseBasedPredictions(analysis);
    }
  },
  {
    id: "complex-exponential",
    name: "Exponential Form Complex",
    category: "complex",
    description: "Uses exponential form representation of complex numbers",
    confidence: "medium",
    execute: () => {
      const analysis = analyzeHistoricalData();
      return predictionGenerator.generateExponentialFormPredictions(analysis);
    }
  },
  {
    id: "complex-roots",
    name: "Complex Roots Analysis",
    category: "complex",
    description: "Applies nth root formula to complex numbers",
    confidence: "medium",
    execute: () => {
      const analysis = analyzeHistoricalData();
      return predictionGenerator.generateComplexRootsPredictions(analysis);
    }
  },
  {
    id: "complex-power",
    name: "Complex Exponentiation",
    category: "complex",
    description: "Uses power formula for complex numbers",
    confidence: "medium",
    execute: () => {
      const analysis = analyzeHistoricalData();
      return predictionGenerator.generateExponentiationPredictions(analysis);
    }
  },
  {
    id: "complex-decomposition",
    name: "Real-Imaginary Decomposition",
    category: "complex",
    description: "Decomposes complex numbers into real and imaginary parts",
    confidence: "medium",
    execute: () => {
      const analysis = analyzeHistoricalData();
      return predictionGenerator.generateRealImaginaryDecompositionPredictions(analysis);
    }
  },

  // FREQUENCY-BASED FORMULAS
  {
    id: "frequency-basic",
    name: "Frequency Analysis",
    category: "frequency",
    description: "Uses top digits from positional frequency analysis",
    confidence: "high",
    execute: () => {
      const analysis = analyzeHistoricalData();
      return predictionGenerator.generateFrequencyBasedPredictions(analysis);
    }
  },
  {
    id: "frequency-ultra-high",
    name: "Ultra High Frequency",
    category: "frequency",
    description: "Focuses on the most frequent digits per position",
    confidence: "high",
    execute: () => {
      const analysis = analyzeHistoricalData();
      return predictionGenerator.generateUltraHighFrequencyPredictions(analysis);
    }
  },
  {
    id: "frequency-hot-numbers",
    name: "Hot Numbers",
    category: "frequency",
    description: "Identifies and combines currently trending digits",
    confidence: "medium",
    execute: () => {
      const analysis = analyzeHistoricalData();
      return predictionGenerator.generateFrequencyBasedPredictions(analysis);
    }
  },

  // PATTERN-BASED FORMULAS
  {
    id: "pattern-matching",
    name: "Pattern Matching",
    category: "pattern",
    description: "Utilizes common adjacent digit pairs",
    confidence: "high",
    execute: () => {
      const analysis = analyzeHistoricalData();
      return predictionGenerator.generatePatternMatchingPredictions(analysis);
    }
  },
  {
    id: "pattern-last4",
    name: "Last 4 Digits Pattern",
    category: "pattern",
    description: "Analyzes frequent last 4-digit patterns",
    confidence: "high",
    execute: () => {
      const analysis = analyzeHistoricalData();
      return predictionGenerator.generateLast4DigitsHighProbabilityPredictions(analysis);
    }
  },
  {
    id: "pattern-abc-board",
    name: "Control Number ABC Board",
    category: "pattern",
    description: "Combines sequences from ABC Board pattern",
    confidence: "medium",
    execute: () => {
      const analysis = analyzeHistoricalData();
      return predictionGenerator.generateControlNumberABCBoardPredictions(analysis);
    }
  },
  {
    id: "pattern-day-of-week",
    name: "Day of Week ABC Pattern",
    category: "pattern",
    description: "Uses day-of-week specific patterns",
    confidence: "medium",
    execute: () => {
      const analysis = analyzeHistoricalData();
      return predictionGenerator.generateDayOfWeekABCPredictions(analysis);
    }
  },

  // STATISTICAL FORMULAS
  {
    id: "statistical-probability",
    name: "Probability Weighted",
    category: "statistical",
    description: "Uses weighted random selection based on historical frequencies",
    confidence: "high",
    execute: () => {
      const analysis = analyzeHistoricalData();
      return predictionGenerator.generateProbabilityWeightedPredictions(analysis);
    }
  },
  {
    id: "statistical-trend",
    name: "Trend Analysis",
    category: "statistical",
    description: "Incorporates temporal patterns and digit pairs",
    confidence: "medium",
    execute: () => {
      const analysis = analyzeHistoricalData();
      return predictionGenerator.generateTrendBasedPredictions(analysis);
    }
  },
  {
    id: "statistical-balanced",
    name: "Balanced Hot/Cold",
    category: "statistical",
    description: "Balances hot and cold digits",
    confidence: "medium",
    execute: () => {
      const analysis = analyzeHistoricalData();
      return predictionGenerator.generateBalancedPredictions(analysis);
    }
  },

  // ADVANCED FORMULAS
  {
    id: "advanced-formula1",
    name: "Formula 1 (Lookup Table)",
    category: "advanced",
    description: "Applies lookup table formula based on latest result",
    confidence: "high",
    execute: () => {
      const analysis = analyzeHistoricalData();
      return predictionGenerator.generateFormula1Predictions(analysis);
    }
  },
  {
    id: "advanced-formula2",
    name: "Formula 2 (Lookup Table)",
    category: "advanced",
    description: "Applies second lookup table formula",
    confidence: "high",
    execute: () => {
      const analysis = analyzeHistoricalData();
      return predictionGenerator.generateFormula2Predictions(analysis);
    }
  },
  {
    id: "advanced-sum45",
    name: "Sum 45 Formula",
    category: "advanced",
    description: "Generates permutations of digits 0-9 that sum to 45",
    confidence: "low",
    execute: () => {
      const analysis = analyzeHistoricalData();
      return predictionGenerator.generateSum45Predictions(analysis);
    }
  },
];

// ============= UTILITY FUNCTIONS =============

/**
 * Get all formulas
 */
export const getAllFormulas = (): Formula[] => {
  return FORMULAS;
};

/**
 * Get formulas by category
 */
export const getFormulasByCategory = (category: FormulaCategory): Formula[] => {
  return FORMULAS.filter(f => f.category === category);
};

/**
 * Get formula by ID
 */
export const getFormulaById = (id: string): Formula | undefined => {
  return FORMULAS.find(f => f.id === id);
};

/**
 * Get all formula categories
 */
export const getCategories = (): FormulaCategory[] => {
  return Array.from(new Set(FORMULAS.map(f => f.category)));
};

/**
 * Execute a formula by ID
 */
export const executeFormula = (id: string, input?: any): string[] | PredictionSet[] => {
  const formula = getFormulaById(id);
  if (!formula) {
    console.warn(`Formula with id "${id}" not found`);
    return [];
  }
  
  try {
    return formula.execute(input);
  } catch (error) {
    console.error(`Error executing formula "${id}":`, error);
    return [];
  }
};

/**
 * Execute all formulas and return results
 */
export const executeAllFormulas = (mcNumber?: string): Map<string, string[]> => {
  const results = new Map<string, string[]>();
  
  FORMULAS.forEach(formula => {
    try {
      let predictions: string[];
      
      if (formula.requiresInput && formula.inputType === "mcNumber") {
        if (!mcNumber) return;
        const result = formula.execute(mcNumber);
        predictions = Array.isArray(result) && typeof result[0] === 'string' 
          ? result as string[]
          : [];
      } else {
        const result = formula.execute();
        predictions = Array.isArray(result) && typeof result[0] === 'string'
          ? result as string[]
          : [];
      }
      
      results.set(formula.id, predictions);
    } catch (error) {
      console.error(`Error executing formula "${formula.id}":`, error);
    }
  });
  
  return results;
};

/**
 * Get formula statistics
 */
export const getFormulaStats = () => {
  const totalFormulas = FORMULAS.length;
  const byCategory = getCategories().map(category => ({
    category,
    count: getFormulasByCategory(category).length
  }));
  const byConfidence = {
    high: FORMULAS.filter(f => f.confidence === "high").length,
    medium: FORMULAS.filter(f => f.confidence === "medium").length,
    low: FORMULAS.filter(f => f.confidence === "low").length,
  };
  const requiresInput = FORMULAS.filter(f => f.requiresInput).length;
  
  return {
    totalFormulas,
    byCategory,
    byConfidence,
    requiresInput,
    noInput: totalFormulas - requiresInput
  };
};
