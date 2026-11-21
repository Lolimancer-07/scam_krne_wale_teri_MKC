import { describe, it, expect } from 'vitest';
import { analyzeText } from '../src/index.js';
import { FIXTURE_MESSAGES } from '../src/fixtures/messages.js';

describe('Regression Test Suite (64 Labelled Fixtures)', () => {
  it('achieves at least 85% accuracy across all test messages', async () => {
    let correct = 0;
    const failures: Array<{
      id: string;
      expected: string;
      actual: string;
      score: number;
      text: string;
    }> = [];

    for (const fixture of FIXTURE_MESSAGES) {
      const result = await analyzeText({ text: fixture.text });
      const isMatch = result.verdict === fixture.expectedVerdict;

      if (isMatch) {
        correct++;
      } else {
        failures.push({
          id: fixture.id,
          expected: fixture.expectedVerdict,
          actual: result.verdict,
          score: result.score,
          text: fixture.text,
        });
      }
    }

    const accuracy = (correct / FIXTURE_MESSAGES.length) * 100;
    console.log(
      `Regression Accuracy: ${correct}/${FIXTURE_MESSAGES.length} (${accuracy.toFixed(1)}%)`,
    );

    if (failures.length > 0) {
      console.warn('Failing fixtures:');
      for (const fail of failures) {
        console.warn(
          ` - [${fail.id}] Expected ${fail.expected}, got ${fail.actual} (score: ${fail.score}): "${fail.text}"`,
        );
      }
    }

    // Minimum accuracy gate: >= 85%
    expect(accuracy).toBeGreaterThanOrEqual(85);
  });

  it('satisfies the P1 Acceptance Criteria: Fake Bank KYC produces "likely_scam"', async () => {
    const fakeBankKycMessage =
      'Dear Customer, your SBI KYC expires today, verify via http://sbi-kyc-update.xyz or account will be blocked';
    const result = await analyzeText({ text: fakeBankKycMessage });

    expect(result.verdict).toBe('likely_scam');
    expect(result.score).toBeGreaterThanOrEqual(60);
    expect(result.redFlags.length).toBeGreaterThan(0);
    expect(result.category).toBe('bank_kyc');
    expect(result.urlAnalysis).toBeDefined();
    expect(result.urlAnalysis?.flags).toContain('brand_impersonation');
  });
});
