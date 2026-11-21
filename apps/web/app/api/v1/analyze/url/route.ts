import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { analyzeUrl, scoreToVerdict } from '@scamshield/detector';
import { rateLimit } from '@/lib/rateLimiter';
import { generateRequestId, ok, err } from '@/lib/requestId';

const UrlSchema = z.object({
  url: z.string().trim().min(3).max(2000),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  const requestId = req.headers.get('x-request-id') || generateRequestId();

  const clientIp =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';

  const rl = await rateLimit(`analyze-url:${clientIp}`, 20, 60);
  if (!rl.allowed) {
    return NextResponse.json(
      err(requestId, 'RATE_LIMITED', 'Too many URL requests. Please wait a moment.'),
      { status: 429, headers: { 'X-Request-Id': requestId } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(err(requestId, 'INVALID_JSON', 'Request body must be valid JSON'), {
      status: 400,
      headers: { 'X-Request-Id': requestId },
    });
  }

  const parseResult = UrlSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      err(requestId, 'VALIDATION_ERROR', 'Invalid URL provided', parseResult.error.flatten()),
      { status: 400, headers: { 'X-Request-Id': requestId } },
    );
  }

  const urlAnalysis = analyzeUrl(parseResult.data.url);
  const verdict = scoreToVerdict(urlAnalysis.riskScore);

  let category = 'other';
  const urlLower = parseResult.data.url.toLowerCase();
  if (
    urlAnalysis.lookalikeBrand ||
    urlLower.includes('kyc') ||
    urlLower.includes('pan') ||
    urlLower.includes('yono') ||
    urlLower.includes('bank')
  ) {
    category = 'bank_kyc';
  } else if (
    urlLower.includes('bescom') ||
    urlLower.includes('msedcl') ||
    urlLower.includes('electricity') ||
    urlLower.includes('challan') ||
    urlLower.includes('police') ||
    urlLower.includes('parivahan')
  ) {
    category = 'government_tax';
  } else if (
    urlLower.includes('earn') ||
    urlLower.includes('task') ||
    urlLower.includes('t.me') ||
    urlLower.includes('job')
  ) {
    category = 'job_task';
  } else if (urlLower.includes('loan') || urlLower.includes('pay') || urlLower.includes('upi')) {
    category = 'upi_payment';
  } else if (
    urlLower.includes('reward') ||
    urlLower.includes('gift') ||
    urlLower.includes('winner') ||
    urlLower.includes('lottery')
  ) {
    category = 'lottery_prize';
  } else if (
    urlLower.includes('parcel') ||
    urlLower.includes('post') ||
    urlLower.includes('delivery')
  ) {
    category = 'delivery_courier';
  }

  return NextResponse.json(
    ok(requestId, {
      verdict,
      score: urlAnalysis.riskScore,
      category,
      redFlags: urlAnalysis.flags.map((flag, idx) => ({
        id: `url-flag-${idx}`,
        signal: flag,
        snippet: urlAnalysis.defanged,
        reason: getFlagDescription(flag, urlAnalysis.lookalikeBrand),
        weight: 25,
      })),
      urlAnalysis,
    }),
    { status: 200, headers: { 'X-Request-Id': requestId } },
  );
}

function getFlagDescription(flag: string, brand?: string): string {
  switch (flag) {
    case 'brand_impersonation':
      return `Domain or link path appears to spoof brand ${brand?.toUpperCase() || ''}. Not an official registered domain.`;
    case 'risky_tld':
      return 'Top-level domain (TLD) is heavily associated with disposable phishing campaigns.';
    case 'ip_host':
      return 'Direct IP address used instead of a registered domain name.';
    case 'shortener':
      return 'URL shortener hides the true destination address, obscuring phishing destinations.';
    case 'free_hosting_tunnel':
      return 'Hosted on a free public tunnel or serverless provider frequently abused for temporary phishing.';
    case 'apk_download':
      return 'Direct Android application (.apk) download link. Legitimate organizations distribute applications through official app stores.';
    case 'suspicious_path_keywords':
      return 'URL path contains high-risk keywords (e.g. KYC, verification, login, task, loan, or power cutoff).';
    case 'at_trick':
      return 'Contains @ sign in URL to mislead address bar rendering.';
    case 'excessive_subdomains':
      return 'Excessive subdomains used to mimic authentic service portals.';
    case 'punycode_homograph':
      return 'Punycode character encoding detected, potentially disguising lookalike letters.';
    case 'insecure_http':
      return 'Unencrypted HTTP protocol used instead of HTTPS.';
    default:
      return 'Suspicious URL characteristic detected.';
  }
}
