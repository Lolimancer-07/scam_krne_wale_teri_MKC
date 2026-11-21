import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as urlHandler } from '../../app/api/v1/analyze/url/route';
import { GET as statsHandler } from '../../app/api/v1/stats/route';
import { POST as feedbackHandler } from '../../app/api/v1/feedback/route';

describe('Additional API v1 Route Handlers', () => {
  it('POST /api/v1/analyze/url analyzes lookalike URL', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/analyze/url', {
      method: 'POST',
      body: JSON.stringify({ url: 'http://sbi-kyc-verify.xyz' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await urlHandler(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.verdict).toBe('likely_scam');
    expect(json.data.urlAnalysis.lookalikeBrand).toBe('sbi');
    expect(json.data.urlAnalysis.defanged).toContain('[.]xyz');
  });

  it('GET /api/v1/stats returns aggregate metrics', async () => {
    const res = await statsHandler();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.totalScans).toBeDefined();
    expect(json.data.byVerdict).toBeDefined();
  });

  it('POST /api/v1/feedback accepts user feedback', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/feedback', {
      method: 'POST',
      body: JSON.stringify({
        isCorrect: true,
        verdict: 'likely_scam',
        score: 95,
        category: 'bank_kyc',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await feedbackHandler(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
  });
});
