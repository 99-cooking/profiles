/**
 * Profiles API - Hono REST API
 */

import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => c.json({ 
  message: 'Profiles API',
  version: '1.0.0',
  endpoints: [
    '/api/scales',
    '/api/items',
    '/api/assessments',
    '/api/candidates',
    '/api/scores',
    '/api/models',
    '/api/match',
  ]
}));

// Scales endpoints
app.get('/api/scales', async (c) => {
  const { db } = await import('@profiles/db');
  const { scales } = await import('@profiles/db/schema');
  const { eq } = await import('drizzle-orm');
  
  const domain = c.req.query('domain');
  const query = domain 
    ? db.select().from(scales).where(eq(scales.domain, domain))
    : db.select().from(scales);
    
  const result = await query.all();
  return c.json(result);
});

app.get('/api/scales/:id', async (c) => {
  const { db } = await import('@profiles/db');
  const { scales } = await import('@profiles/db/schema');
  const { eq } = await import('drizzle-orm');
  
  const result = await db.select().from(scales).where(eq(scales.id, c.req.param('id'))).get();
  if (!result) return c.json({ error: 'Scale not found' }, 404);
  return c.json(result);
});

// Items endpoints
app.get('/api/items', async (c) => {
  const { db } = await import('@profiles/db');
  const { items } = await import('@profiles/db/schema');
  
  const scaleId = c.req.query('scale_id');
  const domain = c.req.query('domain');
  
  let query = db.select().from(items).where(eq(items.isActive, 1));
  
  const result = query.all();
  return c.json(result);
});

app.get('/api/items/:id', async (c) => {
  const { db } = await import('@profiles/db');
  const { items } = await import('@profiles/db/schema');
  const { eq } = await import('drizzle-orm');
  
  const result = await db.select().from(items).where(eq(items.id, c.req.param('id'))).get();
  if (!result) return c.json({ error: 'Item not found' }, 404);
  return c.json(result);
});

// Candidates endpoints
app.post('/api/candidates', async (c) => {
  const { db } = await import('@profiles/db');
  const { candidates } = await import('@profiles/db/schema');
  
  const body = await c.req.json();
  const id = `candidate_${Date.now()}`;
  
  await db.insert(candidates).values({
    id,
    email: body.email,
    firstName: body.firstName,
    lastName: body.lastName,
    externalId: body.externalId,
    createdAt: new Date(),
  });
  
  return c.json({ id }, 201);
});

app.get('/api/candidates/:id', async (c) => {
  const { db } = await import('@profiles/db');
  const { candidates } = await import('@profiles/db/schema');
  const { eq } = await import('drizzle-orm');
  
  const result = await db.select().from(candidates).where(eq(candidates.id, c.req.param('id'))).get();
  if (!result) return c.json({ error: 'Candidate not found' }, 404);
  return c.json(result);
});

// Assessment endpoints
app.post('/api/assessments', async (c) => {
  const { db } = await import('@profiles/db');
  const { assessments } = await import('@profiles/db/schema');
  
  const body = await c.req.json();
  const id = `assessment_${Date.now()}`;
  
  await db.insert(assessments).values({
    id,
    candidateId: body.candidateId,
    type: body.type || 'full',
    status: 'not_started',
    currentItemIndex: 0,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    createdAt: new Date(),
  });
  
  return c.json({ id }, 201);
});

app.get('/api/assessments/:id', async (c) => {
  const { db } = await import('@profiles/db');
  const { assessments } = await import('@profiles/db/schema');
  const { eq } = await import('drizzle-orm');
  
  const result = await db.select().from(assessments).where(eq(assessments.id, c.req.param('id'))).get();
  if (!result) return c.json({ error: 'Assessment not found' }, 404);
  return c.json(result);
});

app.post('/api/assessments/:id/start', async (c) => {
  const { db } = await import('@profiles/db');
  const { assessments } = await import('@profiles/db/schema');
  const { eq } = await import('drizzle-orm');
  
  const id = c.req.param('id');
  const assessment = await db.select().from(assessments).where(eq(assessments.id, id)).get();
  
  if (!assessment) return c.json({ error: 'Assessment not found' }, 404);
  
  await db.update(assessments)
    .set({ status: 'in_progress', startedAt: new Date(), currentSection: 'cognitive' })
    .where(eq(assessments.id, id));
  
  return c.json({ success: true });
});

// Score calculation endpoint
app.post('/api/scores/compute', async (c) => {
  const body = await c.req.json();
  const { likertSumToSten, estimateAbility, selectNextItem, thetaToSten } = await import('@profiles/core');
  const { db } = await import('@profiles/db');
  const { items: itemsSchema, responses: responsesSchema, scaleScores: scaleScoresSchema } = await import('@profiles/db/schema');
  const { eq, and } = await import('drizzle-orm');
  
  const assessmentId = body.assessmentId;
  const scaleId = body.scaleId;
  
  // Get responses for this scale
  const scale = await db.select().from(itemsSchema).where(eq(itemsSchema.scaleId, scaleId)).all();
  const responseData = await db.select().from(responsesSchema)
    .where(and(
      eq(responsesSchema.assessmentId, assessmentId),
      eq(responsesSchema.itemId, scale[0]?.id || '')
    ))
    .all();
  
  // Get item IRT params
  const itemIds = responseData.map(r => r.itemId);
  const itemParams = await db.select().from(itemsSchema)
    .where(itemsSchema.id in itemIds)
    .all();
  
  // Calculate score based on scale type
  const scaleInfo = await db.select().from(itemsSchema).where(eq(itemsSchema.scaleId, scaleId)).get();
  
  let rawScore = 0;
  let theta = 0;
  let stenScore = 5;
  
  if (scaleInfo?.category === 'cognitive') {
    // Use IRT estimation
    const responses = responseData.map(r => r.isCorrect ? 1 : 0);
    theta = estimateAbility(responses, itemParams);
    stenScore = thetaToSten(theta);
    rawScore = responseData.filter(r => r.isCorrect).length;
  } else {
    // Use Likert sum
    const responses = responseData.map(r => JSON.parse(r.response));
    rawScore = responses.reduce((sum, r) => sum + (parseInt(r) || 0), 0);
    const n = responses.length;
    stenScore = likertSumToSten(responses, 1, 5);
  }
  
  // Save score
  const scoreId = `score_${Date.now()}`;
  await db.insert(scaleScoresSchema).values({
    id: scoreId,
    assessmentId,
    scaleId,
    rawScore,
    stenScore,
    itemCount: responseData.length,
    computedAt: new Date(),
  });
  
  return c.json({ rawScore, stenScore, theta });
});

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }));

export default app;
