import { clamp, countMatches, normalizeForMatching } from '../text.js';

/**
 * Lightweight text scorer used as the `mlScore` component of the fusion
 * formula.
 *
 * There is no trained model in this repository yet. This scorer converts a
 * handful of high-signal lexical features into a calibrated 0-100 risk score.
 * It is intentionally isolated behind this function so a real model can be
 * dropped in later without touching the rule engine or fusion code.
 */
export function scoreMl(text: string): number {
  const normalized = normalizeForMatching(text);
  if (!normalized) return 0;

  const urgency = countMatches(
    /\b(?:urgent(?:ly)?|immediately|within\s+\d+\s+(?:hours?|hrs?|minutes?|mins?)|last\s+chance|final\s+notice|today\s+itself|turant|jaldi|abhi)\b/gi,
    normalized,
  );
  const threat = countMatches(
    /\b(?:block(?:ed)?|suspend(?:ed)?|frozen|disconnect(?:ed)?|deactivat(?:ed|e)|legal\s+action|penalty|fine|arrest|fir)\b/gi,
    normalized,
  );
  const money = countMatches(
    /(?:₹|rs\.?|inr)\s?[\d,]{2,}|\b\d+(?:\.\d+)?\s*(?:lakh|lakhs|crore|crores|thousand|k)\b/gi,
    normalized,
  );
  const prize = countMatches(
    /\b(?:won|winner|lottery|prize|cashback|gift|jackpot|reward|inam)\b/gi,
    normalized,
  );
  const credentials = countMatches(
    /\b(?:otp|one[- ]time\s+password|pin|password|cvv|card\s+number|aadhaar|aadhar|pan)\b/gi,
    normalized,
  );
  const imperative = countMatches(
    /\b(?:click|verify|update|confirm|call|send|share|pay|scan|download|install|submit)\b/gi,
    normalized,
  );
  const safety = countMatches(
    /\b(?:(?:never|do\s+not|don'?t)\s+(?:share|click|give|disclose)|report\b.{0,20}\b1930|official\s+(?:app|website|portal))\b/gi,
    normalized,
  );
  const transaction = countMatches(
    /\b(?:debited|credited|withdrawn|deposited|spent)\b/gi,
    normalized,
  );
  const obfuscated = countMatches(/\b(?:[a-z]\s){4,}[a-z]\b/gi, normalized);
  const hinglish = countMatches(
    /\b(?:turant|jaldi|abhi|aaj\s+hi|bhejo|batao|inam)\b/gi,
    normalized,
  );
  const greeting = countMatches(
    /\b(?:dear\s+(?:customer|user|winner|friend)|congratulations)\b/gi,
    normalized,
  );

  const urlCount = countMatches(/\b(?:https?:\/\/|www\.)[^\s]+/gi, normalized);
  const phone = /\b(?:[6-9]\d{9}|1800[\s-]?\d{3}[\s-]?\d{4})\b/.test(normalized);
  const exclamations = countMatches(/!/g, normalized);
  const letters = normalized.replace(/[^a-z]/g, '');
  const uppercaseRatio =
    letters.length > 0 ? (text.match(/[A-Z]/g)?.length ?? 0) / letters.length : 0;

  let raw = 0;
  raw += Math.min(urgency, 3) * 7;
  raw += Math.min(threat, 3) * 9;
  raw += Math.min(money, 3) * 5;
  raw += Math.min(prize, 3) * 7;
  raw += Math.min(credentials, 3) * 8;
  raw += Math.min(imperative, 4) * 3;
  raw += urlCount > 0 ? 6 + Math.min(urlCount - 1, 2) * 2 : 0;
  raw += phone ? 5 : 0;
  raw += safety > 0 ? -12 : 0;
  raw += transaction > 0 ? -8 : 0;
  raw += obfuscated > 0 ? 8 : 0;
  raw += uppercaseRatio > 0.35 && text.length > 20 ? 7 : 0;
  raw += exclamations >= 2 ? 3 : 0;
  raw += hinglish > 0 ? 5 : 0;
  raw += greeting > 0 ? 3 : 0;
  raw += text.length < 100 && (urlCount > 0 || prize > 0) ? 5 : 0;

  const score = 100 / (1 + Math.exp(-(raw - 30) / 12));
  return Math.round(clamp(score, 0, 100));
}
