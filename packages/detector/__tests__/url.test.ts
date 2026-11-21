import { describe, it, expect } from 'vitest';
import {
  analyzeUrl,
  extractUrls,
  defang,
  levenshtein,
  normalizeConfusables,
} from '../src/url/analyzer.js';

describe('URL Analyzer', () => {
  it('defangs URLs properly without making them clickable', () => {
    expect(defang('http://scam-bank.com/login')).toBe('hxxp://scam-bank[.]com/login');
    expect(defang('https://evil.xyz/update')).toBe('hxxps://evil[.]xyz/update');
  });

  it('extracts multiple URLs from message text', () => {
    const text = 'Check out http://foo.com and visit https://bar.net/update immediately';
    const urls = extractUrls(text);
    expect(urls).toEqual(['http://foo.com', 'https://bar.net/update']);
  });

  it('detects IP host addresses', () => {
    const res = analyzeUrl('http://192.168.1.100/login.php');
    expect(res.hasIpHost).toBe(true);
    expect(res.flags).toContain('ip_host');
    expect(res.riskScore).toBeGreaterThanOrEqual(40);
  });

  it('detects known URL shorteners', () => {
    const res = analyzeUrl('https://bit.ly/3xY7zQ');
    expect(res.isShortener).toBe(true);
    expect(res.flags).toContain('shortener');
  });

  it('detects risky top-level domains', () => {
    const res = analyzeUrl('https://sbi-verification.xyz/kyc');
    expect(res.hasRiskyTld).toBe(true);
    expect(res.flags).toContain('risky_tld');
  });

  it('detects @ trick in URL', () => {
    const res = analyzeUrl('https://google.com@phishing-target.com/login');
    expect(res.flags).toContain('at_trick');
    expect(res.riskScore).toBeGreaterThanOrEqual(40);
  });

  it('detects excessive subdomains', () => {
    const res = analyzeUrl('http://sbi.netbanking.update.portal.phishsite.com');
    expect(res.flags).toContain('excessive_subdomains');
  });

  it('detects brand impersonation / lookalikes', () => {
    const res = analyzeUrl('http://sbi-kyc-update.xyz');
    expect(res.flags).toContain('brand_impersonation');
    expect(res.lookalikeBrand).toBe('sbi');
    expect(res.riskScore).toBeGreaterThanOrEqual(60);
  });

  it('does NOT flag legitimate brand domains as lookalikes', () => {
    const res = analyzeUrl('https://onlinesbi.sbi/portal/login');
    expect(res.flags).not.toContain('brand_impersonation');
    expect(res.lookalikeBrand).toBeUndefined();
    expect(res.riskScore).toBeLessThan(30);
  });

  it('correctly handles homograph / confusables replacement', () => {
    expect(normalizeConfusables('sb1-b@nk')).toBe('sbl-bank');
    expect(normalizeConfusables('pаytm')).toBe('paytm');
  });

  it('calculates Levenshtein distance accurately', () => {
    expect(levenshtein('hdfc', 'hdfc')).toBe(0);
    expect(levenshtein('hdfc', 'hdfcb')).toBe(1);
    expect(levenshtein('phonepe', 'phonpe')).toBe(1);
  });
});
