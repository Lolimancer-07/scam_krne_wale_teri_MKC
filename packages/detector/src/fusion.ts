import { DetectionResult, FusionDetails, Verdict } from './types.js';
import { RulesResult } from './rules/index.js';
import { UrlAnalysisResult } from './types.js';

export interface FusionInput {
  rulesResult: RulesResult;
  urlResults: UrlAnalysisResult[];
  mlScore?: number;
  aiNudge?: number;
}

/**
 * Score fusion formula:
 * Combines rules score, URL risk score, and optional ML / AI signals.
 *
 * Design principles:
 * 1. A high rule score is never watered down by a low URL score.
 * 2. A risky URL reinforces and boosts suspicious rule scores.
 * 3. AI nudge is strictly bounded [-10, +10].
 *
 * Verdict thresholds:
 * - score < 30: safe
 * - 30 <= score < 60: suspicious
 * - score >= 60: likely_scam
 */
export function fuseScores(input: FusionInput): FusionDetails {
  const { rulesResult, urlResults, mlScore, aiNudge = 0 } = input;
  const ruleScore = rulesResult.score;
  const urlScore = urlResults.length > 0 ? Math.max(...urlResults.map((r) => r.riskScore)) : 0;
  const boundedNudge = Math.max(-10, Math.min(10, aiNudge));

  let finalScore: number;
  let formula: string;

  if (typeof mlScore === 'number' && mlScore > 0) {
    const raw = ruleScore * 0.5 + mlScore * 0.3 + urlScore * 0.2 + boundedNudge;
    finalScore = Math.min(100, Math.max(0, Math.round(raw)));
    formula = '0.50*rules + 0.30*ml + 0.20*url + aiNudge';
  } else if (urlResults.length > 0) {
    // If URL has risk, it boosts the rule score
    const combined = Math.max(ruleScore, Math.round(ruleScore * 0.7 + urlScore * 0.5));
    finalScore = Math.min(100, Math.max(0, combined + boundedNudge));
    formula = 'max(rules, 0.70*rules + 0.50*url) + aiNudge';
  } else {
    finalScore = Math.min(100, Math.max(0, ruleScore + boundedNudge));
    formula = '1.00*rules + aiNudge';
  }

  // Critical escalation: If high-risk URL flags or KYC + lookalike brand
  if (ruleScore >= 35 && urlScore >= 40) {
    finalScore = Math.max(finalScore, 70);
  }

  return {
    ruleScore,
    mlScore: mlScore ?? 0,
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
  };
}
