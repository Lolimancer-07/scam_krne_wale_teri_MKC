/**
 * Text normalization pipeline – runs before ALL rule matching.
 * Pure functions, no DOM, no network. Called from packages/detector/src/index.ts.
 *
 * Normalisations (ordered, idempotent):
 *   1. NFKC – Unicode compatibility decomposition (ﬁ→fi, fullwidth→ascii, etc.)
 *   2. Strip zero-width chars  (U+200B ZWS, U+200C ZWJ, U+FEFF BOM)
 *   3. Collapse ZWS between printable ASCII chars (scammer trick: "a b c")
 *   4. Collapse repeated whitespace and trim
 */

export function normalizeText(text: string): string {
  // 1. NFKC – Unicode compatibility decomposition
  // e.g. ﬁ (U+FB01 ligature) → fi (U+0064 U+0066); fullwidth Latin → ascii
  let result = text.normalize('NFKC');

  // 2. Strip zero-width characters
  // U+200B ZERO WIDTH SPACE
  // U+200C ZERO WIDTH JOINER
  // U+FEFF BOM
  result = result
    .replace(/\u200b/gi, '')
    .replace(/\u200c/gi, '')
    .replace(/\ufeff/, '');

  // 3. Collapse ZWS between printable ASCII characters
  // Scammers insert invisible spaces between characters to bypass detection.
  // We walk character-by-character: keep a ZWS only if it is NOT between
  // two printable ASCII letters/digits; otherwise drop it.
  const printable = /[a-zA-Z0-9]/;
  const cleaned: string[] = [];
  for (let i = 0; i < result.length; i++) {
    const ch = result[i];
    if (ch === '\u200b' || ch === '\u200c') {
      const prev = result[i - 1];
      const next = result[i + 1];
      const isBetweenPrintable = printable.test(prev ?? '') && printable.test(next ?? '');
      if (isBetweenPrintable) {
        // drop the ZWS – do not append
        continue;
      }
    }
    cleaned.push(ch);
  }
  result = cleaned.join('');

  // 4. Collapse repeated whitespace and trim
  result = result.replace(/\s+/g, ' ').trim();

  return result;
}

/** Quick sanity: output must never contain raw digit runs of length >= 4 */
export function sanityCheck(normalized: string): boolean {
  return !/\d{4,}/.test(normalized);
}
