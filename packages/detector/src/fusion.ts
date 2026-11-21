import { DetectionResult, FusionDetails, Verdict, AiExplanation } from './types.js';
import { RulesResult } from './rules/index.js';
import { UrlAnalysisResult } from './types.js';

export interface FusionInput {
  rulesResult: RulesResult;
  urlResults: UrlAnalysisResult[];
  mlScore?: number;
  aiNudge?: number;
}

/**
 * Score Fusion Engine
 *
 * Combines:
 * - Deterministic Rules Engine (50% weight)
 * - TF-IDF + Logistic Regression ML Classifier (30% weight)
 * - URL Domain & Homograph Heuristics (20% weight)
 * - Optional LLM Explanation Nudge (strictly bounded [-10, +10])
 *
 * Thresholds:
 * - 0 to 29: safe
 * - 30 to 59: suspicious
 * - 60 to 100: likely_scam
 */
export function fuseScores(input: FusionInput): FusionDetails {
  const { rulesResult, urlResults, mlScore = 0, aiNudge = 0 } = input;
  const ruleScore = rulesResult.score;
  const urlScore = urlResults.length > 0 ? Math.max(...urlResults.map((r) => r.riskScore)) : 0;
  const boundedNudge = Math.max(-10, Math.min(10, aiNudge));

  let rawCombined: number;
  let formula: string;

  if (mlScore > 0) {
    rawCombined = ruleScore * 0.5 + mlScore * 0.3 + urlScore * 0.2;
    formula = '0.50*rules + 0.30*ml + 0.20*url + aiNudge';
  } else if (urlResults.length > 0) {
    rawCombined = Math.max(ruleScore, ruleScore * 0.7 + urlScore * 0.5);
    formula = 'max(rules, 0.70*rules + 0.50*url) + aiNudge';
  } else {
    rawCombined = ruleScore;
    formula = '1.00*rules + aiNudge';
  }

  // Safety floor: ensure unambiguous high-confidence fraud cannot be diluted down
  if (
    ruleScore >= 60 ||
    urlScore >= 60 ||
    (ruleScore >= 35 && urlScore >= 40) ||
    (ruleScore >= 20 && urlScore >= 50) ||
    (ruleScore >= 40 && mlScore >= 50) ||
    mlScore >= 75
  ) {
    rawCombined = Math.max(rawCombined, ruleScore, urlScore, 65);
  }

  const finalScore = Math.min(100, Math.max(0, Math.round(rawCombined + boundedNudge)));

  return {
    ruleScore,
    mlScore,
    urlScore,
    aiNudge: boundedNudge,
    finalScore,
    formula,
  };
}

export function scoreToVerdict(score: number): Verdict {
  if (score >= 60) return 'likely_scam';
  if (score >= 30) return 'suspicious';
  return 'safe';
}

export function buildDetectionResult(
  fusion: FusionDetails,
  rulesResult: RulesResult,
  urlResults: UrlAnalysisResult[],
  ai?: AiExplanation,
): DetectionResult {
  const verdict = scoreToVerdict(fusion.finalScore);
  return {
    verdict,
    score: fusion.finalScore,
    category: rulesResult.category,
    redFlags: rulesResult.redFlags,
    signals: rulesResult.signals,
    urlAnalysis: urlResults[0],
    mlScore: fusion.mlScore,
    ruleScore: fusion.ruleScore,
    fusionDetails: fusion,
    ai,
  };
}
