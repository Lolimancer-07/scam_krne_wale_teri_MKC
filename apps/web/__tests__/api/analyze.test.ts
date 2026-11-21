import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as analyzeTextHandler } from '../../app/api/v1/analyze/text/route';
import { GET as healthHandler } from '../../app/api/v1/health/route';

// Mock DB create to avoid needing live Postgres in tests
vi.mock('@/lib/db', () => ({
  db: {
    analysis: {
      create: vi.fn().mockResolvedValue({ id: 'test-analysis-id' }),
    },
  },
}));

describe('API Route Handlers', () => {
  it('GET /api/v1/health returns ok', async () => {
    const res = await healthHandler();
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.service).toBe('scamshield-api');
  });

  it('POST /api/v1/analyze/text rejects empty body with 400', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/analyze/text', {
      method: 'POST',
      body: JSON.stringify({ text: '' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await analyzeTextHandler(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/v1/analyze/text rejects text > 5000 characters with 400', async () => {
    const oversized = 'a'.repeat(5001);
    const req = new NextRequest('http://localhost:3000/api/v1/analyze/text', {
      method: 'POST',
      body: JSON.stringify({ text: oversized }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await analyzeTextHandler(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });

  it('POST /api/v1/analyze/text analyzes fake SBI KYC scam as likely_scam', async () => {
    const fakeKyc =
      'Dear Customer, your SBI KYC expires today, verify via http://sbi-kyc-update.xyz or account will be blocked';

    const req = new NextRequest('http://localhost:3000/api/v1/analyze/text', {
      method: 'POST',
      body: JSON.stringify({ text: fakeKyc }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await analyzeTextHandler(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.verdict).toBe('likely_scam');
    expect(json.data.score).toBeGreaterThanOrEqual(60);
    expect(json.data.category).toBe('bank_kyc');
    expect(json.data.redFlags.length).toBeGreaterThan(0);
    expect(res.headers.get('X-Request-Id')).toBeDefined();
  });
});
