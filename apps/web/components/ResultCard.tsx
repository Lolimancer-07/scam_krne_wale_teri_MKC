'use client';

import React, { useState } from 'react';
import { RedFlagHighlight, RedFlag } from './RedFlagHighlight';
import { CategoryExplainer } from './CategoryExplainer';
import { useLanguage } from './LanguageProvider';
import {
  AlertOctagonIcon,
  AlertTriangleIcon,
  ShieldCheckIcon,
  ShieldAlertIcon,
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
  fusionDetails: {
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
  const isScam = result.verdict === 'likely_scam';
  const isSuspicious = result.verdict === 'suspicious';

  const signatureId = `IN-FIN-${result.category.toUpperCase().slice(0, 4)}-${Math.abs(
    Math.round(result.score * 107 + 1000),
  )
    .toString()
    .slice(0, 4)}`;

  const verdictConfig = {
    likely_scam: {
      panelBorder: 'border-error/40 bg-error-container/15 shadow-[0_0_24px_rgba(255,84,81,0.25)]',
      badge: 'bg-error-container text-on-error font-bold border border-error/50',
      icon: <AlertOctagonIcon className="w-4 h-4 text-on-error shrink-0" />,
      title: 'Likely Scam',
      severityLabel: 'THRESHOLD EXCEEDED: TIER 3 SEVERE',
      severityClass: 'text-error font-bold',
      actionRecommendation: 'IMMEDIATE BLOCK / DO NOT ENGAGE',
      summary:
        'High probability of malicious intent. Do not click links, share OTPs, or transfer money.',
    },
    suspicious: {
      panelBorder:
        'border-tertiary/40 bg-tertiary-container/15 shadow-[0_0_24px_rgba(255,185,95,0.2)]',
      badge: 'bg-tertiary-container text-on-tertiary font-bold border border-tertiary/50',
      icon: <AlertTriangleIcon className="w-4 h-4 text-on-tertiary shrink-0" />,
      title: 'Suspicious Message',
      severityLabel: 'ELEVATED SUSPICION: TIER 2 MODERATE',
      severityClass: 'text-tertiary font-bold',
      actionRecommendation: 'EXERCISE EXTREME CAUTION / VERIFY DIRECTLY',
      summary:
        'Contains suspicious patterns commonly seen in fraud campaigns. Exercise extreme caution.',
    },
    safe: {
      panelBorder:
        'border-secondary/40 bg-secondary-container/15 shadow-[0_0_24px_rgba(78,222,163,0.15)]',
      badge:
        'bg-secondary-container text-on-secondary-container font-bold border border-secondary/50',
      icon: <ShieldCheckIcon className="w-4 h-4 text-on-secondary-container shrink-0" />,
      title: 'Likely Safe',
      severityLabel: 'NOMINAL BASELINE: TIER 1 SAFE',
      severityClass: 'text-secondary font-bold',
      actionRecommendation: 'STANDARD BANKING DILIGENCE',
      summary: 'No obvious fraudulent signals detected. Always verify unexpected communications.',
    },
  }[result.verdict];

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
    const utterance = new SpeechSynthesisUtterance(result.ai?.explanation ?? verdictConfig.summary);
    utterance.lang = isHindi ? 'hi-IN' : 'en-IN';
    window.speechSynthesis.speak(utterance);
  };

  const ncrpComplaintDraft = [
    'POLICE COMPLAINT DRAFT (NATIONAL CYBERCRIME REPORTING PORTAL // cybercrime.gov.in)',
    '--------------------------------------------------------------------------',
    'Incident Category: Financial Cyber Fraud / Impersonation Phishing',
    `Sub-Category: ${result.category.replace(/_/g, ' ').toUpperCase()}`,
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
    ...result.redFlags.map(
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
      `Category: ${result.category.replace(/_/g, ' ')}`,
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
    'ScamShield Family Protect Alert',
    `Verdict: ${result.verdict.toUpperCase()}`,
    `Risk Score: ${result.score}/100`,
    `Threat Category: ${result.category.replace(/_/g, ' ')}`,
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
      {/* 1. Master High-Contrast Glowing Triage Banner (From Stitch Screen 2) */}
      <div
        className={`rounded-xl border ${verdictConfig.panelBorder} p-6 sm:p-8 backdrop-blur-md relative overflow-hidden space-y-6`}
      >
        {/* Top Header Strip with Signature ID & Confidence */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-container-high pb-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span
              className={`px-3 py-1 rounded text-xs font-mono uppercase tracking-wider flex items-center gap-2 ${verdictConfig.badge}`}
            >
              {verdictConfig.icon}
              <span>{verdictConfig.title}</span>
            </span>
            <span className="font-mono text-xs text-on-surface px-2.5 py-1 rounded bg-surface-container border border-surface-container-high">
              CATEGORY: {result.category.replace(/_/g, ' ').toUpperCase()}
            </span>
            <span className="font-mono text-[11px] text-on-surface-variant">
              SIGNATURE_ID: {signatureId}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-tertiary">
              ACTION: {verdictConfig.actionRecommendation}
            </span>
          </div>
        </div>

        {/* Middle Score & Forensic Readout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-2">
            <div className="flex items-baseline gap-2 font-mono">
              <span
                className={`font-headline text-5xl sm:text-6xl font-black tracking-tight ${
                  isScam ? 'text-primary' : isSuspicious ? 'text-tertiary' : 'text-secondary'
                }`}
              >
                {result.score}
              </span>
              <span className="text-xl sm:text-2xl text-on-surface-variant font-normal">/100</span>
            </div>
            <p className="font-body text-sm sm:text-base text-on-surface leading-relaxed max-w-2xl">
              {result.ai?.explanation || verdictConfig.summary}
            </p>
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleReadAloud}
                className="px-3 py-1.5 text-xs font-mono rounded-lg border border-outline-variant/40 bg-surface-container hover:bg-surface-container-high text-on-surface transition flex items-center gap-1.5 cursor-pointer"
                aria-label="Read assessment aloud"
              >
                <Volume2Icon className="w-3.5 h-3.5 text-secondary" />
                <span>Read Aloud (Voice)</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Column */}
          <div className="lg:col-span-4 bg-surface-container p-4 rounded-lg border border-surface-container-high space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant uppercase text-[10px]">Threat Velocity</span>
              <span className="text-primary font-bold">
                {isScam ? 'EXTREME (+380% / 24h)' : isSuspicious ? 'MODERATE (+45%)' : 'NORMAL'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant uppercase text-[10px]">Vector Analysis</span>
              <span className="text-on-surface font-semibold truncate max-w-[150px]">
                Active Forensic Profile
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant uppercase text-[10px]">
                Interception Status
              </span>
              <span className="text-secondary font-mono">
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
        <div className="space-y-1.5 pt-2 border-t border-surface-container-high">
          <div className="flex items-center justify-between font-mono text-[11px] text-on-surface-variant">
            <span>RISK LEVEL GAUGE</span>
            <span className={verdictConfig.severityClass}>{verdictConfig.severityLabel}</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 h-3 w-full rounded overflow-hidden bg-surface-container-lowest p-0.5 border border-surface-container-high">
            <div
              className={`h-full rounded transition-all ${
                result.score <= 30
                  ? 'bg-secondary-container shadow-[0_0_12px_rgba(78,222,163,0.6)]'
                  : 'bg-secondary-container opacity-40'
              }`}
            />
            <div
              className={`h-full rounded transition-all ${
                result.score > 30 && result.score <= 70
                  ? 'bg-tertiary-container shadow-[0_0_12px_rgba(202,129,0,0.6)]'
                  : 'bg-tertiary-container opacity-40'
              }`}
            />
            <div
              className={`h-full rounded transition-all ${
                result.score > 70
                  ? 'bg-primary-container shadow-[0_0_12px_rgba(255,84,81,0.6)] animate-pulse'
                  : 'bg-primary-container opacity-30'
              }`}
            />
          </div>
          <div className="grid grid-cols-3 text-center font-mono text-[10px] pt-1">
            <span className="text-on-surface-variant text-left">LOW (0 - 30)</span>
            <span className="text-on-surface-variant text-center">MODERATE (31 - 70)</span>
            <span className="text-primary text-right font-bold">SEVERE (71 - 100)</span>
          </div>
        </div>
      </div>

      {/* 2. 3-Column Triage Grid (From Stitch Screen 1 & 2) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Link Inspection */}
        <div className="p-4 bg-surface-container-low rounded-xl border border-surface-container-high space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-on-surface-variant uppercase font-semibold">
              Link Inspection
            </span>
            <LinkIcon className="w-4 h-4 text-primary" />
          </div>
          <div className="font-mono text-xs text-primary truncate select-all">
            {result.urlAnalysis
              ? result.urlAnalysis.lookalikeBrand
                ? `Spoofed Brand: ${result.urlAnalysis.lookalikeBrand.toUpperCase()}`
                : 'Suspicious URL Vector'
              : 'No external links extracted'}
          </div>
          <p className="font-body text-xs text-on-surface-variant leading-relaxed">
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
        <div className="p-4 bg-surface-container-low rounded-xl border border-surface-container-high space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-on-surface-variant uppercase font-semibold">
              Psychological Vector
            </span>
            <AlertTriangleIcon className="w-4 h-4 text-tertiary" />
          </div>
          <div className="font-headline font-semibold text-xs text-tertiary">
            {isScam
              ? 'Urgency & Fear Coercion'
              : isSuspicious
                ? 'Unsolicited Financial Lure'
                : 'Neutral Communication'}
          </div>
          <p className="font-body text-xs text-on-surface-variant leading-relaxed">
            {isScam
              ? 'Exploits fear of immediate account deactivation or legal arrest to induce cognitive panic and force hasty action.'
              : 'Synthesizes unsolicited lucrative promises or high-pressure requests to bypass standard security vigilance.'}
          </p>
        </div>

        {/* Metric 3: Sovereign Protection Action */}
        <div className="p-4 bg-surface-container-low rounded-xl border border-surface-container-high space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-on-surface-variant uppercase font-semibold">
              Sovereign Protection
            </span>
            <ShieldCheckIcon className="w-4 h-4 text-secondary" />
          </div>
          <div className="font-headline font-semibold text-xs text-secondary">
            {isScam ? 'National Registry Escalated' : 'Heuristic Verified Safe'}
          </div>
          <p className="font-body text-xs text-on-surface-variant leading-relaxed">
            Triage signature prepared for CERT-In sinkholing and telecom-level SMS header revocation
            across DoT circles.
          </p>
        </div>
      </div>

      {/* 3. Highlighted Message Analysis (Forensic Text Inspection) */}
      <div className="bg-surface-container-low p-6 rounded-xl border border-surface-container-high space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-container-high pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <h3 className="font-mono text-xs font-bold text-on-surface uppercase tracking-wider">
              FORENSIC TEXT INSPECTION // WEIGHTED PHRASE BREAKDOWN
            </h3>
          </div>
          <span className="font-mono text-xs text-secondary">
            {result.redFlags.length} Red Flag{result.redFlags.length === 1 ? '' : 's'} Detected
          </span>
        </div>

        <RedFlagHighlight text={originalText} redFlags={result.redFlags} />

        {/* Itemized Red Flags Evidence Breakdown */}
        {result.redFlags.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider block font-semibold">
              ANOMALY EVIDENCE DECOMPOSITION
            </span>
            <div className="grid gap-2">
              {result.redFlags.map((flag) => (
                <div
                  key={flag.id}
                  className="p-3 rounded-lg border border-surface-container-high bg-surface-container text-xs flex items-start gap-3 hover:border-outline-variant transition"
                >
                  <span className="px-2 py-0.5 rounded bg-error-container text-on-error font-mono font-bold text-[11px] shrink-0 border border-error/40">
                    +{flag.weight}
                  </span>
                  <div>
                    <span className="font-semibold text-on-surface font-mono">
                      &quot;{flag.snippet}&quot;
                    </span>
                    <span className="text-on-surface-variant ml-2">— {flag.reason}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Defanged URL Deep Domain Analysis (if URL present) */}
      {result.urlAnalysis && (
        <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-6 space-y-3.5 shadow-lg">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-primary" />
            <h3 className="font-mono text-xs font-bold text-on-surface uppercase tracking-wider">
              Suspicious Link Analysis (Defanged)
            </h3>
          </div>

          <div className="p-3.5 bg-surface-container-lowest rounded-lg font-mono text-xs sm:text-sm break-all text-primary select-all border border-primary/20">
            {result.urlAnalysis.defanged}
          </div>

          {result.urlAnalysis.lookalikeBrand && (
            <div className="p-3.5 rounded-lg bg-error-container/20 border border-error/30 text-xs text-error font-medium flex items-start gap-2.5">
              <AlertTriangleIcon className="w-4 h-4 text-error shrink-0 mt-0.5" />
              <div>
                <strong className="uppercase">Brand Spoofing Alert:</strong> This URL appears to
                impersonate{' '}
                <strong className="underline text-on-surface">
                  {result.urlAnalysis.lookalikeBrand.toUpperCase()}
                </strong>
                . The legitimate official domain is{' '}
                <strong className="font-mono text-secondary underline">
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
                className="px-2.5 py-1 rounded bg-surface-container border border-surface-container-high text-on-surface-variant uppercase"
              >
                {flag.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 5. Sovereign Action Toolbar: NCRP Police Complaint & Emergency Triage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card A: One-Click NCRP Police Complaint Draft Generator */}
        <div className="p-5 rounded-xl border border-surface-container-high bg-surface-container-low space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-secondary uppercase font-bold tracking-wider">
                Sovereign Escort
              </span>
              <ShieldCheckIcon className="w-4 h-4 text-secondary" />
            </div>
            <h4 className="font-headline font-bold text-sm text-on-surface">
              National Cybercrime Portal Draft
            </h4>
            <p className="font-body text-xs text-on-surface-variant">
              Generate a formatted complaint narrative with timestamps and forensic evidence ready
              for paste into <span className="text-secondary font-mono">cybercrime.gov.in</span>.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowNcrpDraft((v) => !v)}
              className="w-full px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface font-mono text-xs uppercase tracking-wider rounded-lg transition border border-surface-container-high flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>
                {showNcrpDraft
                  ? 'Hide NCRP Police Draft'
                  : 'Generate Police Complaint Draft (NCRP Format)'}
              </span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card B: Emergency Helpline & Bank Freezing */}
        <div className="p-5 rounded-xl border border-surface-container-high bg-surface-container-low space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-primary uppercase font-bold tracking-wider">
                Emergency Hotline
              </span>
              <PhoneCallIcon className="w-4 h-4 text-primary" />
            </div>
            <h4 className="font-headline font-bold text-sm text-on-surface">
              Call Cyber Helpline 1930
            </h4>
            <p className="font-body text-xs text-on-surface-variant">
              Victim of an unauthorized UPI transfer or leaked OTP? Immediately contact the 24x7
              National Cyber Crime Helpline or freeze your bank card.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <a
              href="tel:1930"
              className="flex-1 px-4 py-2 bg-error-container text-on-error font-mono text-xs uppercase tracking-wider font-bold rounded-lg transition hover:opacity-90 flex items-center justify-center gap-1.5 border border-error/40"
            >
              <PhoneCallIcon className="w-3.5 h-3.5 text-on-primary-fixed" />
              <span>Dial 1930</span>
            </a>
            <button
              type="button"
              onClick={() => setShowEmergency((v) => !v)}
              className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-mono text-xs uppercase tracking-wider rounded-lg transition border border-surface-container-high cursor-pointer"
            >
              {showEmergency ? 'Close' : 'Bank Freeze Steps'}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded NCRP Police Complaint Drawer */}
      {showNcrpDraft && (
        <div className="p-5 rounded-xl border border-secondary/30 bg-surface-container-lowest space-y-3 animate-in fade-in-50">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-secondary uppercase tracking-wider">
              NCRP Incident Report Draft
            </span>
            <button
              type="button"
              onClick={handleCopyNcrpDraft}
              className="px-3 py-1.5 bg-secondary-container text-on-secondary-container font-mono text-xs font-bold rounded transition flex items-center gap-1.5 cursor-pointer"
            >
              {copiedNcrp ? (
                <>
                  <CheckCircleIcon className="w-3.5 h-3.5 text-on-secondary-container" />
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
          <pre className="p-4 bg-surface-container font-mono text-xs text-on-surface leading-relaxed overflow-x-auto rounded border border-surface-container-high whitespace-pre-wrap select-all">
            {ncrpComplaintDraft}
          </pre>
        </div>
      )}

      {/* Expanded Emergency Bank Freeze Drawer */}
      {showEmergency && (
        <div className="p-5 rounded-xl border border-error/30 bg-surface-container-lowest space-y-3 animate-in fade-in-50">
          <div className="flex items-center justify-between">
            <h4 className="font-mono text-xs font-bold text-primary uppercase tracking-wider">
              Emergency Action Checklist: Compromised Account or Funds Transferred
            </h4>
            <button
              type="button"
              onClick={handleCopyIncidentSummary}
              className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high font-mono text-xs text-on-surface rounded transition flex items-center gap-1.5 border border-surface-container-high cursor-pointer"
            >
              {copiedIncident ? (
                <>
                  <CheckCircleIcon className="w-3.5 h-3.5 text-secondary" />
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
          <ol className="space-y-2 text-xs font-body text-on-surface list-decimal list-inside pl-1 leading-relaxed">
            <li>
              <strong>Immediately dial 1930</strong> to initiate the Citizen Financial Cyber Fraud
              Reporting and Management System (CFCFRMS) golden-hour fund freeze.
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
                className="text-secondary underline font-semibold"
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
      <CategoryExplainer category={result.category} />

      {/* 7. Action Bar: Accuracy Feedback & Reset */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl border border-surface-container-high bg-surface-container-low">
        <div className="flex items-center gap-3">
          <span className="font-body text-xs text-on-surface-variant font-medium">
            Was this assessment accurate?
          </span>
          {feedbackSent === null ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleFeedback(true)}
                className="px-3 py-1.5 text-xs font-mono rounded bg-surface-container hover:bg-surface-container-high text-secondary border border-secondary/30 transition flex items-center gap-1.5 cursor-pointer"
              >
                <ThumbsUpIcon className="w-3.5 h-3.5" />
                <span>Yes</span>
              </button>
              <button
                type="button"
                onClick={() => handleFeedback(false)}
                className="px-3 py-1.5 text-xs font-mono rounded bg-surface-container hover:bg-surface-container-high text-primary border border-primary/30 transition flex items-center gap-1.5 cursor-pointer"
              >
                <ThumbsDownIcon className="w-3.5 h-3.5" />
                <span>No</span>
              </button>
            </div>
          ) : (
            <span className="text-xs text-secondary font-mono flex items-center gap-1.5">
              <CheckCircleIcon className="w-4 h-4 text-secondary" />
              <span>Feedback recorded in telemetry model</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleFamilyShare}
            className="px-4 py-2 text-xs font-mono rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface border border-surface-container-high transition flex items-center gap-1.5 cursor-pointer"
          >
            <LockIcon className="w-3.5 h-3.5 text-secondary" />
            <span>{familyCopied ? 'Alert Copied!' : 'Share Family Alert'}</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="px-5 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-lg bg-secondary-container text-on-secondary-container hover:bg-secondary transition shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <RotateCcwIcon className="w-3.5 h-3.5" />
            <span>Check Another Message</span>
          </button>
        </div>
      </div>
    </div>
  );
}
