'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AnalyzerForm } from '@/components/AnalyzerForm';
import { ResultCard, DetectionResultData } from '@/components/ResultCard';

export default function HomePage() {
  const [analyzedResult, setAnalyzedResult] = useState<DetectionResultData | null>(null);
  const [analyzedText, setAnalyzedText] = useState<string>('');
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  const isHindi = lang === 'hi';

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
          <Link href="/" className="flex items-center gap-2.5">
            <span className="text-2xl" role="img" aria-label="shield">
              🛡️
            </span>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-primary bg-clip-text text-transparent">
                ScamShield
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                {isHindi ? 'भारत धोखाधड़ी सुरक्षा' : 'India Fraud Defense Engine'}
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/" className="text-primary underline">
              {isHindi ? 'स्कैनर' : 'Scanner'}
            </Link>
            <Link
              href="/learn"
              className="text-muted-foreground hover:text-foreground transition hidden sm:inline"
            >
              {isHindi ? 'सीखें और क्विज' : 'Learn & Quiz'}
            </Link>
            <Link
              href="/stats"
              className="text-muted-foreground hover:text-foreground transition hidden sm:inline"
            >
              {isHindi ? 'लाइव आंकड़े' : 'Live Stats'}
            </Link>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(isHindi ? 'en' : 'hi')}
              className="px-2.5 py-1 rounded-md border text-xs font-bold bg-muted hover:bg-muted/80 text-foreground transition"
              title="Toggle English / हिंदी"
            >
              {isHindi ? 'English 🌐' : 'हिंदी 🇮🇳'}
            </button>

            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400">
              <span className="animate-pulse h-2 w-2 rounded-full bg-red-600 inline-block" />
              <span>
                Cyber Helpline: <strong>1930</strong>
              </span>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 sm:py-12 w-full flex flex-col items-center">
        {/* Hero Section */}
        {!analyzedResult && (
          <div className="text-center max-w-2xl mb-8 space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              {isHindi ? 'क्या यह संदेश या लिंक धोखाधड़ी (स्कैम) है?' : 'Is that message or link a scam?'}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {isHindi
                ? 'क्लिक करने से पहले संदिग्ध एसएमएस, व्हाट्सएप संदेश और बैंक अलर्ट की तुरंत जांच करें।'
                : 'Verify suspicious SMS, WhatsApp forwards, courier links, and bank alerts before clicking. Analyzed instantly using safe local rules and lookalike brand detection.'}
            </p>
          </div>
        )}

        {/* Dynamic Display: Analyzer Form or Result Card */}
        {analyzedResult ? (
          <ResultCard originalText={analyzedText} result={analyzedResult} onReset={handleReset} />
        ) : (
          <AnalyzerForm onAnalyzeSuccess={handleAnalysisSuccess} lang={lang} />
        )}

        {/* Knowledge & Exploration Pillars */}
        {!analyzedResult && (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
            <Link
              href="/learn"
              className="p-5 rounded-2xl border bg-card/60 hover:border-primary/50 text-left space-y-2 transition shadow-sm block group"
            >
              <span className="text-2xl group-hover:scale-110 inline-block transition">🎯</span>
              <h3 className="text-sm font-bold text-foreground">
                {isHindi ? '10-प्रश्नों की क्विज' : 'Spot the Scam Quiz'}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {isHindi
                  ? 'असली भारतीय घोटालों के उदाहरणों के साथ अपने सुरक्षा ज्ञान का परीक्षण करें।'
                  : 'Test your scam-detection reflexes with 10 realistic Indian SMS scenarios.'}
              </p>
            </Link>

            <Link
              href="/stats"
              className="p-5 rounded-2xl border bg-card/60 hover:border-primary/50 text-left space-y-2 transition shadow-sm block group"
            >
              <span className="text-2xl group-hover:scale-110 inline-block transition">📊</span>
              <h3 className="text-sm font-bold text-foreground">
                {isHindi ? 'सार्वजनिक आंकड़े' : 'Live Community Stats'}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {isHindi
                  ? 'भारत भर में पकड़े गए शीर्ष घोटालों के लाइव आंकड़े देखें।'
                  : 'Inspect anonymous real-time telemetry on active Indian scam campaigns.'}
              </p>
            </Link>

            <Link
              href="/privacy"
              className="p-5 rounded-2xl border bg-card/60 hover:border-primary/50 text-left space-y-2 transition shadow-sm block group"
            >
              <span className="text-2xl group-hover:scale-110 inline-block transition">🔒</span>
              <h3 className="text-sm font-bold text-foreground">
                {isHindi ? 'गोपनीयता नीति' : 'Zero-PII Storage'}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {isHindi
                  ? 'जानें कि आपका डेटा स्वचालित रूप से कैसे सुरक्षित रखा जाता है।'
                  : 'Read how your submissions are processed strictly in-memory without logging.'}
              </p>
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/20 py-6 text-center text-xs text-muted-foreground">
        <div className="max-w-5xl mx-auto px-4 space-y-2">
          <div className="flex flex-wrap justify-center gap-4 text-xs font-medium">
            <Link href="/" className="hover:underline">
              {isHindi ? 'स्कैनर' : 'Scanner'}
            </Link>
            <Link href="/learn" className="hover:underline">
              {isHindi ? 'सीखें और क्विज' : 'Learn & Quiz'}
            </Link>
            <Link href="/stats" className="hover:underline">
              {isHindi ? 'लाइव आंकड़े' : 'Live Stats'}
            </Link>
            <Link href="/privacy" className="hover:underline">
              {isHindi ? 'गोपनीयता नीति' : 'Privacy Policy'}
            </Link>
          </div>
          <p>
            {isHindi
              ? 'स्कैमशील्ड स्वचालित मार्गदर्शन प्रदान करता है। वित्तीय धोखाधड़ी की स्थिति में तुरंत 1930 पर कॉल करें।'
              : 'ScamShield provides automated heuristic analysis and does not replace official advice from law enforcement.'}
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
