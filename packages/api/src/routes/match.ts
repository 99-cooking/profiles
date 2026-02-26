/**
 * Job Match API Routes
 * Calculate match between candidate assessment and performance models
 */

import { Hono } from 'hono';
import { db } from '@profiles/db';
import { 
  assessments, scaleScores, performanceModels, performanceModelScales, scales, candidates 
} from '@profiles/db/schema';
import { eq, and } from 'drizzle-orm';

const matchApp = new Hono();

/**
 * Calculate distance penalty for a scale
 * d_i = max(0, L_i - S_i) + max(0, S_i - U_i)
 * Then apply compounding penalty
 */
function calculateScalePenalty(
  candidateSten: number,
  targetMin: number,
  targetMax: number
): { penalty: number; distance: number; withinRange: boolean } {
  const below = Math.max(0, targetMin - candidateSten);
  const above = Math.max(0, candidateSten - targetMax);
  const distance = below + above;
  const withinRange = distance === 0;
  
  // Compounding penalty: each STEN unit outside adds increasing penalty
  // Formula: penalty = 1 - (0.15 * distance + 0.05 * distance^2)
  const penalty = 1 - (0.15 * distance + 0.05 * distance * distance);
  
  return {
    penalty: Math.max(0, penalty),
    distance,
    withinRange,
  };
}

/**
 * Calculate cognitive match score
 */
async function calculateCognitiveMatch(
  assessmentId: string,
  modelScales: any[]
): Promise<{ fit: number; details: any[] }> {
  const cognitiveScaleIds = ['verbal_skill', 'verbal_reasoning', 'numerical_ability', 'numeric_reasoning', 'learning_index'];
  
  const details: any[] = [];
  let totalFit = 0;
  let weightSum = 0;
  
  for (const modelScale of modelScales) {
    if (!cognitiveScaleIds.includes(modelScale.scaleId)) continue;
    
    const score = await db.select().from(scaleScores)
      .where(and(
        eq(scaleScores.assessmentId, assessmentId),
        eq(scaleScores.scaleId, modelScale.scaleId)
      ))
      .get();
    
    if (score) {
      const { penalty, distance, withinRange } = calculateScalePenalty(
        score.stenScore,
        modelScale.targetStenMin,
        modelScale.targetStenMax
      );
      
      const weight = modelScale.weight || 1;
      totalFit += penalty * weight;
      weightSum += weight;
      
      details.push({
        scaleId: modelScale.scaleId,
        candidateSten: score.stenScore,
        targetMin: modelScale.targetStenMin,
        targetMax: modelScale.targetStenMax,
        distance,
        withinRange,
        penalty,
      });
    }
  }
  
  return {
    fit: weightSum > 0 ? (totalFit / weightSum) * 100 : 0,
    details,
  };
}

/**
 * Calculate behavioral match score
 */
async function calculateBehavioralMatch(
  assessmentId: string,
  modelScales: any[]
): Promise<{ fit: number; details: any[] }> {
  const behavioralScaleIds = [
    'energy_level', 'assertiveness', 'sociability', 'manageability',
    'attitude', 'decisiveness', 'accommodating', 'independence', 'objective_judgment'
  ];
  
  const details: any[] = [];
  let totalFit = 0;
  let weightSum = 0;
  
  for (const modelScale of modelScales) {
    if (!behavioralScaleIds.includes(modelScale.scaleId)) continue;
    
    const score = await db.select().from(scaleScores)
      .where(and(
        eq(scaleScores.assessmentId, assessmentId),
        eq(scaleScores.scaleId, modelScale.scaleId)
      ))
      .get();
    
    if (score) {
      const { penalty, distance, withinRange } = calculateScalePenalty(
        score.stenScore,
        modelScale.targetStenMin,
        modelScale.targetStenMax
      );
      
      const weight = modelScale.weight || 1;
      totalFit += penalty * weight;
      weightSum += weight;
      
      details.push({
        scaleId: modelScale.scaleId,
        candidateSten: score.stenScore,
        targetMin: modelScale.targetStenMin,
        targetMax: modelScale.targetStenMax,
        distance,
        withinRange,
        penalty,
      });
    }
  }
  
  return {
    fit: weightSum > 0 ? (totalFit / weightSum) * 100 : 0,
    details,
  };
}

/**
 * Calculate interests match score
 * Uses rank-order matching for top 3 interests
 */
async function calculateInterestsMatch(
  assessmentId: string,
  modelScales: any[]
): Promise<{ fit: number; details: any[] }> {
  const interestScaleIds = ['enterprising', 'financial_admin', 'people_service', 'technical', 'mechanical', 'creative'];
  
  // Get candidate's interest scores
  const candidateScores: { scaleId: string; sten: number }[] = [];
  
  for (const scaleId of interestScaleIds) {
    const score = await db.select().from(scaleScores)
      .where(and(
        eq(scaleScores.assessmentId, assessmentId),
        eq(scaleScores.scaleId, scaleId)
      ))
      .get();
    
    if (score) {
      candidateScores.push({ scaleId, sten: score.stenScore });
    }
  }
  
  // Sort by STEN (highest first)
  candidateScores.sort((a, b) => b.sten - a.sten);
  const candidateTop3 = candidateScores.slice(0, 3).map(s => s.scaleId);
  
  // Get model's top 3 interests
  const modelInterestScales = modelScales.filter(ms => interestScaleIds.includes(ms.scaleId));
  modelInterestScales.sort((a, b) => (b.targetStenMax + b.targetStenMin) / 2 - (a.targetStenMax + a.targetStenMin) / 2);
  const modelTop3 = modelInterestScales.slice(0, 3).map(s => s.scaleId);
  
  // Count matches in same position
  let matches = 0;
  const details: any[] = [];
  
  for (let i = 0; i < 3; i++) {
    const candidateInterest = candidateTop3[i];
    const modelInterest = modelTop3[i];
    const isMatch = candidateInterest === modelInterest;
    
    if (isMatch) matches++;
    
    details.push({
      rank: i + 1,
      candidate: candidateInterest,
      model: modelInterest,
      match: isMatch,
    });
  }
  
  // Convert to percentage: 0 matches = 33%, 1 match = 56%, 2 = 78%, 3 = 100%
  const fit = Math.round(33.33 + (matches * 22.22));
  
  return { fit, details };
}

// POST /api/match - Calculate job match
matchApp.post('/', async (c) => {
  const body = await c.req.json();
  const { assessmentId, modelId, candidateId } = body;
  
  if (!assessmentId && !candidateId) {
    return c.json({ error: 'assessmentId or candidateId is required' }, 400);
  }
  if (!modelId) {
    return c.json({ error: 'modelId is required' }, 400);
  }
  
  // Get assessment
  let assessment;
  if (assessmentId) {
    assessment = await db.select().from(assessments).where(eq(assessments.id, assessmentId)).get();
  } else if (candidateId) {
    assessment = await db.select().from(assessments)
      .where(and(
        eq(assessments.candidateId, candidateId),
        eq(assessments.status, 'completed')
      ))
      .get();
  }
  
  if (!assessment) {
    return c.json({ error: 'Assessment not found or not completed' }, 404);
  }
  
  // Get performance model
  const model = await db.select().from(performanceModels).where(eq(performanceModels.id, modelId)).get();
  if (!model) {
    return c.json({ error: 'Performance model not found' }, 404);
  }
  
  // Get model scale ranges
  const modelScales = await db.select().from(performanceModelScales)
    .where(eq(performanceModelScales.modelId, modelId))
    .all();
  
  // Calculate domain fits
  const [cognitiveFit, behavioralFit, interestsFit] = await Promise.all([
    calculateCognitiveMatch(assessment.id, modelScales),
    calculateBehavioralMatch(assessment.id, modelScales),
    calculateInterestsMatch(assessment.id, modelScales),
  ]);
  
  // Calculate overall match: 40% cognitive + 40% behavioral + 20% interests
  const overallMatch = Math.round(
    0.4 * cognitiveFit.fit +
    0.4 * behavioralFit.fit +
    0.2 * interestsFit.fit
  );
  
  // Get candidate info if available
  let candidate = null;
  if (assessment.candidateId) {
    candidate = await db.select().from(candidates).where(eq(candidates.id, assessment.candidateId)).get();
  }
  
  return c.json({
    assessmentId: assessment.id,
    modelId: model.id,
    modelName: model.name,
    candidate: candidate ? {
      id: candidate.id,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
    } : null,
    overallMatch: Math.max(0, Math.min(100, overallMatch)),
    cognitiveMatch: Math.max(0, Math.min(100, cognitiveFit.fit)),
    behavioralMatch: Math.max(0, Math.min(100, behavioralFit.fit)),
    interestsMatch: Math.max(0, Math.min(100, interestsFit.fit)),
    scaleDetails: {
      cognitive: cognitiveFit.details,
      behavioral: behavioralFit.details,
      interests: interestsFit.details,
    },
    computedAt: new Date().toISOString(),
  });
});

// GET /api/match/:assessmentId/:modelId - Get specific match (alternative endpoint)
matchApp.get('/:assessmentId/:modelId', async (c) => {
  const { assessmentId, modelId } = c.req.param();
  
  const result = await fetch(`${c.req.url.replace(c.req.path, '')}/api/match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assessmentId, modelId }),
  }).then(r => r.json());
  
  return c.json(result);
});

export default matchApp;