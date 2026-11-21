import { describe, it, expect } from 'vitest';
import { getFallbackExplanation, explainWithClaude } from '../src/ai/explainer.js';

describe('AI Explainer & Fallback Engine', () => {
  it('returns clean structured template fallback when API key is missing', async () => {
    const fallback = getFallbackExplanation('bank_kyc', 85);

    expect(fallback.category).toBe('bank_kyc');
    expect(fallback.explanation).toContain('KYC');
    expect(fallback.recommended_actions.length).toBeGreaterThanOrEqual(2);
    expect(fallback.nudge).toBe(0);
    expect(fallback.source).toBe('fallback_template');
  });

  it('gracefully degrades to template when calling explainWithClaude without key', async () => {
    const res = await explainWithClaude(
      {
        message: 'Dear user, your PAN is blocked',
        category: 'bank_kyc',
        score: 75,
        signals: [{ id: 'kyc_lure', matched: true }],
      },
      undefined,
    );

    expect(res.source).toBe('fallback_template');
    expect(res.explanation).toBeDefined();
    expect(res.recommended_actions.length).toBeGreaterThan(0);
  });
});
