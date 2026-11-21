'use client';

import React, { useState } from 'react';
import { DetectionResultData } from './ResultCard';

interface AnalyzerFormProps {
  onAnalyzeSuccess: (data: DetectionResultData, text: string) => void;
}

const SAMPLE_MESSAGES = [
  {
    label: '🏦 Fake SBI KYC Scam',
    text: 'Dear Customer, your SBI KYC expires today, verify via http://sbi-kyc-update.xyz or account will be blocked',
  },
  {
    label: '⚡ Electricity Bill Threat',
    text: 'Dear Consumer, your electricity power will be disconnected tonight at 9:30 PM due to unpaid bill. Contact electricity officer at 9876543210 immediately.',
  },
  {
    label: '💻 Part-Time Job Scam',
    text: 'Work from home opportunity! Earn Rs 3,000 to Rs 8,000 daily by liking YouTube videos. Join our Telegram group now: https://t.co/fakejob',
  },
  {
    label: '✅ Legit Bank Alert',
    text: 'Your SBI a/c ending 4589 is debited for Rs 500.00 on 21-Nov-24 by UPI/P2A/Ref 432109876543. Avail balance: Rs 24,150.20.',
  },
];

export function AnalyzerForm({ onAnalyzeSuccess }: AnalyzerFormProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [storeRaw, setStoreRaw] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/v1/analyze/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          storeRaw,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to analyze message');
      }

      onAnalyzeSuccess(json.data, text.trim());
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sampleText: string) => {
    setText(sampleText);
    setErrorMessage(null);
  };

  return (
    <div className="w-full max-w-3xl rounded-2xl border bg-card p-6 shadow-sm space-y-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Safety Warning */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 font-medium">
          <span className="text-base">🛡️</span>
          <span>
            <strong>Privacy Guarantee:</strong> Raw messages are never stored unless you opt in
            below. Never paste active OTPs, passwords, or PINs.
          </span>
        </div>

        {/* Text Input Area */}
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={5000}
            rows={5}
            placeholder="Paste suspicious SMS, WhatsApp message, email excerpt, or URL here... (e.g. 'Dear customer, your bank KYC has expired...')"
            className="w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-y font-sans leading-relaxed text-foreground placeholder:text-muted-foreground"
          />
          <div className="flex justify-between items-center px-1 mt-1 text-xs text-muted-foreground">
            <span>Supports English, Hindi (हिंदी), and Hinglish</span>
            <span>{text.length} / 5,000</span>
          </div>
        </div>

        {/* Quick Sample Chips */}
        <div>
          <span className="text-xs font-semibold text-muted-foreground block mb-2">
            Try a Realistic Sample:
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_MESSAGES.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSample(s.text)}
                className="px-2.5 py-1 text-xs rounded-full border bg-muted/50 hover:bg-muted text-foreground transition"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Opt-in raw text donation */}
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={storeRaw}
            onChange={(e) => setStoreRaw(e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span>
            Donate anonymized sample to improve open scam defense (PII like phone numbers, card
            numbers, and OTPs are auto-redacted and deleted after 30 days)
          </span>
        </label>

        {/* Error message banner */}
        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 font-medium">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-current"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Analyzing Signals...</span>
              </>
            ) : (
              <span>🔍 Analyze Message</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
