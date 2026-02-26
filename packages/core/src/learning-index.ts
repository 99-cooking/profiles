/**
 * Learning Index Composite Score Engine
 * 
 * The Learning Index is a composite of the 4 cognitive subscale raw scores:
 * - Verbal Skill
 * - Verbal Reasoning
 * - Numerical Ability
 * - Numeric Reasoning
 * 
 * Sum of raw scores → converted to STEN
 */

import { rawToSten } from './sten';

/**
 * Calculate Learning Index from 4 cognitive subscale raw scores
 * 
 * @param verbalSkillRaw - Raw score from Verbal Skill subscale
 * @param verbalReasoningRaw - Raw score from Verbal Reasoning subscale  
 * @param numericalAbilityRaw - Raw score from Numerical Ability subscale
 * @param numericReasoningRaw - Raw score from Numeric Reasoning subscale
 * @returns Object with total raw score and STEN score
 */
export function calculateLearningIndex(
  verbalSkillRaw: number,
  verbalReasoningRaw: number,
  numericalAbilityRaw: number,
  numericReasoningRaw: number
): {
  verbalSkillRaw: number;
  verbalReasoningRaw: number;
  numericalAbilityRaw: number;
  numericReasoningRaw: number;
  totalRaw: number;
  stenScore: number;
  percentile: number;
  category: string;
  description: string;
} {
  // Sum of all 4 cognitive raw scores
  const totalRaw = verbalSkillRaw + verbalReasoningRaw + numericalAbilityRaw + numericReasoningRaw;
  
  // Calculate STEN based on expected ranges
  // Assuming ~20 items per subscale, 1-5 range for scoring = 20-100 per subscale
  // Total range: 80-400
  const minTotal = 80;  // 4 scales × 20 items × min score 1
  const maxTotal = 400; // 4 scales × 20 items × max score 5
  
  const stenScore = rawToSten(totalRaw, minTotal, maxTotal);
  const percentile = stenToPercentile(stenScore);
  
  // Get category and description
  const { category, description } = getLearningIndexCategory(stenScore);
  
  return {
    verbalSkillRaw,
    verbalReasoningRaw,
    numericalAbilityRaw,
    numericReasoningRaw,
    totalRaw,
    stenScore,
    percentile,
    category,
    description,
  };
}

/**
 * Calculate Learning Index from an array of cognitive subscale scores
 */
export function calculateLearningIndexFromArray(
  subscaleRawScores: number[] // [verbalSkill, verbalReasoning, numericalAbility, numericReasoning]
): ReturnType<typeof calculateLearningIndex> {
  return calculateLearningIndex(
    subscaleRawScores[0] || 0,
    subscaleRawScores[1] || 0,
    subscaleRawScores[2] || 0,
    subscaleRawScores[3] || 0
  );
}

/**
 * Get category label for Learning Index STEN score
 */
function getLearningIndexCategory(sten: number): { category: string; description: string } {
  if (sten >= 8) {
    return { 
      category: 'Very High', 
      description: 'Exceptional learning capability and cognitive potential' 
    };
  }
  if (sten >= 7) {
    return { 
      category: 'High', 
      description: 'Above average learning capability' 
    };
  }
  if (sten >= 6) {
    return { 
      category: 'Above Average', 
      description: 'Strong learning capability' 
    };
  }
  if (sten >= 5) {
    return { 
      category: 'Average', 
      description: 'Average learning capability for the population' 
    };
  }
  if (sten >= 4) {
    return { 
      category: 'Below Average', 
      description: 'Below average learning capability' 
    };
  }
  return { 
    category: 'Low', 
    description: 'May require additional support or time for complex tasks' 
  };
}

/**
 * Calculate expected Learning Index ranges for different percentiles
 */
export function getLearningIndexNorms(): {
  sten: number;
  rawMin: number;
  rawMax: number;
  percentile: string;
}[] {
  return [
    { sten: 10, rawMin: 356, rawMax: 400, percentile: '99+' },
    { sten: 9, rawMin: 328, rawMax: 355, percentile: '97-98' },
    { sten: 8, rawMin: 300, rawMax: 327, percentile: '91-96' },
    { sten: 7, rawMin: 272, rawMax: 299, percentile: '76-90' },
    { sten: 6, rawMin: 244, rawMax: 271, percentile: '60-75' },
    { sten: 5, rawMin: 216, rawMax: 243, percentile: '40-59' },
    { sten: 4, rawMin: 188, rawMax: 215, percentile: '25-39' },
    { sten: 3, rawMin: 160, rawMax: 187, percentile: '9-24' },
    { sten: 2, rawMin: 132, rawMax: 159, percentile: '2-8' },
    { sten: 1, rawMin: 80, rawMax: 131, percentile: '<2' },
  ];
}

// Helper
function stenToPercentile(sten: number): number {
  const z = (sten - 5.5) / 2;
  return Math.round((1 / (1 + Math.exp(-z * 1.7))) * 100);
}
