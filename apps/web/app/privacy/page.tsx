'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ShieldIcon, CheckCircleIcon } from '@/components/Icons';

export default function PrivacyPage() {
  const { lang } = useLanguage();
  const isHindi = lang === 'hi';

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-indigo-500/15 bg-[#000f21]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center shadow-sm">
              <ShieldIcon className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
              ScamShield
            </span>
          </Link>

          <nav className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/" className="text-slate-400 hover:text-white transition">
              Scanner
            </Link>
            <Link href="/learn" className="text-slate-400 hover:text-white transition">
              Learn & Quiz
            </Link>
            <Link href="/stats" className="text-slate-400 hover:text-white transition">
              Live Stats
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto px-4 py-8 sm:py-12 w-full space-y-6 leading-relaxed text-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/20 bg-purple-500/5 text-xs text-purple-300 mb-2 font-mono">
            <span>Cryptographic Privacy Architecture</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            {isHindi ? 'गोपनीयता नीति' : 'Privacy Policy & Data Protection'}
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">Effective Date: November 2026</p>
        </div>

        <section className="p-6 rounded-2xl border border-white/[0.08] bg-[#031427]/80 backdrop-blur-md space-y-3">
          <h2 className="text-base font-bold text-indigo-400 font-mono">
            1. Privacy by Default (No Raw Text Storage)
          </h2>
          <p className="text-sm text-slate-300">
            By default, ScamShield <strong>never persists or records the raw text</strong> of
            messages you submit. When you click &quot;Analyze Message&quot;, the content is
            processed entirely in ephemeral memory in a sandboxed runtime.
          </p>
          <p className="text-sm text-slate-300">
            To prevent duplicate abuse and generate high-level telemetry, we store only a{' '}
            <strong className="text-white">cryptographically salted HMAC-SHA256 hash</strong> of the
            message along with the verdict, score, and timestamp. It is computationally infeasible
            to reconstruct your message from this hash.
          </p>
        </section>

        <section className="p-6 rounded-2xl border border-white/[0.08] bg-[#031427]/80 backdrop-blur-md space-y-3">
          <h2 className="text-base font-bold text-indigo-400 font-mono">
            2. Opt-in Sample Donation & Automated PII Scrubbing
          </h2>
          <p className="text-sm text-slate-300">
            If you explicitly check the opt-in box to donate a sample for fraud detection research,
            your text is filtered through our automated PII scrubber before any storage takes place:
          </p>
          <ul className="list-disc list-inside text-xs text-slate-300 space-y-1.5 pl-2 font-mono">
            <li>
              10-digit Indian phone numbers are replaced with{' '}
              <code className="text-indigo-300 bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/10">
                [REDACTED_PHONE]
              </code>
            </li>
            <li>
              Email addresses are replaced with{' '}
              <code className="text-indigo-300 bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/10">
                [REDACTED_EMAIL]
              </code>
            </li>
            <li>
              Credit/debit card numbers are replaced with{' '}
              <code className="text-indigo-300 bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/10">
                [REDACTED_CARD]
              </code>
            </li>
            <li>
              Bank account numbers are replaced with{' '}
              <code className="text-indigo-300 bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/10">
                [REDACTED_ACCOUNT]
              </code>
            </li>
            <li>
              One-Time Passwords (OTPs) and PINs are replaced with{' '}
              <code className="text-indigo-300 bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/10">
                [REDACTED_SECRET]
              </code>
            </li>
            <li>
              Aadhaar and PAN IDs are replaced with{' '}
              <code className="text-indigo-300 bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/10">
                [REDACTED_PAN]
              </code>{' '}
              and{' '}
              <code className="text-indigo-300 bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/10">
                [REDACTED_AADHAAR]
              </code>
            </li>
          </ul>
          <p className="text-sm text-emerald-400 font-semibold font-mono flex items-center gap-1.5">
            <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              All opted-in samples are permanently purged by an automated retention script after 30
              days.
            </span>
          </p>
        </section>

        <section className="p-6 rounded-2xl border border-white/[0.08] bg-[#031427]/80 backdrop-blur-md space-y-3">
          <h2 className="text-base font-bold text-indigo-400 font-mono">
            3. Safe URL Defanging (No SSRF)
          </h2>
          <p className="text-sm text-slate-300">
            Our web servers never query, fetch, or browse third-party destination URLs from user
            messages. This ensures our servers cannot be exploited for Server-Side Request Forgery
            (SSRF) and your IP address is never revealed to scam hosters. All displayed links are
            rendered strictly in defanged format (e.g.{' '}
            <code className="text-rose-400 font-mono">hxxp://example[.]com</code>) and are
            completely unclickable.
          </p>
        </section>

        <section className="p-6 rounded-2xl border border-white/[0.08] bg-[#031427]/80 backdrop-blur-md space-y-3">
          <h2 className="text-base font-bold text-indigo-400 font-mono">
            4. Zero Commercial Tracking
          </h2>
          <p className="text-sm text-slate-300">
            ScamShield does not use third-party advertising cookies, trackers, or marketing pixels.
            We operate strictly under public interest digital safety guidelines.
          </p>
        </section>

        <section className="p-6 rounded-2xl border border-rose-500/20 bg-rose-500/[0.05] backdrop-blur-md space-y-3">
          <h2 className="text-base font-bold text-rose-300 font-mono">
            5. Contact & Official Authorities
          </h2>
          <p className="text-sm text-slate-300">
            For active financial fraud, immediately report to the Indian Ministry of Home Affairs
            Cyber Crime division via toll-free helpline{' '}
            <strong className="text-white font-mono">1930</strong> or visit{' '}
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 underline font-medium"
            >
              cybercrime.gov.in
            </a>
            .
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-indigo-500/10 bg-[#000f21]/60 py-6 text-center text-xs text-slate-500">
        <p>ScamShield — Safeguarding Indian Digital Citizens</p>
      </footer>
    </div>
  );
}
