import { SignalResult, RedFlag, ScamCategory } from '../types.js';
import { SIGNALS } from './patterns.js';

export interface RulesResult {
  score: number;
  signals: SignalResult[];
  redFlags: RedFlag[];
  category: ScamCategory;
}

export function determineCategory(matchedSignals: Set<string>): ScamCategory {
  if (matchedSignals.has('kyc_lure')) return 'bank_kyc';
  if (
    matchedSignals.has('otp_request') ||
    matchedSignals.has('pin_cvv_request') ||
    matchedSignals.has('emergency_impersonation')
  ) {
    return 'otp_impersonation';
  }
  if (
    matchedSignals.has('arrest_threat') ||
    matchedSignals.has('traffic_challan_threat') ||
    matchedSignals.has('utility_disconnection')
  ) {
    return 'government_tax';
  }
  if (matchedSignals.has('delivery_lure')) return 'delivery_courier';
  if (matchedSignals.has('job_task_scam')) return 'job_task';
  if (matchedSignals.has('investment_crypto')) return 'investment_crypto';
  if (matchedSignals.has('refund_prize_lure')) return 'lottery_prize';
  if (
    matchedSignals.has('payment_request') ||
    matchedSignals.has('predatory_loan_lure') ||
    matchedSignals.has('upi_collect_request') ||
    matchedSignals.has('upi_pin_to_receive')
  ) {
    return 'upi_payment';
  }
  if (
    (matchedSignals.has('account_block_threat') || matchedSignals.has('sim_block_threat')) &&
    matchedSignals.has('impersonated_brand')
  ) {
    return 'bank_kyc';
  }
  return 'other';
}

export function runRules(text: string): RulesResult {
  const signalResults: SignalResult[] = [];
  const redFlags: RedFlag[] = [];
  const matchedSignalIds = new Set<string>();
  let totalWeight = 0;

  for (const signalDef of SIGNALS) {
    // Check if negative patterns invalidate this signal (e.g. "Do not share OTP")
    if (signalDef.negativePatterns) {
      const hasNegativeMatch = signalDef.negativePatterns.some((negPattern) =>
        negPattern.test(text),
      );
      if (hasNegativeMatch) {
        signalResults.push({
          id: signalDef.id,
          matched: false,
          weight: signalDef.weight,
        });
        continue;
      }
    }

    let matched = false;
    let matchedSnippet = '';
    let startIndex: number | undefined;
    let endIndex: number | undefined;

    for (const pattern of signalDef.patterns) {
      const match = text.match(pattern);
      if (match && match.index !== undefined) {
        matched = true;
        matchedSnippet = match[0];
        startIndex = match.index;
        endIndex = match.index + match[0].length;
        break;
      }
    }

    signalResults.push({
      id: signalDef.id,
      matched,
      weight: signalDef.weight,
      evidence: matched ? matchedSnippet : undefined,
    });

    if (matched) {
      matchedSignalIds.add(signalDef.id);
      totalWeight += signalDef.weight;
      redFlags.push({
        id: `${signalDef.id}-${startIndex ?? 0}`,
        signal: signalDef.id,
        snippet: matchedSnippet,
        reason: signalDef.reason,
        weight: signalDef.weight,
        startIndex,
        endIndex,
      });
    }
  }

  // Sort red flags by appearance in message text
  redFlags.sort((a, b) => (a.startIndex ?? 0) - (b.startIndex ?? 0));

  const score = Math.min(100, totalWeight);
  const category = determineCategory(matchedSignalIds);

  return {
    score,
    signals: signalResults,
    redFlags,
    category,
  };
}
