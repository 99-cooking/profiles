/**
 * Seed database with comprehensive sample items for testing
 * Step 28: Ensure every scale has enough items for realistic demo
 * - At least 10 cognitive per subscale
 * - At least 15 behavioral per trait
 * - At least 10 interest pairs
 */

import { Database } from 'bun:sqlite';
import * as schema from './schema';

const sqlite = new Database('profiles.db');

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

// Clear existing items (optional - for fresh seeding)
// sqlite.prepare('DELETE FROM items').run();

// Sample items for each scale - ENHANCED for realistic demo
const items: any[] = [];
let itemOrder = 1;

// ============================================
// VERBAL SKILL - 15 items (synonym questions)
// ============================================
const verbalSkillWords = [
  { word: 'eloquent', options: ['articulate', 'quiet', 'angry', 'tall'], correct: 'articulate' },
  { word: 'diligent', options: ['lazy', 'hardworking', 'happy', 'fast'], correct: 'hardworking' },
  { word: 'ambiguous', options: ['clear', 'unclear', 'important', 'small'], correct: 'unclear' },
  { word: 'resilient', options: ['fragile', 'strong', 'weak', 'tall'], correct: 'strong' },
  { word: 'pragmatic', options: ['practical', 'idealistic', 'funny', 'sad'], correct: 'practical' },
  { word: 'verbose', options: ['brief', 'wordy', 'quiet', 'loud'], correct: 'wordy' },
  { word: 'tenacious', options: ['lazy', 'persistent', 'happy', 'weak'], correct: 'persistent' },
  { word: 'capricious', options: ['consistent', 'unpredictable', 'stable', 'calm'], correct: 'unpredictable' },
  { word: 'meticulous', options: ['careless', 'careful', 'quick', 'slow'], correct: 'careful' },
  { word: 'gregarious', options: ['shy', 'sociable', 'quiet', 'angry'], correct: 'sociable' },
  { word: 'acrimonious', options: ['friendly', 'hostile', 'neutral', 'happy'], correct: 'hostile' },
  { word: 'benevolent', options: ['cruel', 'kind', 'indifferent', 'angry'], correct: 'kind' },
  { word: 'ephemeral', options: ['permanent', 'temporary', 'important', 'small'], correct: 'temporary' },
  { word: 'ostentatious', options: ['modest', 'showy', 'quiet', 'simple'], correct: 'showy' },
  { word: 'prolific', options: ['barren', 'productive', 'lazy', 'uncreative'], correct: 'productive' },
];

verbalSkillWords.forEach((item, i) => {
  items.push({
    id: `verbal_skill_${i + 1}`,
    scaleId: 'verbal_skill',
    content: `What is the synonym for: ${item.word}?`,
    contentType: 'text',
    format: 'multiple_choice',
    options: JSON.stringify(item.options),
    correctAnswer: item.correct,
    domain: 'cognitive',
    category: 'verbal_skill',
    irtA: 0.8 + Math.random() * 0.4,
    irtB: -1.5 + (i * 0.25),
    irtC: 0.25,
    difficulty: 1 + Math.floor(i / 3),
    order: itemOrder++,
  });
});

// ============================================
// VERBAL REASONING - 15 items (analogies)
// ============================================
const verbalReasoningItems = [
  { a: 'Book', b: 'Read', c: 'Fork', answer: 'Eat' },
  { a: 'Pen', b: 'Write', c: 'Key', answer: 'Lock' },
  { a: 'Hot', b: 'Cold', c: 'Light', answer: 'Dark' },
  { a: 'Bird', b: 'Fly', c: 'Fish', answer: 'Swim' },
  { a: 'Doctor', b: 'Hospital', c: 'Teacher', answer: 'School' },
  { a: 'Car', b: 'Road', c: 'Ship', answer: 'Sea' },
  { a: 'Day', b: 'Night', c: 'Work', answer: 'Rest' },
  { a: 'Tree', b: 'Leaf', c: 'Book', answer: 'Page' },
  { a: 'Chef', b: 'Kitchen', c: 'Pilot', answer: 'Plane' },
  { a: 'Music', b: 'Listen', c: 'Art', answer: 'View' },
  { a: 'Winter', b: 'Cold', c: 'Summer', answer: 'Hot' },
  { a: 'Dog', b: 'Bark', c: 'Cat', answer: 'Meow' },
  { a: 'Water', b: 'Drink', c: 'Food', answer: 'Eat' },
  { a: 'Seed', b: 'Plant', c: 'Egg', answer: 'Chick' },
  { a: 'Moon', b: 'Night', c: 'Sun', answer: 'Day' },
];

verbalReasoningItems.forEach((item, i) => {
  items.push({
    id: `verbal_reasoning_${i + 1}`,
    scaleId: 'verbal_reasoning',
    content: `Complete the analogy: ${item.a} is to ${item.b} as ${item.c} is to ___`,
    contentType: 'text',
    format: 'multiple_choice',
    options: JSON.stringify([item.answer, 'Wrong1', 'Wrong2', 'Wrong3']),
    correctAnswer: item.answer,
    domain: 'cognitive',
    category: 'verbal_reasoning',
    irtA: 0.9 + Math.random() * 0.3,
    irtB: -1 + (i * 0.2),
    irtC: 0.25,
    difficulty: 1 + Math.floor(i / 3),
    order: itemOrder++,
  });
});

// ============================================
// NUMERICAL ABILITY - 15 items
// ============================================
const numericalProblems = [
  { q: '25 + 17', a: 42 },
  { q: '84 - 39', a: 45 },
  { q: '12 × 7', a: 84 },
  { q: '156 ÷ 12', a: 13 },
  { q: '234 + 567', a: 801 },
  { q: '99 - 47', a: 52 },
  { q: '15 × 8', a: 120 },
  { q: '144 ÷ 9', a: 16 },
  { q: '456 + 278', a: 734 },
  { q: '63 - 28', a: 35 },
  { q: '18 × 6', a: 108 },
  { q: '255 ÷ 5', a: 51 },
  { q: '321 + 189', a: 510 },
  { q: '72 - 19', a: 53 },
  { q: '25 × 12', a: 300 },
];

numericalProblems.forEach((item, i) => {
  items.push({
    id: `numerical_ability_${i + 1}`,
    scaleId: 'numerical_ability',
    content: `Calculate: ${item.q}`,
    contentType: 'text',
    format: 'multiple_choice',
    options: JSON.stringify([item.a, item.a + 1, item.a - 1, item.a + 5]),
    correctAnswer: item.a.toString(),
    domain: 'cognitive',
    category: 'numerical_ability',
    irtA: 1.0 + Math.random() * 0.3,
    irtB: -1.2 + (i * 0.2),
    irtC: 0.25,
    difficulty: 1 + Math.floor(i / 3),
    order: itemOrder++,
  });
});

// ============================================
// NUMERIC REASONING - 15 items
// ============================================
const numericSequences = [
  { seq: '2, 4, 8, 16, ?', a: 32, wrong: [30, 34, 64] },
  { seq: '3, 6, 12, 24, ?', a: 48, wrong: [46, 50, 96] },
  { seq: '1, 1, 2, 3, 5, ?', a: 8, wrong: [6, 7, 9] },
  { seq: '5, 10, 20, 40, ?', a: 80, wrong: [78, 82, 160] },
  { seq: '100, 90, 80, 70, ?', a: 60, wrong: [58, 62, 50] },
  { seq: '2, 6, 18, 54, ?', a: 162, wrong: [158, 164, 324] },
  { seq: '1, 4, 9, 16, ?', a: 25, wrong: [23, 27, 36] },
  { seq: '3, 8, 13, 18, ?', a: 23, wrong: [21, 25, 28] },
  { seq: '10, 20, 40, 80, 160, ?', a: 320, wrong: [318, 322, 640] },
  { seq: '1, 3, 7, 15, ?', a: 31, wrong: [29, 33, 63] },
  { seq: '4, 9, 14, 19, ?', a: 24, wrong: [22, 26, 29] },
  { seq: '2, 5, 10, 17, ?', a: 26, wrong: [24, 28, 34] },
  { seq: '1, 2, 6, 24, ?', a: 120, wrong: [100, 110, 144] },
  { seq: '5, 11, 17, 23, ?', a: 29, wrong: [27, 31, 35] },
  { seq: '3, 7, 15, 31, ?', a: 63, wrong: [61, 65, 127] },
];

numericSequences.forEach((item, i) => {
  items.push({
    id: `numeric_reasoning_${i + 1}`,
    scaleId: 'numeric_reasoning',
    content: `What comes next? ${item.seq}`,
    contentType: 'text',
    format: 'multiple_choice',
    options: JSON.stringify([item.a, ...item.wrong]),
    correctAnswer: item.a.toString(),
    domain: 'cognitive',
    category: 'numeric_reasoning',
    irtA: 1.1 + Math.random() * 0.4,
    irtB: -0.5 + (i * 0.2),
    irtC: 0.2,
    difficulty: 1 + Math.floor(i / 3),
    order: itemOrder++,
  });
});

// ============================================
// BEHAVIORAL TRAITS - 20 items each (Likert format)
// ============================================
const traitQuestions: Record<string, string[]> = {
  energy_level: [
    'I prefer to work at a fast pace',
    'I often complete tasks before deadlines',
    'I have high energy throughout the day',
    'I like to keep busy and productive',
    'I work quickly and efficiently',
    'I am always looking for new tasks',
    'I dislike slow-moving projects',
    'I maintain a high work tempo',
    'I thrive under pressure',
    'I stay active during work hours',
    'I find it hard to sit still',
    'I am energized by challenging work',
    'I prefer working on multiple projects',
    'I get restless when tasks are slow',
    'I am known as a fast worker',
    'I enjoy working at full speed',
    'I am motivated by deadlines',
    'I complete work ahead of schedule',
    'I have difficulty slowing down',
    'I bring energy to every task',
  ],
  assertiveness: [
    'I am comfortable expressing my opinions',
    'I enjoy taking charge of situations',
    'I am confident in persuasive situations',
    'I like to influence others\' decisions',
    'I speak up when I disagree',
    'I am not afraid to lead',
    'I enjoy debating topics',
    'I am comfortable being the center of attention',
    'I take initiative in group settings',
    'I am confident in negotiations',
    'I voice my ideas strongly',
    'I am comfortable challenging authority',
    'I enjoy competition',
    'I am decisive in conflicts',
    'I am comfortable making first contact',
    'I take credit for my work',
    'I express my views directly',
    'I am comfortable selling ideas',
    'I enjoy public speaking',
    'I am comfortable with confrontation',
  ],
  sociability: [
    'I enjoy meeting new people',
    'I prefer collaborative work environments',
    'I like social interactions at work',
    'I maintain many professional relationships',
    'I enjoy team activities',
    'I am talkative in meetings',
    'I enjoy office social events',
    'I reach out to colleagues regularly',
    'I am comfortable with small talk',
    'I build rapport quickly',
    'I prefer working in teams over alone',
    'I enjoy mentoring others',
    'I am approachable',
    'I like to celebrate team successes',
    'I stay connected with former colleagues',
    'I enjoy networking events',
    'I am comfortable in crowds',
    'I initiate conversations',
    'I enjoy helping others',
    'I am a people person',
  ],
  manageability: [
    'I follow rules and procedures carefully',
    'I am comfortable with clear structure',
    'I adapt well to organizational policies',
    'I prefer clear guidelines',
    'I work well under supervision',
    'I respect hierarchy and authority',
    'I am compliant with company policies',
    'I prefer established processes',
    'I am comfortable being managed closely',
    'I follow instructions precisely',
    'I value clear expectations',
    'I am comfortable with routine',
    'I adapt to organizational changes',
    'I respect chain of command',
    'I am a team player',
    'I follow through on commitments',
    'I am reliable and dependable',
    'I meet deadlines consistently',
    'I am organized and systematic',
    'I work well within constraints',
  ],
  attitude: [
    'I maintain a positive outlook',
    'I trust others until proven wrong',
    'I see opportunities in challenges',
    'I am optimistic about the future',
    'I believe in people\'s good intentions',
    'I am generally happy',
    'I see the best in people',
    'I am hopeful about outcomes',
    'I maintain enthusiasm',
    'I am grateful for what I have',
    'I see setbacks as learning opportunities',
    'I am resilient in adversity',
    'I bring positivity to teams',
    'I encourage others',
    'I am cheerful in difficult times',
    'I believe things will work out',
    'I give people the benefit of the doubt',
    'I am upbeat most of the time',
    'I look on the bright side',
    'I spread good vibes',
  ],
  decisiveness: [
    'I make decisions quickly',
    'I am comfortable with uncertainty',
    'I take risks when necessary',
    'I decide without excessive analysis',
    'I act decisively under pressure',
    'I am comfortable making calls with incomplete info',
    'I trust my instincts',
    'I make up my mind fast',
    'I am willing to make mistakes',
    'I move forward confidently',
    'I am comfortable with ambiguity',
    'I make decisions and stick with them',
    'I do not overthink choices',
    'I am comfortable with time pressure',
    'I am decisive in emergencies',
    'I take action rather than wait',
    'I am confident in my choices',
    'I make quick judgments',
    'I am comfortable being wrong sometimes',
    'I take responsibility for decisions',
  ],
  accommodating: [
    'I prioritize group harmony',
    'I am agreeable in discussions',
    'I consider others\' feelings',
    'I avoid conflicts when possible',
    'I am cooperative in teams',
    'I am willing to compromise',
    'I put others\' needs first',
    'I am patient with others',
    'I try to keep the peace',
    'I am diplomatic',
    'I avoid arguments',
    'I am understanding of different views',
    'I go along to get along',
    'I am flexible in my approach',
    'I am considerate of others',
    'I try not to upset people',
    'I adapt to others\' preferences',
    'I am easy to work with',
    'I value consensus',
    'I am a people pleaser',
  ],
  independence: [
    'I prefer to work autonomously',
    'I need minimal supervision',
    'I trust my own judgment',
    'I prefer self-directed work',
    'I make my own decisions',
    'I am comfortable working alone',
    'I rely on myself',
    'I prefer minimal oversight',
    'I am self-motivated',
    'I set my own goals',
    'I am comfortable with isolation',
    'I trust my instincts over others\' advice',
    'I avoid asking for help',
    'I prefer to figure things out myself',
    'I am confident in my abilities',
    'I take initiative without prompting',
    'I am comfortable challenging norms',
    'I prefer to lead rather than follow',
    'I am self-reliant',
    'I do things my way',
  ],
  objective_judgment: [
    'I rely on facts over intuition',
    'I make logical decisions',
    'I prefer data-driven insights',
    'I analyze before concluding',
    'I trust evidence more than gut feelings',
    'I am analytical in my approach',
    'I consider all the facts',
    'I am skeptical of emotional appeals',
    'I base opinions on data',
    'I am methodical',
    'I verify information before accepting',
    'I prefer concrete evidence',
    'I am rational in debates',
    'I look for proof',
    'I am not easily swayed',
    'I use logic to solve problems',
    'I am practical and realistic',
    'I evaluate objectively',
    'I am detail-oriented',
    'I trust science over speculation',
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

// ============================================
// INTERESTS - 15 forced-choice pairs each
// ============================================
const interestPairs: Record<string, [string, string][]> = {
  enterprising: [
    ['Lead a team', 'Work independently'],
    ['Sell products', 'Create products'],
    ['Make decisions', 'Follow procedures'],
    ['Start my own business', 'Work for a company'],
    ['Negotiate deals', 'Analyze data'],
    ['Motivate others', 'Work alone'],
    ['Take financial risks', 'Play it safe'],
    ['Manage people', 'Work with tools'],
    ['Give presentations', 'Do research'],
    ['Be in charge', 'Be a team member'],
    ['Achieve sales targets', 'Achieve quality standards'],
    ['Persuade others', 'Teach others'],
    ['Compete with others', 'Collaborate with others'],
    ['Take charge in crises', 'Provide support in crises'],
    ['Launch new initiatives', 'Maintain existing systems'],
  ],
  financial_admin: [
    ['Keep organized records', 'Work with people'],
    ['Follow precise procedures', 'Adapt to new situations'],
    ['Work with numbers', 'Work with ideas'],
    ['Ensure accuracy', 'Ensure speed'],
    ['Process paperwork', 'Meet with clients'],
    ['Work in accounting', 'Work in marketing'],
    ['Maintain spreadsheets', 'Write reports'],
    ['Follow regulations', 'Create new approaches'],
    ['Be detail-oriented', 'Be big-picture oriented'],
    ['Work with data', 'Work with emotions'],
    ['Verify calculations', 'Make forecasts'],
    ['Manage budgets', 'Manage teams'],
    ['Ensure compliance', 'Drive innovation'],
    ['Organize information', 'Organize people'],
    ['Work with systems', 'Work with people'],
  ],
  people_service: [
    ['Help others solve problems', 'Analyze data'],
    ['Teach others', 'Build things'],
    ['Work in a team', 'Work alone'],
    ['Support colleagues', 'Lead projects'],
    ['Listen to concerns', 'Give presentations'],
    ['Provide advice', 'Create designs'],
    ['Work with customers', 'Work with data'],
    ['Resolve conflicts', 'Avoid conflicts'],
    ['Show empathy', 'Show objectivity'],
    ['Coach others', 'Code solutions'],
    ['Care for others', 'Build products'],
    ['Understand feelings', 'Understand numbers'],
    ['Serve others', 'Direct others'],
    ['Collaborate with clients', 'Work with algorithms'],
    ['Improve well-being', 'Improve efficiency'],
  ],
  technical: [
    ['Solve complex problems', 'Work with people'],
    ['Research new ideas', 'Implement solutions'],
    ['Use technical tools', 'Lead meetings'],
    ['Analyze data', 'Analyze feelings'],
    ['Work with computers', 'Work with customers'],
    ['Read technical manuals', 'Read fiction'],
    ['Debug code', 'Design presentations'],
    ['Build systems', 'Manage teams'],
    ['Understand how things work', 'Understand how people work'],
    ['Work independently', 'Work in teams'],
    ['Learn new technologies', 'Use established methods'],
    ['Design algorithms', 'Design marketing campaigns'],
    ['Work with data', 'Work with emotions'],
    ['Think logically', 'Think creatively'],
    ['Create technical solutions', 'Create artistic solutions'],
  ],
  mechanical: [
    ['Work with tools', 'Work with computers'],
    ['Build or repair things', 'Analyze information'],
    ['Work outdoors', 'Work in an office'],
    ['Use hand tools', 'Use software'],
    ['Assemble products', 'Design products'],
    ['Work with my hands', 'Work with my mind'],
    ['Fix broken things', 'Create new things'],
    ['Operate machinery', 'Operate systems'],
    ['Work in a workshop', 'Work in an office'],
    ['Read blueprints', 'Read reports'],
    ['Use physical skills', 'Use analytical skills'],
    ['Maintain equipment', 'Manage people'],
    ['Troubleshoot mechanical issues', 'Troubleshoot people issues'],
    ['Work with materials', 'Work with data'],
    ['Perform manual tasks', 'Perform mental tasks'],
  ],
  creative: [
    ['Design new things', 'Follow established methods'],
    ['Express ideas', 'Analyze data'],
    ['Be artistic', 'Be systematic'],
    ['Imagine new possibilities', 'Focus on reality'],
    ['Create something unique', 'Improve existing solutions'],
    ['Break rules', 'Follow rules'],
    ['Take creative risks', 'Play it safe'],
    ['Trust intuition', 'Trust data'],
    ['Work in chaos', 'Work in order'],
    ['Be unconventional', 'Be conventional'],
    ['Generate many ideas', 'Select the best idea'],
    ['Explore new approaches', 'Use proven approaches'],
    ['Create visual content', 'Create numerical content'],
    ['Innovate', 'Optimize'],
    ['Think outside the box', 'Think inside the box'],
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

// ============================================
// DISTORTION SCALE - 15 items (socially desirable)
// ============================================
const distortionItems = [
  'I always work hard',
  'I never make mistakes',
  'I am always honest',
  'I never get frustrated',
  'I always follow rules',
  'I never complain',
  'I am always patient',
  'I never lose my temper',
  'I am never late',
  'I never waste time',
  'I always stay positive',
  'I never argue with coworkers',
  'I am always productive',
  'I never make excuses',
  'I always meet commitments',
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
    irtB: 1.5,
    irtC: 0,
    difficulty: 3,
    order: itemOrder++,
  });
});

// ============================================
// INSERT INTO DATABASE
// ============================================

// Insert scales
for (const scale of scales) {
  sqlite.prepare(`
    INSERT OR REPLACE INTO scales (id, name, description, domain, type, min_items, max_items, is_composite, composite_of, created_at)
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
    INSERT OR REPLACE INTO items (id, scale_id, content, content_type, format, options, correct_answer, irt_a, irt_b, irt_c, domain, category, is_distortion, "order", is_active, created_at)
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

// Count items per scale
const itemCounts: Record<string, number> = {};
for (const item of items) {
  itemCounts[item.scaleId] = (itemCounts[item.scaleId] || 0) + 1;
}

console.log('========================================');
console.log('Database seeded successfully!');
console.log(`Inserted ${scales.length} scales`);
console.log(`Inserted ${items.length} items`);
console.log('========================================');
console.log('Items per scale:');
for (const [scaleId, count] of Object.entries(itemCounts)) {
  console.log(`  ${scaleId}: ${count}`);
}
