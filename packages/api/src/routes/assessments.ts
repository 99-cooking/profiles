/**
 * Assessment Flow API Routes
 * Handles assessment sessions, adaptive testing, and scoring
 */

import { Hono } from 'hono';
import { db } from '@profiles/db';
import { 
  assessments, candidates, responses, items, scales, scaleScores 
} from '@profiles/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { probabilityCorrect, itemInformation, selectNextItem, estimateAbility, shouldStopTest, thetaToSten, likertSumToSten } from '@profiles/core';

const assessmentsApp = new Hono();

// Helper: Get cognitive items from DB
function getCognitiveItems(scaleId?: string) {
  let query = db.select().from(items).where(
    and(
      eq(items.domain, 'cognitive'),
      eq(items.isActive, 1)
    )
  );
  return query.all();
}

// Helper: Get behavioral items
function getBehavioralItems(scaleId?: string) {
  let query = db.select().from(items).where(
    and(
      eq(items.domain, 'behavioral'),
      eq(items.isActive, 1)
    )
  );
  return query.all();
}

// Helper: Get interest items (forced-choice pairs)
function getInterestItems() {
  return db.select().from(items).where(
    and(
      eq(items.domain, 'interests'),
      eq(items.isActive, 1)
    )
  ).all();
}

// Helper: Get all scales for a domain
function getScales(domain: string) {
  return db.select().from(scales).where(eq(scales.domain, domain)).all();
}

// Helper: Get distortion items
function getDistortionItems() {
  return db.select().from(items).where(
    and(
      eq(items.isDistortion, 1),
      eq(items.isActive, 1)
    )
  ).all();
}

// POST /api/assessments - Start new assessment
assessmentsApp.post('/', async (c) => {
  const body = await c.req.json();
  const { candidateId, type = 'full' } = body;
  
  const id = `assess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  
  // Validate candidate exists if provided
  if (candidateId) {
    const candidate = await db.select().from(candidates).where(eq(candidates.id, candidateId)).get();
    if (!candidate) {
      return c.json({ error: 'Candidate not found' }, 404);
    }
  }
  
  await db.insert(assessments).values({
    id,
    candidateId,
    type,
    status: 'not_started',
    currentSection: 'cognitive',
    currentItemIndex: 0,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    createdAt: new Date(),
  });
  
  return c.json({ 
    id, 
    type,
    status: 'not_started',
    message: 'Assessment created. Start the assessment to begin.'
  }, 201);
});

// GET /api/assessments/:id - Get assessment state
assessmentsApp.get('/:id', async (c) => {
  const id = c.req.param('id');
  
  const assessment = await db.select().from(assessments).where(eq(assessments.id, id)).get();
  if (!assessment) {
    return c.json({ error: 'Assessment not found' }, 404);
  }
  
  // Get response count
  const responseCount = await db.select().from(responses)
    .where(eq(responses.assessmentId, id))
    .all();
  
  return c.json({
    ...assessment,
    responseCount: responseCount.length,
    expiresAt: assessment.expiresAt,
  });
});

// POST /api/assessments/:id/start - Start assessment (begin first section)
assessmentsApp.post('/:id/start', async (c) => {
  const id = c.req.param('id');
  
  const assessment = await db.select().from(assessments).where(eq(assessments.id, id)).get();
  if (!assessment) {
    return c.json({ error: 'Assessment not found' }, 404);
  }
  
  if (assessment.status === 'completed') {
    return c.json({ error: 'Assessment already completed' }, 400);
  }
  
  // Determine starting section based on type
  let startSection = 'cognitive';
  if (assessment.type === 'behavioral_only') startSection = 'behavioral';
  else if (assessment.type === 'interests_only') startSection = 'interests';
  
  await db.update(assessments)
    .set({ 
      status: 'in_progress', 
      startedAt: new Date(), 
      currentSection: startSection,
      currentItemIndex: 0 
    })
    .where(eq(assessments.id, id));
  
  return c.json({ 
    success: true, 
    section: startSection,
    message: `Starting ${startSection} section`
  });
});

// GET /api/assessments/:id/next - Get next item to present
assessmentsApp.get('/:id/next', async (c) => {
  const id = c.req.param('id');
  
  const assessment = await db.select().from(assessments).where(eq(assessments.id, id)).get();
  if (!assessment) {
    return c.json({ error: 'Assessment not found' }, 404);
  }
  
  if (assessment.status !== 'in_progress') {
    return c.json({ error: 'Assessment not in progress' }, 400);
  }
  
  const section = assessment.currentSection;
  const itemIndex = assessment.currentItemIndex;
  
  // Get items already responded to for this assessment
  const existingResponses = await db.select().from(responses)
    .where(eq(responses.assessmentId, id))
    .all();
  
  const answeredItemIds = new Set(existingResponses.map(r => r.itemId));
  
  let item = null;
  let sectionComplete = false;
  let nextSection = null;
  
  if (section === 'cognitive') {
    // CAT: Adaptive item selection
    const allCognitiveItems = await getCognitiveItems();
    
    // Get answered cognitive items
    const cognitiveResponses = existingResponses.filter(r => {
      const item = allCognitiveItems.find(i => i.id === r.itemId);
      return item !== undefined;
    });
    
    // Current theta estimate
    let theta = 0;
    const administeredItems: any[] = [];
    
    if (cognitiveResponses.length > 0) {
      const respItems = cognitiveResponses.map(r => {
        const item = allCognitiveItems.find(i => i.id === r.itemId);
        return { ...item, isCorrect: r.isCorrect };
      }).filter(i => i.id);
      
      const responses = cognitiveResponses.map(r => r.isCorrect ? 1 : 0);
      theta = estimateAbility(responses, respItems);
      administeredItems.push(...respItems);
    }
    
    // Check termination criteria
    const shouldStop = shouldStopTest(theta, administeredItems, 5, 20, 0.35);
    
    if (shouldStop || cognitiveResponses.length >= 20) {
      // Move to next section
      sectionComplete = true;
      nextSection = assessment.type === 'full' ? 'behavioral' : null;
    } else {
      // Select next item using max information
      const availableItems = allCognitiveItems.filter(i => !answeredItemIds.has(i.id));
      item = selectNextItem(theta, answeredItemIds, availableItems);
    }
    
  } else if (section === 'behavioral') {
    // Behavioral items - sequential presentation
    const behavioralItems = await getBehavioralItems();
    const unanswered = behavioralItems.filter(i => !answeredItemIds.has(i.id));
    
    if (unanswered.length > 0) {
      item = unanswered[itemIndex % unanswered.length];
    } else {
      sectionComplete = true;
      nextSection = assessment.type === 'full' ? 'interests' : null;
    }
    
  } else if (section === 'interests') {
    // Interest items - forced-choice pairs
    const interestItems = await getInterestItems();
    const unanswered = interestItems.filter(i => !answeredItemIds.has(i.id));
    
    if (unanswered.length > 0) {
      item = unanswered[itemIndex % unanswered.length];
    } else {
      sectionComplete = true;
      nextSection = null;
    }
  }
  
  // If section is complete, update assessment
  if (sectionComplete) {
    if (nextSection) {
      await db.update(assessments)
        .set({ 
          currentSection: nextSection,
          currentItemIndex: 0
        })
        .where(eq(assessments.id, id));
    } else {
      // All sections complete
      await db.update(assessments)
        .set({ status: 'completed', completedAt: new Date() })
        .where(eq(assessments.id, id));
    }
  }
  
  // Return item or section complete status
  if (item) {
    // Parse options for display
    let options = [];
    try {
      options = JSON.parse(item.options || '[]');
    } catch {
      options = [];
    }
    
    return c.json({
      section,
      item: {
        id: item.id,
        content: item.content,
        format: item.format,
        options,
        domain: item.domain,
        category: item.category,
      },
      itemIndex: itemIndex + 1,
      sectionComplete: false,
    });
  } else if (sectionComplete) {
    return c.json({
      section,
      sectionComplete: true,
      nextSection,
      message: nextSection ? `Moving to ${nextSection} section` : 'Assessment complete - submit to finalize'
    });
  }
  
  return c.json({ error: 'No items available' }, 400);
});

// POST /api/assessments/:id/respond - Submit response, get next item
assessmentsApp.post('/:id/respond', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const { itemId, response, responseTime = 0 } = body;
  
  if (!itemId || response === undefined) {
    return c.json({ error: 'itemId and response are required' }, 400);
  }
  
  const assessment = await db.select().from(assessments).where(eq(assessments.id, id)).get();
  if (!assessment) {
    return c.json({ error: 'Assessment not found' }, 404);
  }
  
  if (assessment.status !== 'in_progress') {
    return c.json({ error: 'Assessment not in progress' }, 400);
  }
  
  // Get the item
  const item = await db.select().from(items).where(eq(items.id, itemId)).get();
  if (!item) {
    return c.json({ error: 'Item not found' }, 404);
  }
  
  // Process response based on format
  let isCorrect = null;
  let theta = null;
  
  if (item.domain === 'cognitive') {
    // For cognitive items, check if correct
    const correctAnswer = item.correctAnswer;
    const responseStr = String(response).trim();
    isCorrect = responseStr.toLowerCase() === correctAnswer?.toLowerCase() ? 1 : 0;
    
    // Calculate updated theta
    const existingResponses = await db.select().from(responses)
      .where(eq(responses.assessmentId, id))
      .all();
    
    const cognitiveItems = await getCognitiveItems();
    const cognitiveResponses = existingResponses.filter(r => {
      return cognitiveItems.some(i => i.id === r.itemId);
    });
    
    const respItems = [...cognitiveResponses, { itemId, isCorrect }].map(r => {
      const itm = cognitiveItems.find(i => i.id === r.itemId);
      return itm ? { ...itm, isCorrect: r.isCorrect } : null;
    }).filter(Boolean);
    
    const responsePattern = cognitiveResponses.map(r => r.isCorrect ? 1 : 0);
    responsePattern.push(isCorrect);
    
    theta = estimateAbility(responsePattern, respItems);
  }
  
  // Save response
  const responseId = `resp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  await db.insert(responses).values({
    id: responseId,
    assessmentId: id,
    itemId,
    response: JSON.stringify(response),
    responseTime,
    isCorrect: isCorrect ? true : isCorrect === 0 ? false : null,
    theta,
    presentedAt: new Date(),
    answeredAt: new Date(),
  });
  
  // Update assessment progress
  const newItemIndex = assessment.currentItemIndex + 1;
  await db.update(assessments)
    .set({ currentItemIndex: newItemIndex })
    .where(eq(assessments.id, id));
  
  // Get next item
  // We'll return the next item endpoint to be called
  return c.json({
    success: true,
    responseId,
    nextItem: `/api/assessments/${id}/next`,
    message: 'Response recorded. Call /next to get the next item.'
  });
});

// POST /api/assessments/:id/complete - Finalize and compute STEN profile
assessmentsApp.post('/:id/complete', async (c) => {
  const id = c.req.param('id');
  
  const assessment = await db.select().from(assessments).where(eq(assessments.id, id)).get();
  if (!assessment) {
    return c.json({ error: 'Assessment not found' }, 404);
  }
  
  // Get all responses
  const allResponses = await db.select().from(responses)
    .where(eq(responses.assessmentId, id))
    .all();
  
  // Get all items
  const allItems = await db.select().from(items).all();
  const itemMap = new Map(allItems.map(i => [i.id, i]));
  
  // Calculate scores for each domain
  const scores: Record<string, { raw: number; sten: number; percentile: number }> = {};
  
  // === COGNITIVE SCORES ===
  const cognitiveScales = await getScales('cognitive');
  const cognitiveResponses = allResponses.filter(r => {
    const item = itemMap.get(r.itemId);
    return item?.domain === 'cognitive';
  });
  
  // Group cognitive responses by scale
  for (const scale of cognitiveScales) {
    if (scale.isComposite) continue; // Skip composite for now
    
    const scaleItems = allItems.filter(i => i.scaleId === scale.id && i.domain === 'cognitive');
    const scaleResponses = cognitiveResponses.filter(r => scaleItems.some(i => i.id === r.itemId));
    
    // Get raw score (number correct)
    const rawScore = scaleResponses.filter(r => r.isCorrect).length;
    const totalItems = scaleResponses.length;
    
    if (totalItems > 0) {
      // Use theta estimation for cognitive
      let theta = 0;
      if (scaleResponses.length > 0) {
        const responses = scaleResponses.map(r => r.isCorrect ? 1 : 0);
        theta = estimateAbility(responses, scaleItems);
      }
      
      const stenScore = thetaToSten(theta);
      scores[scale.id] = {
        raw: rawScore,
        sten: stenScore,
        percentile: Math.round((1 / (1 + Math.exp(-(stenScore - 5.5) / 1.2))) * 100),
      };
    }
  }
  
  // Calculate Learning Index (composite of 4 cognitive scales)
  const liRaw = ['verbal_skill', 'verbal_reasoning', 'numerical_ability', 'numeric_reasoning']
    .reduce((sum, scaleId) => sum + (scores[scaleId]?.raw || 0), 0);
  const liMin = 0;
  const liMax = 80; // Assuming ~20 items per scale
  const liSten = likertSumToSten([liRaw], liMin, liMax);
  scores['learning_index'] = {
    raw: liRaw,
    sten: liSten,
    percentile: Math.round((1 / (1 + Math.exp(-(liSten - 5.5) / 1.2))) * 100),
  };
  
  // === BEHAVIORAL SCORES ===
  const behavioralScales = await getScales('behavioral');
  const behavioralResponses = allResponses.filter(r => {
    const item = itemMap.get(r.itemId);
    return item?.domain === 'behavioral' && !item.isDistortion;
  });
  
  for (const scale of behavioralScales.filter(s => s.type === 'trait')) {
    const scaleItems = allItems.filter(i => i.scaleId === scale.id && !i.isDistortion);
    const scaleResponses = behavioralResponses.filter(r => scaleItems.some(i => i.id === r.itemId));
    
    if (scaleResponses.length > 0) {
      const likertResponses = scaleResponses.map(r => {
        try {
          return JSON.parse(r.response);
        } catch {
          return 3;
        }
      });
      
      const rawScore = likertResponses.reduce((sum, r) => sum + r, 0);
      const stenScore = likertSumToSten(likertResponses, 1, 5);
      
      scores[scale.id] = {
        raw: rawScore,
        sten: stenScore,
        percentile: Math.round((1 / (1 + Math.exp(-(stenScore - 5.5) / 1.2))) * 100),
      };
    }
  }
  
  // === DISTORTION SCORE ===
  const distortionItems = allItems.filter(i => i.isDistortion);
  const distortionResponses = allResponses.filter(r => 
    distortionItems.some(i => i.id === r.itemId)
  );
  
  if (distortionResponses.length > 0) {
    const distortionLikerts = distortionResponses.map(r => {
      try {
        return JSON.parse(r.response);
      } catch {
        return 3;
      }
    });
    
    const distortionSten = likertSumToSten(distortionLikerts, 1, 5);
    scores['distortion'] = {
      raw: distortionLikerts.reduce((s, r) => s + r, 0),
      sten: distortionSten,
      percentile: Math.round((1 / (1 + Math.exp(-(distortionSten - 5.5) / 1.2))) * 100),
    };
  }
  
  // === INTEREST SCORES ===
  // Interest scoring requires special handling for forced-choice pairs
  const interestScales = await getScales('interests');
  const interestItems = allItems.filter(i => i.domain === 'interests');
  const interestResponses = allResponses.filter(r => 
    interestItems.some(i => i.id === r.itemId)
  );
  
  // Count wins per interest scale
  const interestWins: Record<string, number> = {};
  for (const scale of interestScales) {
    interestWins[scale.id] = 0;
  }
  
  for (const resp of interestResponses) {
    try {
      const responseData = JSON.parse(resp.response);
      // For forced-choice, response is 'A' or 'B' or 0/1
      const choice = responseData.choice || responseData;
      const item = interestItems.find(i => i.id === resp.itemId);
      
      if (item && item.scaleId) {
        // This is a simplified approach - each item maps to one scale
        if (choice === 'A' || choice === 0) {
          interestWins[item.scaleId] = (interestWins[item.scaleId] || 0) + 1;
        }
      }
    } catch {}
  }
  
  // Convert to STEN based on rank
  const sortedInterests = Object.entries(interestWins)
    .sort((a, b) => b[1] - a[1]);
  
  for (let i = 0; i < sortedInterests.length; i++) {
    const [scaleId] = sortedInterests[i];
    const rank = i + 1;
    // Convert rank to STEN: rank 1 = high STEN, rank 6 = low STEN
    const percentile = ((sortedInterests.length - rank + 0.5) / sortedInterests.length) * 100;
    const stenScore = Math.max(1, Math.min(10, Math.round(5.5 + (percentile / 100 - 0.5) * 4)));
    
    scores[scaleId] = {
      raw: interestWins[scaleId],
      sten: stenScore,
      percentile: Math.round(percentile),
    };
  }
  
  // Save all scores to database
  for (const [scaleId, scoreData] of Object.entries(scores)) {
    const scoreId = `score_${scaleId}_${Date.now()}`;
    await db.insert(scaleScores).values({
      id: scoreId,
      assessmentId: id,
      scaleId,
      rawScore: scoreData.raw,
      stenScore: scoreData.sten,
      percentile: scoreData.percentile,
      theta: scoreData.raw > 0 ? undefined : undefined, // Could store theta for cognitive
      itemCount: allResponses.length,
      computedAt: new Date(),
    });
  }
  
  // Mark assessment as completed
  await db.update(assessments)
    .set({ 
      status: 'completed', 
      completedAt: new Date(),
      currentSection: 'complete'
    })
    .where(eq(assessments.id, id));
  
  return c.json({
    success: true,
    assessmentId: id,
    completedAt: new Date().toISOString(),
    scores,
    message: 'Assessment complete. STEN profile calculated.'
  });
});

export default assessmentsApp;