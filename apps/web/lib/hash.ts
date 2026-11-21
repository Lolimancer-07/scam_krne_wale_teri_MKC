import crypto from 'crypto';

const SALT = process.env.MESSAGE_HASH_SALT || 'scamshield-default-salt-change-in-prod-2026';

/**
 * Returns salted SHA-256 hash of a message to avoid storing raw text
 */
export function hashMessage(text: string): string {
  return crypto.createHmac('sha256', SALT).update(text.trim().toLowerCase()).digest('hex');
}

// PII patterns for auto-redaction before optional storage
const PII_PATTERNS: Array<[RegExp, string]> = [
  [/\b\+?(?:91)?[6-9]\d{9}\b/g, '[REDACTED_PHONE]'],
  [/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '[REDACTED_EMAIL]'],
  [/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[REDACTED_CARD]'],
  [/\b\d{9,18}\b/g, '[REDACTED_ACCOUNT]'],
  [/\b(?:otp|code|pin)\s*[:=]?\s*\d{4,8}\b/gi, '[REDACTED_SECRET]'],
  [/\b[A-Z]{5}\d{4}[A-Z]{1}\b/g, '[REDACTED_PAN]'],
  [/\b\d{4}\s*\d{4}\s*\d{4}\b/g, '[REDACTED_AADHAAR]'],
];

export function redactPii(text: string): string {
  let redacted = text;
  for (const [regex, placeholder] of PII_PATTERNS) {
    redacted = redacted.replace(regex, placeholder);
  }
  return redacted;
}
