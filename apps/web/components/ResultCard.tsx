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
      bg: 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400',
      badge: 'bg-red-600 text-white',
      title: '🚨 Likely Scam',
      summary:
        'High probability of malicious intent. Do not click links, share OTPs, or transfer money.',
    },
    suspicious: {
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400',
      badge: 'bg-amber-600 text-white',
      title: '⚠️ Suspicious Message',
      summary:
        'Contains suspicious red flags commonly seen in fraud campaigns. Exercise extreme caution.',
    },
    safe: {
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400',
      badge: 'bg-emerald-600 text-white',
      title: '🛡️ Likely Safe',
      summary: 'No obvious fraudulent signals detected. Always verify unexpected communications.',
    },
  }[result.verdict];

  const handleFeedback = (isCorrect: boolean) => {
    setFeedbackSent(isCorrect);
    // Best-effort post to feedback endpoint
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
      <div className={`rounded-xl border p-6 ${verdictConfig.bg} shadow-sm`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${verdictConfig.badge}`}
              >
                {verdictConfig.title}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-background/80 border text-foreground">
                Category: {result.category.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <p className="mt-3 text-sm font-medium leading-relaxed">{verdictConfig.summary}</p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Risk Score
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-foreground">{result.score}</span>
              <span className="text-sm text-muted-foreground font-bold">/100</span>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="mt-4 w-full bg-background/50 h-3 rounded-full overflow-hidden border">
          <div
            className={`h-full transition-all duration-700 ${
              isScam ? 'bg-red-600' : isSuspicious ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.max(5, result.score)}%` }}
          />
        </div>
      </div>

      {/* 2. Highlighted Message */}
      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Highlighted Message Analysis
          </h3>
          <span className="text-xs text-muted-foreground">
            {result.redFlags.length} Red Flag{result.redFlags.length === 1 ? '' : 's'} Detected
          </span>
        </div>

        <RedFlagHighlight text={originalText} redFlags={result.redFlags} />

        {result.redFlags.length > 0 && (
          <div className="pt-2 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Detected Red Flag Details:
            </h4>
            <div className="grid gap-2">
              {result.redFlags.map((flag) => (
                <div
                  key={flag.id}
                  className="p-2.5 rounded-lg border bg-muted/30 text-xs flex items-start gap-2.5"
                >
                  <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 font-bold shrink-0">
                    +{flag.weight}
                  </span>
                  <div>
                    <span className="font-semibold text-foreground">
                      &quot;{flag.snippet}&quot;
                    </span>
                    <span className="text-muted-foreground ml-1.5">— {flag.reason}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. URL Analysis (if link present) */}
      {result.urlAnalysis && (
        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
            🔗 Suspicious Link Analysis (Defanged)
          </h3>
          <div className="p-3 bg-muted rounded-lg font-mono text-sm break-all text-red-600 dark:text-red-400 select-all border">
            {result.urlAnalysis.defanged}
          </div>
          <p className="text-xs text-muted-foreground">
            Links are intentionally defanged (dots and protocol escaped) so they cannot be clicked.
          </p>
          {result.urlAnalysis.lookalikeBrand && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-700 dark:text-red-300 font-medium">
              ⚠️ <strong>Brand Spoofing Alert:</strong> This URL appears to impersonate{' '}
              <strong className="underline">
                {result.urlAnalysis.lookalikeBrand.toUpperCase()}
              </strong>
              . The legitimate official domain is{' '}
              <strong className="font-mono">{result.urlAnalysis.lookalikeDomain}</strong>.
            </div>
          )}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {result.urlAnalysis.flags.map((flag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md text-[11px] bg-secondary font-mono text-secondary-foreground"
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border bg-card/60">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">
            Was this assessment accurate?
          </span>
          {feedbackSent === null ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleFeedback(true)}
                className="px-2.5 py-1 text-xs rounded-md border hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-500 text-emerald-700 dark:text-emerald-400 font-medium transition"
              >
                👍 Yes
              </button>
              <button
                onClick={() => handleFeedback(false)}
                className="px-2.5 py-1 text-xs rounded-md border hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-500 text-rose-700 dark:text-rose-400 font-medium transition"
              >
                👎 No
              </button>
            </div>
          ) : (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              Thank you for your feedback!
            </span>
          )}
        </div>

        <button
          onClick={onReset}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-sm"
        >
          🔍 Check Another Message
        </button>
      </div>
    </div>
  );
}
