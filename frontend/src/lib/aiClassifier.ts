/**
 * Client-side AI Danger Priority Classifier
 * Uses NLP-style keyword analysis with weighted scoring to assess incident danger.
 * This runs entirely in the browser — no backend needed for production (GitHub Pages).
 */

export interface AIClassification {
  danger_score: number;
  severity: 'critical' | 'high' | 'moderate' | 'low';
  type: string;
  confidence: number;
  threat_keywords: string[];
  risk_factors: string[];
  priority: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  response_time: string;
}

type KeywordMap = Record<string, number>;

const FIRE_KEYWORDS: KeywordMap = {
  fire: 0.7, flame: 0.7, blaze: 0.8, burning: 0.75, smoke: 0.6,
  inferno: 0.9, arson: 0.85, explosion: 0.9, ignited: 0.7,
  wildfire: 0.9, combustion: 0.7, charred: 0.6, engulfed: 0.85,
  'gas leak': 0.8, propane: 0.7, 'electrical fire': 0.85,
  furnace: 0.5, ember: 0.5, scorched: 0.6,
};

const MEDICAL_KEYWORDS: KeywordMap = {
  injury: 0.6, injured: 0.65, wound: 0.6, bleeding: 0.7,
  unconscious: 0.85, 'heart attack': 0.95, cardiac: 0.9, stroke: 0.9,
  breathing: 0.7, choking: 0.8, seizure: 0.85, allergic: 0.7,
  anaphylaxis: 0.95, overdose: 0.9, poison: 0.85, fracture: 0.6,
  'broken bone': 0.6, concussion: 0.7, drowning: 0.9, cpr: 0.9,
  ambulance: 0.7, medical: 0.5, hospital: 0.4, doctor: 0.4,
  pain: 0.4, fainted: 0.7, collapsed: 0.75, 'not breathing': 0.95,
  diabetic: 0.6, insulin: 0.5, blood: 0.6, trauma: 0.7,
  burn: 0.6, 'chest pain': 0.85, pregnant: 0.6, labor: 0.7,
};

const SECURITY_KEYWORDS: KeywordMap = {
  gun: 0.9, firearm: 0.9, weapon: 0.85, shooting: 0.95,
  stabbing: 0.9, knife: 0.8, assault: 0.8, attack: 0.75,
  robbery: 0.8, theft: 0.5, burglary: 0.6, intruder: 0.75,
  hostage: 0.95, threat: 0.7, bomb: 0.95, explosive: 0.95,
  terrorist: 0.95, terrorism: 0.95, suspicious: 0.4, fight: 0.6,
  violence: 0.75, murder: 0.95, killed: 0.9, shooter: 0.95,
  'active shooter': 0.99, gunshot: 0.9, kidnap: 0.9, abduct: 0.9,
  riot: 0.85, looting: 0.7, armed: 0.85, ransom: 0.85,
  carjack: 0.8, gang: 0.7, stalking: 0.6, harassing: 0.5,
};

const HAZMAT_KEYWORDS: KeywordMap = {
  chemical: 0.8, toxic: 0.85, hazardous: 0.8, radiation: 0.9,
  spill: 0.7, contamination: 0.8, biohazard: 0.9, nuclear: 0.95,
  gas: 0.5, fumes: 0.6, leak: 0.6, asbestos: 0.7,
  mercury: 0.75, acid: 0.7, corrosive: 0.75, volatile: 0.7,
};

const NATURAL_KEYWORDS: KeywordMap = {
  earthquake: 0.9, flood: 0.85, tsunami: 0.95, tornado: 0.9,
  hurricane: 0.9, landslide: 0.85, avalanche: 0.85, storm: 0.6,
  cyclone: 0.85, lightning: 0.5, hailstorm: 0.6,
  volcanic: 0.9, sinkhole: 0.7, mudslide: 0.8,
};

const URGENCY_KEYWORDS: KeywordMap = {
  help: 0.3, emergency: 0.5, urgent: 0.5, immediately: 0.6,
  hurry: 0.5, fast: 0.3, quick: 0.3, dying: 0.9,
  trapped: 0.8, stuck: 0.5, 'can\'t escape': 0.85, spreading: 0.7,
  'getting worse': 0.6, critical: 0.7, 'life threatening': 0.9,
  please: 0.2, save: 0.5, rescue: 0.6, sos: 0.7,
  mayday: 0.8, danger: 0.6, dangerous: 0.6,
};

const SCALE_KEYWORDS: KeywordMap = {
  building: 0.5, school: 0.7, hospital: 0.7, apartment: 0.6,
  neighborhood: 0.7, city: 0.8, multiple: 0.6, several: 0.5,
  many: 0.5, crowd: 0.6, mass: 0.7, widespread: 0.8,
  entire: 0.6, highway: 0.6, bridge: 0.6, mall: 0.6,
  factory: 0.6, warehouse: 0.5, residential: 0.5, commercial: 0.5,
};

const CASUALTY_KEYWORDS: KeywordMap = {
  dead: 0.95, death: 0.95, killed: 0.95, died: 0.95,
  casualties: 0.9, victims: 0.7, 'people hurt': 0.7, children: 0.8,
  elderly: 0.6, baby: 0.8, infant: 0.8, disabled: 0.6,
  fatality: 0.95, bodies: 0.95, survivor: 0.7, 'critical condition': 0.85,
};

function scoreCategory(text: string, keywords: KeywordMap): { score: number; matches: string[] } {
  let totalScore = 0;
  const matches: string[] = [];

  for (const [keyword, weight] of Object.entries(keywords)) {
    if (text.includes(keyword)) {
      totalScore += weight;
      matches.push(keyword);
    }
  }

  if (matches.length === 0) return { score: 0, matches };

  const avgWeight = totalScore / matches.length;
  const countBoost = Math.log2(matches.length + 1) / 3;
  const finalScore = Math.min(avgWeight + countBoost, 1.0);

  return { score: finalScore, matches };
}

/**
 * Classify an emergency description and return danger priority assessment.
 * Runs entirely client-side — no network calls needed.
 */
export function classifyDanger(description: string): AIClassification {
  const text = description.toLowerCase();

  const fire = scoreCategory(text, FIRE_KEYWORDS);
  const medical = scoreCategory(text, MEDICAL_KEYWORDS);
  const security = scoreCategory(text, SECURITY_KEYWORDS);
  const hazmat = scoreCategory(text, HAZMAT_KEYWORDS);
  const natural = scoreCategory(text, NATURAL_KEYWORDS);

  const urgency = scoreCategory(text, URGENCY_KEYWORDS);
  const scale = scoreCategory(text, SCALE_KEYWORDS);
  const casualty = scoreCategory(text, CASUALTY_KEYWORDS);

  // Determine primary category
  const categories: Record<string, number> = {
    Fire: fire.score,
    Medical: medical.score,
    Security: security.score,
    Hazmat: hazmat.score,
    Natural: natural.score,
  };

  let bestType = 'Medical';
  let bestScore = 0;
  for (const [cat, score] of Object.entries(categories)) {
    if (score > bestScore) {
      bestScore = score;
      bestType = cat;
    }
  }

  // Collect all matched keywords
  const allMatches = [
    ...fire.matches, ...medical.matches, ...security.matches,
    ...hazmat.matches, ...natural.matches, ...urgency.matches,
    ...scale.matches, ...casualty.matches,
  ];

  // Composite danger score with amplifiers
  const amplifier = 1.0 + (urgency.score * 0.3) + (scale.score * 0.25) + (casualty.score * 0.45);
  const rawDanger = bestScore * amplifier;
  let dangerScore = Math.min(rawDanger, 1.0);

  // Confidence based on keyword density
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  let confidence = 0;
  if (wordCount > 0) {
    const keywordDensity = allMatches.length / wordCount;
    confidence = Math.min(0.4 + keywordDensity * 3.0 + bestScore * 0.3, 0.99);
  }
  if (allMatches.length === 0) {
    confidence = 0.15;
    dangerScore = 0.2;
  }

  // Map score to severity
  let severity: AIClassification['severity'];
  let priority: AIClassification['priority'];
  let responseTime: string;

  if (dangerScore >= 0.8) {
    severity = 'critical'; priority = 'CRITICAL'; responseTime = '< 2 minutes';
  } else if (dangerScore >= 0.6) {
    severity = 'high'; priority = 'HIGH'; responseTime = '< 5 minutes';
  } else if (dangerScore >= 0.35) {
    severity = 'moderate'; priority = 'MODERATE'; responseTime = '< 15 minutes';
  } else {
    severity = 'low'; priority = 'LOW'; responseTime = '< 30 minutes';
  }

  // Build risk factors
  const riskFactors: string[] = [];
  if (casualty.score > 0.3) riskFactors.push('Potential casualties reported');
  if (scale.score > 0.3) riskFactors.push('Large-scale incident indicated');
  if (urgency.score > 0.3) riskFactors.push('High urgency language detected');
  if (security.score > 0.5) riskFactors.push('Active threat situation');
  if (fire.score > 0.5 && scale.score > 0.3) riskFactors.push('Structural fire with spread risk');
  if (medical.score > 0.5 && casualty.score > 0.3) riskFactors.push('Multiple medical emergencies');
  if (riskFactors.length === 0 && dangerScore > 0.2) riskFactors.push('General emergency situation');

  return {
    danger_score: Math.round(dangerScore * 100) / 100,
    severity,
    type: bestType,
    confidence: Math.round(confidence * 100) / 100,
    threat_keywords: allMatches,
    risk_factors: riskFactors,
    priority,
    response_time: responseTime,
  };
}
