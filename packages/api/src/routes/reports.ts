/**
 * Reports API Routes
 * Comprehensive selection, comparison, and interview question generation
 */

import { Hono } from 'hono';
import { db } from '@profiles/db';
import { 
  assessments, scaleScores, performanceModels, performanceModelScales, scales, candidates, items 
} from '@profiles/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

// Reuse match calculation logic
function calculateScalePenalty(
  candidateSten: number,
  targetMin: number,
  targetMax: number
): { penalty: number; distance: number; withinRange: boolean } {
  const below = Math.max(0, targetMin - candidateSten);
  const above = Math.max(0, candidateSten - targetMax);
  const distance = below + above;
  const withinRange = distance === 0;
  const penalty = 1 - (0.15 * distance + 0.05 * distance * distance);
  return { penalty: Math.max(0, penalty), distance, withinRange };
}

const reportsApp = new Hono();

// Helper: Get scale by ID
async function getScaleById(scaleId: string) {
  return db.select().from(scales).where(eq(scales.id, scaleId)).get();
}

// Helper: Get assessment scores
async function getAssessmentScores(assessmentId: string) {
  const scores = await db.select().from(scaleScores)
    .where(eq(scaleScores.assessmentId, assessmentId))
    .all();
  
  return Promise.all(scores.map(async (score) => {
    const scale = await getScaleById(score.scaleId);
    return { ...score, scale };
  }));
}

// Helper: Calculate domain match
async function calculateDomainMatch(
  assessmentId: string,
  modelScales: any[],
  domain: 'cognitive' | 'behavioral' | 'interests'
): Promise<{ fit: number; details: any[] }> {
  const domainScaleIds = {
    cognitive: ['verbal_skill', 'verbal_reasoning', 'numerical_ability', 'numeric_reasoning', 'learning_index'],
    behavioral: ['energy_level', 'assertiveness', 'sociability', 'manageability', 'attitude', 'decisiveness', 'accommodating', 'independence', 'objective_judgment'],
    interests: ['enterprising', 'financial_admin', 'people_service', 'technical', 'mechanical', 'creative'],
  }[domain];
  
  const details: any[] = [];
  let totalFit = 0;
  let weightSum = 0;
  
  for (const modelScale of modelScales) {
    if (!domainScaleIds.includes(modelScale.scaleId)) continue;
    
    const score = await db.select().from(scaleScores)
      .where(and(eq(scaleScores.assessmentId, assessmentId), eq(scaleScores.scaleId, modelScale.scaleId)))
      .get();
    
    if (score) {
      const { penalty, distance, withinRange } = calculateScalePenalty(
        score.stenScore, modelScale.targetStenMin, modelScale.targetStenMax
      );
      const weight = modelScale.weight || 1;
      totalFit += penalty * weight;
      weightSum += weight;
      
      const scale = await getScaleById(modelScale.scaleId);
      details.push({
        scaleId: modelScale.scaleId,
        scaleName: scale?.name || modelScale.scaleId,
        candidateSten: score.stenScore,
        targetMin: modelScale.targetStenMin,
        targetMax: modelScale.targetStenMax,
        distance,
        withinRange,
        penalty: Math.round(penalty * 100),
      });
    }
  }
  
  return { fit: weightSum > 0 ? Math.round((totalFit / weightSum) * 100) : 0, details };
}

// Helper: Generate strengths and gaps
function analyzeStrengthsGaps(scores: any[], modelScales: any[]): { strengths: any[]; gaps: any[] } {
  const strengths: any[] = [];
  const gaps: any[] = [];
  
  for (const modelScale of modelScales) {
    const score = scores.find(s => s.scaleId === modelScale.scaleId);
    if (!score) continue;
    
    const scale = score.scale;
    const isAboveMin = score.stenScore >= modelScale.targetStenMin;
    const isBelowMax = score.stenScore <= modelScale.targetStenMax;
    
    if (isAboveMin && isBelowMax) {
      strengths.push({ scaleId: modelScale.scaleId, scaleName: scale?.name, stenScore: score.stenScore });
    } else if (score.stenScore < modelScale.targetStenMin - 1 || score.stenScore > modelScale.targetStenMax + 1) {
      gaps.push({ scaleId: modelScale.scaleId, scaleName: scale?.name, stenScore: score.stenScore, targetMin: modelScale.targetStenMin, targetMax: modelScale.targetStenMax });
    }
  }
  
  return { strengths, gaps };
}

// GET /api/reports/selection?candidateId=X&modelId=Y
// Full selection report with job match %, per-scale STEN scores vs model bands, strengths/gaps
reportsApp.get('/selection', async (c) => {
  const candidateId = c.req.query('candidateId');
  const modelId = c.req.query('modelId');
  
  if (!candidateId || !modelId) {
    return c.json({ error: 'candidateId and modelId are required' }, 400);
  }
  
  // Get candidate
  const candidate = await db.select().from(candidates).where(eq(candidates.id, candidateId)).get();
  if (!candidate) return c.json({ error: 'Candidate not found' }, 404);
  
  // Get completed assessment
  const assessment = await db.select().from(assessments)
    .where(and(eq(assessments.candidateId, candidateId), eq(assessments.status, 'completed')))
    .get();
  if (!assessment) return c.json({ error: 'No completed assessment found for candidate' }, 404);
  
  // Get performance model
  const model = await db.select().from(performanceModels).where(eq(performanceModels.id, modelId)).get();
  if (!model) return c.json({ error: 'Performance model not found' }, 404);
  
  // Get model scale ranges
  const modelScales = await db.select().from(performanceModelScales)
    .where(eq(performanceModelScales.modelId, modelId))
    .all();
  
  // Get candidate's STEN scores
  const scores = await getAssessmentScores(assessment.id);
  
  // Calculate domain matches
  const [cognitiveFit, behavioralFit, interestsFit] = await Promise.all([
    calculateDomainMatch(assessment.id, modelScales, 'cognitive'),
    calculateDomainMatch(assessment.id, modelScales, 'behavioral'),
    calculateDomainMatch(assessment.id, modelScales, 'interests'),
  ]);
  
  const overallMatch = Math.round(
    0.4 * cognitiveFit.fit + 0.4 * behavioralFit.fit + 0.2 * interestsFit.fit
  );
  
  // Get strengths and gaps
  const { strengths, gaps } = analyzeStrengthsGaps(scores, modelScales);
  
  // Get distortion score
  const distortionScore = scores.find(s => s.scaleId === 'distortion');
  
  return c.json({
    candidate: { id: candidate.id, firstName: candidate.firstName, lastName: candidate.lastName, email: candidate.email },
    assessmentId: assessment.id,
    completedAt: assessment.completedAt?.toISOString(),
    model: { id: model.id, name: model.name, description: model.description },
    overallMatch: Math.max(0, Math.min(100, overallMatch)),
    domainMatches: {
      cognitive: { fit: cognitiveFit.fit, details: cognitiveFit.details },
      behavioral: { fit: behavioralFit.fit, details: behavioralFit.details },
      interests: { fit: interestsFit.fit, details: interestsFit.details },
    },
    strengths,
    gaps,
    distortionScore: distortionScore ? { sten: distortionScore.stenScore, valid: distortionScore.stenScore >= 3 } : null,
    perScaleData: modelScales.map(ms => {
      const score = scores.find(s => s.scaleId === ms.scaleId);
      return {
        scaleId: ms.scaleId,
        scaleName: score?.scale?.name || ms.scaleId,
        stenScore: score?.stenScore ?? null,
        modelLower: ms.targetStenMin,
        modelUpper: ms.targetStenMax,
        inBand: score ? score.stenScore >= ms.targetStenMin && score.stenScore <= ms.targetStenMax : false,
      };
    }),
    allScores: scores.map(s => ({ scaleId: s.scaleId, scaleName: s.scale?.name, stenScore: s.stenScore, percentile: s.percentile })),
  });
});

// GET /api/reports/compare?modelId=Y&candidateIds=A,B,C
// Rank candidates by fit
reportsApp.get('/compare', async (c) => {
  const modelId = c.req.query('modelId');
  const candidateIds = c.req.query('candidateIds')?.split(',').filter(Boolean);
  
  if (!modelId || !candidateIds || candidateIds.length === 0) {
    return c.json({ error: 'modelId and candidateIds (comma-separated) are required' }, 400);
  }
  
  // Get performance model
  const model = await db.select().from(performanceModels).where(eq(performanceModels.id, modelId)).get();
  if (!model) return c.json({ error: 'Performance model not found' }, 404);
  
  // Get model scale ranges
  const modelScales = await db.select().from(performanceModelScales)
    .where(eq(performanceModelScales.modelId, modelId))
    .all();
  
  // Process each candidate
  const results = await Promise.all(candidateIds.map(async (cid) => {
    const candidate = await db.select().from(candidates).where(eq(candidates.id, cid)).get();
    if (!candidate) return null;
    
    const assessment = await db.select().from(assessments)
      .where(and(eq(assessments.candidateId, cid), eq(assessments.status, 'completed')))
      .get();
    
    if (!assessment) return { candidate: { id: cid, firstName: candidate.firstName, lastName: candidate.lastName }, hasAssessment: false };
    
    const [cognitiveFit, behavioralFit, interestsFit] = await Promise.all([
      calculateDomainMatch(assessment.id, modelScales, 'cognitive'),
      calculateDomainMatch(assessment.id, modelScales, 'behavioral'),
      calculateDomainMatch(assessment.id, modelScales, 'interests'),
    ]);
    
    const overallMatch = Math.round(0.4 * cognitiveFit.fit + 0.4 * behavioralFit.fit + 0.2 * interestsFit.fit);
    
    return {
      candidate: { id: candidate.id, firstName: candidate.firstName, lastName: candidate.lastName, email: candidate.email },
      assessmentId: assessment.id,
      hasAssessment: true,
      overallMatch: Math.max(0, Math.min(100, overallMatch)),
      cognitiveMatch: Math.max(0, Math.min(100, cognitiveFit.fit)),
      behavioralMatch: Math.max(0, Math.min(100, behavioralFit.fit)),
      interestsMatch: Math.max(0, Math.min(100, interestsFit.fit)),
    };
  }));
  
  // Filter and sort by overall match
  const validResults = results.filter(r => r && r.hasAssessment).sort((a, b) => (b?.overallMatch || 0) - (a?.overallMatch || 0));
  
  return c.json({
    model: { id: model.id, name: model.name },
    rankedCandidates: validResults.map((r, idx) => ({ rank: idx + 1, ...r })),
    totalCandidates: candidateIds.length,
    assessedCandidates: validResults.length,
  });
});

// GET /api/reports/interview?candidateId=X&modelId=Y
// Dynamic interview questions for scales outside model band
reportsApp.get('/interview', async (c) => {
  const candidateId = c.req.query('candidateId');
  const modelId = c.req.query('modelId');
  
  if (!candidateId || !modelId) {
    return c.json({ error: 'candidateId and modelId are required' }, 400);
  }
  
  // Get candidate assessment
  const assessment = await db.select().from(assessments)
    .where(and(eq(assessments.candidateId, candidateId), eq(assessments.status, 'completed')))
    .get();
  if (!assessment) return c.json({ error: 'No completed assessment found for candidate' }, 404);
  
  // Get performance model
  const model = await db.select().from(performanceModels).where(eq(performanceModels.id, modelId)).get();
  if (!model) return c.json({ error: 'Performance model not found' }, 404);
  
  // Get model scale ranges
  const modelScales = await db.select().from(performanceModelScales)
    .where(eq(performanceModelScales.modelId, modelId))
    .all();
  
  // Get candidate scores
  const scores = await getAssessmentScores(assessment.id);
  
  // Find scales outside model band
  const deviations: any[] = [];
  
  for (const modelScale of modelScales) {
    const score = scores.find(s => s.scaleId === modelScale.scaleId);
    if (!score) continue;
    
    const { distance, withinRange } = calculateScalePenalty(score.stenScore, modelScale.targetStenMin, modelScale.targetStenMax);
    
    if (!withinRange) {
      const scale = score.scale;
      const direction = score.stenScore > modelScale.targetStenMax ? 'high' : 'low';
      const scaleName = scale?.name || modelScale.scaleId;
      
      deviations.push({
        scaleId: modelScale.scaleId,
        scaleName,
        candidateSten: score.stenScore,
        targetMin: modelScale.targetStenMin,
        targetMax: modelScale.targetStenMax,
        direction,
        distance,
      });
    }
  }
  
  // Import interview questions from core
  const { getInterviewQuestions } = await import('@profiles/core');
  
  const interviewQuestions = deviations.map(d => ({
    scaleId: d.scaleId,
    scaleName: d.scaleName,
    direction: d.direction,
    candidateSten: d.candidateSten,
    targetRange: `${d.targetMin}-${d.targetMax}`,
    deviation: d.distance,
    questions: getInterviewQuestions(d.scaleId, d.direction).map(q => q.question),
  }));
  
  return c.json({
    candidateId,
    modelId,
    modelName: model.name,
    deviationCount: interviewQuestions.length,
    interviewQuestions,
  });
});

export default reportsApp;
