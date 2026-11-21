'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from './LanguageProvider';
import { ShieldIcon, PhoneCallIcon, GlobeIcon, TargetIcon, BarChartIcon, LockIcon } from './Icons';

interface NavbarProps {
  onReset?: () => void;
}

export function Navbar({ onReset }: NavbarProps) {
  const pathname = usePathname();
  const { lang, toggle } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isHindi = lang === 'hi';

  const isScanner = pathname === '/';
  const isLearn = pathname.startsWith('/learn');
  const isStats = pathname.startsWith('/stats');
  const isPrivacy = pathname.startsWith('/privacy');

  const handleNavClick = (callback?: () => void) => {
    if (callback) callback();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 w-full z-50 bg-[#0f131c]/90 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_1px_12px_rgba(0,0,0,0.5)]">
      <div className="h-20 w-full px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto flex items-center justify-between gap-4">
        {/* Brand & Telemetry Node */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            onClick={() => handleNavClick(onReset)}
            className="flex items-center gap-3 group text-left focus:outline-none"
            title="ScamShield Forensic Home"
          >
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center group-hover:border-emerald-400/60 group-hover:bg-emerald-500/20 transition shadow-sm">
              <ShieldIcon className="w-5 h-5 text-emerald-400 group-hover:scale-105 transition-transform" />
            </div>
            <div className="flex flex-col">
              <span className="font-headline font-black text-xl tracking-tight text-white leading-none">
                ScamShield
              </span>
              <span className="font-mono text-[10px] text-emerald-400 tracking-widest uppercase mt-1">
                {isHindi ? 'भारत साइबर सुरक्षा' : 'India Fraud Defense'}
              </span>
            </div>
          </Link>

          {/* Live Engine Status Badge */}
          <div className="hidden xl:flex items-center gap-2 ml-4 pl-4 py-1 px-3 bg-white/[0.03] rounded-lg border border-white/[0.08]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
            <span className="font-mono text-[11px] text-slate-300 tracking-wider">
              NODE-IN-01: ONLINE <span className="text-slate-500">|</span> LATENCY: 24ms
            </span>
          </div>
        </div>

        {/* Primary Route Navigation (Desktop) */}
        <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
          <Link
            href="/"
            onClick={() => handleNavClick(onReset)}
            className={`px-3.5 py-2 font-mono text-xs uppercase tracking-wider rounded-lg transition-all ${
              isScanner
                ? 'bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            {isHindi ? 'स्कैनर' : 'Scanner'}
          </Link>

          <Link
            href="/learn"
            onClick={() => handleNavClick()}
            className={`px-3.5 py-2 font-mono text-xs uppercase tracking-wider rounded-lg transition-all ${
              isLearn
                ? 'bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            {isHindi ? 'सीखें और क्विज़' : 'Learn & Quiz'}
          </Link>

          <Link
            href="/stats"
            onClick={() => handleNavClick()}
            className={`px-3.5 py-2 font-mono text-xs uppercase tracking-wider rounded-lg transition-all ${
              isStats
                ? 'bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            {isHindi ? 'लाइव आंकड़े' : 'Live Stats'}
          </Link>

          <Link
            href="/privacy"
            onClick={() => handleNavClick()}
            className={`px-3.5 py-2 font-mono text-xs uppercase tracking-wider rounded-lg transition-all ${
              isPrivacy
                ? 'bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            {isHindi ? 'गोपनीयता' : 'Privacy & Arch'}
          </Link>
        </nav>

        {/* Right Action Widgets */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Cyber Helpline: 1930 Badge */}
          <a
            href="tel:1930"
            className="relative flex items-center px-3 py-1.5 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 rounded-lg font-mono text-xs uppercase tracking-wider transition border border-rose-500/30 shadow-sm"
            title="National Cyber Crime Reporting Helpline 1930"
          >
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            </span>
            <PhoneCallIcon className="w-3.5 h-3.5 mr-1.5 text-rose-400" />
            <span className="font-bold tracking-tight">1930</span>
          </a>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={toggle}
            aria-label={isHindi ? 'Switch to English' : 'हिंदी में बदलें'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-200 font-mono text-xs hover:border-emerald-400/50 hover:bg-white/[0.08] transition cursor-pointer"
          >
            <GlobeIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold">{isHindi ? 'EN' : 'हि'}</span>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            className="md:hidden flex items-center justify-center p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:text-white"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/[0.08] bg-[#0f131c]/98 px-4 py-4 space-y-2 animate-in fade-in-50">
          <Link
            href="/"
            onClick={() => handleNavClick(onReset)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-mono text-xs uppercase tracking-wider ${
              isScanner
                ? 'bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30'
                : 'text-slate-300 hover:bg-white/[0.05]'
            }`}
          >
            <ShieldIcon className="w-4 h-4 text-emerald-400" />
            <span>{isHindi ? 'स्कैनर' : 'Scanner'}</span>
          </Link>

          <Link
            href="/learn"
            onClick={() => handleNavClick()}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-mono text-xs uppercase tracking-wider ${
              isLearn
                ? 'bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30'
                : 'text-slate-300 hover:bg-white/[0.05]'
            }`}
          >
            <TargetIcon className="w-4 h-4 text-emerald-400" />
            <span>{isHindi ? 'सीखें और क्विज़' : 'Learn & Quiz'}</span>
          </Link>

          <Link
            href="/stats"
            onClick={() => handleNavClick()}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-mono text-xs uppercase tracking-wider ${
              isStats
                ? 'bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30'
                : 'text-slate-300 hover:bg-white/[0.05]'
            }`}
          >
            <BarChartIcon className="w-4 h-4 text-emerald-400" />
            <span>{isHindi ? 'लाइव आंकड़े' : 'Live Stats'}</span>
          </Link>

          <Link
            href="/privacy"
            onClick={() => handleNavClick()}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-mono text-xs uppercase tracking-wider ${
              isPrivacy
                ? 'bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30'
                : 'text-slate-300 hover:bg-white/[0.05]'
            }`}
          >
            <LockIcon className="w-4 h-4 text-emerald-400" />
            <span>{isHindi ? 'गोपनीयता' : 'Privacy & Arch'}</span>
          </Link>
        </div>
      )}
    </header>
  );
}
