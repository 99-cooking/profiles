/**
 * Performance Models API Routes
 * CRUD for job/role performance models
 */

import { Hono } from 'hono';
import { db } from '@profiles/db';
import { 
  performanceModels, performanceModelScales, scales 
} from '@profiles/db/schema';
import { eq, and } from 'drizzle-orm';

const modelsApp = new Hono();

// GET /api/performance-models - List all models
modelsApp.get('/', async (c) => {
  const allModels = await db.select().from(performanceModels).all();
  
  // Get scale ranges for each model
  const modelsWithScales = await Promise.all(
    allModels.map(async (model) => {
      const scaleRanges = await db.select().from(performanceModelScales)
        .where(eq(performanceModelScales.modelId, model.id))
        .all();
      return { ...model, scaleRanges };
    })
  );
  
  return c.json(modelsWithScales);
});

// GET /api/performance-models/library - Pre-built templates
modelsApp.get('/library', async (c) => {
  const templates = await db.select().from(performanceModels)
    .where(eq(performanceModels.isTemplate, 1))
    .all();
  
  const templatesWithScales = await Promise.all(
    templates.map(async (model) => {
      const scaleRanges = await db.select().from(performanceModelScales)
        .where(eq(performanceModelScales.modelId, model.id))
        .all();
      return { ...model, scaleRanges };
    })
  );
  
  return c.json(templatesWithScales);
});

// GET /api/performance-models/:id - Get single model
modelsApp.get('/:id', async (c) => {
  const id = c.req.param('id');
  
  const model = await db.select().from(performanceModels).where(eq(performanceModels.id, id)).get();
  if (!model) {
    return c.json({ error: 'Model not found' }, 404);
  }
  
  const scaleRanges = await db.select().from(performanceModelScales)
    .where(eq(performanceModelScales.modelId, id))
    .all();
  
  // Get scale details
  const scaleDetails = await Promise.all(
    scaleRanges.map(async (sr) => {
      const scale = await db.select().from(scales).where(eq(scales.id, sr.scaleId)).get();
      return { ...sr, scale };
    })
  );
  
  return c.json({ ...model, scaleRanges: scaleDetails });
});

// POST /api/performance-models - Create new model
modelsApp.post('/', async (c) => {
  const body = await c.req.json();
  const { 
    name, 
    description, 
    category, 
    isTemplate = false, 
    scaleRanges = [] 
  } = body;
  
  if (!name) {
    return c.json({ error: 'name is required' }, 400);
  }
  
  const id = `model_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  
  await db.insert(performanceModels).values({
    id,
    name,
    description,
    category,
    isTemplate: isTemplate ? 1 : 0,
    type: isTemplate ? 'library' : 'custom',
    metadata: JSON.stringify({}),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  // Add scale ranges
  for (const range of scaleRanges) {
    const rangeId = `pmr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await db.insert(performanceModelScales).values({
      id: rangeId,
      modelId: id,
      scaleId: range.scaleId,
      targetStenMin: range.targetStenMin || 4,
      targetStenMax: range.targetStenMax || 7,
      weight: range.weight || 1,
    });
  }
  
  return c.json({ id, name, message: 'Model created' }, 201);
});

// PUT /api/performance-models/:id - Update model
modelsApp.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  
  const model = await db.select().from(performanceModels).where(eq(performanceModels.id, id)).get();
  if (!model) {
    return c.json({ error: 'Model not found' }, 404);
  }
  
  const { name, description, category, scaleRanges } = body;
  
  await db.update(performanceModels)
    .set({ 
      name: name || model.name,
      description: description || model.description,
      category: category || model.category,
      updatedAt: new Date(),
    })
    .where(eq(performanceModels.id, id));
  
  // Update scale ranges if provided
  if (scaleRanges) {
    // Delete existing ranges
    await db.delete(performanceModelScales)
      .where(eq(performanceModelScales.modelId, id));
    
    // Add new ranges
    for (const range of scaleRanges) {
      const rangeId = `pmr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      await db.insert(performanceModelScales).values({
        id: rangeId,
        modelId: id,
        scaleId: range.scaleId,
        targetStenMin: range.targetStenMin || 4,
        targetStenMax: range.targetStenMax || 7,
        weight: range.weight || 1,
      });
    }
  }
  
  return c.json({ success: true, message: 'Model updated' });
});

// DELETE /api/performance-models/:id - Delete model
modelsApp.delete('/:id', async (c) => {
  const id = c.req.param('id');
  
  const model = await db.select().from(performanceModels).where(eq(performanceModels.id, id)).get();
  if (!model) {
    return c.json({ error: 'Model not found' }, 404);
  }
  
  // Delete scale ranges first
  await db.delete(performanceModelScales)
    .where(eq(performanceModelScales.modelId, id));
  
  // Delete model
  await db.delete(performanceModels)
    .where(eq(performanceModels.id, id));
  
  return c.json({ success: true, message: 'Model deleted' });
});

export default modelsApp;