export * from './types.js';
export * from './rules/patterns.js';
export * from './rules/brands.js';
export * from './rules/index.js';
export * from './url/analyzer.js';
export * from './fusion.js';
export * from './ml/classifier.js';
export * from './ai/explainer.js';

import { normalizeText } from './normalize.js';
import { runRules } from './rules/index.js';
import { analyzeUrl, extractUrls } from './url/analyzer.js';
import { fuseScores, buildDetectionResult } from './fusion.js';
import { predictSpam } from './ml/classifier.js';
import { explainWithClaude, getFallbackExplanation } from './ai/explainer.js';
import { DetectionResult, AnalyzeTextInput, AiExplanation } from './types.js';

/**
 * Main text analysis pipeline for @scamshield/detector
 * Integrates: Rules -> URL Analyzer -> Pure-TS ML Classifier -> Optional Claude AI -> Score Fusion
 */
export async function analyzeText(input: AnalyzeTextInput): Promise<DetectionResult> {
  const { text, enableAi = false } = input;

  // ── Normalization pipeline (run before any rule matching) ──────────────────────
  // Calls packages/detector/src/normalize.ts which performs:
  //   1. NFKC Unicode normalization
  //   2. Strip zero-width characters (ZWS, ZWJ, BOM)
  //   3. Collapse ZWS between printable chars (obfuscation bypass)
  //   4. Collapse repeated whitespace and trim
  const normalized = normalizeText(text);

  // 1. Rules Engine
  const rulesResult = runRules(normalized);

  // 2. URL Analyzer
  const urls = extractUrls(text);
  const urlResults = urls.map(analyzeUrl);

  // 3. ML Inference (TF-IDF + Logistic Regression)
  const mlResult = predictSpam(text);

  // 4. Optional AI Explanation (behind feature flag) — advisory only
  let ai: AiExplanation | undefined;
  let aiNudge = 0;
  if (enableAi) {
    try {
      const aiResponse = await explainWithClaude({
        message: text,
        category: rulesResult.category,
        score: rulesResult.score,
        signals: rulesResult.signals,
      });
      ai = {
        category: aiResponse.category,
        explanation: aiResponse.explanation,
        recommended_actions: aiResponse.recommended_actions,
        confidence: aiResponse.confidence,
        nudge: aiResponse.nudge,
        source: aiResponse.source,
      };
      aiNudge = aiResponse.nudge;
    } catch {
      ai = getFallbackExplanation(rulesResult.category, rulesResult.score);
      aiNudge = ai.nudge;
    }
  }

  // 5. Score Fusion
  const fusion = fuseScores({
    rulesResult,
    urlResults,
    mlScore: mlResult.score,
    aiNudge,
  });

  return buildDetectionResult(fusion, rulesResult, urlResults, ai);
}
