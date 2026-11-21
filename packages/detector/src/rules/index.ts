import type {
  AnalyzeTextInput,
  RedFlag,
  RuleEngineResult,
  ScamCategory,
  SignalResult,
} from '../types.js';
import { clamp, findOriginalIndex, firstMatch, snippetAround, tidySnippet } from '../text.js';
import { RULES, type RuleDefinition } from './definitions.js';

const CATEGORY_ORDER: Exclude<ScamCategory, 'other'>[] = [
  'bank_kyc',
  'upi_payment',
  'delivery_courier',
  'government_tax',
  'lottery_prize',
  'job_task',
  'otp_impersonation',
  'investment_crypto',
];

function evidenceFor(match: RegExpMatchArray): string {
  return tidySnippet(match[0]).slice(0, 100);
}

/**
 * Evaluate every rule and return a structured result the orchestrator can
 * feed into score fusion.
 *
 * A rule counts once even if several of its patterns match. That keeps the
 * score stable and prevents one noisy regex from dominating.
 */
export function runRules(input: AnalyzeTextInput): RuleEngineResult {
  const text = input.text ?? '';
  const signals: SignalResult[] = [];
  const redFlags: RedFlag[] = [];
  const categoryScores = new Map<ScamCategory, number>();
  let score = 0;

  for (const rule of RULES) {
    const match = findFirstMatch(rule, text);

    if (!match) {
      signals.push({ id: rule.id, matched: false, weight: rule.weight });
      continue;
    }

    const evidence = evidenceFor(match);
    signals.push({ id: rule.id, matched: true, weight: rule.weight, evidence });
    score += rule.weight;

    if (rule.weight > 0 && rule.category !== 'other') {
      categoryScores.set(rule.category, (categoryScores.get(rule.category) ?? 0) + rule.weight);
    }

    if (rule.weight > 0) {
      const startIndex = findOriginalIndex(text, match[0]);
      const endIndex = startIndex >= 0 ? startIndex + match[0].length : undefined;
      redFlags.push({
        id: rule.id,
        signal: rule.signal,
        snippet: startIndex >= 0 ? snippetAround(text, startIndex, match[0].length) : evidence,
        reason: rule.reason,
        weight: rule.weight,
        startIndex: startIndex >= 0 ? startIndex : undefined,
        endIndex,
      });
    }
  }

  redFlags.sort((a, b) => b.weight - a.weight || a.id.localeCompare(b.id));

  return {
    score: Math.round(clamp(score, 0, 100)),
    category: pickCategory(categoryScores),
    signals,
    redFlags: redFlags.slice(0, 10),
  };
}

function findFirstMatch(rule: RuleDefinition, text: string): RegExpMatchArray | null {
  for (const pattern of rule.patterns) {
    const match = firstMatch(pattern, text);
    if (match) return match;
  }
  return null;
}

function pickCategory(scores: Map<ScamCategory, number>): ScamCategory {
  let best: ScamCategory = 'other';
  let bestScore = 0;

  for (const category of CATEGORY_ORDER) {
    const value = scores.get(category) ?? 0;
    if (value > bestScore) {
      bestScore = value;
      best = category;
    }
  }

  return best;
}

export { RULES };
export type { RuleDefinition };
