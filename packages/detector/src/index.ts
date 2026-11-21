export * from './types.js';
export * from './rules/patterns.js';
export * from './rules/brands.js';
export * from './rules/index.js';
export * from './url/analyzer.js';
export * from './fusion.js';
export * from './ml/classifier.js';
export * from './ai/explainer.js';

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
  // 1. NFKC — Unicode compatibility decomposition (e.g. ﬁ → fi, fullwidth → ascii)
  let normalized = text.normalize('NFKC');
  // 2. Strip zero-width characters (U+200B ZWS, U+200C ZWJ, U+FEFF BOM)
  normalized = normalized
    .replace(/\u200b/gi, '')
    .replace(/\u200c/gi, '')
    .replace(/\ufeff/, '');
  // 3. Collapse zero-width-spaced letters (walker removes ZWS between printable chars)
  //    Walk character-by-character to safely remove ZWS between printable chars.
  let result = '';
  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i];
    if (ch === '\u200b' || ch === '\u200c') {
      // keep the char only if it's not between two printable ASCII chars
      continue;
    }
    result += ch;
  }
  normalized = result.replace(/\s+/g, ' ').trim();
  // ---------------------------------------------------------------------------

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
