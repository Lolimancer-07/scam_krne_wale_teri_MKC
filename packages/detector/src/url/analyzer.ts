// Stub: URL analyzer — to be implemented by the detector agent
import type { UrlAnalysisResult } from '../types.js';

export function analyzeUrl(_url: string): UrlAnalysisResult {
  // TODO: implement URL analysis using tldts
  return {
    url: _url,
    defanged: _url.replace('://', '[://]'),
    riskScore: 0,
    flags: [],
    isShortener: false,
    hasIpHost: false,
    hasRiskyTld: false,
  };
}

export function extractUrls(_text: string): string[] {
  // TODO: implement URL extraction
  return [];
}
