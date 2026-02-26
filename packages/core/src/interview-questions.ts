/**
 * Interview Question Bank
 * Dynamic questions for scales outside model band
 */

export interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  followUp?: string[];
}

// Scale definitions for context
const scaleContext: Record<string, { name: string; highLabel: string; lowLabel: string }> = {
  // Cognitive
  verbal_skill: { name: 'Verbal Skill', highLabel: 'High verbal skill', lowLabel: 'Low verbal skill' },
  verbal_reasoning: { name: 'Verbal Reasoning', highLabel: 'Strong analytical thinker', lowLabel: 'Less analytical' },
  numerical_ability: { name: 'Numerical Ability', highLabel: 'Strong numerical skills', lowLabel: 'Limited numerical skills' },
  numeric_reasoning: { name: 'Numeric Reasoning', highLabel: 'Strong numeric reasoning', lowLabel: 'Limited numeric reasoning' },
  // Behavioral
  energy_level: { name: 'Energy Level', highLabel: 'High energy, fast-paced', lowLabel: 'Calm, measured pace' },
  assertiveness: { name: 'Assertiveness', highLabel: 'Direct and assertive', lowLabel: 'More passive approach' },
  sociability: { name: 'Sociability', highLabel: 'Highly social', lowLabel: 'Reserved, prefer solitude' },
  manageability: { name: 'Manageability', highLabel: 'Independent thinker', lowLabel: 'Prefers structure/direction' },
  attitude: { name: 'Attitude', highLabel: 'Optimistic, positive', lowLabel: 'Cautious, realistic' },
  decisiveness: { name: 'Decisiveness', highLabel: 'Quick decision-maker', lowLabel: 'Deliberate, thorough' },
  accommodating: { name: 'Accommodating', highLabel: 'Cooperative, harmonizing', lowLabel: 'Direct, challenging' },
  independence: { name: 'Independence', highLabel: 'Self-directed', lowLabel: 'Team-oriented' },
  objective_judgment: { name: 'Objective Judgment', highLabel: 'Data-driven', lowLabel: 'Intuition-based' },
  // Interests
  enterprising: { name: 'Enterprising', highLabel: 'Leadership/sales orientation', lowLabel: 'Non-commercial focus' },
  financial_admin: { name: 'Financial/Administrative', highLabel: 'Order and routine orientation', lowLabel: 'Flexible approach' },
  people_service: { name: 'People Service', highLabel: 'Helping/collaborative orientation', lowLabel: 'Task-focused' },
  technical: { name: 'Technical', highLabel: 'Analytical/problem-solving', lowLabel: 'Non-technical focus' },
  mechanical: { name: 'Mechanical', highLabel: 'Hands-on/practical orientation', lowLabel: 'Conceptual focus' },
  creative: { name: 'Creative', highLabel: 'Imaginative/creative orientation', lowLabel: 'Conventional approach' },
};

// Questions for each scale and direction (high/low)
const questionBank: Record<string, { high: InterviewQuestion[]; low: InterviewQuestion[] }> = {
  // === COGNITIVE SCALES ===
  verbal_skill: {
    high: [
      { id: 'vs_h1', question: 'Can you describe a situation where you had to explain complex information to someone without technical background?', category: 'Communication' },
      { id: 'vs_h2', question: 'How do you typically present written recommendations to stakeholders?', category: 'Writing' },
    ],
    low: [
      { id: 'vs_l1', question: 'What strategies do you use when you need to communicate technical concepts to non-technical team members?', category: 'Communication' },
      { id: 'vs_l2', question: 'How do you ensure your written communication is clear and accessible?', category: 'Writing' },
    ],
  },
  verbal_reasoning: {
    high: [
      { id: 'vr_h1', question: 'Walk me through how you analyze a complex problem and develop a solution.', category: 'Problem Analysis' },
      { id: 'vr_h2', question: 'Describe a time when you had to make a logical argument to convince others.', category: 'Reasoning' },
    ],
    low: [
      { id: 'vr_l1', question: 'How do you approach making decisions when information is incomplete?', category: 'Decision Making' },
      { id: 'vr_l2', question: 'What helps you most when analyzing information and drawing conclusions?', category: 'Analysis' },
    ],
  },
  numerical_ability: {
    high: [
      { id: 'na_h1', question: 'Describe a project where you worked extensively with numerical data.', category: 'Data Work' },
      { id: 'na_h2', question: 'How do you ensure accuracy when working with financial or numerical information?', category: 'Accuracy' },
    ],
    low: [
      { id: 'na_l1', question: 'What tools or support do you use when working with numerical data?', category: 'Data Work' },
      { id: 'na_l2', question: 'How do you verify your work when it involves calculations?', category: 'Accuracy' },
    ],
  },
  numeric_reasoning: {
    high: [
      { id: 'nr_h1', question: 'Give an example of when you identified a trend from data that others missed.', category: 'Insight' },
      { id: 'nr_h2', question: 'How do you approach solving problems that involve numbers or statistics?', category: 'Problem Solving' },
    ],
    low: [
      { id: 'nr_l1', question: 'When you encounter numerical problems, what approach works best for you?', category: 'Problem Solving' },
      { id: 'nr_l2', question: 'How do you make decisions when quantitative data is limited?', category: 'Decision Making' },
    ],
  },
  
  // === BEHAVIORAL SCALES ===
  energy_level: {
    high: [
      { id: 'el_h1', question: 'How do you manage working on multiple high-priority projects simultaneously?', category: 'Pace Management' },
      { id: 'el_h2', question: 'Describe your ideal work environment in terms of pace and variety.', category: 'Work Style' },
      { id: 'el_h3', question: 'What do you do when you need to slow down to match a team member\'s pace?', category: 'Teamwork' },
    ],
    low: [
      { id: 'el_l1', question: 'How do you maintain productivity in a role requiring sustained high energy?', category: 'Sustained Effort' },
      { id: 'el_l2', question: 'What strategies help you manage your energy throughout the workday?', category: 'Energy Management' },
    ],
  },
  assertiveness: {
    high: [
      { id: 'as_h1', question: 'Describe a time when you had to influence someone at a higher level.', category: 'Influence' },
      { id: 'as_h2', question: 'How do you handle situations where you disagree with management decisions?', category: 'Conflict' },
      { id: 'as_h3', question: 'What approaches help you be persuasive without being aggressive?', category: 'Communication' },
    ],
    low: [
      { id: 'as_l1', question: 'How do you ensure your perspectives are heard in meetings?', category: 'Voice' },
      { id: 'as_l2', question: 'What support helps you be more assertive in challenging situations?', category: 'Development' },
    ],
  },
  sociability: {
    high: [
      { id: 'so_h1', question: 'How do you balance building relationships with completing individual work?', category: 'Balance' },
      { id: 'so_h2', question: 'Describe your approach to networking and building professional relationships.', category: 'Networking' },
    ],
    low: [
      { id: 'so_l1', question: 'How do you build trust and rapport with colleagues you interact with less frequently?', category: 'Relationships' },
      { id: 'so_l2', question: 'What strategies help you in roles requiring regular stakeholder contact?', category: 'Communication' },
    ],
  },
  manageability: {
    high: [
      { id: 'ma_h1', question: 'How do you respond when given direction that conflicts with your own approach?', category: 'Adaptability' },
      { id: 'ma_h2', question: 'Describe how you work with supervisors who have different management styles.', category: 'Flexibility' },
    ],
    low: [
      { id: 'ma_l1', question: 'How do you handle situations where you believe a different approach would be better?', category: 'Advocacy' },
      { id: 'ma_l2', question: 'What role does autonomy play in your job satisfaction?', category: 'Independence' },
    ],
  },
  attitude: {
    high: [
      { id: 'at_h1', question: 'How do you maintain positivity during challenging projects or setbacks?', category: 'Resilience' },
      { id: 'at_h2', question: 'Describe how you approach problems with a positive outlook.', category: 'Mindset' },
    ],
    low: [
      { id: 'at_l1', question: 'How do you stay motivated when facing repeated obstacles?', category: 'Motivation' },
      { id: 'at_l2', question: 'What helps you maintain a realistic but constructive perspective?', category: 'Balance' },
    ],
  },
  decisiveness: {
    high: [
      { id: 'de_h1', question: 'Describe a time you made a quick decision that paid off.', category: 'Decision Speed' },
      { id: 'de_h2', question: 'How do you balance speed with thoroughness in decision-making?', category: 'Quality' },
    ],
    low: [
      { id: 'de_l1', question: 'What information do you need before making important decisions?', category: 'Information Needs' },
      { id: 'de_l2', question: 'How do you avoid analysis paralysis when faced with complex choices?', category: 'Decision Making' },
    ],
  },
  accommodating: {
    high: [
      { id: 'ac_h1', question: 'How do you handle disagreements within your team?', category: 'Conflict Resolution' },
      { id: 'ac_h2', question: 'Describe your approach to giving constructive feedback.', category: 'Feedback' },
    ],
    low: [
      { id: 'ac_l1', question: 'How do you ensure your voice is heard while maintaining team harmony?', category: 'Balance' },
      { id: 'ac_l2', question: 'What strategies help you address conflict directly but respectfully?', category: 'Conflict' },
    ],
  },
  independence: {
    high: [
      { id: 'in_h1', question: 'How do you stay productive without regular supervision?', category: 'Self-Management' },
      { id: 'in_h2', question: 'Describe a situation where you worked independently on a major project.', category: 'Autonomy' },
    ],
    low: [
      { id: 'in_l1', question: 'What type of supervision and guidance helps you perform best?', category: 'Support Needs' },
      { id: 'in_l2', question: 'How do you build confidence in making decisions without constant approval?', category: 'Development' },
    ],
  },
  objective_judgment: {
    high: [
      { id: 'oj_h1', question: 'Give an example of when you made a data-driven decision that others disagreed with.', category: 'Data-Driven' },
      { id: 'oj_h2', question: 'How do you balance objective data with intangible factors?', category: 'Balance' },
    ],
    low: [
      { id: 'oj_l1', question: 'How do you incorporate intuition and gut feeling into your decisions?', category: 'Intuition' },
      { id: 'oj_l2', question: 'What role does personal experience play in your decision-making?', category: 'Experience' },
    ],
  },
  
  // === INTEREST SCALES ===
  enterprising: {
    high: [
      { id: 'en_h1', question: 'Describe a project where you took initiative to pitch or sell an idea.', category: 'Initiative' },
      { id: 'en_h2', question: 'What aspects of leadership or sales appeal to you most?', category: 'Motivation' },
    ],
    low: [
      { id: 'en_l1', question: 'What type of work allows you to contribute without requiring sales/leadership?', category: 'Preference' },
      { id: 'en_l2', question: 'How do you prefer to add value in a team setting?', category: 'Team Role' },
    ],
  },
  financial_admin: {
    high: [
      { id: 'fa_h1', question: 'Describe your experience with organized, detail-oriented work.', category: 'Organization' },
      { id: 'fa_h2', question: 'What gives you satisfaction in administrative or financial tasks?', category: 'Satisfaction' },
    ],
    low: [
      { id: 'fa_l1', question: 'How do you stay organized when working on projects without strict structure?', category: 'Organization' },
      { id: 'fa_l2', question: 'What aspects of routine administrative work do you find challenging?', category: 'Challenges' },
    ],
  },
  people_service: {
    high: [
      { id: 'ps_h1', question: 'Describe a time you went above and beyond to help a colleague or customer.', category: 'Service' },
      { id: 'ps_h2', question: 'What motivates you to help others succeed?', category: 'Motivation' },
    ],
    low: [
      { id: 'ps_l1', question: 'How do you maintain engagement in roles with limited interpersonal interaction?', category: 'Engagement' },
      { id: 'ps_l2', question: 'What type of work environment suits your helping style best?', category: 'Preference' },
    ],
  },
  technical: {
    high: [
      { id: 'te_h1', question: 'Describe a complex problem you solved through analysis and research.', category: 'Problem Solving' },
      { id: 'te_h2', question: 'What types of intellectual challenges are most engaging for you?', category: 'Engagement' },
    ],
    low: [
      { id: 'te_l1', question: 'How do you approach work that requires technical analysis?', category: 'Approach' },
      { id: 'te_l2', question: 'What support helps you tackle technical problems?', category: 'Support' },
    ],
  },
  mechanical: {
    high: [
      { id: 'me_h1', question: 'Describe your experience with hands-on or practical work.', category: 'Experience' },
      { id: 'me_h2', question: 'What do you enjoy about working with tools, equipment, or practical tasks?', category: 'Enjoyment' },
    ],
    low: [
      { id: 'me_l1', question: 'How do you contribute in roles that don\'t involve hands-on work?', category: 'Contribution' },
      { id: 'me_l2', question: 'What types of work do you prefer over practical/hands-on tasks?', category: 'Preference' },
    ],
  },
  creative: {
    high: [
      { id: 'cr_h1', question: 'Describe a project where you had the opportunity to be creative.', category: 'Creativity' },
      { id: 'cr_h2', question: 'How do you generate new ideas or approaches to problems?', category: 'Ideation' },
    ],
    low: [
      { id: 'cr_l1', question: 'How do you approach work that requires creative problem-solving?', category: 'Approach' },
      { id: 'cr_l2', question: 'What environment helps you be most effective in your work?', category: 'Environment' },
    ],
  },
};

/**
 * Get interview questions for a specific scale and direction
 * @param scaleId The scale identifier (e.g., 'energy_level', 'verbal_skill')
 * @param direction 'high' or 'low' - whether candidate is above or below target
 * @returns Array of interview questions
 */
export function getInterviewQuestions(scaleId: string, direction: 'high' | 'low'): InterviewQuestion[] {
  const normalizedScale = scaleId.toLowerCase().replace(/\s+/g, '_');
  const q = questionBank[normalizedScale];
  
  if (!q) {
    // Return generic questions for unknown scales
    return [
      { id: `${scaleId}_${direction}_1`, question: `Tell me about your experience with ${scaleId.replace(/_/g, ' ')}.`, category: 'General' },
      { id: `${scaleId}_${direction}_2`, question: `How would you describe your approach to ${scaleId.replace(/_/g, ' ')} in your work?`, category: 'General' },
    ];
  }
  
  return q[direction] || [];
}

/**
 * Get all interview questions for a candidate based on deviations
 * @param deviations Array of deviation objects with scaleId and direction
 * @returns Combined array of all interview questions
 */
export function getAllInterviewQuestions(deviations: { scaleId: string; direction: 'high' | 'low' }[]): InterviewQuestion[] {
  const allQuestions: (InterviewQuestion & { scaleId: string })[] = [];
  
  for (const dev of deviations) {
    const questions = getInterviewQuestions(dev.scaleId, dev.direction);
    for (const q of questions) {
      allQuestions.push({ ...q, scaleId: dev.scaleId });
    }
  }
  
  return allQuestions;
}

/**
 * Get scale context information
 * @param scaleId The scale identifier
 * @returns Scale context or null if not found
 */
export function getScaleContext(scaleId: string) {
  return scaleContext[scaleId.toLowerCase()] || null;
}

export default {
  getInterviewQuestions,
  getAllInterviewQuestions,
  getScaleContext,
};
