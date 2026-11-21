import { describe, it, expect } from 'vitest';
import { fuseScores, scoreToVerdict } from '../src/fusion.js';
import { RulesResult } from '../src/rules/index.js';
import { UrlAnalysisResult } from '../src/types.js';

describe('Score Fusion', () => {
  const dummyRulesResult: RulesResult = {
    score: 80,
    signals: [],
    redFlags: [],
    category: 'bank_kyc',
  };

  const dummyUrlResult: UrlAnalysisResult = {
    url: 'http://sbi-fake.xyz',
    defanged: 'hxxp://sbi-fake[.]xyz',
    riskScore: 75,
    flags: ['brand_impersonation', 'risky_tld'],
    isShortener: false,
    hasIpHost: false,
    hasRiskyTld: true,
    lookalikeBrand: 'sbi',
  };

  it('computes combined score from rules and URL when ML is absent', () => {
    const fusion = fuseScores({
      rulesResult: dummyRulesResult,
      urlResults: [dummyUrlResult],
    });

    expect(fusion.finalScore).toBeGreaterThanOrEqual(75);
    expect(fusion.ruleScore).toBe(80);
    expect(fusion.urlScore).toBe(75);
  });

  it('maps scores to correct verdicts', () => {
    expect(scoreToVerdict(15)).toBe('safe');
    expect(scoreToVerdict(29)).toBe('safe');
    expect(scoreToVerdict(30)).toBe('suspicious');
    expect(scoreToVerdict(59)).toBe('suspicious');
    expect(scoreToVerdict(60)).toBe('likely_scam');
    expect(scoreToVerdict(95)).toBe('likely_scam');
  });

  it('strictly clamps AI nudge between -10 and +10', () => {
    const f1 = fuseScores({
      rulesResult: { ...dummyRulesResult, score: 50 },
      urlResults: [],
      aiNudge: 50, // oversized nudge
    });
    expect(f1.aiNudge).toBe(10);
    expect(f1.finalScore).toBe(60);

    const f2 = fuseScores({
      rulesResult: { ...dummyRulesResult, score: 50 },
      urlResults: [],
      aiNudge: -99, // oversized negative nudge
    });
    expect(f2.aiNudge).toBe(-10);
    expect(f2.finalScore).toBe(40);
  });
});
