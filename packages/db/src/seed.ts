/**
 * Seed database with sample items for testing
 */

import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import * as schema from './schema';

const sqlite = new Database('profiles.db');
const db = drizzle(sqlite, { schema });

// Helper to generate IDs
const genId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

// Scale definitions
const scales = [
  // Cognitive
  { id: 'verbal_skill', name: 'Verbal Skill', description: 'Vocabulary and word knowledge', domain: 'cognitive', type: 'cognitive', minItems: 15, maxItems: 20 },
  { id: 'verbal_reasoning', name: 'Verbal Reasoning', description: 'Logical deductions and analogies', domain: 'cognitive', type: 'cognitive', minItems: 15, maxItems: 20 },
  { id: 'numerical_ability', name: 'Numerical Ability', description: 'Basic arithmetic calculations', domain: 'cognitive', type: 'cognitive', minItems: 15, maxItems: 20 },
  { id: 'numeric_reasoning', name: 'Numeric Reasoning', description: 'Number sequences and word problems', domain: 'cognitive', type: 'cognitive', minItems: 15, maxItems: 20 },
  { id: 'learning_index', name: 'Learning Index', description: 'Composite of all cognitive scales', domain: 'cognitive', type: 'cognitive', isComposite: true, compositeOf: '["verbal_skill","verbal_reasoning","numerical_ability","numeric_reasoning"]' },
  
  // Behavioral
  { id: 'energy_level', name: 'Energy Level', description: 'Pace and task completion rate', domain: 'behavioral', type: 'trait', minItems: 15, maxItems: 25 },
  { id: 'assertiveness', name: 'Assertiveness', description: 'Influence and persuasiveness', domain: 'behavioral', type: 'trait', minItems: 15, maxItems: 25 },
  { id: 'sociability', name: 'Sociability', description: 'Desire for interpersonal interaction', domain: 'behavioral', type: 'trait', minItems: 15, maxItems: 25 },
  { id: 'manageability', name: 'Manageability', description: 'Reaction to external controls', domain: 'behavioral', type: 'trait', minItems: 15, maxItems: 25 },
  { id: 'attitude', name: 'Attitude', description: 'Trust and optimism', domain: 'behavioral', type: 'trait', minItems: 15, maxItems: 25 },
  { id: 'decisiveness', name: 'Decisiveness', description: 'Risk acceptance and speed', domain: 'behavioral', type: 'trait', minItems: 15, maxItems: 25 },
  { id: 'accommodating', name: 'Accommodating', description: 'Agreeableness and harmony', domain: 'behavioral', type: 'trait', minItems: 15, maxItems: 25 },
  { id: 'independence', name: 'Independence', description: 'Self-direction vs supervision', domain: 'behavioral', type: 'trait', minItems: 15, maxItems: 25 },
  { id: 'objective_judgment', name: 'Objective Judgment', description: 'Logical vs intuitive', domain: 'behavioral', type: 'trait', minItems: 15, maxItems: 25 },
  
  // Interests
  { id: 'enterprising', name: 'Enterprising', description: 'Leadership and sales', domain: 'interests', type: 'interest', minItems: 10, maxItems: 15 },
  { id: 'financial_admin', name: 'Financial/Administrative', description: 'Order and record keeping', domain: 'interests', type: 'interest', minItems: 10, maxItems: 15 },
  { id: 'people_service', name: 'People Service', description: 'Helping and collaboration', domain: 'interests', type: 'interest', minItems: 10, maxItems: 15 },
  { id: 'technical', name: 'Technical', description: 'Research and problem solving', domain: 'interests', type: 'interest', minItems: 10, maxItems: 15 },
  { id: 'mechanical', name: 'Mechanical', description: 'Manual work and tools', domain: 'interests', type: 'interest', minItems: 10, maxItems: 15 },
  { id: 'creative', name: 'Creative', description: 'Imagination and artistic', domain: 'interests', type: 'interest', minItems: 10, maxItems: 15 },
  
  // Distortion scale (embedded in behavioral)
  { id: 'distortion', name: 'Distortion Scale', description: 'Response consistency detection', domain: 'behavioral', type: 'distortion', minItems: 10, maxItems: 15 },
];

// Sample items for each scale
const items: any[] = [];
let itemOrder = 1;

// Verbal Skill items
for (let i = 1; i <= 5; i++) {
  items.push({
    id: `vs_${i}`,
    scaleId: 'verbal_skill',
    content: `What is the synonym for: ${['eloquent', 'diligent', 'ambiguous', 'resilient', 'pragmatic'][i-1]}?`,
    contentType: 'text',
    format: 'multiple_choice',
    options: JSON.stringify(['option_a', 'option_b', 'option_c', 'option_d']),
    domain: 'cognitive',
    category: 'verbal_skill',
    irtA: 0.8 + Math.random() * 0.4,
    irtB: -1 + (i * 0.5),
    irtC: 0.25,
    difficulty: Math.ceil(i / 2),
    order: itemOrder++,
  });
}

// Verbal Reasoning items
for (let i = 1; i <= 5; i++) {
  items.push({
    id: `vr_${i}`,
    scaleId: 'verbal_reasoning',
    content: `Complete the analogy: Book is to Read as Fork is to ${['Eat', 'Kitchen', 'Metal', 'Food', 'Hand'][i-1]}`,
    contentType: 'text',
    format: 'multiple_choice',
    options: JSON.stringify(['Eat', 'Kitchen', 'Metal', 'Food', 'Hand']),
    domain: 'cognitive',
    category: 'verbal_reasoning',
    irtA: 0.9 + Math.random() * 0.3,
    irtB: -0.5 + (i * 0.4),
    irtC: 0.25,
    difficulty: Math.ceil(i / 2),
    order: itemOrder++,
  });
}

// Numerical Ability items
for (let i = 1; i <= 5; i++) {
  const problems = ['25 + 17', '84 - 39', '12 × 7', '156 ÷ 12', '234 + 567'];
  const answers = [42, 45, 84, 13, 801];
  items.push({
    id: `na_${i}`,
    scaleId: 'numerical_ability',
    content: `Calculate: ${problems[i-1]}`,
    contentType: 'text',
    format: 'multiple_choice',
    options: JSON.stringify([answers[i-1], answers[i-1] + 1, answers[i-1] - 1, answers[i-1] + 5]),
    correctAnswer: answers[i-1].toString(),
    domain: 'cognitive',
    category: 'numerical_ability',
    irtA: 1.0 + Math.random() * 0.3,
    irtB: -1 + (i * 0.6),
    irtC: 0.25,
    difficulty: Math.ceil(i / 2),
    order: itemOrder++,
  });
}

// Numeric Reasoning items
for (let i = 1; i <= 5; i++) {
  const sequences = ['2, 4, 8, 16, ?', '3, 6, 12, 24, ?', '1, 1, 2, 3, 5, ?', '5, 10, 20, 40, ?', '100, 90, 80, 70, ?'];
  const answers = [32, 48, 8, 80, 60];
  items.push({
    id: `nr_${i}`,
    scaleId: 'numeric_reasoning',
    content: `What comes next? ${sequences[i-1]}`,
    contentType: 'text',
    format: 'multiple_choice',
    options: JSON.stringify([answers[i-1], answers[i-1] + 2, answers[i-1] - 2, answers[i-1] * 2]),
    correctAnswer: answers[i-1].toString(),
    domain: 'cognitive',
    category: 'numeric_reasoning',
    irtA: 1.1 + Math.random() * 0.4,
    irtB: 0 + (i * 0.5),
    irtC: 0.2,
    difficulty: Math.ceil(i / 2),
    order: itemOrder++,
  });
}

// Behavioral trait items (Likert format)
const traitQuestions: Record<string, string[]> = {
  energy_level: [
    'I prefer to work at a fast pace',
    'I often complete tasks before deadlines',
    'I have high energy throughout the day',
    'I like to keep busy and productive',
    'I work quickly and efficiently',
  ],
  assertiveness: [
    'I am comfortable expressing my opinions',
    'I enjoy taking charge of situations',
    'I am confident in persuasive situations',
    'I like to influence others\' decisions',
    'I speak up when I disagree',
  ],
  sociability: [
    'I enjoy meeting new people',
    'I prefer collaborative work environments',
    'I like social interactions at work',
    'I maintain many professional relationships',
    'I enjoy team activities',
  ],
  manageability: [
    'I follow rules and procedures carefully',
    'I am comfortable with clear structure',
    'I adapt well to organizational policies',
    'I prefer clear guidelines',
    'I work well under supervision',
  ],
  attitude: [
    'I maintain a positive outlook',
    'I trust others until proven wrong',
    'I see opportunities in challenges',
    'I am optimistic about the future',
    'I believe in people\'s good intentions',
  ],
  decisiveness: [
    'I make decisions quickly',
    'I am comfortable with uncertainty',
    'I take risks when necessary',
    'I decide without excessive analysis',
    'I act decisively under pressure',
  ],
  accommodating: [
    'I prioritize group harmony',
    'I am agreeable in discussions',
    'I consider others\' feelings',
    'I avoid conflicts when possible',
    'I am cooperative in teams',
  ],
  independence: [
    'I prefer to work autonomously',
    'I need minimal supervision',
    'I trust my own judgment',
    'I prefer self-directed work',
    'I make my own decisions',
  ],
  objective_judgment: [
    'I rely on facts over intuition',
    'I make logical decisions',
    'I prefer data-driven insights',
    'I analyze before concluding',
    'I trust evidence more than gut feelings',
  ],
};

for (const [scaleId, questions] of Object.entries(traitQuestions)) {
  questions.forEach((q, i) => {
    items.push({
      id: `${scaleId}_${i + 1}`,
      scaleId,
      content: q,
      contentType: 'text',
      format: 'likert',
      options: JSON.stringify([1, 2, 3, 4, 5]),
      domain: 'behavioral',
      category: scaleId,
      irtA: 0.6 + Math.random() * 0.4,
      irtB: -1 + Math.random() * 2,
      irtC: 0,
      difficulty: 2 + Math.floor(Math.random() * 3),
      order: itemOrder++,
    });
  });
}

// Interest items (forced-choice pairs)
const interestPairs: Record<string, [string, string][]> = {
  enterprising: [
    ['Lead a team', 'Work independently'],
    ['Sell products', 'Create products'],
    ['Make decisions', 'Follow procedures'],
  ],
  financial_admin: [
    ['Keep organized records', 'Work with people'],
    ['Follow precise procedures', 'Adapt to new situations'],
    ['Work with numbers', 'Work with ideas'],
  ],
  people_service: [
    ['Help others solve problems', 'Analyze data'],
    ['Teach others', 'Build things'],
    ['Work in a team', 'Work alone'],
  ],
  technical: [
    ['Solve complex problems', 'Work with people'],
    ['Research new ideas', 'Implement solutions'],
    ['Use technical tools', 'Lead meetings'],
  ],
  mechanical: [
    ['Work with tools', 'Work with computers'],
    ['Build or repair things', 'Analyze information'],
    ['Work outdoors', 'Work in an office'],
  ],
  creative: [
    ['Design new things', 'Follow established methods'],
    ['Express ideas', 'Analyze data'],
    ['Be artistic', 'Be systematic'],
  ],
};

for (const [scaleId, pairs] of Object.entries(interestPairs)) {
  pairs.forEach(([opt1, opt2], i) => {
    items.push({
      id: `${scaleId}_fc_${i + 1}`,
      scaleId,
      content: JSON.stringify([opt1, opt2]),
      contentType: 'text',
      format: 'forced_choice',
      options: JSON.stringify([opt1, opt2]),
      domain: 'interests',
      category: scaleId,
      irtA: 0.5 + Math.random() * 0.3,
      irtB: -0.5 + Math.random(),
      irtC: 0,
      difficulty: 2,
      order: itemOrder++,
    });
  });
}

// Distortion scale items (socially desirable statements)
const distortionItems = [
  'I always work hard',
  'I never make mistakes',
  'I am always honest',
  'I never get frustrated',
  'I always follow rules',
  'I never complain',
  'I am always patient',
  'I never lose my temper',
];

distortionItems.forEach((q, i) => {
  items.push({
    id: `distortion_${i + 1}`,
    scaleId: 'distortion',
    content: q,
    contentType: 'text',
    format: 'likert',
    options: JSON.stringify([1, 2, 3, 4, 5]),
    domain: 'behavioral',
    category: 'distortion',
    isDistortion: true,
    irtA: 0.4,
    irtB: 1.5, // Biased toward high scores
    irtC: 0,
    difficulty: 3,
    order: itemOrder++,
  });
});

// Insert scales
for (const scale of scales) {
  sqlite.prepare(`
    INSERT OR IGNORE INTO scales (id, name, description, domain, type, min_items, max_items, is_composite, composite_of, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    scale.id,
    scale.name,
    scale.description,
    scale.domain,
    scale.type,
    scale.minItems,
    scale.maxItems,
    scale.isComposite ? 1 : 0,
    scale.compositeOf || null,
    Date.now()
  );
}

// Insert items
for (const item of items) {
  sqlite.prepare(`
    INSERT OR IGNORE INTO items (id, scale_id, content, content_type, format, options, correct_answer, irt_a, irt_b, irt_c, domain, category, is_distortion, "order", is_active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `).run(
    item.id,
    item.scaleId,
    item.content,
    item.contentType,
    item.format,
    item.options,
    item.correctAnswer || null,
    item.irtA,
    item.irtB,
    item.irtC,
    item.domain,
    item.category,
    item.isDistortion ? 1 : 0,
    item.order,
    Date.now()
  );
}

console.log(`Seeded ${scales.length} scales and ${items.length} items`);
console.log('Database seeded successfully!');
