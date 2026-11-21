'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from './LanguageProvider';
import { ShieldIcon, PhoneCallIcon, GlobeIcon } from './Icons';

interface NavbarProps {
  onReset?: () => void;
}

export function Navbar({ onReset }: NavbarProps) {
  const pathname = usePathname();
  const { lang, toggle } = useLanguage();
  const isHindi = lang === 'hi';

  const isScanner = pathname === '/';
  const isLearn = pathname.startsWith('/learn');
  const isStats = pathname.startsWith('/stats');
  const isPrivacy = pathname.startsWith('/privacy');

  return (
    <header className="sticky top-0 w-full z-50 bg-surface/90 backdrop-blur-xl border-b border-surface-container-high shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
      <div className="h-20 w-full px-4 lg:px-8 max-w-[1440px] mx-auto flex items-center justify-between gap-4">
        {/* Brand & Telemetry Node */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            onClick={onReset}
            className="flex items-center gap-3 group text-left focus:outline-none"
            title="ScamShield Forensic Home"
          >
            <div className="h-10 w-10 rounded-lg bg-surface-container-high border border-outline/30 flex items-center justify-center group-hover:border-secondary transition shadow-sm">
              <ShieldIcon className="w-5 h-5 text-secondary" />
            </div>
            <div className="flex flex-col">
              <span className="font-headline font-bold text-xl tracking-tight text-on-surface leading-none">
                ScamShield
              </span>
              <span className="font-mono text-[10px] text-secondary tracking-widest uppercase mt-1">
                {isHindi ? 'भारत धोखाधड़ी सुरक्षा' : 'India Fraud Defense Engine'}
              </span>
            </div>
          </Link>

          {/* Live Engine Status Badge */}
          <div className="hidden xl:flex items-center gap-2 ml-4 pl-4 py-1 px-3 bg-surface-container-low rounded-lg border border-outline-variant/30">
            <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(78,222,163,0.8)] animate-pulse" />
            <span className="font-mono text-[11px] text-on-surface-variant tracking-wider">
              NODE-IN-01: ONLINE | ENGINE LATENCY: 24ms
            </span>
          </div>
        </div>

        {/* Primary Route Navigation */}
        <nav className="hidden lg:flex items-center gap-2">
          <Link
            href="/"
            onClick={onReset}
            className={`px-4 py-2 font-mono text-xs uppercase tracking-wider rounded-lg transition-all ${
              isScanner
                ? 'bg-secondary-container text-on-secondary-container font-bold shadow-[0_0_12px_rgba(78,222,163,0.25)]'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            {isHindi ? 'स्कैनर' : 'Scanner'}
          </Link>

          <Link
            href="/learn"
            className={`px-4 py-2 font-mono text-xs uppercase tracking-wider rounded-lg transition-all ${
              isLearn
                ? 'bg-secondary-container text-on-secondary-container font-bold shadow-[0_0_12px_rgba(78,222,163,0.25)]'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            {isHindi ? 'सीखें और क्विज़' : 'Learn & Quiz'}
          </Link>

          <Link
            href="/stats"
            className={`px-4 py-2 font-mono text-xs uppercase tracking-wider rounded-lg transition-all ${
              isStats
                ? 'bg-secondary-container text-on-secondary-container font-bold shadow-[0_0_12px_rgba(78,222,163,0.25)]'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            {isHindi ? 'लाइव आंकड़े' : 'Live Stats'}
          </Link>

          <Link
            href="/privacy"
            className={`px-4 py-2 font-mono text-xs uppercase tracking-wider rounded-lg transition-all ${
              isPrivacy
                ? 'bg-secondary-container text-on-secondary-container font-bold shadow-[0_0_12px_rgba(78,222,163,0.25)]'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            {isHindi ? 'गोपनीयता' : 'Privacy & Arch'}
          </Link>
        </nav>

        {/* Right Action Widgets */}
        <div className="flex items-center gap-3">
          {/* Cyber Helpline: 1930 Badge */}
          <a
            href="tel:1930"
            className="relative flex items-center px-3 py-1.5 bg-error-container text-on-error-container rounded-lg font-mono text-xs uppercase tracking-wider hover:opacity-90 transition border border-error/40 shadow-sm"
            title="National Cyber Crime Reporting Helpline 1930"
          >
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-container" />
            </span>
            <PhoneCallIcon className="w-3.5 h-3.5 mr-1.5 text-on-primary-fixed" />
            <span className="font-bold tracking-tight text-on-primary-fixed">Helpline: 1930</span>
          </a>

          {/* Language Toggle */}
          <button
            onClick={toggle}
            aria-label={isHindi ? 'Switch to English' : 'हिंदी में बदलें'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high border border-outline-variant/40 text-on-surface font-mono text-xs hover:border-secondary transition cursor-pointer"
          >
            <GlobeIcon className="w-3.5 h-3.5 text-secondary" />
            <span className="font-bold">{isHindi ? 'EN' : 'हि'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
