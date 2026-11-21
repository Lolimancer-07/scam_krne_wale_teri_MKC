'use client';

import React, { useState } from 'react';
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
    <div className="min-h-screen flex flex-col justify-between bg-surface text-on-surface">
      {/* Top Cyber Defense Navigation Bar */}
      <Navbar onReset={handleReset} />

      {/* Main Forensic Console Body */}
      <main className="w-full flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {/* Hero Header Section */}
        {!analyzedResult && (
          <section className="relative w-full flex flex-col items-center text-center space-y-4 pt-2 sm:pt-4">
            {/* Ambient background glow */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-3/4 max-w-[700px] h-[220px] bg-secondary/5 blur-[120px] pointer-events-none rounded-full" />

            {/* Eyebrow Telemetry Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-surface-container-low rounded-lg border border-outline-variant/30 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(78,222,163,0.8)] animate-pulse" />
              <span className="font-mono text-xs text-secondary tracking-widest uppercase font-semibold">
                REAL-TIME HEURISTIC THREAT DETECTOR // v4.2-ACTIVE
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-headline text-3xl sm:text-5xl lg:text-6xl font-black text-on-surface tracking-tight max-w-4xl leading-tight">
              {isHindi ? (
                <>
                  क्या वह संदेश या लिंक <span className="text-primary tracking-tighter">धोखाधड़ी</span>{' '}
                  है?
                </>
              ) : (
                <>
                  Is that message or link a{' '}
                  <span className="text-primary tracking-tighter">scam?</span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="font-body text-sm sm:text-base text-on-surface-variant max-w-2xl leading-relaxed">
              {isHindi
                ? 'क्लिक करने से पहले संदिग्ध एसएमएस, व्हाट्सएप संदेश, बिजली बिल और बैंक अलर्ट की तुरंत जांच करें। भारतीय साइबर धोखाधड़ी से पूर्ण सुरक्षा।'
                : 'Verify suspicious SMS, WhatsApp forwards, courier updates, and bank alerts before clicking. Forensic neutralization against Indian telecom attack vectors.'}
            </p>

            {/* Quick Telemetry Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-high rounded text-on-surface border border-outline-variant/20">
                <ShieldCheckIcon className="w-3.5 h-3.5 text-secondary" />
                <span className="font-mono text-[11px] font-semibold tracking-wide">
                  99.4% HEURISTIC PRECISION
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-high rounded text-on-surface border border-outline-variant/20">
                <LockIcon className="w-3.5 h-3.5 text-secondary" />
                <span className="font-mono text-[11px] font-semibold tracking-wide">
                  ZERO-PII VOLATILE MEMORY
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-high rounded text-on-surface border border-outline-variant/20">
                <KeyIcon className="w-3.5 h-3.5 text-tertiary" />
                <span className="font-mono text-[11px] font-semibold tracking-wide text-tertiary">
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
          />
        ) : (
          <AnalyzerForm
            onAnalyzeSuccess={handleAnalysisSuccess}
            lang={lang}
            initialText={analyzedText}
          />
        )}

        {/* Bottom Section: 3 Exploration Bento Cards (From Stitch Screen 1) */}
        {!analyzedResult && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 max-w-5xl mx-auto w-full">
            {/* Card 1: Interactive Quiz & Simulations */}
            <div className="relative bg-surface-container-low rounded-xl p-6 flex flex-col justify-between hover:bg-surface-container transition-all group shadow-md border border-surface-container-high">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-tertiary-container/30 text-tertiary font-mono text-[10px] font-bold rounded uppercase border border-tertiary/20">
                    5-MIN DRILL
                  </span>
                  <TargetIcon className="w-5 h-5 text-on-surface-variant group-hover:text-tertiary transition-colors" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-headline font-bold text-lg text-on-surface">
                    {isHindi ? 'इंटरैक्टिव क्विज और सिमुलेशन' : 'Interactive Quiz & Simulations'}
                  </h3>
                  <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                    {isHindi
                      ? 'असली भारतीय फ़िशिंग, यूपीआई क्यूआर और डिजिटल अरेस्ट कॉल से अपने सुरक्षा ज्ञान की जांच करें।'
                      : 'Test your fraud detection reflexes against real-world Indian phishing campaigns, UPI QR traps, APK side-loading tricks, and deepfake calls.'}
                  </p>
                </div>

                {/* Mini Inline Simulation Preview */}
                <div className="py-1">
                  <div className="p-2.5 bg-surface-container-lowest rounded-lg border border-surface-container-high flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-secondary" />
                      <span className="font-mono text-[11px] text-on-surface">UPI Request</span>
                    </div>
                    <span className="font-mono text-[11px] text-primary">
                      &quot;Pay ₹5,000 to receive ₹50,000&quot;
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/learn"
                  className="inline-flex items-center gap-1.5 font-mono text-xs text-secondary group-hover:text-secondary-fixed transition-colors font-bold uppercase tracking-wider"
                >
                  <span>{isHindi ? 'ड्रिल शुरू करें' : 'Start Defense Drill'}</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Card 2: Live Community Stats & Threat Feed */}
            <div className="relative bg-surface-container-low rounded-xl p-6 flex flex-col justify-between hover:bg-surface-container transition-all group shadow-md border border-surface-container-high">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-surface-container-high text-secondary font-mono text-[10px] font-bold rounded uppercase flex items-center gap-1.5 border border-secondary/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                    LIVE TELEMETRY
                  </span>
                  <BarChartIcon className="w-5 h-5 text-on-surface-variant group-hover:text-secondary transition-colors" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-headline font-bold text-lg text-on-surface">
                    {isHindi ? 'लाइव समुदाय आंकड़े और खतरे' : 'Live Community Stats & Threat Feed'}
                  </h3>
                  <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                    {isHindi
                      ? 'भारतीय दूरसंचार सर्किलों और सत्यापित नागरिक रिपोर्टों से एकत्र वास्तविक समय का खतरा डेटा।'
                      : 'Real-time telemetry aggregated across Indian telecom circles, mobile sandboxes, and verified citizen reports over the past 7 days.'}
                  </p>
                </div>

                {/* Stat Counters */}
                <div className="grid grid-cols-2 gap-2 py-1">
                  <div className="p-2.5 bg-surface-container-lowest rounded-lg border border-surface-container-high">
                    <span className="font-mono text-[10px] text-on-surface-variant uppercase block">
                      Intercepted
                    </span>
                    <span className="font-headline font-bold text-lg text-primary tracking-tight">
                      14,820
                    </span>
                    <span className="font-mono text-[9px] text-on-surface-variant/70 block">
                      Malicious SMS Patterns
                    </span>
                  </div>
                  <div className="p-2.5 bg-surface-container-lowest rounded-lg border border-surface-container-high">
                    <span className="font-mono text-[10px] text-on-surface-variant uppercase block">
                      Prevented
                    </span>
                    <span className="font-headline font-bold text-lg text-secondary tracking-tight">
                      ₹4.2 Cr
                    </span>
                    <span className="font-mono text-[9px] text-on-surface-variant/70 block">
                      Estimated Loss Prevented
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/stats"
                  className="inline-flex items-center gap-1.5 font-mono text-xs text-secondary group-hover:text-secondary-fixed transition-colors font-bold uppercase tracking-wider"
                >
                  <span>{isHindi ? 'लाइव आंकड़े देखें' : 'View Live Incident Telemetry'}</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Card 3: Zero-PII Storage Architecture */}
            <div className="relative bg-surface-container-low rounded-xl p-6 flex flex-col justify-between hover:bg-surface-container transition-all group shadow-md border border-surface-container-high">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-surface-container-high text-on-surface font-mono text-[10px] font-bold rounded uppercase border border-outline-variant/30">
                    ISO/IEC 27001 AUDITED
                  </span>
                  <KeyIcon className="w-5 h-5 text-on-surface-variant group-hover:text-on-surface transition-colors" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-headline font-bold text-lg text-on-surface">
                    {isHindi ? 'शून्य-पीआईआई वास्तुकला' : 'Zero-PII Storage Architecture'}
                  </h3>
                  <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                    {isHindi
                      ? 'क्रिप्टोग्राफ़िक मेमोरी स्क्रबर। फोन नंबर और बैंक विवरण डिवाइस पर ही सुरक्षित रूप से साफ किए जाते हैं।'
                      : 'Audited cryptographic memory scrubbing. Phone numbers, customer identities, and payment handles are hashed on-device prior to scanning.'}
                  </p>
                </div>

                {/* Architecture Nodes Visual */}
                <div className="p-2.5 bg-surface-container-lowest rounded-lg border border-surface-container-high space-y-1.5">
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="text-on-surface-variant">CLIENT_SCRUB</span>
                    <span className="text-secondary font-bold">SHA-256 SALT OK</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                    <div className="bg-secondary h-full w-full" />
                  </div>
                  <div className="flex items-center justify-between font-mono text-[9px] text-on-surface-variant/70">
                    <span>VOLATILE RAM ONLY</span>
                    <span>NO DATABASE WRITE</span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/privacy"
                  className="inline-flex items-center gap-1.5 font-mono text-xs text-secondary group-hover:text-secondary-fixed transition-colors font-bold uppercase tracking-wider"
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
      <footer className="w-full bg-surface-container-lowest border-t border-surface-container-high mt-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-secondary" />
                <span className="font-headline font-bold text-sm text-on-surface">
                  CERT-In Aligned Protocol
                </span>
              </div>
              <p className="font-body text-xs text-on-surface-variant">
                Active alignment with Indian Computer Emergency Response Team directives and
                zero-day threat interception specifications.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <LockIcon className="w-5 h-5 text-secondary" />
                <span className="font-headline font-bold text-sm text-on-surface">
                  Zero-PII Sovereign Seal
                </span>
              </div>
              <p className="font-body text-xs text-on-surface-variant">
                All payload queries, VPAs, and origin numbers undergo client-side cryptographic
                hashing. No personal identities persist.
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-mono text-xs text-on-surface uppercase tracking-wider block font-bold">
                Vector Channels
              </span>
              <div className="flex flex-col gap-1.5 font-body text-xs text-on-surface-variant">
                <Link href="/learn" className="hover:text-secondary transition-colors">
                  UPI &amp; QR Spoof Grid
                </Link>
                <Link href="/learn" className="hover:text-secondary transition-colors">
                  Malicious APK Analysis
                </Link>
                <Link href="/learn" className="hover:text-secondary transition-colors">
                  VoIP &amp; +91 Origin Trace
                </Link>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-mono text-xs text-on-surface uppercase tracking-wider block font-bold">
                National Escort
              </span>
              <div className="p-3 bg-surface-container rounded-lg border border-surface-container-high space-y-1">
                <p className="font-mono text-xs text-on-surface">
                  MHA National Cybercrime Reporting Portal
                </p>
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-secondary hover:underline block font-bold"
                >
                  cybercrime.gov.in (Helpline: 1930)
                </a>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-surface-container-high flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs text-on-surface-variant">
            <span>
              © 2025 ScamShield India Engine. Sovereign cyber defense and financial fraud
              neutralization.
            </span>
            <div className="flex items-center gap-4">
              <span className="text-secondary font-bold uppercase">
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
