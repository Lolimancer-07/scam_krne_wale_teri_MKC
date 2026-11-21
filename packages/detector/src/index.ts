export * from './types.js';
export * from './rules/patterns.js';
export * from './rules/brands.js';
export * from './rules/index.js';
export * from './url/analyzer.js';
export * from './fusion.js';

import { runRules } from './rules/index.js';
import { analyzeUrl, extractUrls } from './url/analyzer.js';
import { fuseScores, buildDetectionResult } from './fusion.js';
import { DetectionResult, AnalyzeTextInput } from './types.js';

/**
 * Main text analysis entry point for @scamshield/detector
 */
export async function analyzeText(input: AnalyzeTextInput): Promise<DetectionResult> {
  const { text } = input;
  const rulesResult = runRules(text);
  const urls = extractUrls(text);
  const urlResults = urls.map(analyzeUrl);

  const fusion = fuseScores({
    rulesResult,
    urlResults,
    mlScore: 0,
    aiNudge: 0,
  });

  return buildDetectionResult(fusion, rulesResult, urlResults);
}
