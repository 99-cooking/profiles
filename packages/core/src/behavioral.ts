/**
 * Behavioral Trait Scoring Engine
 * Handles Likert scale and Forced-Choice response formats
 */

import { rawToSten, likertSumToSten } from './sten';

/**
 * Score behavioral trait from Likert responses
 */
export function scoreLikertTrait(
  responses: number[],
  minScore: number = 1,
  maxScore: number = 5
): { raw: number; sten: number; percentile: number } {
  const raw = responses.reduce((sum, r) => sum + r, 0);
  const minPossible = responses.length * minScore;
  const maxPossible = responses.length * maxScore;
  
  const sten = likertSumToSten(responses, minScore, maxScore);
  const percentile = stenToPercentile(sten);
  
  return { raw, sten, percentile };
}

/**
 * Score forced-choice block (MFC - Multidimensional Forced Choice)
 * Each block has items that load on different traits
 * Response indicates preference (1 = first option preferred)
 */
export function scoreForcedChoice(
  responses: { itemId: string; choice: number; traitLoadings: Record<string, number> }[]
): Record<string, { raw: number; sten: number }> {
  // Aggregate scores per trait based on loadings
  const traitScores: Record<string, number[]> = {};
  
  for (const response of responses) {
    const choice = response.choice; // 0 or 1
    const loadings = response.traitLoadings;
    
    for (const [trait, loading] of Object.entries(loadings)) {
      if (!traitScores[trait]) traitScores[trait] = [];
      // Score is loading * choice (higher choice = higher score on that trait)
      traitScores[trait].push(loading * (choice === 1 ? 1 : -1));
    }
  }
  
  // Convert to STEN per trait
  const results: Record<string, { raw: number; sten: number }> = {};
  for (const [trait, scores] of Object.entries(traitScores)) {
    const raw = scores.reduce((sum, s) => sum + s, 0);
    // Normalize to 1-5 range then convert to STEN
    const normalizedScores = scores.map(s => (s + 1) / 2 * 4 + 1); // Map to 1-5
    const sten = likertSumToSten(normalizedScores, 1, 5);
    results[trait] = { raw, sten };
  }
  
  return results;
}

/**
 * Score mixed format behavioral section
 * Combines Likert and forced-choice blocks
 */
export function scoreBehavioralSection(
  likertResponses: Record<string, number[]>,  // scaleId -> responses
  forcedChoiceResponses: { itemId: string; choice: number; loadings: Record<string, number> }[]
): Record<string, { raw: number; sten: number; percentile: number }> {
  const scores: Record<string, { raw: number; sten: number; percentile: number }> = {};
  
  // Score Likert items per scale
  for (const [scaleId, responses] of Object.entries(likertResponses)) {
    scores[scaleId] = scoreLikertTrait(responses);
  }
  
  // Score forced-choice items
  const fcScores = scoreForcedChoice(forcedChoiceResponses);
  
  // Merge FC scores with Likert scores (weighted average)
  for (const [scaleId, fcScore] of Object.entries(fcScores)) {
    if (scores[scaleId]) {
      // Weighted: 70% Likert, 30% forced-choice
      const weightedRaw = scores[scaleId].raw * 0.7 + fcScore.raw * 0.3;
      const weightedSten = Math.round(scores[scaleId].sten * 0.7 + fcScore.sten * 0.3);
      scores[scaleId] = {
        raw: weightedRaw,
        sten: weightedSten,
        percentile: stenToPercentile(weightedSten),
      };
    } else {
      scores[scaleId] = {
        raw: fcScore.raw,
        sten: fcScore.sten,
        percentile: stenToPercentile(fcScore.sten),
      };
    }
  }
  
  return scores;
}

// Helper
function stenToPercentile(sten: number): number {
  const z = (sten - 5.5) / 2;
  return Math.round((1 / (1 + Math.exp(-z * 1.7))) * 100);
}
