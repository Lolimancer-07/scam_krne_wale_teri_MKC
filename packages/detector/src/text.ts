/** Text helpers shared by the rule engine, URL extractor and heuristic scorer. */

const ZERO_WIDTH = /[\u200B-\u200D\uFEFF\u2060]/g;

export function stripZeroWidth(text: string): string {
  return text.replace(ZERO_WIDTH, '');
}

/** Lower-cased, aggressively normalised text used for matching/scoring only. */
export function normalizeForMatching(text: string): string {
  return stripZeroWidth(text).normalize('NFKC').replace(/\s+/g, ' ').trim().toLowerCase();
}

/** Clamp a numeric value into an inclusive range. */
export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/** Collapse whitespace and trim, preserving the original characters otherwise. */
export function tidySnippet(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Return a short evidence snippet around a match. The returned string is
 * trimmed and ellipsised but the original match is left intact.
 */
export function snippetAround(text: string, startIndex: number, matchLength: number): string {
  const radius = 42;
  const start = Math.max(0, startIndex - radius);
  const end = Math.min(text.length, startIndex + matchLength + radius);
  const prefix = start > 0 ? '…' : '';
  const suffix = end < text.length ? '…' : '';
  return `${prefix}${tidySnippet(text.slice(start, end))}${suffix}`.slice(0, 180);
}

/** Find the first case-insensitive occurrence of an exact match in the original text. */
export function findOriginalIndex(text: string, match: string): number {
  if (!match) return -1;
  const direct = text.indexOf(match);
  if (direct !== -1) return direct;
  return text.toLowerCase().indexOf(match.toLowerCase());
}

/** Return the text with a regex's global flag removed so `match` is stateless. */
export function stateless(pattern: RegExp): RegExp {
  return new RegExp(pattern.source, pattern.flags.replace(/g/g, ''));
}

/** Safe regex match that never carries lastIndex state between evaluations. */
export function firstMatch(pattern: RegExp, text: string): RegExpMatchArray | null {
  return stateless(pattern).exec(text);
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Count non-overlapping matches of a stateless regular expression. */
export function countMatches(pattern: RegExp, text: string): number {
  const global = new RegExp(
    pattern.source,
    pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`,
  );
  return [...text.matchAll(global)].length;
}
