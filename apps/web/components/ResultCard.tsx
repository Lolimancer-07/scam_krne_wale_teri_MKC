'use client';

import React, { useState } from 'react';
import { RedFlagHighlight, RedFlag } from './RedFlagHighlight';
import { CategoryExplainer } from './CategoryExplainer';

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

  const isScam = result.verdict === 'likely_scam';
  const isSuspicious = result.verdict === 'suspicious';

  const verdictConfig = {
    likely_scam: {
      panelBorder: 'border-rose-500/40 bg-rose-500/[0.08]',
      badge: 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-500/25',
      title: '🚨 Likely Scam',
      summary:
        'High probability of malicious intent. Do not click links, share OTPs, or transfer money.',
      barColor: 'bg-rose-500',
    },
    suspicious: {
      panelBorder: 'border-amber-500/40 bg-amber-500/[0.08]',
      badge:
        'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-500/25',
      title: '⚠️ Suspicious Message',
      summary:
        'Contains suspicious red flags commonly seen in fraud campaigns. Exercise extreme caution.',
      barColor: 'bg-amber-500',
    },
    safe: {
      panelBorder: 'border-emerald-500/40 bg-emerald-500/[0.08]',
      badge:
        'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25',
      title: '🛡️ Likely Safe',
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
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${verdictConfig.badge}`}
              >
                {verdictConfig.title}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/10 text-slate-200 font-mono">
                Category: {result.category.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <p className="mt-3 text-sm font-medium leading-relaxed text-slate-300">
              {verdictConfig.summary}
            </p>
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
      </div>

      {/* 2. Highlighted Message */}
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

      {/* 3. URL Analysis (if link present) */}
      {result.urlAnalysis && (
        <div className="rounded-2xl border border-indigo-500/15 bg-[#031427]/80 backdrop-blur-md p-6 shadow-xl space-y-3.5">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">
            🔗 Suspicious Link Analysis (Defanged)
          </h3>
          <div className="p-3.5 bg-[#000814]/90 rounded-xl font-mono text-xs sm:text-sm break-all text-rose-400 select-all border border-rose-500/20">
            {result.urlAnalysis.defanged}
          </div>
          <p className="text-xs text-slate-400">
            Links are intentionally defanged (dots and protocol escaped) so they cannot be clicked.
          </p>
          {result.urlAnalysis.lookalikeBrand && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200 font-medium">
              ⚠️ <strong>Brand Spoofing Alert:</strong> This URL appears to impersonate{' '}
              <strong className="underline text-white">
                {result.urlAnalysis.lookalikeBrand.toUpperCase()}
              </strong>
              . The legitimate official domain is{' '}
              <strong className="font-mono text-emerald-300">
                {result.urlAnalysis.lookalikeDomain}
              </strong>
              .
            </div>
          )}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {result.urlAnalysis.flags.map((flag, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-md text-[11px] bg-white/[0.04] border border-white/10 font-mono text-slate-300"
              >
                🏷️ {flag.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 4. What the Scammer Wants & Action Steps */}
      <CategoryExplainer category={result.category} />

      {/* 5. Feedback & Reset Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-white/[0.08] bg-[#031427]/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">Was this assessment accurate?</span>
          {feedbackSent === null ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFeedback(true)}
                className="px-3 py-1.5 text-xs rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-semibold transition flex items-center gap-1"
              >
                👍 Yes
              </button>
              <button
                onClick={() => handleFeedback(false)}
                className="px-3 py-1.5 text-xs rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-semibold transition flex items-center gap-1"
              >
                👎 No
              </button>
            </div>
          ) : (
            <span className="text-xs text-emerald-400 font-semibold font-mono flex items-center gap-1">
              ✓ Thank you for your feedback!
            </span>
          )}
        </div>

        <button
          onClick={onReset}
          className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transition shadow-md shadow-indigo-600/30 border border-indigo-400/20"
        >
          🔍 Check Another Message
        </button>
      </div>
    </div>
  );
}
