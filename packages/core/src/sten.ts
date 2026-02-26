/**
 * STEN (Standard Ten) Scoring Engine
 * Converts raw scores to STEN scores using normal distribution
 * Mean = 5.5, SD = 2.0, range 1-10
 */

// Inverse cumulative normal distribution (approximation)
function normalInverse(p: number): number {
  // Abramowitz and Stegun approximation
  const a1 = -3.969683028665376e+01;
  const a2 = 2.209460984245205e+02;
  const a3 = -2.759285104469687e+02;
  const a4 = 1.383577518672690e+02;
  const a5 = -3.066479806614716e+01;
  const a6 = 2.506628277459239e+00;
  const b1 = -5.447609879822406e+01;
  const b2 = 1.615858368580409e+02;
  const b3 = -1.556989798598866e+02;
  const b4 = 6.680131188771972e+01;
  const b5 = -1.328068155288572e+01;
  const c1 = -7.784894002430293e-03;
  const c2 = -3.223964580411365e-01;
  const c3 = -2.400758277161838e+00;
  const c4 = -2.549732539343734e+00;
  const c5 = 4.374664141464968e+00;
  const c6 = 2.938163982698783e+00;
  const d1 = 7.784695709041462e-03;
  const d2 = 3.224671290700398e-01;
  const d3 = 2.445134137142996e+00;
  const d4 = 3.754408661907416e+00;
  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  let q, r;
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
      ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q /
      (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
      ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
  }
}

// Cumulative normal distribution
function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - prob : prob;
}

const STEN_MEAN = 5.5;
const STEN_SD = 2.0;

/**
 * Convert raw score to STEN score
 * @param rawScore - The raw score (can be sum of item scores)
 * @param minScore - Minimum possible raw score
 * @param maxScore - Maximum possible raw score
 * @returns STEN score (1-10)
 */
export function rawToSten(rawScore: number, minScore: number, maxScore: number): number {
  if (rawScore <= minScore) return 1;
  if (rawScore >= maxScore) return 10;
  
  // Normalize to 0-1 (proportion of max)
  const proportion = (rawScore - minScore) / (maxScore - minScore);
  
  // Convert to z-score using inverse normal
  const z = normalInverse(proportion);
  
  // Convert to STEN
  const sten = STEN_MEAN + z * STEN_SD;
  
  // Clamp to 1-10
  return Math.max(1, Math.min(10, Math.round(sten)));
}

/**
 * Convert raw score to STEN using cumulative distribution
 * Better for when you have the actual distribution of scores
 * @param rawScore - The raw score
 * @param scores - Array of all possible raw scores to compute percentiles
 */
export function rawToStenFromDistribution(rawScore: number, scores: number[]): number {
  const sorted = [...scores].sort((a, b) => a - b);
  const proportion = sorted.filter(s => s <= rawScore).length / sorted.length;
  const z = normalInverse(proportion);
  const sten = STEN_MEAN + z * STEN_SD;
  return Math.max(1, Math.min(10, Math.round(sten)));
}

/**
 * Calculate STEN from a sum of Likert-scale responses
 * @param responses - Array of Likert responses (1-5 typically)
 * @param minPerItem - Minimum score per item
 * @param maxPerItem - Maximum score per item
 */
export function likertSumToSten(responses: number[], minPerItem: number = 1, maxPerItem: number = 5): number {
  const rawScore = responses.reduce((sum, r) => sum + r, 0);
  const minScore = responses.length * minPerItem;
  const maxScore = responses.length * maxPerItem;
  return rawToSten(rawScore, minScore, maxScore);
}

/**
 * Get the STEN category for interpretation
 */
export function getStenCategory(sten: number): { label: string; description: string } {
  if (sten >= 7) return { label: 'High', description: 'Well above average' };
  if (sten >= 6) return { label: 'Above Average', description: 'Above average' };
  if (sten >= 5) return { label: 'Average', description: 'Average range' };
  if (sten >= 4) return { label: 'Below Average', description: 'Below average' };
  return { label: 'Low', description: 'Well below average' };
}

/**
 * STEN to percentile conversion
 */
export function stenToPercentile(sten: number): number {
  const z = (sten - STEN_MEAN) / STEN_SD;
  return Math.round(normalCDF(z) * 100);
}

export const STEN = {
  MEAN: STEN_MEAN,
  SD: STEN_SD,
  MIN: 1,
  MAX: 10,
};
