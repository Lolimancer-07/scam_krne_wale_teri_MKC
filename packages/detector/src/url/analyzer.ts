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
  't.me',
  'telegram.me',
  'surl.li',
  'qrco.de',
  'trib.al',
  'v.gd',
  'clck.ru',
  's.id',
  'shorturl.at',
  'mysocial.vip',
  'forms.gle',
]);

export const FREE_TUNNELS_AND_HOSTS = new Set([
  'ngrok.io',
  'ngrok-free.app',
  'ngrok.app',
  'pages.dev',
  'vercel.app',
  'web.app',
  'firebaseapp.com',
  '000webhostapp.com',
  'glitch.me',
  'onrender.com',
  'netlify.app',
  'duckdns.org',
  'ddns.net',
  'serveo.net',
  'loca.lt',
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
  '.shop',
  '.fit',
  '.rest',
  '.buzz',
  '.cc',
  '.fun',
  '.app',
  '.su',
  '.monster',
  '.cfd',
  '.sbs',
  '.lat',
  '.quest',
  '.beauty',
  '.press',
  '.uno',
]);

export const SUSPICIOUS_PATH_KEYWORDS = [
  'kyc',
  'pan',
  'yono',
  'netbanking',
  'aadhaar',
  'unblock',
  'reactivate',
  'verify',
  'verification',
  'login',
  'credential',
  'account-update',
  'passbook',
  'atm-pin',
  'bescom',
  'msedcl',
  'tpddl',
  'electricity',
  'bill-pay',
  'power-cut',
  'challan',
  'echallan',
  'parivahan',
  'police-notice',
  'fir-case',
  'court-order',
  'earn',
  'earnmoney',
  'parttime',
  'task',
  'daily-salary',
  'youtube-like',
  'commission',
  'bonus',
  'vip-member',
  'lucky-spin',
  'winner',
  'reward',
  'cashback',
  'lottery',
  'kbc',
  'loan',
  'instant-loan',
  'disbursement',
];

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

  // Extract path and query for inspection
  let fullPath = '';
  try {
    const u = new URL(urlToParse);
    fullPath = (u.pathname + u.search).toLowerCase();
  } catch {
    const slashIdx = urlToParse.indexOf('/', 8);
    if (slashIdx !== -1) {
      fullPath = urlToParse.slice(slashIdx).toLowerCase();
    }
  }

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
    riskScore += 30;
  }

  const isFreeTunnelOrHost =
    FREE_TUNNELS_AND_HOSTS.has(hostname) || (domain !== null && FREE_TUNNELS_AND_HOSTS.has(domain));
  if (isFreeTunnelOrHost) {
    flags.push('free_hosting_tunnel');
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

  // Check for malicious file downloads (.apk, .exe, etc.)
  const isMaliciousDownload = /\.(?:apk|exe|dmg|bat|vbs|sh|scr)(?:$|[?#&])/i.test(fullPath);
  if (isMaliciousDownload) {
    flags.push('apk_download');
    riskScore += 45;
  }

  // Check lookalike domain/hostname
  const lookalike = detectLookalike(hostname, domain);
  let lookalikeBrand: string | undefined;
  let lookalikeDomain: string | undefined;

  if (lookalike && lookalike.isLookalike) {
    flags.push('brand_impersonation');
    lookalikeBrand = lookalike.brand;
    lookalikeDomain = lookalike.legitDomain;
    riskScore += 45;
  }

  // Check for brand impersonation in URL path or subdomain on untrusted hosts/shorteners
  if (!lookalikeBrand) {
    for (const brand of BRAND_KEYWORDS) {
      const legitDomains = BRAND_DOMAINS[brand] || [];
      const isLegit = legitDomains.some(
        (legit) => hostname === legit || hostname.endsWith(`.${legit}`),
      );
      if (isLegit) continue;

      const brandInPathOrSub =
        fullPath.includes(brand) || (parsed.subdomain && parsed.subdomain.includes(brand));
      if (brandInPathOrSub) {
        flags.push('brand_impersonation');
        lookalikeBrand = brand;
        lookalikeDomain = legitDomains[0] || brand;
        riskScore += 45;
        break;
      }
    }
  }

  // Check for high-risk suspicious path keywords (kyc, pan, challan, earn, loan, etc.)
  const hasSuspiciousKeyword = SUSPICIOUS_PATH_KEYWORDS.some((kw) => fullPath.includes(kw));
  if (hasSuspiciousKeyword) {
    // If it's not a verified official brand domain
    const isVerifiedOfficialDomain = Object.values(BRAND_DOMAINS)
      .flat()
      .some((legit) => hostname === legit || hostname.endsWith(`.${legit}`));

    if (!isVerifiedOfficialDomain) {
      flags.push('suspicious_path_keywords');
      riskScore += 35;
    }
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
