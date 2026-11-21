/** Brands frequently impersonated in Indian phishing campaigns. */
export interface Brand {
  name: string;
  aliases: string[];
  officialDomains: string[];
}

export const BRANDS: Brand[] = [
  {
    name: 'sbi',
    aliases: ['sbi', 'statebank', 'statebankofindia', 'onlinesbi'],
    officialDomains: ['sbi.co.in', 'onlinesbi.sbi', 'sbiyono.sbi', 'sbicard.com'],
  },
  {
    name: 'hdfc',
    aliases: ['hdfc', 'hdfcbank'],
    officialDomains: ['hdfcbank.com', 'hdfcsec.com', 'hdfclife.com'],
  },
  {
    name: 'icici',
    aliases: ['icici', 'icicibank'],
    officialDomains: ['icicibank.com', 'icicidirect.com'],
  },
  {
    name: 'axis',
    aliases: ['axis', 'axisbank'],
    officialDomains: ['axisbank.com', 'axisbank.co.in'],
  },
  {
    name: 'kotak',
    aliases: ['kotak', 'kotakbank'],
    officialDomains: ['kotak.com', 'kotakbank.com'],
  },
  {
    name: 'pnb',
    aliases: ['pnb', 'punjabnationalbank'],
    officialDomains: ['pnbindia.in', 'netpnb.com'],
  },
  {
    name: 'bob',
    aliases: ['bob', 'bankofbaroda', 'baroda'],
    officialDomains: ['bankofbaroda.in', 'bankofbaroda.com'],
  },
  {
    name: 'canara',
    aliases: ['canara', 'canarabank'],
    officialDomains: ['canarabank.com'],
  },
  {
    name: 'unionbank',
    aliases: ['unionbank', 'unionbankofindia'],
    officialDomains: ['unionbankofindia.co.in'],
  },
  {
    name: 'idfc',
    aliases: ['idfc', 'idfcfirst'],
    officialDomains: ['idfcfirstbank.com', 'idfcbank.com'],
  },
  {
    name: 'paytm',
    aliases: ['paytm'],
    officialDomains: ['paytm.com', 'paytmbank.com'],
  },
  {
    name: 'phonepe',
    aliases: ['phonepe', 'phonepe'],
    officialDomains: ['phonepe.com'],
  },
  {
    name: 'gpay',
    aliases: ['gpay', 'googlepay', 'google'],
    officialDomains: ['google.com', 'pay.google.com'],
  },
  {
    name: 'bhim',
    aliases: ['bhim'],
    officialDomains: ['npci.org.in', 'bhimupi.org.in'],
  },
  {
    name: 'upi',
    aliases: ['upi', 'npci'],
    officialDomains: ['npci.org.in', 'upi.org.in'],
  },
  {
    name: 'amazon',
    aliases: ['amazon', 'amzn'],
    officialDomains: ['amazon.in', 'amazon.com', 'amzn.to'],
  },
  {
    name: 'flipkart',
    aliases: ['flipkart'],
    officialDomains: ['flipkart.com'],
  },
  {
    name: 'myntra',
    aliases: ['myntra'],
    officialDomains: ['myntra.com'],
  },
  {
    name: 'meesho',
    aliases: ['meesho'],
    officialDomains: ['meesho.com'],
  },
  {
    name: 'irctc',
    aliases: ['irctc'],
    officialDomains: ['irctc.co.in', 'irctc.com'],
  },
  {
    name: 'epfo',
    aliases: ['epfo', 'epfindia'],
    officialDomains: ['epfindia.gov.in', 'epfo.gov.in'],
  },
  {
    name: 'incometax',
    aliases: ['incometax', 'itr'],
    officialDomains: ['incometax.gov.in', 'incometaxindia.gov.in'],
  },
  {
    name: 'uidai',
    aliases: ['uidai', 'aadhaar', 'aadhar'],
    officialDomains: ['uidai.gov.in', 'aadhaar.uidai.gov.in'],
  },
  {
    name: 'whatsapp',
    aliases: ['whatsapp', 'wa'],
    officialDomains: ['whatsapp.com', 'wa.me'],
  },
  {
    name: 'fedex',
    aliases: ['fedex'],
    officialDomains: ['fedex.com'],
  },
  {
    name: 'dhl',
    aliases: ['dhl'],
    officialDomains: ['dhl.com', 'dhl.co.in'],
  },
  {
    name: 'bluedart',
    aliases: ['bluedart'],
    officialDomains: ['bluedart.com'],
  },
  {
    name: 'delhivery',
    aliases: ['delhivery'],
    officialDomains: ['delhivery.com'],
  },
  {
    name: 'indianpost',
    aliases: ['indianpost', 'indiapost'],
    officialDomains: ['indiapost.gov.in', 'indianpost.gov.in'],
  },
  {
    name: 'netflix',
    aliases: ['netflix'],
    officialDomains: ['netflix.com'],
  },
  {
    name: 'microsoft',
    aliases: ['microsoft', 'msft'],
    officialDomains: ['microsoft.com', 'live.com', 'office.com'],
  },
  {
    name: 'apple',
    aliases: ['apple', 'icloud'],
    officialDomains: ['apple.com', 'icloud.com'],
  },
  {
    name: 'facebook',
    aliases: ['facebook', 'meta'],
    officialDomains: ['facebook.com', 'meta.com'],
  },
  {
    name: 'instagram',
    aliases: ['instagram'],
    officialDomains: ['instagram.com'],
  },
];

/** All official domains, used to avoid flagging the real thing. */
export const OFFICIAL_DOMAINS = new Set(BRANDS.flatMap((brand) => brand.officialDomains));

/**
 * Levenshtein distance capped at `max + 1` — enough for typosquatting checks
 * without allocating a full matrix for unrelated strings.
 */
export function boundedLevenshtein(a: string, b: string, max: number): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;

  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  const current = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    let rowMin = current[0];
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost);
      rowMin = Math.min(rowMin, current[j]);
    }
    if (rowMin > max) return max + 1;
    previous = [...current];
  }

  return previous[b.length];
}
