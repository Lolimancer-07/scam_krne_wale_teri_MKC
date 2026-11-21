import type { AnalyzeTextInput, DetectionResult, UrlAnalysisResult } from './types.js';
import { runRules } from './rules/index.js';
import { analyzeUrl, extractUrls } from './url/analyzer.js';
import { scoreMl } from './ml/heuristic.js';
import { fuseScores, scoreToVerdict } from './fusion.js';
import { clamp } from './text.js';

/**
 * Full detection pipeline: URL analysis → rule engine → heuristic ML scorer →
 * score fusion → verdict.
 *
 * The detector never calls an LLM and never makes network requests. An
 * optional `aiNudge` may be supplied by the caller after it has run its own
 * AI check.
 */
export function analyzeText(input: AnalyzeTextInput): DetectionResult {
  const text = input.text ?? '';
  const urls = extractUrls(text);
  const urlAnalyses: UrlAnalysisResult[] = urls
    .map((url) => analyzeUrl(url))
    .sort((a, b) => b.riskScore - a.riskScore);
  const topUrl = urlAnalyses[0];

  const urlScore =
    urlAnalyses.length === 0
      ? 0
      : clamp(
          Math.max(...urlAnalyses.map((analysis) => analysis.riskScore)) +
            (urlAnalyses.length - 1) * 5,
          0,
          100,
        );

  const ruleResult = runRules({ text, enableAi: input.enableAi });
  const mlScore = scoreMl(text);
  const fusionDetails = fuseScores({
    ruleScore: ruleResult.score,
    mlScore,
    urlScore,
    aiNudge: input.aiNudge,
  });

  return {
    verdict: scoreToVerdict(fusionDetails.finalScore),
    score: fusionDetails.finalScore,
    category: ruleResult.category,
    redFlags: ruleResult.redFlags,
    signals: ruleResult.signals,
    urlAnalysis: topUrl,
    urlAnalyses: urlAnalyses.length > 0 ? urlAnalyses : undefined,
    mlScore,
    ruleScore: ruleResult.score,
    fusionDetails,
  };
}
