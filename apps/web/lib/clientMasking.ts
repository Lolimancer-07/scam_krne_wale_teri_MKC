/**
 * Client-Side PII and Secret Masking Utilities
 *
 * Masks sensitive patterns (OTPs, PINs, card numbers) on the user's browser
 * before transmitting to prevent accidental disclosure of real secrets.
 */

const OTP_PATTERNS = [
  /\b(otp|code|pin)\s*[:=-]?\s*(\d{4,8})\b/gi,
  /\b(\d{6})\b(?=.*(?:otp|verification|login))/gi,
];

const CARD_PATTERN = /\b(\d{4})[\s-](\d{4})[\s-](\d{4})[\s-](\d{4})\b/g;
const ACCOUNT_PATTERN = /\b(\d{4})(\d{4,10})(\d{4})\b/g;

export function maskClientSecrets(input: string): { masked: string; secretsDetected: boolean } {
  let masked = input;
  let secretsDetected = false;

  // Mask OTP codes
  for (const pattern of OTP_PATTERNS) {
    if (pattern.test(masked)) {
      secretsDetected = true;
      pattern.lastIndex = 0;
      masked = masked.replace(pattern, (match, prefix, digits) => {
        if (digits) {
          return `${prefix}: ****`;
        }
        return '******';
      });
    }
  }

  // Mask credit card numbers (keep first 4 and last 4)
  if (CARD_PATTERN.test(masked)) {
    secretsDetected = true;
    CARD_PATTERN.lastIndex = 0;
    masked = masked.replace(CARD_PATTERN, '$1-****-****-$4');
  }

  return {
    masked,
    secretsDetected,
  };
}
