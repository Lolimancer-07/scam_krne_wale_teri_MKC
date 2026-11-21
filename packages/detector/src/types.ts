export type Verdict = 'safe' | 'suspicious' | 'likely_scam';

export type ScamCategory =
  | 'bank_kyc'
  | 'upi_payment'
  | 'delivery_courier'
  | 'government_tax'
  | 'lottery_prize'
  | 'job_task'
  | 'otp_impersonation'
  | 'investment_crypto'
  | 'other';

export interface RedFlag {
  id: string;
  signal: string;
  snippet: string;
  reason: string;
  weight: number;
  startIndex?: number;
  endIndex?: number;
}

export interface DetectionResult {
  verdict: Verdict;
  score: number; // 0-100
  category: ScamCategory;
  redFlags: RedFlag[];
  signals: SignalResult[];
  urlAnalysis?: UrlAnalysisResult;
  urlAnalyses?: UrlAnalysisResult[];
  mlScore?: number;
  ruleScore: number;
  fusionDetails: FusionDetails;
}

export interface SignalResult {
  id: string;
  matched: boolean;
  weight: number;
  evidence?: string;
}

export interface UrlAnalysisResult {
  url: string;
  defanged: string;
  riskScore: number;
  flags: string[];
  isShortener: boolean;
  hasIpHost: boolean;
  hasRiskyTld: boolean;
  lookalikeBrand?: string;
  lookalikeDomain?: string;
}

export interface FusionDetails {
  ruleScore: number;
  mlScore: number;
  urlScore: number;
  aiNudge: number;
  finalScore: number;
  formula: string;
}

export interface AnalyzeTextInput {
  text: string;
  enableAi?: boolean;
  /**
   * Optional 0-100 scam-likelihood nudge supplied by the caller (e.g. the web
   * app's Claude integration). The detector package never calls an LLM itself.
   */
  aiNudge?: number;
}

export interface RuleEngineResult {
  score: number;
  category: ScamCategory;
  signals: SignalResult[];
  redFlags: RedFlag[];
}
