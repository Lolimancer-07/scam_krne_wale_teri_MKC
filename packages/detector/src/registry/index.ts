/**
 * Official-source brand registry for ScamShield.
 * Pure TS, no network, no DOM. Seeded with verifiable Indian brands.
 *
 * Usage:
 *   import { brands, matchBrands, verifyLink, checkSender } from '@scamshield/detector';
 *
 *   const result = matchBrands("Dear Customer, SBI KYC expired", ["sbi.co.in"]);
 *   const verdict = verifyLink("sbi", "sbi-kyc-update.xyz");
 *   const senderFlag = checkSender("9876543210", "sbi");
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Zod schema for a single brand entry – validated by pnpm registry:validate
// ---------------------------------------------------------------------------

const brandSchema = z.object({
  id: z.string(),
  name: z.string(),
  aliases: z.array(z.string()),
  category: z.enum([
    'bank',
    'payments',
    'government',
    'delivery',
    'ecommerce',
    'telecom',
    'utility',
  ]),
  officialDomains: z.array(z.string()),
  senderIdPrefixes: z.array(z.string()),
  officialHelplines: z.array(z.string()),
  sourceUrl: z.string().url(),
  lastVerified: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  verified: z.boolean().default(true),
});

const brandsSchema = z.object({ brands: z.array(brandSchema) });

type Brand = z.infer<typeof brandSchema>;

// ---------------------------------------------------------------------------
// Load and validate the seeded brand data (synchronous)
// ---------------------------------------------------------------------------

import pkg from '../registry/data/brands.json' with { type: 'json' };

const parseResult = brandsSchema.safeParse(pkg);

if (!parseResult.success) {
  console.error(
    'FATAL: Brand registry data fails schema validation. Run `pnpm registry:validate`.',
  );
  process.exit(1);
}

// Type-narrowed brands array – use type assertion since safeParse returns SafeParseSuccess
const brands: Brand[] = parseResult.brands;

// Create lookup maps for fast matching
export const brandById = new Map(brands.map((b) => [b.id, b]));

export const aliasMap = new Map<string, Brand>();
for (const brand of brands) {
  for (const alias of brand.aliases) {
    aliasMap.set(alias.toLowerCase(), brand);
  }
}

// ---------------------------------------------------------------------------
// matchBrands: detect claimed brands via names/aliases and domain tokens
// ---------------------------------------------------------------------------

/**
 * Detect claimed brands in normalized text and observed URLs.
 * Returns evidence per match including the brand, matched tokens, and confidence.
 */
export function matchBrands(normalizedText: string, urls: string[] = []) {
  const evidence: Array<{
    brandId: string;
    brandName: string;
    matchedToken: string;
    matchedType: 'name' | 'alias' | 'domain';
    confidence: number;
  }> = [];

  const textLower = normalizedText.toLowerCase();

  // Match brand names/aliases in text
  for (const brand of brands) {
    // Check full name
    const nameLower = brand.name.toLowerCase();
    if (textLower.includes(nameLower)) {
      evidence.push({
        brandId: brand.id,
        brandName: brand.name,
        matchedToken: nameLower,
        matchedType: 'name',
        confidence: 0.8,
      });
    }

    // Check aliases
    for (const alias of brand.aliases) {
      const aliasLower = alias.toLowerCase();
      if (textLower.includes(aliasLower)) {
        evidence.push({
          brandId: brand.id,
          brandName: brand.name,
          matchedToken: aliasLower,
          matchedType: 'alias',
          confidence: 0.7,
        });
      }
    }
  }

  // Match domain tokens
  for (const url of urls) {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();

      // Check official domains and their subdomains
      for (const brand of brands) {
        for (const domain of brand.officialDomains) {
          const domainLower = domain.toLowerCase();

          // Exact match
          if (hostname === domainLower) {
            evidence.push({
              brandId: brand.id,
              brandName: brand.name,
              matchedToken: domainLower,
              matchedType: 'domain',
              confidence: 0.95,
            });
          }

          // Subdomain of official domain
          if (hostname.endsWith('.' + domainLower)) {
            evidence.push({
              brandId: brand.id,
              brandName: brand.name,
              matchedToken: domainLower,
              matchedType: 'domain',
              confidence: 0.9,
            });
          }
        }
      }
    } catch {
      // Not a valid URL, skip
    }
  }

  // Deduplicate evidence
  const deduplicated = evidence.reduce(
    (acc, cur) => {
      const existing = acc.find(
        (e) => e.brandId === cur.brandId && e.matchedType === cur.matchedType,
      );
      if (!existing) {
        acc.push(cur);
      } else if (cur.confidence > existing.confidence) {
        const idx = acc.indexOf(existing);
        acc[idx] = cur;
      }
      return acc;
    },
    [] as Array<{
      brandId: string;
      brandName: string;
      matchedToken: string;
      matchedType: 'name' | 'alias' | 'domain';
      confidence: number;
    }>,
  );

  return deduplicated;
}

// ---------------------------------------------------------------------------
// verifyLink: classify a URL as official | lookalike | unrelated
// ---------------------------------------------------------------------------

/**
 * Classify a URL relative to a known brand.
 * - official: exact match or legitimate subdomain of an official domain
 * - lookalike: domain that mimics the brand but uses tricks (hyphens, TLD swaps, homographs)
 * - unrelated: no connection to the brand
 */
export function verifyLink(brandId: string, url: string) {
  const brand = brands.find((b) => b.id === brandId);
  if (!brand) {
    const hostname = new URL(url).hostname;
    return {
      verdict: 'unrelated',
      observedDomain: hostname,
      explanation: 'Unknown brand ID',
      brand: {} as Brand,
    };
  }

  let observedDomain: string;
  try {
    observedDomain = new URL(url).hostname;
  } catch {
    observedDomain = url;
  }

  const hostnameLower = observedDomain.toLowerCase();

  // Check exact official domain match
  for (const domain of brand.officialDomains) {
    const domainLower = domain.toLowerCase();
    if (hostnameLower === domainLower) {
      return {
        verdict: 'official',
        observedDomain,
        explanation: 'Official domain',
        brand,
      };
    }

    // Check if it is a legitimate subdomain of an official domain
    if (hostnameLower.endsWith('.' + domainLower)) {
      return {
        verdict: 'official',
        observedDomain,
        explanation: 'Legitimate subdomain of official domain',
        brand,
      };
    }
  }

  // Check for lookalike patterns: hyphenated brand domain (e.g., sbi-kyc-update.xyz)
  const brandNameLower = brand.name.toLowerCase();
  const brandNameDashed = brandNameLower.replace(/\s/g, '-');
  if (hostnameLower.includes(brandNameDashed)) {
    return {
      verdict: 'lookalike',
      observedDomain,
      explanation: 'Hyphenated domain mimics brand name',
      brand,
    };
  }

  // TLD swap detection
  const knownTlds = [
    '.com',
    '.in',
    '.co.in',
    '.net',
    '.org',
    '.xyz',
    '.top',
    '.online',
    '.club',
    '.info',
    '.io',
    '.ai',
  ];
  let foundKnownTld = false;
  let foundTld = '';
  for (const tld of knownTlds) {
    if (hostnameLower.endsWith(tld)) {
      foundKnownTld = true;
      foundTld = tld;
      break;
    }
  }
  if (foundKnownTld) {
    const brandNameChars = brandNameLower.replace(/[^a-z]/g, '');
    const beforeTld = hostnameLower.slice(0, -foundTld.length - 1);
    if (
      brandNameChars &&
      (beforeTld.includes(brandNameChars) || beforeTld.replace(/-/g, '').includes(brandNameChars))
    ) {
      return {
        verdict: 'lookalike',
        observedDomain,
        explanation: 'Domain mimics brand with TLD swap',
        brand,
      };
    }
  }

  return {
    verdict: 'unrelated',
    observedDomain,
    explanation: 'No connection to official brand domains',
    brand,
  };
}

// ---------------------------------------------------------------------------
// checkSender: optional sender field check
// ---------------------------------------------------------------------------

/**
 * Check if an SMS sender header matches a claimed brand.
 * Indian SMS format: XX-HEADER[-S/-T/-P/-G] where XX is a two-digit sector code.
 * e.g., "SBI-HEADER", "9876543210" (plain 10-digit number).
 *
 * @param sender The sender header from the SMS (e.g., "SBI-HEADER", "9876543210")
 * @param claimedBrand The brand being claimed (e.g., "sbi")
 * @returns Object with flag status and confidence
 */
export function checkSender(
  sender: string | undefined,
  claimedBrand: string,
): { flag: boolean; confidence: number; reason: string } {
  if (!sender) {
    return { flag: false, confidence: 0, reason: 'no-sender-info' };
  }

  const senderUpper = sender.toUpperCase();
  const brand = brands.find((b) => b.id === claimedBrand);

  // If we have a known brand with sender ID prefixes
  if (brand) {
    // Check if sender starts with a known prefix
    for (const prefix of brand.senderIdPrefixes) {
      if (senderUpper.startsWith(prefix)) {
        return {
          flag: false,
          confidence: 0.9,
          reason: 'Sender matches official prefix: ' + prefix,
        };
      }
    }

    // Check if sender is a plain 10-digit number (not a branded header)
    const tenDigitPattern = /^\+?9?[6-9]\d{9}$/;
    const cleaned = senderUpper.replace(/\s/g, '').replace(/[-]/g, '');
    if (tenDigitPattern.test(cleaned)) {
      return {
        flag: true,
        confidence: 0.3,
        reason:
          'Plain 10-digit sender does not match official brand header. Expected branded prefix like SBI, HDFC etc.',
      };
    }

    // Sender has some other format – check if it contains the brand name
    if (senderUpper.includes(brand.name.toUpperCase())) {
      return {
        flag: false,
        confidence: 0.6,
        reason: 'Sender contains brand name',
      };
    }
  }

  return {
    flag: true,
    confidence: 0.3,
    reason: 'Sender pattern not recognized',
  };
}
