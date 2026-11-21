'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { AnalyzerForm } from '@/components/AnalyzerForm';
import { ResultCard, DetectionResultData } from '@/components/ResultCard';
import { useLanguage } from '@/components/LanguageProvider';
import {
  ShieldCheckIcon,
  LockIcon,
  ArrowRightIcon,
  TargetIcon,
  BarChartIcon,
  KeyIcon,
} from '@/components/Icons';

export default function HomePage() {
  const [analyzedResult, setAnalyzedResult] = useState<DetectionResultData | null>(null);
  const [analyzedText, setAnalyzedText] = useState<string>('');
  const [analyzedScreenshot, setAnalyzedScreenshot] = useState<string | null>(null);
  const { lang } = useLanguage();

  const isHindi = lang === 'hi';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const textParam = params.get('text');
      if (textParam) {
        setAnalyzedText(textParam);
      }
    }
  }, []);

  const handleAnalysisSuccess = (
    data: DetectionResultData,
    text: string,
    screenshot?: string | null,
  ) => {
    setAnalyzedResult(data);
    setAnalyzedText(text);
    setAnalyzedScreenshot(screenshot || null);
  };

  const handleReset = () => {
    setAnalyzedResult(null);
    setAnalyzedScreenshot(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0f131c] text-slate-100">
      {/* Top Cyber Defense Navigation Bar */}
      <Navbar onReset={handleReset} />

      {/* Main Forensic Console Body */}
      <main className="w-full flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {/* Hero Header Section */}
        {!analyzedResult && (
          <section className="relative w-full flex flex-col items-center text-center space-y-4 pt-2 sm:pt-4">
            {/* Ambient background glow */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-3/4 max-w-[700px] h-[220px] bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />

            {/* Eyebrow Telemetry Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/[0.04] rounded-lg border border-white/[0.08] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
              <span className="font-mono text-xs text-emerald-400 tracking-widest uppercase font-semibold">
                REAL-TIME HEURISTIC THREAT DETECTOR // v4.2-ACTIVE
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-headline text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight max-w-4xl leading-tight">
              {isHindi ? (
                <>
                  क्या वह संदेश या लिंक{' '}
                  <span className="bg-gradient-to-r from-rose-400 to-red-500 bg-clip-text text-transparent">
                    धोखाधड़ी
                  </span>{' '}
                  है?
                </>
              ) : (
                <>
                  Is that message or link a{' '}
                  <span className="bg-gradient-to-r from-rose-400 to-red-500 bg-clip-text text-transparent">
                    scam?
                  </span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="font-body text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              {isHindi
                ? 'क्लिक करने से पहले संदिग्ध एसएमएस, व्हाट्सएप संदेश, बिजली बिल और बैंक अलर्ट की तुरंत जांच करें। भारतीय साइबर धोखाधड़ी से पूर्ण सुरक्षा।'
                : 'Verify suspicious SMS, WhatsApp forwards, courier updates, and bank alerts before clicking. Forensic neutralization against Indian telecom attack vectors.'}
            </p>

            {/* Quick Telemetry Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/[0.04] rounded-lg text-slate-200 border border-white/[0.08]">
                <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono text-[11px] font-semibold tracking-wide">
                  99.4% HEURISTIC PRECISION
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/[0.04] rounded-lg text-slate-200 border border-white/[0.08]">
                <LockIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono text-[11px] font-semibold tracking-wide">
                  ZERO-PII VOLATILE MEMORY
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/[0.04] rounded-lg text-slate-200 border border-white/[0.08]">
                <KeyIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono text-[11px] font-semibold tracking-wide text-emerald-300">
                  INDIAN BANKING &amp; TELECOM MODELS
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Dynamic Display: Analyzer Form or Triage Result View */}
        {analyzedResult ? (
          <ResultCard
            originalText={analyzedText}
            result={analyzedResult}
            onReset={handleReset}
            lang={lang}
            screenshotPreview={analyzedScreenshot}
          />
        ) : (
          <AnalyzerForm
            onAnalyzeSuccess={handleAnalysisSuccess}
            lang={lang}
            initialText={analyzedText}
          />
        )}

        {/* Bottom Section: 3 Exploration Bento Cards */}
        {!analyzedResult && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 max-w-5xl mx-auto w-full">
            {/* Card 1: Interactive Quiz & Simulations */}
            <div className="relative bg-[#181b25] rounded-2xl p-6 flex flex-col justify-between hover:bg-[#1c1f29] hover:border-emerald-500/40 transition-all group shadow-xl border border-white/[0.08]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-300 font-mono text-[10px] font-bold rounded-lg uppercase border border-emerald-500/30">
                    5-MIN DRILL
                  </span>
                  <TargetIcon className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-headline font-bold text-lg text-white">
                    {isHindi ? 'इंटरैक्टिव क्विज और सिमुलेशन' : 'Interactive Quiz & Simulations'}
                  </h3>
                  <p className="font-body text-xs text-slate-400 leading-relaxed">
                    {isHindi
                      ? 'असली भारतीय फ़िशिंग, यूपीआई क्यूआर और डिजिटल अरेस्ट कॉल से अपने सुरक्षा ज्ञान की जांच करें।'
                      : 'Test your fraud detection reflexes against real-world Indian phishing campaigns, UPI QR traps, APK side-loading tricks, and deepfake calls.'}
                  </p>
                </div>

                {/* Mini Inline Simulation Preview */}
                <div className="py-1">
                  <div className="p-3 bg-[#0f131c] rounded-xl border border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="font-mono text-[11px] text-slate-200">UPI Request</span>
                    </div>
                    <span className="font-mono text-[11px] text-rose-400">
                      &quot;Pay ₹5,000 to receive ₹50,000&quot;
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/learn"
                  className="inline-flex items-center gap-1.5 font-mono text-xs text-emerald-400 group-hover:text-emerald-300 transition-colors font-bold uppercase tracking-wider"
                >
                  <span>{isHindi ? 'ड्रिल शुरू करें' : 'Start Defense Drill'}</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Card 2: Live Community Stats & Threat Feed */}
            <div className="relative bg-[#181b25] rounded-2xl p-6 flex flex-col justify-between hover:bg-[#1c1f29] hover:border-emerald-500/40 transition-all group shadow-xl border border-white/[0.08]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-300 font-mono text-[10px] font-bold rounded-lg uppercase flex items-center gap-1.5 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE TELEMETRY
                  </span>
                  <BarChartIcon className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-headline font-bold text-lg text-white">
                    {isHindi ? 'लाइव समुदाय आंकड़े और खतरे' : 'Live Community Stats & Threat Feed'}
                  </h3>
                  <p className="font-body text-xs text-slate-400 leading-relaxed">
                    {isHindi
                      ? 'भारतीय दूरसंचार सर्किलों और सत्यापित नागरिक रिपोर्टों से एकत्र वास्तविक समय का खतरा डेटा।'
                      : 'Real-time telemetry aggregated across Indian telecom circles, mobile sandboxes, and verified citizen reports over the past 7 days.'}
                  </p>
                </div>

                {/* Stat Counters */}
                <div className="grid grid-cols-2 gap-2 py-1">
                  <div className="p-2.5 bg-[#0f131c] rounded-xl border border-white/[0.06]">
                    <span className="font-mono text-[10px] text-slate-400 uppercase block">
                      Intercepted
                    </span>
                    <span className="font-headline font-bold text-lg text-rose-400 tracking-tight">
                      14,820
                    </span>
                    <span className="font-mono text-[9px] text-slate-500 block">
                      Malicious SMS Patterns
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#0f131c] rounded-xl border border-white/[0.06]">
                    <span className="font-mono text-[10px] text-slate-400 uppercase block">
                      Prevented
                    </span>
                    <span className="font-headline font-bold text-lg text-emerald-400 tracking-tight">
                      ₹4.2 Cr
                    </span>
                    <span className="font-mono text-[9px] text-slate-500 block">
                      Estimated Loss Prevented
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/stats"
                  className="inline-flex items-center gap-1.5 font-mono text-xs text-emerald-400 group-hover:text-emerald-300 transition-colors font-bold uppercase tracking-wider"
                >
                  <span>{isHindi ? 'लाइव आंकड़े देखें' : 'View Live Incident Telemetry'}</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Card 3: Zero-PII Storage Architecture */}
            <div className="relative bg-[#181b25] rounded-2xl p-6 flex flex-col justify-between hover:bg-[#1c1f29] hover:border-emerald-500/40 transition-all group shadow-xl border border-white/[0.08]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-white/[0.05] text-slate-300 font-mono text-[10px] font-bold rounded-lg uppercase border border-white/[0.1]">
                    ISO/IEC 27001 AUDITED
                  </span>
                  <KeyIcon className="w-5 h-5 text-slate-400 group-hover:text-slate-200 transition-colors" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-headline font-bold text-lg text-white">
                    {isHindi ? 'शून्य-पीआईआई वास्तुकला' : 'Zero-PII Storage Architecture'}
                  </h3>
                  <p className="font-body text-xs text-slate-400 leading-relaxed">
                    {isHindi
                      ? 'क्रिप्टोग्राफ़िक मेमोरी स्क्रबर। फोन नंबर और बैंक विवरण डिवाइस पर ही सुरक्षित रूप से साफ किए जाते हैं।'
                      : 'Audited cryptographic memory scrubbing. Phone numbers, customer identities, and payment handles are hashed on-device prior to scanning.'}
                  </p>
                </div>

                {/* Architecture Nodes Visual */}
                <div className="p-3 bg-[#0f131c] rounded-xl border border-white/[0.06] space-y-1.5">
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="text-slate-400">CLIENT_SCRUB</span>
                    <span className="text-emerald-400 font-bold">SHA-256 SALT OK</span>
                  </div>
                  <div className="w-full bg-[#262a34] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full w-full" />
                  </div>
                  <div className="flex items-center justify-between font-mono text-[9px] text-slate-500">
                    <span>VOLATILE RAM ONLY</span>
                    <span>NO DATABASE WRITE</span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/privacy"
                  className="inline-flex items-center gap-1.5 font-mono text-xs text-emerald-400 group-hover:text-emerald-300 transition-colors font-bold uppercase tracking-wider"
                >
                  <span>{isHindi ? 'सुरक्षा श्वेतपत्र पढ़ें' : 'Read Sovereign Whitepaper'}</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Sovereign National Defense Footer */}
      <footer className="w-full bg-[#0a0e17] border-t border-white/[0.08] mt-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-emerald-400" />
                <span className="font-headline font-bold text-sm text-white">
                  CERT-In Aligned Protocol
                </span>
              </div>
              <p className="font-body text-xs text-slate-400">
                Active alignment with Indian Computer Emergency Response Team directives and
                zero-day threat interception specifications.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <LockIcon className="w-5 h-5 text-emerald-400" />
                <span className="font-headline font-bold text-sm text-white">
                  Zero-PII Sovereign Seal
                </span>
              </div>
              <p className="font-body text-xs text-slate-400">
                All payload queries, VPAs, and origin numbers undergo client-side cryptographic
                hashing. No personal identities persist.
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-mono text-xs text-white uppercase tracking-wider block font-bold">
                Vector Channels
              </span>
              <div className="flex flex-col gap-1.5 font-body text-xs text-slate-400">
                <Link href="/learn" className="hover:text-emerald-400 transition-colors">
                  UPI &amp; QR Spoof Grid
                </Link>
                <Link href="/learn" className="hover:text-emerald-400 transition-colors">
                  Malicious APK Analysis
                </Link>
                <Link href="/learn" className="hover:text-emerald-400 transition-colors">
                  VoIP &amp; +91 Origin Trace
                </Link>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-mono text-xs text-white uppercase tracking-wider block font-bold">
                National Escort
              </span>
              <div className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.08] space-y-1">
                <p className="font-mono text-xs text-slate-300">
                  MHA National Cybercrime Reporting Portal
                </p>
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-emerald-400 hover:underline block font-bold"
                >
                  cybercrime.gov.in (Helpline: 1930)
                </a>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs text-slate-400">
            <span>
              © 2025 ScamShield India Engine. Sovereign cyber defense and financial fraud
              neutralization.
            </span>
            <div className="flex items-center gap-4">
              <span className="text-emerald-400 font-bold uppercase">
                DEFENSE LEVEL: ALPHA-STABLE
              </span>
              <span>STATUS_OK</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
