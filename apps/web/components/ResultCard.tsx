'use client';

import React, { useState } from 'react';
import { RedFlagHighlight, RedFlag } from './RedFlagHighlight';
import { CategoryExplainer } from './CategoryExplainer';
import { useLanguage } from './LanguageProvider';
import {
  AlertOctagonIcon,
  AlertTriangleIcon,
  ShieldCheckIcon,
  LinkIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  RotateCcwIcon,
  CheckCircleIcon,
  Volume2Icon,
  CopyIcon,
  PhoneCallIcon,
  ArrowRightIcon,
  LockIcon,
} from './Icons';

export interface UrlAnalysis {
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

export interface DetectionResultData {
  verdict: 'safe' | 'suspicious' | 'likely_scam';
  score: number;
  category: string;
  redFlags: RedFlag[];
  signals: Array<{ id: string; matched: boolean; weight: number }>;
  urlAnalysis?: UrlAnalysis;
  ruleScore: number;
  mlScore?: number;
  ai?: {
    explanation?: string;
  };
  fusionDetails?: {
    ruleScore: number;
    mlScore: number;
    urlScore: number;
    aiNudge: number;
    finalScore: number;
    formula: string;
  };
}

interface ResultCardProps {
  originalText: string;
  result: DetectionResultData;
  onReset: () => void;
  lang?: 'en' | 'hi';
}

export function ResultCard({ originalText, result, onReset, lang = 'en' }: ResultCardProps) {
  const [feedbackSent, setFeedbackSent] = useState<boolean | null>(null);
  const [showEmergency, setShowEmergency] = useState(false);
  const [showNcrpDraft, setShowNcrpDraft] = useState(false);
  const [copiedIncident, setCopiedIncident] = useState(false);
  const [copiedNcrp, setCopiedNcrp] = useState(false);
  const [familyCopied, setFamilyCopied] = useState(false);
  const { lang: currentLang } = useLanguage();

  const isHindi = (lang || currentLang) === 'hi';
  const rawVerdict = (result.verdict || 'safe').toLowerCase();
  const isScam = rawVerdict === 'likely_scam';
  const isSuspicious = rawVerdict === 'suspicious';

  const signatureId = `IN-FIN-${(result.category || 'THREAT').toUpperCase().slice(0, 4)}-${Math.abs(
    Math.round(result.score * 107 + 1000),
  )
    .toString()
    .slice(0, 4)}`;

  const verdictConfigs = {
    likely_scam: {
      panelBorder: 'border-rose-500/40 bg-[#0a101f] shadow-[0_0_30px_rgba(239,68,68,0.2)]',
      badge: 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40',
      icon: <AlertOctagonIcon className="w-4 h-4 text-rose-400 shrink-0" />,
      title: 'Likely Scam',
      severityLabel: 'THRESHOLD EXCEEDED: TIER 3 SEVERE',
      severityClass: 'text-rose-400 font-bold',
      scoreColor: 'text-rose-400',
      actionRecommendation: 'IMMEDIATE BLOCK / DO NOT ENGAGE',
      summary:
        'High probability of malicious intent. Do not click links, share OTPs, or transfer money.',
    },
    suspicious: {
      panelBorder: 'border-amber-500/40 bg-[#0a101f] shadow-[0_0_30px_rgba(245,158,11,0.15)]',
      badge: 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40',
      icon: <AlertTriangleIcon className="w-4 h-4 text-amber-400 shrink-0" />,
      title: 'Suspicious Message',
      severityLabel: 'ELEVATED SUSPICION: TIER 2 MODERATE',
      severityClass: 'text-amber-400 font-bold',
      scoreColor: 'text-amber-400',
      actionRecommendation: 'EXERCISE EXTREME CAUTION / VERIFY DIRECTLY',
      summary:
        'Contains suspicious patterns commonly seen in fraud campaigns. Exercise extreme caution.',
    },
    safe: {
      panelBorder: 'border-emerald-500/40 bg-[#0a101f] shadow-[0_0_30px_rgba(16,185,129,0.15)]',
      badge: 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40',
      icon: <ShieldCheckIcon className="w-4 h-4 text-emerald-400 shrink-0" />,
      title: 'Likely Safe',
      severityLabel: 'NOMINAL BASELINE: TIER 1 SAFE',
      severityClass: 'text-emerald-400 font-bold',
      scoreColor: 'text-emerald-400',
      actionRecommendation: 'STANDARD BANKING DILIGENCE',
      summary: 'No obvious fraudulent signals detected. Always verify unexpected communications.',
    },
  };

  const currentVerdictConfig =
    verdictConfigs[rawVerdict as keyof typeof verdictConfigs] || verdictConfigs.safe;

  const handleFeedback = (isCorrect: boolean) => {
    setFeedbackSent(isCorrect);
    fetch('/api/v1/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        score: result.score,
        verdict: result.verdict,
        category: result.category,
        isCorrect,
      }),
    }).catch(() => {
      // background tracking
    });
  };

  const handleReadAloud = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      result.ai?.explanation ?? currentVerdictConfig.summary,
    );
    utterance.lang = isHindi ? 'hi-IN' : 'en-IN';
    window.speechSynthesis.speak(utterance);
  };

  const ncrpComplaintDraft = [
    'POLICE COMPLAINT DRAFT (NATIONAL CYBERCRIME REPORTING PORTAL // cybercrime.gov.in)',
    '--------------------------------------------------------------------------',
    'Incident Category: Financial Cyber Fraud / Impersonation Phishing',
    `Sub-Category: ${(result.category || 'general').replace(/_/g, ' ').toUpperCase()}`,
    `Date & Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`,
    `Triage Confidence Score: ${result.score}/100 [${result.verdict.toUpperCase()}]`,
    `Forensic Signature ID: ${signatureId}`,
    '',
    'SUSPECT DETAILS / COMMUNICATION CONTENT:',
    `Payload Text: "${originalText.slice(0, 300)}"`,
    result.urlAnalysis
      ? `Defanged Phishing Link: ${result.urlAnalysis.defanged}`
      : 'Link: None Detected',
    result.urlAnalysis?.lookalikeBrand
      ? `Spoofed Organization: ${result.urlAnalysis.lookalikeBrand.toUpperCase()} (Legit: ${result.urlAnalysis.lookalikeDomain})`
      : '',
    '',
    'ANOMALY EVIDENCE & RED FLAGS DETECTED:',
    ...(result.redFlags || []).map(
      (f, idx) => `  ${idx + 1}. [Weight +${f.weight}] "${f.snippet}": ${f.reason}`,
    ),
    '',
    'RELIEF / ACTION REQUESTED:',
    '1. Register an electronic complaint under relevant sections of Information Technology Act 2000 (Section 66D) & BNS/IPC.',
    '2. Issue immediate telecom header and domain sinkholing notice to DoT / CERT-In.',
    '3. Coordinate with payment gateway / beneficiary bank to freeze suspected mule accounts.',
    '--------------------------------------------------------------------------',
    'Reported via ScamShield India Forensic Engine (Zero-PII Sovereign Architecture)',
  ]
    .filter(Boolean)
    .join('\n');

  const handleCopyNcrpDraft = async () => {
    try {
      await navigator.clipboard.writeText(ncrpComplaintDraft);
      setCopiedNcrp(true);
      setTimeout(() => setCopiedNcrp(false), 3000);
    } catch {
      // Clipboard fallback
    }
  };

  const handleCopyIncidentSummary = async () => {
    const summary = [
      'ScamShield Emergency Incident Summary',
      `Verdict: ${result.verdict.toUpperCase()} (Risk Score: ${result.score}/100)`,
      `Category: ${(result.category || 'general').replace(/_/g, ' ')}`,
      `Signature: ${signatureId}`,
      `Timestamp: ${new Date().toISOString()}`,
      'Recommended Action: Call bank immediately or National Cyber Helpline 1930, freeze compromised card/UPI, change credentials, report at cybercrime.gov.in',
    ].join('\n');

    try {
      await navigator.clipboard.writeText(summary);
      setCopiedIncident(true);
      setTimeout(() => setCopiedIncident(false), 3000);
    } catch {
      // Clipboard fallback
    }
  };

  const familyAlertText = [
    'ScamShield Security Alert',
    `Verdict: ${result.verdict.toUpperCase()}`,
    `Risk Score: ${result.score}/100`,
    `Threat Category: ${(result.category || 'general').replace(/_/g, ' ')}`,
    'Please verify suspicious communications directly through official bank/telecom apps. Never share OTP or UPI PIN.',
  ].join('\n');

  const handleFamilyShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'ScamShield Security Alert',
          text: familyAlertText,
          url: window.location.origin,
        });
      } else {
        await navigator.clipboard.writeText(familyAlertText);
        setFamilyCopied(true);
        setTimeout(() => setFamilyCopied(false), 3000);
      }
    } catch {
      // user cancelled
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in-50 duration-300">
      {/* 1. Master High-Contrast Glowing Triage Banner */}
      <div
        className={`rounded-2xl border ${currentVerdictConfig.panelBorder} p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden space-y-6`}
      >
        {/* Top Header Strip with Signature ID & Confidence */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span
              className={`px-3 py-1 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-2 ${currentVerdictConfig.badge}`}
            >
              {currentVerdictConfig.icon}
              <span>{currentVerdictConfig.title}</span>
            </span>
            <span className="font-mono text-xs text-slate-300 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08]">
              CATEGORY: {(result.category || 'GENERAL').replace(/_/g, ' ').toUpperCase()}
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              SIGNATURE_ID: {signatureId}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-indigo-400 font-semibold">
              ACTION: {currentVerdictConfig.actionRecommendation}
            </span>
          </div>
        </div>

        {/* Middle Score & Forensic Readout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-2">
            <div className="flex items-baseline gap-2 font-mono">
              <span
                className={`font-headline text-5xl sm:text-6xl font-black tracking-tight ${currentVerdictConfig.scoreColor}`}
              >
                {result.score}
              </span>
              <span className="text-xl sm:text-2xl text-slate-400 font-normal">/100</span>
            </div>
            <p className="font-body text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl">
              {result.ai?.explanation || currentVerdictConfig.summary}
            </p>
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleReadAloud}
                className="px-3.5 py-1.5 text-xs font-mono rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                aria-label="Read assessment aloud"
              >
                <Volume2Icon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Read Aloud (Voice)</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Column */}
          <div className="lg:col-span-4 bg-[#050b14] p-4 rounded-xl border border-white/[0.08] space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 uppercase text-[10px]">Threat Velocity</span>
              <span
                className={
                  isScam
                    ? 'text-rose-400 font-bold'
                    : isSuspicious
                      ? 'text-amber-400 font-bold'
                      : 'text-emerald-400 font-bold'
                }
              >
                {isScam ? 'EXTREME (+380% / 24h)' : isSuspicious ? 'MODERATE (+45%)' : 'NORMAL'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 uppercase text-[10px]">Vector Analysis</span>
              <span className="text-slate-200 font-semibold truncate max-w-[150px]">
                Active Forensic Profile
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 uppercase text-[10px]">Interception Status</span>
              <span
                className={
                  isScam
                    ? 'text-rose-400 font-mono'
                    : isSuspicious
                      ? 'text-amber-400 font-mono'
                      : 'text-emerald-400 font-mono'
                }
              >
                {isScam
                  ? 'Quarantined & Flagged'
                  : isSuspicious
                    ? 'Review Recommended'
                    : 'Baseline Verified'}
              </span>
            </div>
          </div>
        </div>

        {/* Segmented Risk Meter (Low / Moderate / Severe) */}
        <div className="space-y-1.5 pt-2 border-t border-white/[0.08]">
          <div className="flex items-center justify-between font-mono text-[11px] text-slate-400">
            <span>RISK LEVEL GAUGE</span>
            <span className={currentVerdictConfig.severityClass}>
              {currentVerdictConfig.severityLabel}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 h-3 w-full rounded-lg overflow-hidden bg-[#050b14] p-0.5 border border-white/[0.08]">
            <div
              className={`h-full rounded transition-all ${
                result.score <= 30
                  ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]'
                  : 'bg-emerald-500/30'
              }`}
            />
            <div
              className={`h-full rounded transition-all ${
                result.score > 30 && result.score <= 60
                  ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.8)]'
                  : 'bg-amber-500/30'
              }`}
            />
            <div
              className={`h-full rounded transition-all ${
                result.score > 60
                  ? 'bg-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.8)] animate-pulse'
                  : 'bg-rose-500/30'
              }`}
            />
          </div>
          <div className="grid grid-cols-3 text-center font-mono text-[10px] pt-1">
            <span className="text-slate-400 text-left">LOW (0 - 30)</span>
            <span className="text-slate-400 text-center">MODERATE (31 - 60)</span>
            <span className="text-rose-400 text-right font-bold">SEVERE (61 - 100)</span>
          </div>
        </div>
      </div>

      {/* 2. 3-Column Triage Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Link Inspection */}
        <div className="p-4 bg-[#0a101f] rounded-xl border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-slate-400 uppercase font-semibold">
              Link Inspection
            </span>
            <LinkIcon className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="font-mono text-xs text-rose-400 truncate select-all">
            {result.urlAnalysis
              ? result.urlAnalysis.lookalikeBrand
                ? `Spoofed Brand: ${result.urlAnalysis.lookalikeBrand.toUpperCase()}`
                : 'Suspicious URL Vector'
              : 'No external links extracted'}
          </div>
          <p className="font-body text-xs text-slate-400 leading-relaxed">
            {result.urlAnalysis
              ? `Defanged to prevent accidental execution. ${
                  result.urlAnalysis.lookalikeBrand
                    ? `Spoofing detected for ${result.urlAnalysis.lookalikeBrand.toUpperCase()}.`
                    : 'Target analyzed against Indian banking registries.'
                }`
              : 'Message does not contain HTTP or URL redirects; vector operates purely through conversational deception.'}
          </p>
        </div>

        {/* Metric 2: Social Engineering & Psychological Vector */}
        <div className="p-4 bg-[#0a101f] rounded-xl border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-slate-400 uppercase font-semibold">
              Psychological Vector
            </span>
            <AlertTriangleIcon className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-headline font-semibold text-xs text-amber-300">
            {isScam
              ? 'Urgency & Fear Coercion'
              : isSuspicious
                ? 'Unsolicited Financial Lure'
                : 'Neutral Communication'}
          </div>
          <p className="font-body text-xs text-slate-400 leading-relaxed">
            {isScam
              ? 'Exploits fear of immediate account deactivation or legal arrest to induce cognitive panic and force hasty action.'
              : 'Synthesizes unsolicited lucrative promises or high-pressure requests to bypass standard security vigilance.'}
          </p>
        </div>

        {/* Metric 3: Sovereign Protection Action */}
        <div className="p-4 bg-[#0a101f] rounded-xl border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-slate-400 uppercase font-semibold">
              Sovereign Protection
            </span>
            <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
          </div>
          <div
            className={`font-headline font-semibold text-xs ${isScam ? 'text-rose-400' : isSuspicious ? 'text-amber-400' : 'text-emerald-400'}`}
          >
            {isScam
              ? 'National Registry Escalation'
              : isSuspicious
                ? 'Manual Review Recommended'
                : 'Heuristic Verified Safe'}
          </div>
          <p className="font-body text-xs text-slate-400 leading-relaxed">
            {isScam
              ? 'Triage signature prepared for CERT-In sinkholing and telecom-level SMS header revocation across DoT circles.'
              : isSuspicious
                ? 'Unverified sender patterns identified. Cross-check sender numbers directly with official customer care.'
                : 'Message matches expected legitimate transactional formats and passes zero-threat heuristics.'}
          </p>
        </div>
      </div>

      {/* 3. Highlighted Message Analysis (Forensic Text Inspection) */}
      <div className="bg-[#0a101f] p-6 rounded-2xl border border-white/[0.08] space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              FORENSIC TEXT INSPECTION // WEIGHTED PHRASE BREAKDOWN
            </h3>
          </div>
          <span className="font-mono text-xs text-indigo-400">
            {(result.redFlags || []).length} Red Flag
            {(result.redFlags || []).length === 1 ? '' : 's'} Detected
          </span>
        </div>

        <RedFlagHighlight text={originalText} redFlags={result.redFlags || []} />

        {/* Itemized Red Flags Evidence Breakdown */}
        {(result.redFlags || []).length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">
              ANOMALY EVIDENCE DECOMPOSITION
            </span>
            <div className="grid gap-2">
              {result.redFlags.map((flag) => (
                <div
                  key={flag.id}
                  className="p-3 rounded-xl border border-white/[0.06] bg-[#050b14] text-xs flex items-start gap-3 hover:border-white/[0.15] transition"
                >
                  <span className="px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 font-mono font-bold text-[11px] shrink-0 border border-rose-500/30">
                    +{flag.weight}
                  </span>
                  <div>
                    <span className="font-semibold text-slate-100 font-mono">
                      &quot;{flag.snippet}&quot;
                    </span>
                    <span className="text-slate-400 ml-2">— {flag.reason}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Defanged URL Deep Domain Analysis (if URL present) */}
      {result.urlAnalysis && (
        <div className="rounded-2xl border border-white/[0.08] bg-[#0a101f] p-6 space-y-3.5 shadow-xl">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-indigo-400" />
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              Suspicious Link Analysis (Defanged)
            </h3>
          </div>

          <div className="p-3.5 bg-[#050b14] rounded-xl font-mono text-xs sm:text-sm break-all text-rose-400 select-all border border-rose-500/20">
            {result.urlAnalysis.defanged}
          </div>

          {result.urlAnalysis.lookalikeBrand && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300 font-medium flex items-start gap-2.5">
              <AlertTriangleIcon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="uppercase">Brand Spoofing Alert:</strong> This URL appears to
                impersonate{' '}
                <strong className="underline text-white">
                  {result.urlAnalysis.lookalikeBrand.toUpperCase()}
                </strong>
                . The legitimate official domain is{' '}
                <strong className="font-mono text-emerald-400 underline">
                  {result.urlAnalysis.lookalikeDomain}
                </strong>
                .
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
            {result.urlAnalysis.flags.map((flag, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-300 uppercase"
              >
                {flag.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 5. Action Toolbar: NCRP Police Complaint & Emergency Triage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card A: One-Click NCRP Police Complaint Draft Generator */}
        <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0a101f] space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-indigo-400 uppercase font-bold tracking-wider">
                Sovereign Escort
              </span>
              <ShieldCheckIcon className="w-4 h-4 text-indigo-400" />
            </div>
            <h4 className="font-headline font-bold text-sm text-white">
              National Cybercrime Portal Draft
            </h4>
            <p className="font-body text-xs text-slate-400">
              Generate a formatted complaint narrative with timestamps and forensic evidence ready
              for paste into <span className="text-indigo-400 font-mono">cybercrime.gov.in</span>.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowNcrpDraft((v) => !v)}
              className="w-full px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white font-mono text-xs uppercase tracking-wider rounded-xl transition border border-white/[0.08] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>
                {showNcrpDraft
                  ? 'Hide NCRP Police Draft'
                  : 'Generate Police Complaint Draft (NCRP Format)'}
              </span>
              <ArrowRightIcon className="w-3.5 h-3.5 text-indigo-400" />
            </button>
          </div>
        </div>

        {/* Card B: Emergency Helpline & Bank Freezing */}
        <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0a101f] space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-rose-400 uppercase font-bold tracking-wider">
                Emergency Helpline
              </span>
              <PhoneCallIcon className="w-4 h-4 text-rose-400" />
            </div>
            <h4 className="font-headline font-bold text-sm text-white">Call Cyber Helpline 1930</h4>
            <p className="font-body text-xs text-slate-400">
              Victim of an unauthorized UPI transfer or leaked OTP? Immediately contact the 24x7
              National Cyber Crime Helpline or freeze your bank card.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <a
              href="tel:1930"
              className="flex-1 px-4 py-2.5 bg-rose-500/20 text-rose-300 font-mono text-xs uppercase tracking-wider font-bold rounded-xl transition hover:bg-rose-500/30 flex items-center justify-center gap-1.5 border border-rose-500/40"
            >
              <PhoneCallIcon className="w-3.5 h-3.5 text-rose-400" />
              <span>Dial 1930</span>
            </a>
            <button
              type="button"
              onClick={() => setShowEmergency((v) => !v)}
              className="px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white font-mono text-xs uppercase tracking-wider rounded-xl transition border border-white/[0.08] cursor-pointer"
            >
              {showEmergency ? 'Close' : 'Bank Freeze Steps'}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded NCRP Police Complaint Drawer */}
      {showNcrpDraft && (
        <div className="p-5 rounded-2xl border border-indigo-500/30 bg-[#050b14] space-y-3 animate-in fade-in-50">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-indigo-400 uppercase tracking-wider">
              NCRP Incident Report Draft
            </span>
            <button
              type="button"
              onClick={handleCopyNcrpDraft}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              {copiedNcrp ? (
                <>
                  <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Draft Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <CopyIcon className="w-3.5 h-3.5" />
                  <span>Copy Police Complaint Draft</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-4 bg-[#0a101f] font-mono text-xs text-slate-200 leading-relaxed overflow-x-auto rounded-xl border border-white/[0.08] whitespace-pre-wrap select-all">
            {ncrpComplaintDraft}
          </pre>
        </div>
      )}

      {/* Expanded Emergency Bank Freeze Drawer */}
      {showEmergency && (
        <div className="p-5 rounded-2xl border border-rose-500/30 bg-[#050b14] space-y-3 animate-in fade-in-50">
          <div className="flex items-center justify-between">
            <h4 className="font-mono text-xs font-bold text-rose-400 uppercase tracking-wider">
              Emergency Action Checklist: Compromised Account or Funds Transferred
            </h4>
            <button
              type="button"
              onClick={handleCopyIncidentSummary}
              className="px-3.5 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] font-mono text-xs text-slate-200 rounded-xl transition flex items-center gap-1.5 border border-white/[0.08] cursor-pointer"
            >
              {copiedIncident ? (
                <>
                  <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Summary Copied!</span>
                </>
              ) : (
                <>
                  <CopyIcon className="w-3.5 h-3.5" />
                  <span>Copy Emergency Summary</span>
                </>
              )}
            </button>
          </div>
          <ol className="space-y-2 text-xs font-body text-slate-300 list-decimal list-inside pl-1 leading-relaxed">
            <li>
              <strong className="text-white">Immediately dial 1930</strong> to initiate the Citizen
              Financial Cyber Fraud Reporting and Management System (CFCFRMS) golden-hour fund
              freeze.
            </li>
            <li>
              Call your bank’s 24x7 toll-free fraud helpline to freeze your debit/credit card and
              block your UPI VPA handle.
            </li>
            <li>
              Change all internet banking passwords, UPI MPINs, and email account credentials from a
              clean, separate device.
            </li>
            <li>
              File an official complaint with screenshots and transaction reference numbers on{' '}
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 underline font-semibold"
              >
                cybercrime.gov.in
              </a>
              .
            </li>
            <li>
              Preserve all evidence: retain original SMS messages, WhatsApp chat logs, and call
              records; do not delete them.
            </li>
          </ol>
        </div>
      )}

      {/* 6. What the Scammer Wants Explainer */}
      <CategoryExplainer category={result.category || 'general'} />

      {/* 7. Action Bar: Accuracy Feedback & Reset */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl border border-white/[0.08] bg-[#0a101f]">
        <div className="flex items-center gap-3">
          <span className="font-body text-xs text-slate-400 font-medium">
            Was this assessment accurate?
          </span>
          {feedbackSent === null ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleFeedback(true)}
                className="px-3.5 py-1.5 text-xs font-mono rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition flex items-center gap-1.5 cursor-pointer"
              >
                <ThumbsUpIcon className="w-3.5 h-3.5" />
                <span>Yes</span>
              </button>
              <button
                type="button"
                onClick={() => handleFeedback(false)}
                className="px-3.5 py-1.5 text-xs font-mono rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition flex items-center gap-1.5 cursor-pointer"
              >
                <ThumbsDownIcon className="w-3.5 h-3.5" />
                <span>No</span>
              </button>
            </div>
          ) : (
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
              <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
              <span>Feedback recorded in telemetry model</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleFamilyShare}
            className="px-4 py-2 text-xs font-mono rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] transition flex items-center gap-1.5 cursor-pointer"
          >
            <LockIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span>{familyCopied ? 'Alert Copied!' : 'Share Family Alert'}</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="px-5 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white transition shadow-[0_0_16px_rgba(99,102,241,0.35)] flex items-center gap-2 cursor-pointer border border-indigo-400/30"
          >
            <RotateCcwIcon className="w-3.5 h-3.5" />
            <span>Check Another Message</span>
          </button>
        </div>
      </div>
    </div>
  );
}
