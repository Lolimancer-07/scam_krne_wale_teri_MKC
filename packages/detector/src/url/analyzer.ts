import { parse } from 'tldts';
import { UrlAnalysisResult } from '../types.js';
import { BRAND_DOMAINS, BRAND_KEYWORDS, CONFUSABLES } from '../rules/brands.js';

export const KNOWN_SHORTENERS = new Set([
  'bit.ly',
  'tinyurl.com',
  't.co',
  'goo.gl',
  'ow.ly',
  'is.gd',
  'buff.ly',
  'short.io',
  'rb.gy',
  'cutt.ly',
  'tiny.cc',
  'shorte.st',
  'adf.ly',
  'linktr.ee',
  'lnkd.in',
  'fb.me',
  'wa.me',
  'youtu.be',
  'amzn.to',
  'rebrand.ly',
  'bl.ink',
]);

export const RISKY_TLDS = new Set([
  '.xyz',
  '.tk',
  '.ml',
  '.ga',
  '.cf',
  '.gq',
  '.pw',
  '.top',
  '.club',
  '.online',
  '.site',
  '.website',
  '.space',
  '.info',
  '.biz',
  '.click',
  '.download',
  '.link',
  '.win',
  '.bid',
  '.loan',
  '.review',
  '.cricket',
  '.work',
  '.stream',
  '.icu',
  '.vip',
  '.live',
]);

export function defang(url: string): string {
  return url
    .replace(/^https:\/\//i, 'hxxps://')
    .replace(/^http:\/\//i, 'hxxp://')
    .replace(/\./g, '[.]');
}

export function extractUrls(text: string): string[] {
  const urlRegex = /(?:https?:\/\/|www\.)[^\s<>"'{}|\\^`[\]]+/gi;
  const matches = text.match(urlRegex) || [];
  return matches.map((m) => (m.startsWith('www.') ? `http://${m}` : m));
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

export function normalizeConfusables(str: string): string {
  let normalized = '';
  for (const ch of str) {
    normalized += CONFUSABLES[ch] || ch;
  }
  return normalized;
}

export function detectLookalike(
  hostname: string,
  domain: string | null,
): { brand: string; legitDomain: string; isLookalike: boolean } | null {
  if (!hostname) return null;

  const cleanHost = hostname.toLowerCase().replace(/^www\./, '');
  const normalizedHost = normalizeConfusables(cleanHost);

  for (const brand of BRAND_KEYWORDS) {
    const legitDomains = BRAND_DOMAINS[brand] || [];

    const isLegit = legitDomains.some(
      (legit) => cleanHost === legit || cleanHost.endsWith(`.${legit}`),
    );
    if (isLegit) {
      return null;
    }

    if (normalizedHost.includes(brand)) {
      return {
        brand,
        legitDomain: legitDomains[0] || brand,
        isLookalike: true,
      };
    }

    if (domain) {
      const sld = domain.split('.')[0] || '';
      for (const legit of legitDomains) {
        const legitSld = legit.split('.')[0] || '';
        const dist = levenshtein(normalizeConfusables(sld), legitSld);
        if (dist > 0 && dist <= 2 && sld.length > 3) {
          return {
            brand,
            legitDomain: legit,
            isLookalike: true,
          };
        }
      }
    }
  }

  return null;
}

export function analyzeUrl(rawUrl: string): UrlAnalysisResult {
  const flags: string[] = [];
  let riskScore = 0;

  let urlToParse = rawUrl.trim();
  if (!/^https?:\/\//i.test(urlToParse)) {
    urlToParse = `http://${urlToParse}`;
  }

  const parsed = parse(urlToParse);
  const hostname = parsed.hostname ? parsed.hostname.toLowerCase() : '';
  const domain = parsed.domain ? parsed.domain.toLowerCase() : null;
  const publicSuffix = parsed.publicSuffix ? `.${parsed.publicSuffix.toLowerCase()}` : '';

  const isIpHost =
    /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) ||
    /^\[[0-9a-f:]+\]$/i.test(hostname) ||
    /^(?:0x[0-9a-f]+|\d+)$/i.test(hostname);
  if (isIpHost) {
    flags.push('ip_host');
    riskScore += 45;
  }

  const isShortener =
    KNOWN_SHORTENERS.has(hostname) || (domain !== null && KNOWN_SHORTENERS.has(domain));
  if (isShortener) {
    flags.push('shortener');
    riskScore += 25;
  }

  const hasRiskyTld = RISKY_TLDS.has(publicSuffix);
  if (hasRiskyTld) {
    flags.push('risky_tld');
    riskScore += 30;
  }

  const hasAtTrick = rawUrl.includes('@');
  if (hasAtTrick) {
    flags.push('at_trick');
    riskScore += 40;
  }

  if (parsed.subdomain) {
    const subLabels = parsed.subdomain.split('.');
    if (subLabels.length >= 3) {
      flags.push('excessive_subdomains');
      riskScore += 20;
    }
  }

  const hasPunycode = hostname.includes('xn--');
  if (hasPunycode) {
    flags.push('punycode_homograph');
    riskScore += 35;
  }

  const lookalike = detectLookalike(hostname, domain);
  let lookalikeBrand: string | undefined;
  let lookalikeDomain: string | undefined;

  if (lookalike && lookalike.isLookalike) {
    flags.push('brand_impersonation');
    lookalikeBrand = lookalike.brand;
    lookalikeDomain = lookalike.legitDomain;
    riskScore += 45;
  }

  if (rawUrl.startsWith('http://') && !isIpHost && hostname !== 'localhost') {
    flags.push('insecure_http');
    riskScore += 10;
  }

  const cappedRiskScore = Math.min(100, riskScore);

  return {
    url: rawUrl,
    defanged: defang(rawUrl),
    riskScore: cappedRiskScore,
    flags,
    isShortener,
    hasIpHost: isIpHost,
    hasRiskyTld,
    lookalikeBrand,
    lookalikeDomain,
  };
}
