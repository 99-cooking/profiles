/**
 * Distortion Scale Detection Engine
 * Identifies "faking good" via statistically improbable responses
 * 
 * Thresholds:
 * - STEN 7-10: Acceptable, candid responses
 * - STEN 3-6: Somewhat polished, flag for interview probing  
 * - STEN 1-2: Invalid data, should not be used for decisions
 */

import { likertSumToSten, STEN } from './sten';

export interface DistortionResult {
  stenScore: number;
  category: 'valid' | 'warning' | 'invalid';
  label: string;
  description: string;
  responseConsistency: number; // 0-100
}

/**
 * Detect response distortion from embedded social desirability items
 * 
 * @param responses - Array of Likert responses (1-5) on distortion items
 * @returns Distortion detection result with STEN score and validity category
 */
export function detectDistortion(responses: number[]): DistortionResult {
  // Calculate raw score (sum of responses)
  // Distortion items are socially desirable statements
  // High scores = "too good" = potential distortion
  const rawScore = responses.reduce((sum, r) => sum + r, 0);
  const n = responses.length;
  
  // Calculate STEN score
  // For distortion items, higher score = more distorted (selecting "agree/strongly agree" to positive statements)
  const stenScore = likertSumToSten(responses, 1, 5);
  
  // Determine category based on STEN thresholds
  let category: 'valid' | 'warning' | 'invalid';
  let label: string;
  let description: string;
  
  if (stenScore >= 7) {
    category = 'invalid';
    label = 'Invalid - Highly Distorted';
    description = 'Response pattern is statistically improbable. Results should not be used for decisions.';
  } else if (stenScore >= 4) {
    category = 'warning';
    label = 'Somewhat Polished';
    description = 'Responses show mild social desirability bias. Consider probing during interview.';
  } else {
    category = 'valid';
    label = 'Acceptable - Candid';
    description = 'Response pattern is consistent with honest responding.';
  }
  
  // Calculate response consistency (variance-based)
  // Low variance = all responses similar = potential response bias
  const mean = rawScore / n;
  const variance = responses.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);
  
  // Consistency: low variance = low consistency (0-100)
  // Expected stdDev for honest responders ~1.0-1.5
  const responseConsistency = Math.min(100, Math.max(0, (stdDev / 1.5) * 100));
  
  return {
    stenScore,
    category,
    label,
    description,
    responseConsistency,
  };
}

/**
 * Check for response patterns across all behavioral items
 * Detects: straight-lining, alternating patterns, random responding
 */
export function detectResponsePatterns(responses: number[]): {
  isStraightLine: boolean;
  isAlternating: boolean;
  isRandom: boolean;
  recommendation: string;
} {
  const n = responses.length;
  if (n < 5) {
    return {
      isStraightLine: false,
      isAlternating: false,
      isRandom: false,
      recommendation: 'insufficient_data',
    };
  }
  
  // Check for straight-lining (all same response)
  const first = responses[0];
  const isStraightLine = responses.every(r => r === first);
  
  // Check for alternating pattern (1,2,1,2,1,2 or 1,3,1,3...)
  let alternatingCount = 0;
  for (let i = 1; i < n; i += 2) {
    if (responses[i] === responses[i - 1]) alternatingCount++;
  }
  const isAlternating = alternatingCount / Math.ceil(n / 2) > 0.8;
  
  // Check for randomness using runs test (simplified)
  let runs = 1;
  for (let i = 1; i < n; i++) {
    if (responses[i] !== responses[i - 1]) runs++;
  }
  const expectedRuns = (2 * n - 1) / 3;
  const isRandom = Math.abs(runs - expectedRuns) < 0.3 * expectedRuns;
  
  let recommendation = 'acceptable';
  if (isStraightLine) recommendation = 'review';
  if (isAlternating) recommendation = 'review';
  if (isRandom) recommendation = 'caution';
  
  return {
    isStraightLine,
    isAlternating,
    isRandom,
    recommendation,
  };
}

/**
 * Combined validity check
 */
export function checkResponseValidity(
  distortionResponses: number[],
  allBehavioralResponses: number[]
): {
  valid: boolean;
  distortion: DistortionResult;
  patterns: ReturnType<typeof detectResponsePatterns>;
  recommendation: 'use' | 'interview' | 'discard';
} {
  const distortion = detectDistortion(distortionResponses);
  const patterns = detectResponsePatterns(allBehavioralResponses);
  
  let recommendation: 'use' | 'interview' | 'discard';
  
  if (distortion.category === 'invalid' || patterns.recommendation === 'caution') {
    recommendation = 'discard';
  } else if (distortion.category === 'warning' || patterns.recommendation === 'review') {
    recommendation = 'interview';
  } else {
    recommendation = 'use';
  }
  
  return {
    valid: recommendation === 'use',
    distortion,
    patterns,
    recommendation,
  };
}
