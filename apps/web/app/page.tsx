'use client';

import React, { useState } from 'react';
import { AnalyzerForm } from '@/components/AnalyzerForm';
import { ResultCard, DetectionResultData } from '@/components/ResultCard';

export default function HomePage() {
  const [analyzedResult, setAnalyzedResult] = useState<DetectionResultData | null>(null);
  const [analyzedText, setAnalyzedText] = useState<string>('');

  const handleAnalysisSuccess = (data: DetectionResultData, text: string) => {
    setAnalyzedResult(data);
    setAnalyzedText(text);
  };

  const handleReset = () => {
    setAnalyzedResult(null);
    setAnalyzedText('');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between selection:bg-primary/20">
      {/* Top Navbar */}
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl" role="img" aria-label="shield">
              🛡️
            </span>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-primary bg-clip-text text-transparent">
                ScamShield
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                India Fraud Defense Engine
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400">
              <span className="animate-pulse h-2 w-2 rounded-full bg-red-600 inline-block" />
              <span>
                Cyber Helpline: <strong>1930</strong>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 sm:py-12 w-full flex flex-col items-center">
        {/* Hero Section */}
        {!analyzedResult && (
          <div className="text-center max-w-2xl mb-8 space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              Is that message or link a scam?
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Verify suspicious SMS, WhatsApp forwards, courier links, and bank alerts before
              clicking. Analyzed instantly using safe local rules and lookalike brand detection.
            </p>
          </div>
        )}

        {/* Dynamic Display: Analyzer Form or Result Card */}
        {analyzedResult ? (
          <ResultCard originalText={analyzedText} result={analyzedResult} onReset={handleReset} />
        ) : (
          <AnalyzerForm onAnalyzeSuccess={handleAnalysisSuccess} />
        )}

        {/* Trust & Knowledge Pillars */}
        {!analyzedResult && (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
            <div className="p-4 rounded-xl border bg-card/50 text-left space-y-1">
              <span className="text-xl">🏦</span>
              <h3 className="text-sm font-bold text-foreground">Fake Bank KYC</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Detects lookalike domains mimicking SBI, HDFC, ICICI, and Axis Bank.
              </p>
            </div>

            <div className="p-4 rounded-xl border bg-card/50 text-left space-y-1">
              <span className="text-xl">⚡</span>
              <h3 className="text-sm font-bold text-foreground">Bill & Police Threats</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Flags fake power disconnection notices and digital arrest intimidation.
              </p>
            </div>

            <div className="p-4 rounded-xl border bg-card/50 text-left space-y-1">
              <span className="text-xl">🔒</span>
              <h3 className="text-sm font-bold text-foreground">Strictly Private</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Zero telemetry on your raw text. Evaluated locally in a sandbox.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/20 py-6 text-center text-xs text-muted-foreground">
        <div className="max-w-5xl mx-auto px-4 space-y-2">
          <p>
            ScamShield provides automated heuristic analysis and does not replace official advice
            from law enforcement.
          </p>
          <p>
            Report cybercrime immediately at{' '}
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline"
            >
              cybercrime.gov.in
            </a>{' '}
            or call toll-free helpline <strong className="text-foreground">1930</strong>.
          </p>
        </div>
      </footer>
    </div>
  );
}
