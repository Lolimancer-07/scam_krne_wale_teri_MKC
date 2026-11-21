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
}

export function ResultCard({ originalText, result, onReset }: ResultCardProps) {
  const [feedbackSent, setFeedbackSent] = useState<boolean | null>(null);
  const [showEmergency, setShowEmergency] = useState(false);
  const [copied, setCopied] = useState(false);
  const { lang } = useLanguage();

  const isHindi = lang === 'hi';
  const isScam = result.verdict === 'likely_scam';
  const isSuspicious = result.verdict === 'suspicious';

  const verdictConfig = {
    likely_scam: {
      panelBorder: 'border-rose-500/40 bg-rose-500/[0.08]',
      badge: 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-500/25',
      icon: <AlertOctagonIcon className="w-4 h-4 shrink-0" />,
      title: 'Likely Scam',
      summary:
        'High probability of malicious intent. Do not click links, share OTPs, or transfer money.',
      barColor: 'bg-rose-500',
    },
    suspicious: {
      panelBorder: 'border-amber-500/40 bg-amber-500/[0.08]',
      badge:
        'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-500/25',
      icon: <AlertTriangleIcon className="w-4 h-4 shrink-0" />,
      title: 'Suspicious Message',
      summary:
        'Contains suspicious red flags commonly seen in fraud campaigns. Exercise extreme caution.',
      barColor: 'bg-amber-500',
    },
    safe: {
      panelBorder: 'border-emerald-500/40 bg-emerald-500/[0.08]',
      badge:
        'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25',
      icon: <ShieldCheckIcon className="w-4 h-4 shrink-0" />,
      title: 'Likely Safe',
      summary: 'No obvious fraudulent signals detected. Always verify unexpected communications.',
      barColor: 'bg-emerald-500',
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
      // Ignore background error
    });
  };

  const handleReadAloud = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(result.ai?.explanation ?? verdictConfig.summary);
    utterance.lang = isHindi ? 'hi-IN' : 'en-IN';
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyIncidentSummary = async () => {
    const summary = [
      'ScamShield Emergency Incident Summary',
      `Verdict: ${result.verdict.toUpperCase()} (Risk Score: ${result.score}/100)`,
      `Category: ${result.category.replace(/_/g, ' ')}`,
      'Status: Confirmed click / payment / OTP share reported',
      `Timestamp: ${new Date().toISOString()}`,
      'Recommended Action: Call bank immediately or National Cyber Helpline 1930, freeze compromised card/UPI, change credentials, report at cybercrime.gov.in',
    ].join('\n');

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Clipboard unavailable
    }
  };

  const familyHindiText =
    result.category === 'bank_kyc'
      ? 'यह संदेश संभावतः धोखाधड़ी है — बैंक से सीधे पुष्टि करें।'
      : result.category === 'otp_impersonation'
        ? 'यह संदेश OTP अनुरोध ले रहा है — OTP कभी साझा न करें।'
        : result.category === 'upi_payment'
          ? 'यह संदेश UPI लेनदेन की धोखाधड़ी है — UPI PIN कभी साझा न करें।'
          : result.category === 'government_tax'
            ? 'यह संदेश सरकारी धोखाधड़ी है — अधिकृत अधिकारियों से संपर्क करें।'
            : 'यह संदेश संभावित धोखाधड़ी है। कृपया अधिकृत संस्था से सत्यापित करें।';

  const familyAlertText = [
    'ScamShield Family Protect Alert',
    `Verdict: ${result.verdict.toUpperCase()}`,
    `Risk score: ${result.score}/100`,
    `Threat category: ${result.category.replace(/_/g, ' ')}`,
    'No message content was shared.',
    isHindi ? familyHindiText : 'Please verify suspicious requests through official channels.',
  ].join('\n');

  const handleFamilyShare = async () => {
    try {
      const shareData = {
        title: 'ScamShield Alert',
        text: familyAlertText,
        url: window.location.origin,
      };
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(familyAlertText);
        setFamilyCopied(true);
        setTimeout(() => setFamilyCopied(false), 3000);
      }
    } catch {
      // user cancelled or unsupported
    }
  };

  const handleFamilyImage = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#030b14';
      ctx.fillRect(0, 0, 1080, 1080);
      ctx.beginPath();
      ctx.arc(540, 350, 170, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(99,102,241,0.15)';
      ctx.fill();
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '48px sans-serif';
      ctx.fillText('ScamShield', 540, 520);
      ctx.font = '36px sans-serif';
      ctx.fillStyle = '#fda4af';
      ctx.fillText(
        result.verdict === 'likely_scam' ? 'LIKELY SCAM' : result.verdict.toUpperCase(),
        540,
        600,
      );
      ctx.font = '32px sans-serif';
      ctx.fillStyle = '#a5b4fc';
      ctx.fillText(`Risk Score: ${result.score}/100`, 540, 680);
      ctx.font = '28px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(familyHindiText, 540, 760);
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `scamshield-family-${result.category}-${result.verdict}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      // canvas unsupported
    }
  };

  return (
    <div className="w-full max-w-3xl space-y-6 animate-in fade-in-50 duration-300">
      {/* 1. Verdict Banner */}
      <div
        className={`rounded-2xl border ${verdictConfig.panelBorder} p-6 sm:p-7 shadow-xl backdrop-blur-md relative overflow-hidden`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${verdictConfig.badge}`}
              >
                {verdictConfig.icon}
                <span>{verdictConfig.title}</span>
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/10 text-slate-200 font-mono">
                Category: {result.category.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <p className="mt-3 text-sm font-medium leading-relaxed text-slate-300">
              {verdictConfig.summary}
            </p>
            <button
              onClick={handleReadAloud}
              className="mt-3 px-3 py-1.5 text-xs font-semibold rounded-lg border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 transition flex items-center gap-1.5 cursor-pointer"
              aria-label="Read this result aloud"
            >
              <Volume2Icon className="w-3.5 h-3.5" />
              <span>Read aloud</span>
            </button>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between border-t border-white/10 sm:border-t-0 pt-3 sm:pt-0">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono">
              Risk Score
            </span>
            <div className="flex items-baseline gap-1 font-mono">
              <span
                className={`text-4xl sm:text-5xl font-black ${
                  isScam ? 'text-rose-400' : isSuspicious ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {result.score}
              </span>
              <span className="text-sm text-slate-500 font-bold">/100</span>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="mt-5 w-full bg-[#000814]/80 h-2.5 rounded-full overflow-hidden border border-white/10">
          <div
            className={`h-full transition-all duration-700 ${verdictConfig.barColor}`}
            style={{ width: `${Math.max(5, result.score)}%` }}
          />
        </div>

        {result.verdict === 'safe' && result.score < 40 && (
          <p className="mt-4 text-xs font-medium text-amber-400/90 leading-relaxed">
            Low confidence: we cannot tell for sure whether this message is a scam. When in doubt,
            verify through the official app or phone number before clicking any link or sharing
            information.
          </p>
        )}
      </div>

      {/* 2. Emergency Help: Triage after clicking / paying / sharing OTP */}
      {(isScam || isSuspicious) && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/[0.06] p-5 shadow-xl space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertOctagonIcon className="w-4 h-4 text-rose-400 shrink-0" />
              <h3 className="text-sm font-bold text-rose-300 uppercase tracking-wider font-mono">
                Emergency Action: Compromised OTP / Payment
              </h3>
            </div>
            <button
              onClick={() => setShowEmergency((v) => !v)}
              className="px-4 py-1.5 text-xs font-bold rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 transition shrink-0 cursor-pointer"
            >
              {showEmergency ? 'Hide triage steps' : 'Get triage steps'}
            </button>
          </div>

          {showEmergency && (
            <div className="space-y-3 animate-in fade-in-50 duration-300">
              <ol className="space-y-2 text-sm text-slate-300 list-decimal list-inside pl-1">
                <li>
                  Call your bank immediately using the official number from its website or app (or
                  the National Cyber Helpline at <strong className="text-white">1930</strong>).
                </li>
                <li>Freeze or block the compromised card / UPI handle right away.</li>
                <li>Change passwords and PINs for the affected accounts.</li>
                <li>
                  Report at{' '}
                  <a
                    href="https://cybercrime.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-rose-300 underline font-medium"
                  >
                    cybercrime.gov.in
                  </a>{' '}
                  and call the toll-free helpline <strong className="text-white">1930</strong>.
                </li>
                <li>
                  Preserve evidence (screenshots, transaction IDs, message copy); do not delete it.
                </li>
              </ol>
              <div className="pt-1">
                <button
                  onClick={handleCopyIncidentSummary}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 transition flex items-center gap-2 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Incident summary copied!</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon className="w-3.5 h-3.5" />
                      <span>Copy incident summary</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Highlighted Message */}
      <div className="rounded-2xl border border-indigo-500/15 bg-[#031427]/80 backdrop-blur-md p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">
            Highlighted Message Analysis
          </h3>
          <span className="text-xs text-indigo-300 font-mono">
            {result.redFlags.length} Red Flag{result.redFlags.length === 1 ? '' : 's'} Detected
          </span>
        </div>

        <RedFlagHighlight text={originalText} redFlags={result.redFlags} />

        {result.redFlags.length > 0 && (
          <div className="pt-2 space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Detected Red Flag Details:
            </h4>
            <div className="grid gap-2">
              {result.redFlags.map((flag) => (
                <div
                  key={flag.id}
                  className="p-3 rounded-xl border border-white/[0.08] bg-white/[0.02] text-xs flex items-start gap-2.5 hover:border-indigo-500/30 transition"
                >
                  <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold font-mono shrink-0">
                    +{flag.weight}
                  </span>
                  <div>
                    <span className="font-semibold text-white font-mono">
                      &quot;{flag.snippet}&quot;
                    </span>
                    <span className="text-slate-400 ml-1.5">— {flag.reason}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. URL Analysis (if link present) */}
      {result.urlAnalysis && (
        <div className="rounded-2xl border border-indigo-500/15 bg-[#031427]/80 backdrop-blur-md p-6 shadow-xl space-y-3.5">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">
              Suspicious Link Analysis (Defanged)
            </h3>
          </div>
          <div className="p-3.5 bg-[#000814]/90 rounded-xl font-mono text-xs sm:text-sm break-all text-rose-400 select-all border border-rose-500/20">
            {result.urlAnalysis.defanged}
          </div>
          <p className="text-xs text-slate-400">
            Links are intentionally defanged (dots and protocol escaped) so they cannot be clicked.
          </p>
          {result.urlAnalysis.lookalikeBrand && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200 font-medium flex items-start gap-2">
              <AlertTriangleIcon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong>Brand Spoofing Alert:</strong> This URL appears to impersonate{' '}
                <strong className="underline text-white">
                  {result.urlAnalysis.lookalikeBrand.toUpperCase()}
                </strong>
                . The legitimate official domain is{' '}
                <strong className="font-mono text-emerald-300">
                  {result.urlAnalysis.lookalikeDomain}
                </strong>
                .
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {result.urlAnalysis.flags.map((flag, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-md text-[11px] bg-white/[0.04] border border-white/10 font-mono text-slate-300"
              >
                {flag.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 5. What the Scammer Wants & Action Steps */}
      <CategoryExplainer category={result.category} />

      {/* 6. Feedback & Reset Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-white/[0.08] bg-[#031427]/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">Was this assessment accurate?</span>
          {feedbackSent === null ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFeedback(true)}
                className="px-3 py-1.5 text-xs rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-semibold transition flex items-center gap-1.5 cursor-pointer"
              >
                <ThumbsUpIcon className="w-3.5 h-3.5" />
                <span>Yes</span>
              </button>
              <button
                onClick={() => handleFeedback(false)}
                className="px-3 py-1.5 text-xs rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-semibold transition flex items-center gap-1.5 cursor-pointer"
              >
                <ThumbsDownIcon className="w-3.5 h-3.5" />
                <span>No</span>
              </button>
            </div>
          ) : (
            <span className="text-xs text-emerald-400 font-semibold font-mono flex items-center gap-1.5">
              <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
              <span>Thank you for your feedback!</span>
            </span>
          )}
        </div>

        <button
          onClick={onReset}
          className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transition shadow-md shadow-indigo-600/30 border border-indigo-400/20 flex items-center gap-2 cursor-pointer"
        >
          <RotateCcwIcon className="w-4 h-4" />
          <span>Check Another Message</span>
        </button>
      </div>
    </div>
  );
}
