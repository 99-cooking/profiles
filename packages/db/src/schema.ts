/**
 * Database Schema for Profiles Platform
 * Uses Drizzle ORM with SQLite
 */

import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// Scales table - defines the measurement constructs
export const scales = sqliteTable('scales', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  domain: text('domain').notNull(), // 'cognitive', 'behavioral', 'interests'
  type: text('type').notNull(), // 'cognitive', 'trait', 'interest'
  minItems: integer('min_items').default(1),
  maxItems: integer('max_items').default(99),
  minScore: integer('min_score'), // minimum possible raw score
  maxScore: integer('max_score'), // maximum possible raw score
  isComposite: integer('is_composite', { mode: 'boolean' }).default(false),
  compositeOf: text('composite_of'), // JSON array of scale IDs this is composite of
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Items table - individual test questions
export const items = sqliteTable('items', {
  id: text('id').primaryKey(),
  scaleId: text('scale_id').references(() => scales.id),
  content: text('content').notNull(),
  contentType: text('content_type').notNull(), // 'text', 'image', 'video'
  format: text('format').notNull(), // 'likert', 'multiple_choice', 'forced_choice', 'binary'
  options: text('options'), // JSON array of response options
  correctAnswer: text('correct_answer'), // for cognitive items
  // IRT parameters
  irtA: real('irt_a'), // discrimination
  irtB: real('irt_b'), // difficulty
  irtC: real('irt_c'), // guessing
  // Metadata
  difficulty: integer('difficulty'), // 1-5 subjective difficulty
  domain: text('domain'), // 'cognitive', 'behavioral', 'interests'
  category: text('category'), // for behavioral: trait name, for cognitive: subscale
  isDistortion: integer('is_distortion', { mode: 'boolean' }).default(false),
  order: integer('order').default(0),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Candidates table - people taking assessments
export const candidates = sqliteTable('candidates', {
  id: text('id').primaryKey(),
  email: text('email'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  externalId: text('external_id'), // HR system ID
  metadata: text('metadata'), // JSON blob for custom fields
  status: text('status').default('active'), // 'active', 'archived'
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Assessments - assessment sessions
export const assessments = sqliteTable('assessments', {
  id: text('id').primaryKey(),
  candidateId: text('candidate_id').references(() => candidates.id),
  type: text('type').notNull(), // 'full', 'cognitive_only', 'behavioral_only', 'interests_only'
  status: text('status').default('not_started'), // 'not_started', 'in_progress', 'completed', 'expired'
  startedAt: integer('started_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  currentSection: text('current_section'), // 'cognitive', 'behavioral', 'interests'
  currentItemIndex: integer('current_item_index').default(0),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Responses - individual item responses
export const responses = sqliteTable('responses', {
  id: text('id').primaryKey(),
  assessmentId: text('assessment_id').references(() => assessments.id),
  itemId: text('item_id').references(() => items.id),
  response: text('response').notNull(), // JSON - response value(s)
  responseTime: integer('response_time'), // milliseconds
  isCorrect: integer('is_correct', { mode: 'boolean' }), // for cognitive items
  theta: real('theta'), // ability estimate at time of response
  presentedAt: integer('presented_at', { mode: 'timestamp' }),
  answeredAt: integer('answered_at', { mode: 'timestamp' }),
});

// Scale Scores - computed scores per scale
export const scaleScores = sqliteTable('scale_scores', {
  id: text('id').primaryKey(),
  assessmentId: text('assessment_id').references(() => assessments.id),
  scaleId: text('scale_id').references(() => scales.id),
  rawScore: real('raw_score'),
  stenScore: integer('sten_score'),
  percentile: real('percentile'),
  theta: real('theta'), // for cognitive
  itemCount: integer('item_count'),
  computedAt: integer('computed_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Performance Models - job/role profiles
export const performanceModels = sqliteTable('performance_models', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').default('custom'), // 'custom', 'library', 'concurrent'
  category: text('category'), // job family, O*NET code, etc
  isTemplate: integer('is_template', { mode: 'boolean' }).default(false),
  metadata: text('metadata'), // JSON for additional data
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Performance Model Scales - STEN ranges for each scale
export const performanceModelScales = sqliteTable('performance_model_scales', {
  id: text('id').primaryKey(),
  modelId: text('model_id').references(() => performanceModels.id),
  scaleId: text('scale_id').references(() => scales.id),
  targetStenMin: integer('target_sten_min'),
  targetStenMax: integer('target_sten_max'),
  weight: real('default_weight'), // default weight in matching
});

// Job Matches - matching results
export const jobMatches = sqliteTable('job_matches', {
  id: text('id').primaryKey(),
  assessmentId: text('assessment_id').references(() => assessments.id),
  modelId: text('model_id').references(() => performanceModels.id),
  overallMatch: real('overall_match'),
  cognitiveMatch: real('cognitive_match'),
  behavioralMatch: real('behavioral_match'),
  interestsMatch: real('interests_match'),
  scaleDeviations: text('scale_deviations'), // JSON
  computedAt: integer('computed_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Type exports
export type Scale = typeof scales.$inferSelect;
export type Item = typeof items.$inferSelect;
export type Candidate = typeof candidates.$inferSelect;
export type Assessment = typeof assessments.$inferSelect;
export type Response = typeof responses.$inferSelect;
export type ScaleScore = typeof scaleScores.$inferSelect;
export type PerformanceModel = typeof performanceModels.$inferSelect;
export type PerformanceModelScale = typeof performanceModelScales.$inferSelect;
export type JobMatch = typeof jobMatches.$inferSelect;
