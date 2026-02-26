/**
 * Job Analysis Survey (JAS) API Routes
 * Generate Performance Model ranges from structured questionnaire responses
 */

import { Hono } from 'hono';
import { db } from '@profiles/db';
import { performanceModels, performanceModelScales, scales } from '@profiles/db/schema';

const jasApp = new Hono();

/**
 * JAS Question Templates
 */
const JAS_QUESTIONS = {
  cognitive: [
    {
      id: 'cog_demand',
      text: 'How complex are the mental tasks this role requires?',
      scale: 'learning_index',
      options: [
        { value: 1, label: 'Simple, routine tasks with clear procedures' },
        { value: 3, label: 'Moderate complexity, some problem-solving' },
        { value: 5, label: 'High complexity, requires significant analytical ability' },
        { value: 7, label: 'Very high complexity, strategic thinking essential' },
      ],
    },
    {
      id: 'verbal_demand',
      text: 'How important is verbal skill for this role?',
      scale: 'verbal_skill',
      options: [
        { value: 1, label: 'Minimal verbal communication required' },
        { value: 3, label: 'Basic communication skills needed' },
        { value: 5, label: 'Strong verbal abilities important' },
        { value: 7, label: 'Exceptional verbal skill critical' },
      ],
    },
    {
      id: 'numerical_demand',
      text: 'How important is numerical ability for this role?',
      scale: 'numerical_ability',
      options: [
        { value: 1, label: 'Minimal numerical work' },
        { value: 3, label: 'Basic arithmetic needed' },
        { value: 5, label: 'Strong numerical skills important' },
        { value: 7, label: 'Advanced numerical/quantitative skills critical' },
      ],
    },
  ],
  behavioral: [
    {
      id: 'energy_level',
      text: 'What pace of work is expected in this role?',
      scale: 'energy_level',
      options: [
        { value: 1, label: 'Slow, methodical pace acceptable' },
        { value: 3, label: 'Moderate pace, meets deadlines' },
        { value: 5, label: 'Fast-paced, high productivity expected' },
        { value: 7, label: 'Very high energy, constantly busy' },
      ],
    },
    {
      id: 'assertiveness',
      text: 'How much assertiveness/influence is needed?',
      scale: 'assertiveness',
      options: [
        { value: 1, label: 'Follows directions, minimal influence needed' },
        { value: 3, label: 'Some influence in decisions' },
        { value: 5, label: 'Strong influence and leadership expected' },
        { value: 7, label: 'Executive-level influence critical' },
      ],
    },
    {
      id: 'sociability',
      text: 'How important is social interaction in this role?',
      scale: 'sociability',
      options: [
        { value: 1, label: 'Primarily independent work' },
        { value: 3, label: 'Some team interaction' },
        { value: 5, label: 'High collaboration required' },
        { value: 7, label: 'Constant social engagement, networking essential' },
      ],
    },
    {
      id: 'manageability',
      text: 'How much structure and supervision does this role need?',
      scale: 'manageability',
      options: [
        { value: 1, label: 'Highly independent, minimal structure' },
        { value: 3, label: 'Some structure, moderate autonomy' },
        { value: 5, label: 'Structured environment, follows procedures' },
        { value: 7, label: 'Highly structured, detailed oversight' },
      ],
    },
    {
      id: 'attitude',
      text: 'What level of optimism/positive attitude is expected?',
      scale: 'attitude',
      options: [
        { value: 1, label: 'Realistic, can be neutral' },
        { value: 3, label: 'Generally positive outlook' },
        { value: 5, label: 'Consistently optimistic, motivates others' },
        { value: 7, label: 'Highly positive, inspirational leader' },
      ],
    },
    {
      id: 'decisiveness',
      text: 'How quickly must decisions be made in this role?',
      scale: 'decisiveness',
      options: [
        { value: 1, label: 'Careful analysis, slow decisions OK' },
        { value: 3, label: 'Moderate decision speed' },
        { value: 5, label: 'Quick decisions when needed' },
        { value: 7, label: 'Rapid, decisive action essential' },
      ],
    },
    {
      id: 'accommodating',
      text: 'How important is agreeableness/harmony in this role?',
      scale: 'accommodating',
      options: [
        { value: 1, label: 'Can be challenging, direct' },
        { value: 3, label: 'Balances harmony and results' },
        { value: 5, label: 'Prioritizes group harmony' },
        { value: 7, label: 'Must always maintain harmony' },
      ],
    },
    {
      id: 'independence',
      text: 'How independent should this role be?',
      scale: 'independence',
      options: [
        { value: 1, label: 'Close supervision required' },
        { value: 3, label: 'Some independence with guidance' },
        { value: 5, label: 'Highly autonomous' },
        { value: 7, label: 'Fully self-directed' },
      ],
    },
    {
      id: 'objective_judgment',
      text: 'How important is objective, data-driven decision making?',
      scale: 'objective_judgment',
      options: [
        { value: 1, label: 'Intuition and experience valued' },
        { value: 3, label: 'Balanced approach' },
        { value: 5, label: 'Data-driven preferred' },
        { value: 7, label: 'Must be purely objective/analytical' },
      ],
    },
  ],
  interests: [
    {
      id: 'enterprising',
      text: 'How much interest in leadership/sales should this role have?',
      scale: 'enterprising',
      options: [
        { value: 1, label: 'Minimal interest needed' },
        { value: 3, label: 'Some interest in leading' },
        { value: 5, label: 'Strong interest in business development' },
        { value: 7, label: 'High need for enterprising interests' },
      ],
    },
    {
      id: 'financial_admin',
      text: 'How much interest in administrative/financial work?',
      scale: 'financial_admin',
      options: [
        { value: 1, label: 'Minimal interest in admin' },
        { value: 3, label: 'Some organizational interest' },
        { value: 5, label: 'Strong interest in financial tasks' },
        { value: 7, label: 'High need for administrative interests' },
      ],
    },
    {
      id: 'people_service',
      text: 'How much interest in helping/working with people?',
      scale: 'people_service',
      options: [
        { value: 1, label: 'Minimal people contact' },
        { value: 3, label: 'Some client interaction' },
        { value: 5, label: 'Strong service orientation' },
        { value: 7, label: 'High need for service orientation' },
      ],
    },
    {
      id: 'technical',
      text: 'How much interest in technical/problem-solving work?',
      scale: 'technical',
      options: [
        { value: 1, label: 'Minimal technical interest' },
        { value: 3, label: 'Some technical curiosity' },
        { value: 5, label: 'Strong technical interest' },
        { value: 7, label: 'High need for technical interests' },
      ],
    },
    {
      id: 'mechanical',
      text: 'How much interest in mechanical/practical work?',
      scale: 'mechanical',
      options: [
        { value: 1, label: 'Minimal mechanical interest' },
        { value: 3, label: 'Some practical interest' },
        { value: 5, label: 'Strong mechanical interest' },
        { value: 7, label: 'High need for mechanical interests' },
      ],
    },
    {
      id: 'creative',
      text: 'How much interest in creative/imaginative work?',
      scale: 'creative',
      options: [
        { value: 1, label: 'Minimal creative need' },
        { value: 3, label: 'Some creative input' },
        { value: 5, label: 'Strong creative interest' },
        { value: 7, label: 'High need for creative interests' },
      ],
    },
  ],
};

/**
 * Convert JAS response to STEN range
 */
function responseToStenRange(responseValue: number): { min: number; max: number } {
  // Map 1-7 response to STEN range (roughly)
  // Response 1-2: STEN 1-4
  // Response 3-4: STEN 4-6
  // Response 5: STEN 5-7
  // Response 6-7: STEN 7-10
  
  if (responseValue <= 2) {
    return { min: 1, max: 4 };
  } else if (responseValue <= 4) {
    return { min: 4, max: 6 };
  } else if (responseValue <= 5) {
    return { min: 5, max: 7 };
  } else {
    return { min: 7, max: 10 };
  }
}

// GET /api/jas/questions - Get JAS questionnaire
jasApp.get('/questions', async (c) => {
  return c.json(JAS_QUESTIONS);
});

// POST /api/jas - Submit JAS and generate model
jasApp.post('/', async (c) => {
  const body = await c.req.json();
  const { 
    roleName, 
    roleDescription, 
    category,
    responses 
  } = body;
  
  if (!roleName || !responses) {
    return c.json({ error: 'roleName and responses are required' }, 400);
  }
  
  // Build scale ranges from responses
  const scaleRanges: { scaleId: string; targetStenMin: number; targetStenMax: number; weight: number }[] = [];
  
  for (const [questionId, responseValue] of Object.entries(responses)) {
    // Find which scale this question maps to
    const allQuestions = [
      ...JAS_QUESTIONS.cognitive,
      ...JAS_QUESTIONS.behavioral,
      ...JAS_QUESTIONS.interests,
    ];
    
    const question = allQuestions.find(q => q.id === questionId);
    if (question) {
      const range = responseToStenRange(responseValue as number);
      scaleRanges.push({
        scaleId: question.scale,
        targetStenMin: range.min,
        targetStenMax: range.max,
        weight: 1, // Default weight
      });
    }
  }
  
  // Create the performance model
  const modelId = `model_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  
  await db.insert(performanceModels).values({
    id: modelId,
    name: roleName,
    description: roleDescription || `Generated from JAS for ${roleName}`,
    category: category || 'custom',
    isTemplate: 0,
    type: 'jas',
    metadata: JSON.stringify({ 
      jasResponses: responses,
      generatedAt: new Date().toISOString(),
    }),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  // Add scale ranges
  for (const range of scaleRanges) {
    const rangeId = `pmr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await db.insert(performanceModelScales).values({
      id: rangeId,
      modelId,
      scaleId: range.scaleId,
      targetStenMin: range.targetStenMin,
      targetStenMax: range.targetStenMax,
      weight: range.weight,
    });
  }
  
  // Get the created model with scales
  const model = await db.select().from(performanceModels).where(eq(performanceModels.id, modelId)).get();
  const modelScales = await db.select().from(performanceModelScales)
    .where(eq(performanceModelScales.modelId, modelId))
    .all();
  
  return c.json({
    success: true,
    modelId,
    model: {
      ...model,
      scaleRanges: modelScales,
    },
    message: `Performance model "${roleName}" created from JAS`,
  });
});

export default jasApp;