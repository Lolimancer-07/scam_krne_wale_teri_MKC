import { parse as parseDomain } from 'tldts';
import type { UrlAnalysisResult } from '../types.js';
import { RISKY_TLDS, isShortenerHost } from './shorteners.js';
import { BRANDS, OFFICIAL_DOMAINS, boundedLevenshtein } from './brands.js';

const MAX_URLS = 10;

const SCHEME_URL = /\b(?:https?|hxxps?):\/\/[^\s<>"'`]+/gi;
const WWW_URL = /\bwww\.[^\s<>"'`]+/gi;
const DEFANGED_URL =
  /\b(?:[a-z0-9-]+(?:\[\.\]|\(\.\)|\{\.\}|\[dot\]|\(dot\)|\s+dot\s+))+[a-z]{2,24}\b/gi;
const BARE_DOMAIN = /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}\b/gi;

const TRAILING_PUNCTUATION = /[.,;:!?)\]}>'"]+$/;
const LEADING_PUNCTUATION = /^[([{<"']+/;

/** Extract unique URLs from free text, including common defanged forms. */
export function extractUrls(text: string): string[] {
  if (!text) return [];

  const candidates: Array<{ value: string; index: number }> = [];

  for (const regex of [SCHEME_URL, WWW_URL, DEFANGED_URL, BARE_DOMAIN]) {
    for (const match of text.matchAll(regex)) {
      candidates.push({ value: match[0], index: match.index ?? 0 });
    }
  }

  candidates.sort((a, b) => a.index - b.index);

  const seen = new Set<string>();
  const urls: string[] = [];

  for (const candidate of candidates) {
    // Bare domains inside an email address are not URLs.
    const previous = text[candidate.index - 1];
    if (previous === '@') continue;

    const normalized = normalizeUrl(candidate.value);
    if (!normalized) continue;

    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    urls.push(normalized);
    if (urls.length >= MAX_URLS) break;
  }

  return urls;
}

/** Analyze a single URL with static heuristics only — no network requests. */
export function analyzeUrl(rawUrl: string): UrlAnalysisResult {
  const normalized = normalizeUrl(rawUrl) ?? rawUrl.trim();
  const base: UrlAnalysisResult = {
    url: normalized,
    defanged: defangUrl(normalized),
    riskScore: 0,
    flags: [],
    isShortener: false,
    hasIpHost: false,
    hasRiskyTld: false,
  };

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return { ...base, flags: ['invalid_url'] };
  }

  const hostname = parsed.hostname
    .toLowerCase()
    .replace(/\.$/, '')
    .replace(/^\[|\]$/g, '');
  if (!hostname) return { ...base, flags: ['invalid_url'] };

  const domainInfo = parseDomain(hostname, { allowPrivateDomains: true });
  const registrableDomain = domainInfo.domain ?? hostname;
  const labels = hostname.split('.').filter(Boolean);
  const mainLabel = (domainInfo.domain ?? hostname).split('.')[0] ?? hostname;
  const tld = labels[labels.length - 1] ?? '';

  const flags: string[] = [];
  let riskScore = 0;

  const addFlag = (flag: string, weight: number) => {
    if (!flags.includes(flag)) {
      flags.push(flag);
      riskScore += weight;
    }
  };

  const isIp = Boolean(domainInfo.isIp);
  const isShortener = isShortenerHost(hostname);
  const hasRiskyTld = RISKY_TLDS.has(tld) || RISKY_TLDS.has(domainInfo.publicSuffix ?? '');
  const hasUserInfo = Boolean(parsed.username || parsed.password);
  const hasPunycode = labels.some((label) => label.startsWith('xn--'));
  const hasEncodedHost = hostname.includes('%');
  const hasExplicitHttp = /^http:\/\//i.test(rawUrl);

  base.isShortener = isShortener;
  base.hasIpHost = isIp;
  base.hasRiskyTld = hasRiskyTld;

  if (isIp) addFlag('ip_host', 35);
  if (isShortener) addFlag('shortener', 20);
  if (hasRiskyTld) addFlag('risky_tld', 18);
  if (hasUserInfo) addFlag('userinfo', 40);
  if (hasPunycode) addFlag('punycode', 25);
  if (hasEncodedHost) addFlag('encoded_host', 15);
  if (hasExplicitHttp) addFlag('http_only', 5);
  if (labels.length > 4) addFlag('many_subdomains', 10);
  if (hostname.length > 40) addFlag('long_host', 8);
  if (parsed.port && parsed.port !== '80' && parsed.port !== '443') {
    addFlag('nonstandard_port', 5);
  }

  // Brand impersonation. Never flag a known official registrable domain.
  if (!OFFICIAL_DOMAINS.has(registrableDomain)) {
    const match = findBrandImpersonation(mainLabel, labels, registrableDomain);
    if (match) {
      base.lookalikeBrand = match.brand;
      base.lookalikeDomain = registrableDomain;
      addFlag(match.flag, match.weight);
    }
  }

  base.riskScore = Math.min(100, riskScore);
  base.flags = flags;
  return base;
}

interface BrandMatch {
  brand: string;
  flag: string;
  weight: number;
}

function findBrandImpersonation(
  mainLabel: string,
  labels: string[],
  registrableDomain: string,
): BrandMatch | null {
  const compactMain = mainLabel.replace(/[^a-z0-9]/g, '');
  const subdomainLabels = labels.slice(
    0,
    Math.max(0, labels.length - registrableDomain.split('.').length),
  );

  for (const brand of BRANDS) {
    for (const alias of brand.aliases) {
      const compactAlias = alias.replace(/[^a-z0-9]/g, '');
      if (!compactAlias) continue;

      const mainLooksLikeBrand =
        compactMain === compactAlias ||
        compactMain.startsWith(compactAlias) ||
        compactMain.endsWith(compactAlias) ||
        compactMain.includes(`-${compactAlias}`) ||
        compactMain.includes(`${compactAlias}-`);

      if (mainLooksLikeBrand) {
        return { brand: brand.name, flag: 'lookalike_brand', weight: 40 };
      }

      const maxDistance = compactAlias.length >= 8 ? 2 : 1;
      if (
        compactAlias.length >= 4 &&
        compactMain.length >= 4 &&
        boundedLevenshtein(compactMain, compactAlias, maxDistance) <= maxDistance
      ) {
        return { brand: brand.name, flag: 'lookalike_brand', weight: 40 };
      }

      if (subdomainLabels.some((label) => label.replace(/[^a-z0-9]/g, '') === compactAlias)) {
        return { brand: brand.name, flag: 'brand_in_subdomain', weight: 30 };
      }
    }
  }

  return null;
}

/**
 * Normalise a candidate URL: undo common defanging, strip surrounding
 * punctuation and add a scheme when missing. Returns null if it does not look
 * like a real hostname.
 */
function normalizeUrl(candidate: string): string | null {
  let value = candidate
    .trim()
    .replace(LEADING_PUNCTUATION, '')
    .replace(TRAILING_PUNCTUATION, '')
    .replace(/\[\.\]|\(\.\)|\{\.\}|\[dot\]|\(dot\)|\s+dot\s+/gi, '.')
    .replace(/hxxps?/gi, (match) => match.replace(/xx/i, 'tt'))
    .replace(/\[:\/\/\]/g, '://')
    .replace(/\[@\]/g, '@');

  if (!value) return null;

  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) {
    value = `http://${value}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return null;
  }

  if (!parsed.hostname || !parsed.hostname.includes('.')) {
    // Allow IPv6 hosts, which are bracketed in URLs.
    if (!parsed.hostname.startsWith('[')) return null;
  }

  const host = parsed.hostname.replace(/^www\./i, '');
  const domainInfo = parseDomain(host, { allowPrivateDomains: true });
  if (!domainInfo.domain && !domainInfo.isIp) return null;

  return parsed
    .toString()
    .replace(/\/$/, (slash) => (parsed.pathname === '/' && !parsed.search ? '' : slash));
}

function defangUrl(url: string): string {
  return url
    .replace(/^https/i, 'hxxps')
    .replace(/^http/i, 'hxxp')
    .replace(/:\/\//, '[://]')
    .replace(/\./g, '[.]')
    .replace(/@/g, '[@]');
}
