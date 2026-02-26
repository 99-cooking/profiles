/**
 * Profiles API - Hono REST API
 * 
 * Routes:
 * - /api/scales - Scale definitions
 * - /api/items - Assessment items
 * - /api/assessments - Assessment session management
 * - /api/candidates - Candidate management
 * - /api/performance-models - Job performance models
 * - /api/match - Job matching algorithm
 * - /api/jas - Job Analysis Survey
 */

import { Hono } from 'hono';
import assessmentsApp from './routes/assessments';
import modelsApp from './routes/performance-models';
import matchApp from './routes/match';
import jasApp from './routes/jas';
import reportsApp from './routes/reports';

const app = new Hono();

// API info endpoint (under /api)
app.get('/api', (c) => c.json({ 
  message: 'Profiles API',
  version: '1.0.0',
  endpoints: [
    '/api/scales',
    '/api/items',
    '/api/assessments',
    '/api/candidates',
    '/api/performance-models',
    '/api/performance-models/library',
    '/api/match',
    '/api/jas',
    '/api/reports/selection',
    '/api/reports/compare',
    '/api/reports/interview',
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
  const { eq } = await import('drizzle-orm');
  
  const scaleId = c.req.query('scale_id');
  const domain = c.req.query('domain');
  
  const result = db.select().from(items).where(eq(items.isActive, 1)).all();
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
    metadata: JSON.stringify(body.metadata || {}),
    createdAt: new Date(),
  });
  
  return c.json({ id }, 201);
});

app.get('/api/candidates', async (c) => {
  const { db } = await import('@profiles/db');
  const { candidates } = await import('@profiles/db/schema');
  const result = await db.select().from(candidates).all();
  return c.json(result);
});

app.get('/api/candidates/:id', async (c) => {
  const { db } = await import('@profiles/db');
  const { candidates } = await import('@profiles/db/schema');
  const { eq } = await import('drizzle-orm');
  
  const result = await db.select().from(candidates).where(eq(candidates.id, c.req.param('id'))).get();
  if (!result) return c.json({ error: 'Candidate not found' }, 404);
  return c.json(result);
});

// Assessment endpoints - mounted from routes
app.route('/api/assessments', assessmentsApp);

// Performance Models endpoints - mounted from routes
app.route('/api/performance-models', modelsApp);

// Job Match endpoints - mounted from routes
app.route('/api/match', matchApp);

// Job Analysis Survey endpoints - mounted from routes
app.route('/api/jas', jasApp);

// Reports endpoints - mounted from routes
app.route('/api/reports', reportsApp);

// Score endpoints (for viewing completed assessments)
app.get('/api/scores/:assessmentId', async (c) => {
  const { db } = await import('@profiles/db');
  const { scaleScores, scales } = await import('@profiles/db/schema');
  const { eq } = await import('drizzle-orm');
  
  const assessmentId = c.req.param('assessmentId');
  
  const scores = await db.select().from(scaleScores)
    .where(eq(scaleScores.assessmentId, assessmentId))
    .all();
  
  // Get scale details
  const scoresWithScales = await Promise.all(
    scores.map(async (score) => {
      const scale = await db.select().from(scales).where(eq(scales.id, score.scaleId)).get();
      return { ...score, scale };
    })
  );
  
  return c.json(scoresWithScales);
});

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }));

// Serve static frontend in production
import { readFileSync, existsSync, statSync, readdirSync } from 'fs';
import { resolve, join, extname } from 'path';

const staticDir = resolve(import.meta.dir, '../../web/dist');
console.log(`Static dir: ${staticDir}, exists: ${existsSync(staticDir)}`);
if (existsSync(staticDir)) {
  console.log(`Static files: ${readdirSync(staticDir).join(', ')}`);
}
const mimeTypes: Record<string, string> = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff',
};

if (existsSync(staticDir)) {
  app.get('*', (c) => {
    const urlPath = new URL(c.req.url).pathname;
    const filePath = join(staticDir, urlPath === '/' ? 'index.html' : urlPath);
    if (existsSync(filePath) && statSync(filePath).isFile()) {
      const content = readFileSync(filePath);
      const mime = mimeTypes[extname(filePath)] || 'application/octet-stream';
      return new Response(content, { headers: { 'Content-Type': mime } });
    }
    // SPA fallback
    const html = readFileSync(resolve(staticDir, 'index.html'), 'utf-8');
    return c.html(html);
  });
}

const port = parseInt(process.env.PORT || '3000');
console.log(`Profiles API running on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};