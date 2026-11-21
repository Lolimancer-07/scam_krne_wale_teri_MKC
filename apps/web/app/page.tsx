'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AnalyzerForm } from '@/components/AnalyzerForm';
import { ResultCard, DetectionResultData } from '@/components/ResultCard';
import { useLanguage } from '@/components/LanguageProvider';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ShieldIcon, PhoneCallIcon, TargetIcon, BarChartIcon, LockIcon } from '@/components/Icons';

export default function HomePage() {
  const [analyzedResult, setAnalyzedResult] = useState<DetectionResultData | null>(null);
  const [analyzedText, setAnalyzedText] = useState<string>('');
  const { lang } = useLanguage();

  const isHindi = lang === 'hi';

  const handleAnalysisSuccess = (data: DetectionResultData, text: string) => {
    setAnalyzedResult(data);
    setAnalyzedText(text);
  };

  const handleReset = () => {
    setAnalyzedResult(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-indigo-500/30">
      {/* Top Navbar */}
      <header className="border-b border-indigo-500/15 bg-[#000f21]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none"
            title="ScamShield Home"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center shadow-sm group-hover:border-indigo-400/50 transition">
              <ShieldIcon className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                ScamShield
              </span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-300/70 font-mono">
                {isHindi ? 'भारत धोखाधड़ी सुरक्षा' : 'Obsidian Fraud Defense Engine'}
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="flex items-center gap-3 sm:gap-4 text-xs font-semibold">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-medium hover:bg-indigo-500/20 hover:text-white transition cursor-pointer"
            >
              {isHindi ? 'स्कैनर' : 'Scanner'}
            </button>
            <Link
              href="/learn"
              className="text-slate-400 hover:text-white transition hidden sm:inline"
            >
              {isHindi ? 'सीखें और क्विज' : 'Learn & Quiz'}
            </Link>
            <Link
              href="/stats"
              className="text-slate-400 hover:text-white transition hidden sm:inline"
            >
              {isHindi ? 'लाइव आंकड़े' : 'Live Stats'}
            </Link>

            {/* Language + Theme Switchers */}
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>

            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300">
              <PhoneCallIcon className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-xs font-medium font-mono">
                Helpline: <strong className="text-rose-200">1930</strong>
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-xs text-indigo-300 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-mono text-[11px]">Real-Time Threat Telemetry Active</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              {isHindi ? 'क्या यह संदेश या लिंक धोखाधड़ी (स्कैम) है?' : 'Is that message or link a scam?'}
            </h1>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl mx-auto">
              {isHindi
                ? 'क्लिक करने से पहले संदिग्ध एसएमएस, व्हाट्सएप संदेश और बैंक अलर्ट की तुरंत जांच करें।'
                : 'Verify suspicious SMS, WhatsApp forwards, courier links, and bank alerts before clicking. Evaluated instantly via local rules, ML classification, and lookalike brand defense.'}
            </p>
          </div>
        )}

        {/* Dynamic Display: Analyzer Form or Result Card */}
        {analyzedResult ? (
          <ResultCard originalText={analyzedText} result={analyzedResult} onReset={handleReset} />
        ) : (
          <AnalyzerForm
            onAnalyzeSuccess={handleAnalysisSuccess}
            lang={lang}
            initialText={analyzedText}
          />
        )}

        {/* Bento Grid: Knowledge & Exploration Pillars */}
        {!analyzedResult && (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
            <Link
              href="/learn"
              className="p-5 rounded-2xl border border-white/[0.08] bg-[#031427]/60 hover:border-indigo-500/40 hover:bg-[#031427]/90 text-left space-y-2 transition duration-200 shadow-sm block group backdrop-blur-md"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-105 transition">
                  <TargetIcon className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 font-mono">
                  10 Scenarios
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
                {isHindi ? '10-प्रश्नों की क्विज' : 'Spot the Scam Quiz'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isHindi
                  ? 'असली भारतीय घोटालों के उदाहरणों के साथ अपने सुरक्षा ज्ञान का परीक्षण करें।'
                  : 'Test your scam-detection reflexes with 10 realistic Indian SMS scenarios.'}
              </p>
            </Link>

            <Link
              href="/stats"
              className="p-5 rounded-2xl border border-white/[0.08] bg-[#031427]/60 hover:border-indigo-500/40 hover:bg-[#031427]/90 text-left space-y-2 transition duration-200 shadow-sm block group backdrop-blur-md"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-105 transition">
                  <BarChartIcon className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 font-mono flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
                {isHindi ? 'सार्वजनिक आंकड़े' : 'Live Community Stats'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isHindi
                  ? 'भारत भर में पकड़े गए शीर्ष घोटालों के लाइव आंकड़े देखें।'
                  : 'Inspect anonymous real-time telemetry on active Indian scam campaigns.'}
              </p>
            </Link>

            <Link
              href="/privacy"
              className="p-5 rounded-2xl border border-white/[0.08] bg-[#031427]/60 hover:border-indigo-500/40 hover:bg-[#031427]/90 text-left space-y-2 transition duration-200 shadow-sm block group backdrop-blur-md"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:scale-105 transition">
                  <LockIcon className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400 font-mono">
                  HMAC-SHA256
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
                {isHindi ? 'गोपनीयता नीति' : 'Zero-PII Storage'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isHindi
                  ? 'जानें कि आपका डेटा स्वचालित रूप से कैसे सुरक्षित रखा जाता है।'
                  : 'Read how your submissions are processed strictly in-memory without logging.'}
              </p>
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-indigo-500/10 bg-[#000f21]/60 py-6 text-center text-xs text-slate-500">
        <p>
          ScamShield Obsidian Telemetry — Safeguarding Indian Digital Citizens · Emergency Cyber
          Crime: <strong className="text-slate-300 font-mono">1930</strong>
        </p>
      </footer>
    </div>
  );
}
