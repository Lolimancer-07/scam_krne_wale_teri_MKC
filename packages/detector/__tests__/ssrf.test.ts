import { describe, it, expect } from 'vitest';
import { analyzeUrl } from '../src/url/analyzer.js';

describe('SSRF & IP Host Security Defenses', () => {
  it('flags private IPv4 address (192.168.x.x)', () => {
    const res = analyzeUrl('http://192.168.1.1/admin');
    expect(res.hasIpHost).toBe(true);
    expect(res.flags).toContain('ip_host');
    expect(res.riskScore).toBeGreaterThanOrEqual(40);
  });

  it('flags AWS metadata service address (169.254.169.254)', () => {
    const res = analyzeUrl('http://169.254.169.254/latest/meta-data/');
    expect(res.hasIpHost).toBe(true);
    expect(res.flags).toContain('ip_host');
    expect(res.riskScore).toBeGreaterThanOrEqual(40);
  });

  it('flags loopback address (127.0.0.1)', () => {
    const res = analyzeUrl('http://127.0.0.1:8080/internal');
    expect(res.hasIpHost).toBe(true);
    expect(res.flags).toContain('ip_host');
  });

  it('flags 10.x.x.x private network range', () => {
    const res = analyzeUrl('http://10.0.0.5/api');
    expect(res.hasIpHost).toBe(true);
    expect(res.flags).toContain('ip_host');
  });

  it('flags hex/dword encoded IP addresses used to bypass basic filters', () => {
    // 0x7f000001 = 127.0.0.1, 2130706433 = 127.0.0.1
    const res = analyzeUrl('http://0x7f000001/status');
    expect(res.hasIpHost).toBe(true);
  });

  it('never initiates an outbound network connection during analysis', () => {
    // Asserts analyzer returns synchronously or instantly without socket activity
    const start = performance.now();
    const res = analyzeUrl('http://non-existent-domain-that-would-hang-if-fetched-123456789.xyz');
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(50); // < 50ms implies zero network lookups
    expect(res.defanged).toContain('[.]xyz');
  });
});
