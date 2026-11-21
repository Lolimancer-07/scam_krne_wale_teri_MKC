'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { useLanguage } from '@/components/LanguageProvider';
import { ShieldCheckIcon, LockIcon, CheckCircleIcon } from '@/components/Icons';

export default function PrivacyPage() {
  const { lang } = useLanguage();
  const isHindi = lang === 'hi';

  return (
    <div className="min-h-screen flex flex-col justify-between bg-surface text-on-surface">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-surface-container-high border border-outline-variant/30 text-xs text-secondary mb-2 font-mono">
            <LockIcon className="w-3.5 h-3.5" />
            <span>Cryptographic Privacy Architecture // Zero-PII</span>
          </div>
          <h1 className="font-headline text-3xl sm:text-4xl font-black tracking-tight text-on-surface">
            {isHindi ? 'गोपनीयता नीति और वास्तुकला' : 'Privacy Architecture & Data Protection'}
          </h1>
          <p className="font-mono text-xs text-on-surface-variant mt-1">
            Standard Operating Architecture: ISO/IEC 27001 Aligned · Effective Date: November 2026
          </p>
        </div>

        <section className="p-6 rounded-xl border border-surface-container-high bg-surface-container-low space-y-3">
          <h2 className="font-headline text-base font-bold text-secondary">
            1. Privacy by Default (No Raw Text Storage)
          </h2>
          <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            By default, ScamShield <strong>never persists or records the raw text</strong> of
            messages you submit. When you click &quot;Analyze Message&quot;, the content is
            processed entirely in ephemeral memory in a sandboxed, volatile runtime.
          </p>
          <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            To prevent duplicate abuse and generate high-level community telemetry, we store only a{' '}
            <strong className="text-on-surface font-mono">
              cryptographically salted HMAC-SHA256 hash
            </strong>{' '}
            of the message along with the verdict, score, and timestamp. It is computationally
            infeasible to reconstruct your message from this hash.
          </p>
        </section>

        <section className="p-6 rounded-xl border border-surface-container-high bg-surface-container-low space-y-3">
          <h2 className="font-headline text-base font-bold text-secondary">
            2. Opt-in Sample Donation &amp; Automated PII Scrubbing
          </h2>
          <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            If you explicitly check the opt-in box to donate a sample for fraud detection research,
            your text is filtered through our automated PII scrubber before any storage takes place:
          </p>
          <ul className="list-disc list-inside font-mono text-xs text-on-surface space-y-1.5 pl-2">
            <li>
              10-digit Indian phone numbers are replaced with{' '}
              <code className="text-secondary bg-surface-container px-1.5 py-0.5 rounded border border-surface-container-high">
                [REDACTED_PHONE]
              </code>
            </li>
            <li>
              Email addresses are replaced with{' '}
              <code className="text-secondary bg-surface-container px-1.5 py-0.5 rounded border border-surface-container-high">
                [REDACTED_EMAIL]
              </code>
            </li>
            <li>
              Credit/debit card numbers are replaced with{' '}
              <code className="text-secondary bg-surface-container px-1.5 py-0.5 rounded border border-surface-container-high">
                [REDACTED_CARD]
              </code>
            </li>
            <li>
              6-digit OTP codes and UPI MPINs are replaced with{' '}
              <code className="text-secondary bg-surface-container px-1.5 py-0.5 rounded border border-surface-container-high">
                [REDACTED_OTP]
              </code>
            </li>
          </ul>
        </section>

        <section className="p-6 rounded-xl border border-surface-container-high bg-surface-container-low space-y-3">
          <h2 className="font-headline text-base font-bold text-secondary">
            3. Client-Side Processing Guarantees
          </h2>
          <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Whenever possible, heuristic scans execute directly inside your browser without
            contacting external servers. OCR extraction for images is performed client-side using
            WebAssembly Tesseract workers.
          </p>
        </section>

        <section className="p-6 rounded-xl border border-surface-container-high bg-surface-container-low space-y-3">
          <h2 className="font-headline text-base font-bold text-secondary">
            4. Sovereign Alignment (CERT-In &amp; NCRP Directives)
          </h2>
          <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            ScamShield complies with Indian Information Technology Act (2000), CERT-In security
            advisories, and Digital Personal Data Protection (DPDP) Act standards. For active
            financial cyber frauds, report directly to the MHA National Cybercrime Reporting Portal
            at{' '}
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary underline font-semibold"
            >
              cybercrime.gov.in
            </a>{' '}
            or dial 1930.
          </p>
        </section>
      </main>

      <footer className="w-full bg-surface-container-lowest border-t border-surface-container-high mt-12 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-on-surface-variant">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="w-4 h-4 text-secondary" />
            <span>Zero-PII Storage Architecture</span>
          </div>
          <span>Emergency Cybercrime Helpline: 1930</span>
        </div>
      </footer>
    </div>
  );
}
