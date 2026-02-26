/**
 * Database migration - creates all tables
 */

import { Database } from 'bun:sqlite';
import * as schema from './schema';

const sqlite = new Database('profiles.db');

// Enable foreign keys
sqlite.exec('PRAGMA foreign_keys = ON');

// Create tables based on schema
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS scales (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    domain TEXT NOT NULL,
    type TEXT NOT NULL,
    min_items INTEGER DEFAULT 1,
    max_items INTEGER DEFAULT 99,
    min_score INTEGER,
    max_score INTEGER,
    is_composite INTEGER DEFAULT 0,
    composite_of TEXT,
    created_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    scale_id TEXT REFERENCES scales(id),
    content TEXT NOT NULL,
    content_type TEXT NOT NULL,
    format TEXT NOT NULL,
    options TEXT,
    correct_answer TEXT,
    irt_a REAL,
    irt_b REAL,
    irt_c REAL,
    difficulty INTEGER,
    domain TEXT,
    category TEXT,
    is_distortion INTEGER DEFAULT 0,
    "order" INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS candidates (
    id TEXT PRIMARY KEY,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    external_id TEXT,
    metadata TEXT,
    status TEXT DEFAULT 'active',
    created_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS assessments (
    id TEXT PRIMARY KEY,
    candidate_id TEXT REFERENCES candidates(id),
    type TEXT NOT NULL,
    status TEXT DEFAULT 'not_started',
    started_at INTEGER,
    completed_at INTEGER,
    current_section TEXT,
    current_item_index INTEGER DEFAULT 0,
    expires_at INTEGER,
    created_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS responses (
    id TEXT PRIMARY KEY,
    assessment_id TEXT REFERENCES assessments(id),
    item_id TEXT REFERENCES items(id),
    response TEXT NOT NULL,
    response_time INTEGER,
    is_correct INTEGER,
    theta REAL,
    presented_at INTEGER,
    answered_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS scale_scores (
    id TEXT PRIMARY KEY,
    assessment_id TEXT REFERENCES assessments(id),
    scale_id TEXT REFERENCES scales(id),
    raw_score REAL,
    sten_score INTEGER,
    percentile REAL,
    theta REAL,
    item_count INTEGER,
    computed_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS performance_models (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'custom',
    category TEXT,
    is_template INTEGER DEFAULT 0,
    metadata TEXT,
    created_at INTEGER,
    updated_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS performance_model_scales (
    id TEXT PRIMARY KEY,
    model_id TEXT REFERENCES performance_models(id),
    scale_id TEXT REFERENCES scales(id),
    target_sten_min INTEGER,
    target_sten_max INTEGER,
    default_weight REAL
  );

  CREATE TABLE IF NOT EXISTS job_matches (
    id TEXT PRIMARY KEY,
    assessment_id TEXT REFERENCES assessments(id),
    model_id TEXT REFERENCES performance_models(id),
    overall_match REAL,
    cognitive_match REAL,
    behavioral_match REAL,
    interests_match REAL,
    scale_deviations TEXT,
    computed_at INTEGER
  );

  CREATE INDEX IF NOT EXISTS idx_items_scale ON items(scale_id);
  CREATE INDEX IF NOT EXISTS idx_items_domain ON items(domain);
  CREATE INDEX IF NOT EXISTS idx_responses_assessment ON responses(assessment_id);
  CREATE INDEX IF NOT EXISTS idx_scale_scores_assessment ON scale_scores(assessment_id);
  CREATE INDEX IF NOT EXISTS idx_assessments_candidate ON assessments(candidate_id);
`);

console.log('Database migrated successfully!');
