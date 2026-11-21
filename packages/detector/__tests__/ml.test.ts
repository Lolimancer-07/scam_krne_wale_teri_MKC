import { describe, it, expect } from 'vitest';
import { predictSpam, preprocessText, extractNgrams } from '../src/ml/classifier.js';

describe('Pure TypeScript ML Classifier', () => {
  it('preprocesses text and replaces URLs, numbers, phones with placeholders', () => {
    const raw = 'Visit https://fake-sbi.xyz and call 9876543210 for Rs 5000 refund';
    const clean = preprocessText(raw);

    expect(clean).toContain('[url]');
    expect(clean).toContain('[phone]');
    expect(clean).toContain('[num]');
    expect(clean).not.toContain('https://fake-sbi.xyz');
  });

  it('extracts word unigrams and bigrams', () => {
    const text = 'sbi kyc update';
    const ngrams = extractNgrams(text);

    expect(ngrams.has('sbi')).toBe(true);
    expect(ngrams.has('kyc')).toBe(true);
    expect(ngrams.has('sbi kyc')).toBe(true);
    expect(ngrams.has('kyc update')).toBe(true);
  });

  it('predicts high spam probability for classic phishing message', () => {
    const phishingText =
      'Dear Customer your SBI account KYC has expired. Verify your documents immediately at http://sbi-kyc-update.xyz to prevent account suspension.';
    const res = predictSpam(phishingText);

    expect(res.probability).toBeGreaterThan(0.5);
    expect(res.score).toBeGreaterThanOrEqual(50);
    expect(res.matchedFeatures.length).toBeGreaterThan(0);
  });

  it('predicts low spam probability for typical conversational message', () => {
    const hamText =
      'Hi Priya, dinner is booked for 8 PM tonight at the rooftop bistro. See you both there!';
    const res = predictSpam(hamText);

    expect(res.score).toBeLessThan(40);
  });
});
