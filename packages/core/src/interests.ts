/**
 * Occupational Interest Scoring Engine
 * Handles ipsative (forced-choice) → normative STEN conversion
 */

import { STEN } from './sten';

export interface InterestPair {
  optionA: string;
  optionB: string;
  scaleA: string;
  scaleB: string;
}

export interface InterestResponse {
  pairId: string;
  choice: 'A' | 'B';
}

/**
 * Score occupational interests from forced-choice pairs
 * 
 * Algorithm:
 * 1. Count wins per scale (ipsative score)
 * 2. Convert to relative ranking
 * 3. Convert to normative STEN using normal distribution
 */
export function scoreInterests(
  responses: InterestResponse[],
  pairs: InterestPair[]
): Record<string, { rawScore: number; rank: number; sten: number; percentile: number }> {
  // Initialize ipsative scores (count of wins per scale)
  const ipsativeScores: Record<string, number> = {};
  
  for (const pair of pairs) {
    ipsativeScores[pair.scaleA] = 0;
    ipsativeScores[pair.scaleB] = 0;
  }
  
  // Count wins
  for (const response of responses) {
    const pair = pairs.find(p => p.pairId === response.pairId);
    if (!pair) continue;
    
    if (response.choice === 'A') {
      ipsativeScores[pair.scaleA]++;
    } else {
      ipsativeScores[pair.scaleB]++;
    }
  }
  
  // Convert to ranks (1-6)
  const scales = Object.keys(ipsativeScores);
  const sortedScales = [...scales].sort((a, b) => ipsativeScores[b] - ipsativeScores[a]);
  const ranks: Record<string, number> = {};
  
  for (let i = 0; i < sortedScales.length; i++) {
    ranks[sortedScales[i]] = i + 1;
  }
  
  // Convert to normative STEN
  const results: Record<string, { rawScore: number; rank: number; sten: number; percentile: number }> = {};
  
  for (const scale of scales) {
    const rawScore = ipsativeScores[scale];
    const rank = ranks[scale];
    
    // Convert rank to percentile (e.g., rank 1 = ~92%, rank 6 = ~8%)
    const percentile = ((scales.length - rank + 0.5) / scales.length) * 100;
    
    // Convert percentile to STEN
    const sten = percentileToSten(percentile);
    
    results[scale] = { rawScore, rank, sten, percentile };
  }
  
  return results;
}

/**
 * Get top 3 interests from scored results
 */
export function getTopInterests(
  scores: Record<string, { rawScore: number; rank: number; sten: number; percentile: number }>
): string[] {
  return Object.entries(scores)
    .sort((a, b) => b[1].sten - a[1].sten) // Higher STEN = more interested
    .slice(0, 3)
    .map(([scale]) => scale);
}

/**
 * Calculate interest match between candidate and performance model
 * Uses rank-order comparison of top 3 interests
 */
export function calculateInterestMatch(
  candidateScores: Record<string, { rawScore: number; rank: number; sten: number; percentile: number }>,
  modelTopInterests: string[]
): number {
  const candidateTop = getTopInterests(candidateScores);
  
  // Count matches in top 3
  let matches = 0;
  for (let i = 0; i < Math.min(3, modelTopInterests.length); i++) {
    if (candidateTop[i] === modelTopInterests[i]) {
      matches++;
    }
  }
  
  // Convert to percentage (0, 33, 67, or 100)
  return Math.round((matches / 3) * 100);
}

// Helper: percentile to STEN using approximation
function percentileToSten(percentile: number): number {
  // Approximate inverse normal CDF
  const z = probit(percentile / 100);
  // Convert to STEN: mean=5.5, SD=2.0
  const sten = STEN.MEAN + z * STEN.SD;
  return Math.max(1, Math.min(10, Math.round(sten)));
}

// Probit function (approximate inverse CDF)
function probit(p: number): number {
  if (p <= 0) return -4;
  if (p >= 1) return 4;
  if (p === 0.5) return 0;
  
  // Rational approximation for normal inverse
  const a = [
    -3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02,
    1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00
  ];
  const b = [
    -5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02,
    6.680131188771972e+01, -1.328068155288572e+01
  ];
  
  const q = p - 0.5;
  const r = q * q;
  
  const num = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q;
  const den = ((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1;
  
  return num / den;
}
