/**
 * IRT 3PL Model and CAT Engine
 * 
 * P(θ) = c + (1-c)/(1+e^(-a(θ-b)))
 * - θ = latent ability (-3 to +3)
 * - a = item discrimination (slope)
 * - b = item difficulty (location)
 * - c = pseudo-guessing parameter
 */

export interface Item {
  id: string;
  a: number;  // discrimination
  b: number;  // difficulty
  c: number;  // guessing
}

/**
 * Calculate probability of correct response given ability
 */
export function probabilityCorrect(theta: number, item: Item): number {
  const { a, b, c } = item;
  const exponent = -a * (theta - b);
  const logistic = 1 / (1 + Math.exp(exponent));
  return c + (1 - c) * logistic;
}

/**
 * Calculate information for an item at given ability level
 * I(θ) = (a² * (1-c)) / ((1 + e^(a(θ-b))) * (1 + e^(-a(θ-b))) * (1 + c*e^(a(θ-b))))
 */
export function itemInformation(theta: number, item: Item): number {
  const { a, b, c } = item;
  const expTerm = Math.exp(a * (theta - b));
  const numerator = a * a * (1 - c);
  const denominator = (1 + expTerm) * (1 + expTerm * c);
  return numerator / denominator;
}

/**
 * Calculate the likelihood of a response pattern
 */
export function logLikelihood(
  responses: number[],  // 1 = correct, 0 = incorrect
  theta: number,
  items: Item[]
): number {
  let logLik = 0;
  for (let i = 0; i < responses.length; i++) {
    const p = probabilityCorrect(theta, items[i]);
    if (responses[i] === 1) {
      logLik += Math.log(p || 1e-10);
    } else {
      logLik += Math.log(1 - p || 1e-10);
    }
  }
  return logLik;
}

/**
 * Maximum Likelihood Estimation of ability
 * Uses Newton-Raphson method
 */
export function estimateAbility(
  responses: number[],
  items: Item[],
  initialTheta: number = 0,
  maxIterations: number = 50,
  tolerance: number = 0.001
): number {
  let theta = initialTheta;
  
  for (let iter = 0; iter < maxIterations; iter++) {
    let firstDeriv = 0;
    let secondDeriv = 0;
    
    for (let i = 0; i < responses.length; i++) {
      const p = probabilityCorrect(theta, items[i]);
      const q = 1 - p;
      const info = itemInformation(theta, items[i]);
      
      // First derivative: d log L / d theta
      firstDeriv += (responses[i] - p) * items[i].a * (1 - items[i].c) / q;
      
      // Second derivative: d² log L / d theta²
      secondDeriv -= info;
    }
    
    if (Math.abs(secondDeriv) < 1e-10) break;
    
    const delta = firstDeriv / secondDeriv;
    theta -= delta;
    
    // Bound theta to reasonable range
    theta = Math.max(-4, Math.min(4, theta));
    
    if (Math.abs(delta) < tolerance) break;
  }
  
  return theta;
}

/**
 * Bayesian MAP estimation (when fewer responses)
 * Uses normal prior centered at 0
 */
export function estimateAbilityMAP(
  responses: number[],
  items: Item[],
  priorMean: number = 0,
  priorVariance: number = 1,
  maxIterations: number = 50
): number {
  let theta = priorMean;
  
  for (let iter = 0; iter < maxIterations; iter++) {
    let firstDeriv = 0;
    let secondDeriv = 0;
    
    // Prior component
    firstDeriv += (theta - priorMean) / priorVariance;
    secondDeriv -= 1 / priorVariance;
    
    // Likelihood component
    for (let i = 0; i < responses.length; i++) {
      const p = probabilityCorrect(theta, items[i]);
      const q = 1 - p;
      const a = items[i].a;
      const c = items[i].c;
      
      firstDeriv += (responses[i] - p) * a * (1 - c) / q;
      secondDeriv -= itemInformation(theta, items[i]);
    }
    
    if (Math.abs(secondDeriv) < 1e-10) break;
    
    const delta = firstDeriv / secondDeriv;
    theta -= delta;
    theta = Math.max(-4, Math.min(4, theta));
    
    if (Math.abs(delta) < 0.001) break;
  }
  
  return theta;
}

/**
 * CAT Engine - Select next item based on current ability estimate
 */
export function selectNextItem(
  theta: number,
  administeredItems: Set<string>,
  availableItems: Item[]
): Item | null {
  let maxInfo = -1;
  let selectedItem: Item | null = null;
  
  for (const item of availableItems) {
    if (administeredItems.has(item.id)) continue;
    
    const info = itemInformation(theta, item);
    if (info > maxInfo) {
      maxInfo = info;
      selectedItem = item;
    }
  }
  
  return selectedItem;
}

/**
 * Get standard error of measurement at given theta
 */
export function getSEM(theta: number, items: Item[]): number {
  let totalInfo = 0;
  for (const item of items) {
    totalInfo += itemInformation(theta, item);
  }
  
  if (totalInfo === 0) return Infinity;
  return 1 / Math.sqrt(totalInfo);
}

/**
 * Determine if test should stop based on SEM
 */
export function shouldStopTest(
  theta: number,
  administeredItems: Item[],
  minItems: number = 5,
  maxItems: number = 30,
  targetSEM: number = 0.3
): boolean {
  if (administeredItems.length < minItems) return false;
  if (administeredItems.length >= maxItems) return true;
  
  const sem = getSEM(theta, administeredItems);
  return sem <= targetSEM;
}

/**
 * Convert ability estimate (theta) to STEN
 */
export function thetaToSten(theta: number): number {
  // Theta typically ranges from -3 to +3
  // Convert to STEN: mean=5.5, SD=2.0
  const sten = 5.5 + theta * 2;
  return Math.max(1, Math.min(10, Math.round(sten)));
}
