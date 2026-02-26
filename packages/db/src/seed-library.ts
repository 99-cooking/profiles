/**
 * Seed Performance Model Library
 * Pre-built templates for common job roles
 */

import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import * as schema from './schema';

const sqlite = new Database('profiles.db');
const db = drizzle(sqlite, { schema });

// Pre-built performance model templates
const libraryModels = [
  {
    name: 'Sales Executive',
    description: 'High-performing sales professional who drives revenue growth',
    category: 'Sales',
    scales: {
      verbal_skill: { min: 6, max: 9 },
      verbal_reasoning: { min: 6, max: 9 },
      numerical_ability: { min: 5, max: 8 },
      numeric_reasoning: { min: 5, max: 8 },
      learning_index: { min: 6, max: 9 },
      energy_level: { min: 7, max: 10 },
      assertiveness: { min: 7, max: 10 },
      sociability: { min: 7, max: 10 },
      manageability: { min: 3, max: 6 },
      attitude: { min: 6, max: 9 },
      decisiveness: { min: 6, max: 9 },
      accommodating: { min: 4, max: 7 },
      independence: { min: 6, max: 9 },
      objective_judgment: { min: 5, max: 8 },
      enterprising: { min: 7, max: 10 },
      financial_admin: { min: 3, max: 6 },
      people_service: { min: 5, max: 8 },
      technical: { min: 2, max: 5 },
      mechanical: { min: 1, max: 4 },
      creative: { min: 3, max: 6 },
    },
  },
  {
    name: 'Software Engineer',
    description: 'Technical developer who builds and maintains software systems',
    category: 'Engineering',
    scales: {
      verbal_skill: { min: 5, max: 8 },
      verbal_reasoning: { min: 6, max: 9 },
      numerical_ability: { min: 7, max: 10 },
      numeric_reasoning: { min: 7, max: 10 },
      learning_index: { min: 7, max: 10 },
      energy_level: { min: 5, max: 8 },
      assertiveness: { min: 4, max: 7 },
      sociability: { min: 3, max: 6 },
      manageability: { min: 4, max: 7 },
      attitude: { min: 5, max: 8 },
      decisiveness: { min: 4, max: 7 },
      accommodating: { min: 4, max: 7 },
      independence: { min: 7, max: 10 },
      objective_judgment: { min: 7, max: 10 },
      enterprising: { min: 2, max: 5 },
      financial_admin: { min: 2, max: 5 },
      people_service: { min: 2, max: 5 },
      technical: { min: 8, max: 10 },
      mechanical: { min: 3, max: 6 },
      creative: { min: 5, max: 8 },
    },
  },
  {
    name: 'Customer Support',
    description: 'Front-line support professional who resolves customer issues',
    category: 'Customer Service',
    scales: {
      verbal_skill: { min: 5, max: 8 },
      verbal_reasoning: { min: 5, max: 8 },
      numerical_ability: { min: 4, max: 7 },
      numeric_reasoning: { min: 4, max: 7 },
      learning_index: { min: 5, max: 8 },
      energy_level: { min: 5, max: 8 },
      assertiveness: { min: 4, max: 7 },
      sociability: { min: 7, max: 10 },
      manageability: { min: 5, max: 8 },
      attitude: { min: 7, max: 10 },
      decisiveness: { min: 4, max: 7 },
      accommodating: { min: 7, max: 10 },
      independence: { min: 3, max: 6 },
      objective_judgment: { min: 4, max: 7 },
      enterprising: { min: 2, max: 5 },
      financial_admin: { min: 3, max: 6 },
      people_service: { min: 8, max: 10 },
      technical: { min: 4, max: 7 },
      mechanical: { min: 2, max: 5 },
      creative: { min: 3, max: 6 },
    },
  },
  {
    name: 'Project Manager',
    description: 'Organized leader who plans and executes projects on time and budget',
    category: 'Management',
    scales: {
      verbal_skill: { min: 6, max: 9 },
      verbal_reasoning: { min: 6, max: 9 },
      numerical_ability: { min: 5, max: 8 },
      numeric_reasoning: { min: 6, max: 9 },
      learning_index: { min: 6, max: 9 },
      energy_level: { min: 6, max: 9 },
      assertiveness: { min: 6, max: 9 },
      sociability: { min: 5, max: 8 },
      manageability: { min: 5, max: 8 },
      attitude: { min: 6, max: 9 },
      decisiveness: { min: 6, max: 9 },
      accommodating: { min: 4, max: 7 },
      independence: { min: 5, max: 8 },
      objective_judgment: { min: 6, max: 9 },
      enterprising: { min: 5, max: 8 },
      financial_admin: { min: 5, max: 8 },
      people_service: { min: 5, max: 8 },
      technical: { min: 4, max: 7 },
      mechanical: { min: 2, max: 5 },
      creative: { min: 4, max: 7 },
    },
  },
  {
    name: 'Data Analyst',
    description: 'Analytical professional who extracts insights from data',
    category: 'Analytics',
    scales: {
      verbal_skill: { min: 5, max: 8 },
      verbal_reasoning: { min: 6, max: 9 },
      numerical_ability: { min: 7, max: 10 },
      numeric_reasoning: { min: 8, max: 10 },
      learning_index: { min: 7, max: 10 },
      energy_level: { min: 5, max: 8 },
      assertiveness: { min: 4, max: 7 },
      sociability: { min: 3, max: 6 },
      manageability: { min: 5, max: 8 },
      attitude: { min: 5, max: 8 },
      decisiveness: { min: 4, max: 7 },
      accommodating: { min: 4, max: 7 },
      independence: { min: 6, max: 9 },
      objective_judgment: { min: 8, max: 10 },
      enterprising: { min: 2, max: 5 },
      financial_admin: { min: 5, max: 8 },
      people_service: { min: 3, max: 6 },
      technical: { min: 7, max: 10 },
      mechanical: { min: 3, max: 6 },
      creative: { min: 4, max: 7 },
    },
  },
  {
    name: 'Human Resources Manager',
    description: 'People-focused leader who manages HR functions and employee relations',
    category: 'Human Resources',
    scales: {
      verbal_skill: { min: 7, max: 10 },
      verbal_reasoning: { min: 6, max: 9 },
      numerical_ability: { min: 4, max: 7 },
      numeric_reasoning: { min: 5, max: 8 },
      learning_index: { min: 6, max: 9 },
      energy_level: { min: 5, max: 8 },
      assertiveness: { min: 5, max: 8 },
      sociability: { min: 8, max: 10 },
      manageability: { min: 5, max: 8 },
      attitude: { min: 7, max: 10 },
      decisiveness: { min: 5, max: 8 },
      accommodating: { min: 7, max: 10 },
      independence: { min: 4, max: 7 },
      objective_judgment: { min: 5, max: 8 },
      enterprising: { min: 4, max: 7 },
      financial_admin: { min: 5, max: 8 },
      people_service: { min: 9, max: 10 },
      technical: { min: 3, max: 6 },
      mechanical: { min: 1, max: 4 },
      creative: { min: 4, max: 7 },
    },
  },
  {
    name: 'Financial Analyst',
    description: 'Numerically-skilled professional who analyzes financial data',
    category: 'Finance',
    scales: {
      verbal_skill: { min: 5, max: 8 },
      verbal_reasoning: { min: 6, max: 9 },
      numerical_ability: { min: 8, max: 10 },
      numeric_reasoning: { min: 8, max: 10 },
      learning_index: { min: 7, max: 10 },
      energy_level: { min: 5, max: 8 },
      assertiveness: { min: 4, max: 7 },
      sociability: { min: 3, max: 6 },
      manageability: { min: 5, max: 8 },
      attitude: { min: 5, max: 8 },
      decisiveness: { min: 4, max: 7 },
      accommodating: { min: 4, max: 7 },
      independence: { min: 5, max: 8 },
      objective_judgment: { min: 9, max: 10 },
      enterprising: { min: 4, max: 7 },
      financial_admin: { min: 8, max: 10 },
      people_service: { min: 2, max: 5 },
      technical: { min: 6, max: 9 },
      mechanical: { min: 2, max: 5 },
      creative: { min: 2, max: 5 },
    },
  },
  {
    name: 'Marketing Manager',
    description: 'Creative and strategic professional who drives brand and demand',
    category: 'Marketing',
    scales: {
      verbal_skill: { min: 7, max: 10 },
      verbal_reasoning: { min: 6, max: 9 },
      numerical_ability: { min: 5, max: 8 },
      numeric_reasoning: { min: 5, max: 8 },
      learning_index: { min: 6, max: 9 },
      energy_level: { min: 6, max: 9 },
      assertiveness: { min: 6, max: 9 },
      sociability: { min: 6, max: 9 },
      manageability: { min: 4, max: 7 },
      attitude: { min: 7, max: 10 },
      decisiveness: { min: 5, max: 8 },
      accommodating: { min: 4, max: 7 },
      independence: { min: 5, max: 8 },
      objective_judgment: { min: 5, max: 8 },
      enterprising: { min: 6, max: 9 },
      financial_admin: { min: 3, max: 6 },
      people_service: { min: 5, max: 8 },
      technical: { min: 4, max: 7 },
      mechanical: { min: 1, max: 4 },
      creative: { min: 7, max: 10 },
    },
  },
];

// Scale IDs mapping
const scaleIds: Record<string, string> = {
  verbal_skill: 'verbal_skill',
  verbal_reasoning: 'verbal_reasoning',
  numerical_ability: 'numerical_ability',
  numeric_reasoning: 'numeric_reasoning',
  learning_index: 'learning_index',
  energy_level: 'energy_level',
  assertiveness: 'assertiveness',
  sociability: 'sociability',
  manageability: 'manageability',
  attitude: 'attitude',
  decisiveness: 'decisiveness',
  accommodating: 'accommodating',
  independence: 'independence',
  objective_judgment: 'objective_judgment',
  enterprising: 'enterprising',
  financial_admin: 'financial_admin',
  people_service: 'people_service',
  technical: 'technical',
  mechanical: 'mechanical',
  creative: 'creative',
};

// Insert library models
for (const model of libraryModels) {
  const modelId = `model_library_${model.name.toLowerCase().replace(/\s+/g, '_')}`;
  
  // Check if already exists
  const existing = sqlite.prepare('SELECT id FROM performance_models WHERE id = ?').get(modelId);
  if (existing) {
    console.log(`Model "${model.name}" already exists, skipping...`);
    continue;
  }
  
  console.log(`Creating model: ${model.name}`);
  
  // Insert model
  sqlite.prepare(`
    INSERT INTO performance_models (id, name, description, type, category, is_template, created_at, updated_at)
    VALUES (?, ?, ?, 'library', ?, 1, ?, ?)
  `).run(
    modelId,
    model.name,
    model.description,
    model.category,
    Date.now(),
    Date.now()
  );
  
  // Insert scale ranges
  for (const [scaleName, range] of Object.entries(model.scales)) {
    const scaleId = scaleIds[scaleName];
    if (!scaleId) continue;
    
    const rangeId = `pmr_${modelId}_${scaleId}`;
    sqlite.prepare(`
      INSERT INTO performance_model_scales (id, model_id, scale_id, target_sten_min, target_sten_max, default_weight)
      VALUES (?, ?, ?, ?, ?, 1)
    `).run(
      rangeId,
      modelId,
      scaleId,
      range.min,
      range.max
    );
  }
}

console.log('Performance Model Library seeded successfully!');
console.log(`Created ${libraryModels.length} job templates`);