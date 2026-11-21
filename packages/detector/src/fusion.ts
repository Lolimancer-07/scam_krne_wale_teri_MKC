import type { FusionDetails, Verdict } from './types.js';
import { clamp } from './text.js';

export interface FusionInput {
  ruleScore: number;
  mlScore: number;
  urlScore: number;
  aiNudge?: number;
}

const FORMULA = '0.5*rule + 0.3*ml + 0.15*url + 0.05*ai';

/**
 * Fuse the independent signals into a single 0-100 score.
 *
 * All inputs are clamped so a buggy analyzer cannot push the final score
 * outside the documented range. The verdict is derived from the rounded
 * score, which is also what the API returns.
 */
export function fuseScores(input: FusionInput): FusionDetails {
  const ruleScore = clamp(input.ruleScore, 0, 100);
  const mlScore = clamp(input.mlScore, 0, 100);
  const urlScore = clamp(input.urlScore, 0, 100);
  const aiNudge = clamp(input.aiNudge ?? 0, 0, 100);

  const raw = ruleScore * 0.5 + mlScore * 0.3 + urlScore * 0.15 + aiNudge * 0.05;
  const finalScore = Math.round(clamp(raw, 0, 100));

  return {
    ruleScore,
    mlScore,
    urlScore,
    aiNudge,
    finalScore,
    formula: FORMULA,
  };
}

export function scoreToVerdict(score: number): Verdict {
  const safeScore = clamp(score, 0, 100);
  if (safeScore >= 70) return 'likely_scam';
  if (safeScore >= 40) return 'suspicious';
  return 'safe';
}
