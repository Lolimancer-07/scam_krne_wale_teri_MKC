/**
 * UPI URI parser – pure TS, no network, no DOM.
 * Parses upi://pay?... and legacy collect-style requests.
 * Tolerates malformed and duplicate params; never throws.
 */

export type UpiParseKind = 'pay' | 'collect' | 'unknown';

export interface UpiParsed {
  kind: UpiParseKind;
  payee: string; // payee name from VPA or pn param
  vpa: string; // VPA handle@psp (empty if not present)
  pspHandle: string; // PSP part after @ (empty if not present)
  amount: string; // amount string (empty if not present)
  note: string; // note/tracking memo (empty if not present)
  issues: string[]; // list of validation/concern issues
}

/**
 * Parse a UPI URI string into a structured result.
 * Handles:
 *   upi://pay?...pay... params
 *   upi://collect?... collect-style requests
 *   Legacy collect-style with `mode=collect` param
 *   Malformed/duplicate params are tolerated (first value wins)
 *   Never throws.
 */
export function parseUpiUri(input: string): UpiParsed {
  const result: UpiParsed = {
    kind: 'unknown',
    payee: '',
    vpa: '',
    pspHandle: '',
    amount: '',
    note: '',
    issues: [],
  };

  if (!input || typeof input !== 'string') {
    result.issues.push('empty-input');
    return result;
  }

  const trimmed = input.trim();
  if (trimmed.length === 0) {
    result.issues.push('empty-after-trim');
    return result;
  }

  // Check if it starts with upi://
  const upiPrefix = 'upi://';
  if (!trimmed.toLowerCase().startsWith(upiPrefix)) {
    result.issues.push('no-upi-prefix');
    return result;
  }

  // Extract the query part after upi://
  const afterPrefix = trimmed.slice(upiPrefix.length);
  // Split on first ?
  const queryMarkIdx = afterPrefix.indexOf('?');
  if (queryMarkIdx === -1) {
    result.issues.push('no-query-string');
    return result;
  }
  const queryString = afterPrefix.slice(queryMarkIdx + 1);

  // Parse key=value pairs, handling duplicate params (first wins)
  const params = new Map<string, string[]>();
  const pairs = queryString.split('&');
  for (const pair of pairs) {
    const eqIdx = pair.indexOf('=');
    let key = '';
    let value = '';
    if (eqIdx !== -1) {
      key = pair.substring(0, eqIdx);
      value = pair.substring(eqIdx + 1);
    } else {
      key = pair;
    }
    if (!key) continue;
    if (params.has(key)) {
      // Duplicate: keep first value only
      continue;
    }
    params.set(key, [value]);
  }

  // Helper to get first value for a param
  const getFirst = (key: string): string => {
    const vals = params.get(key);
    return vals ? vals[0] : '';
  };

  const pa = getFirst('pa'); // Payee VPA handle@psp format
  const pn = getFirst('pn'); // Payee name
  const am = getFirst('am'); // Amount
  const cu = getFirst('cu'); // Currency
  const tn = getFirst('tn'); // Note/title

  // Determine kind: pay or collect
  // upi://pay?... → pay
  // upi://collect?... → collect
  // If mode=collect present → collect
  const modeVal = params.get('mode');
  const hasModeCollect = modeVal !== undefined && modeVal[0] === 'collect';
  const isCollect = hasModeCollect || trimmed.toLowerCase().includes('collect');

  let vpaPart = '';
  let pspPart = '';

  // Parse VPA from pa param (handle@psp format)
  if (pa) {
    const atIdx = pa.indexOf('@');
    if (atIdx !== -1) {
      vpaPart = pa.substring(0, atIdx); // handle
      pspPart = pa.substring(atIdx + 1); // psp
    } else {
      // No @ sign – treat entire pa as VPA (psp defaults to default)
      vpaPart = pa;
    }
  }

  // Set pspHandle – use from pa, fall back to cu if available, else empty
  result.pspHandle = pspPart || cu || '';

  // Set VPA
  result.vpa = vpaPart;

  // Determine kind
  if (isCollect) {
    result.kind = 'collect';
  } else {
    result.kind = 'pay';
  }

  // Set payee name: pn takes priority, otherwise derive from VPA
  if (pn) {
    result.payee = pn;
  } else if (vpaPart) {
    result.payee = vpaPart;
  } else {
    result.payee = '';
  }

  // Set note
  result.note = tn || '';

  // ---- Validation signals (issues) ----

  // Check for unusually high amount (>= ₹5000)
  const amtNum = parseFloat(am.replace(/[^\d.-]/g, '') || '0');
  if (!isNaN(amtNum) && amtNum >= 5000) {
    result.issues.push('high-amount');
  }

  // Check for collect request asking for money (receive money scam)
  if (result.kind === 'collect') {
    result.issues.push('collect-request');
  }

  // Check for amount present while message mentions refund/prize/cashback/receive
  const textForCheck = [tn || '', pn || ''].join(' ').toLowerCase();
  const receiveKeywords = ['refund', 'prize', 'cashback', 'receive', 'paise', 'milenge', 'paisa'];
  if (am && receiveKeywords.some((k) => textForCheck.includes(k))) {
    result.issues.push('collect-with-amount');
  }

  // Unknown PSP handle (LOW confidence – legitimate handles vary)
  const knownPspList = [
    'upi',
    'paay',
    'phonepe',
    'googlepay',
    'bhim',
    'apt',
    'apl',
    'axis',
    'icici',
    'hdfc',
    'sbi',
  ];
  const lowerPsp = (pspPart || '').toLowerCase();
  if (pspPart && !knownPspList.includes(lowerPsp)) {
    result.issues.push('unknown-psp');
  }

  // Duplicate params detected (informational)
  const duplicateCount = pairs.length - params.size;
  if (duplicateCount > 0) {
    result.issues.push('duplicate-params');
  }

  // kind is now 'pay' or 'collect' (never 'unknown' due to the if/else above)
  return result;
}

/**
 * Classify a QR payload decoded string into a type category.
 * Returns one of: upi | url | tel | sms | wifi | text | unknown
 * URLs are passed to the existing URL analyzer.
 * Cap payload at 2048 chars.
 */
export function classifyQrPayload(decodedString: string): string {
  if (!decodedString || typeof decodedString !== 'string') {
    return 'unknown';
  }

  const s = decodedString.slice(0, 2048); // cap at 2048 chars

  // Check for upi:// prefix
  if (s.toLowerCase().startsWith('upi://')) {
    return 'upi';
  }

  // Check for tel: prefix
  if (s.toLowerCase().startsWith('tel:')) {
    return 'tel';
  }

  // Check for sms: prefix
  if (s.toLowerCase().startsWith('sms:')) {
    return 'sms';
  }

  // Check for wifi: prefix
  if (s.toLowerCase().startsWith('wifi:')) {
    return 'wifi';
  }

  // Check if it looks like a URL (starts with http://, https://, or common URL patterns)
  const urlPatterns = /^(https?:\/\/)|www\./i;
  if (urlPatterns.test(s)) {
    return 'url';
  }

  // Check for mailto:
  if (s.toLowerCase().startsWith('mailto:')) {
    return 'url'; // treat email as URL for our purposes
  }

  // Default to text/unknown
  return 'text';
}

/**
 * Generate UPI signals for the fusion engine.
 * Returns weighted signals as number contributions.
 */
export function upiSignals(parsed: UpiParsed, _context: { fullMessage?: string }): number {
  let score = 0;

  // Collect request = strong scam signal
  if (parsed.issues.includes('collect-request')) {
    score += 40;
  }

  // High amount (>= ₹5000) with collect request
  if (parsed.issues.includes('high-amount') && parsed.issues.includes('collect-request')) {
    score += 20;
  }

  // Amount present with receive/prize/refund keywords
  if (parsed.issues.includes('collect-with-amount')) {
    score += 30;
  }

  // Unknown PSP handle (LOW confidence, but still a concern)
  if (parsed.issues.includes('unknown-psp')) {
    score += 5;
  }

  // Duplicate params (subtle obfuscation)
  if (parsed.issues.includes('duplicate-params')) {
    score += 3;
  }

  return score;
}
