// Stub: score fusion — to be implemented by the detector agent
import type { FusionDetails, Verdict } from './types.js';

export interface FusionInput {
  ruleScore: number;
  mlScore: number;
  urlScore: number;
  aiNudge?: number;
}

export function fuseScores(input: FusionInput): FusionDetails {
  // TODO: implement weighted fusion formula
  const { ruleScore, mlScore, urlScore, aiNudge = 0 } = input;
  const finalScore = Math.round(ruleScore * 0.5 + mlScore * 0.3 + urlScore * 0.15 + aiNudge * 0.05);
  return {
    ruleScore,
    mlScore,
    urlScore,
    aiNudge,
    finalScore,
    formula: '0.5*rule + 0.3*ml + 0.15*url + 0.05*ai',
  };
}

export function scoreToVerdict(score: number): Verdict {
  if (score >= 70) return 'likely_scam';
  if (score >= 40) return 'suspicious';
  return 'safe';
}
