import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-primary bg-clip-text text-transparent">
              ScamShield
            </span>
          </Link>

          <nav className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition">
              Scanner
            </Link>
            <Link href="/learn" className="text-muted-foreground hover:text-foreground transition">
              Learn & Quiz
            </Link>
            <Link href="/stats" className="text-muted-foreground hover:text-foreground transition">
              Live Stats
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto px-4 py-8 sm:py-12 w-full space-y-8 leading-relaxed text-foreground">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Privacy Policy & Data Protection</h1>
          <p className="text-xs text-muted-foreground mt-1">Effective Date: November 2024</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-primary">
            1. Privacy by Default (No Raw Text Storage)
          </h2>
          <p className="text-sm text-muted-foreground">
            By default, ScamShield <strong>never persists or records the raw text</strong> of
            messages you submit. When you click &quot;Analyze Message&quot;, the content is
            processed entirely in ephemeral memory in a sandboxed runtime.
          </p>
          <p className="text-sm text-muted-foreground">
            To prevent duplicate abuse and generate high-level telemetry, we store only a{' '}
            <strong>cryptographically salted HMAC-SHA256 hash</strong> of the message along with the
            verdict, score, and timestamp. It is mathematically impossible to reconstruct your
            message from this hash.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-primary">
            2. Opt-in Sample Donation & Automated PII Scrubbing
          </h2>
          <p className="text-sm text-muted-foreground">
            If you explicitly check the opt-in box to donate a sample for fraud detection research,
            your text is filtered through our automated PII scrubber before any storage takes place:
          </p>
          <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1 pl-2">
            <li>
              10-digit Indian phone numbers are replaced with <code>[REDACTED_PHONE]</code>
            </li>
            <li>
              Email addresses are replaced with <code>[REDACTED_EMAIL]</code>
            </li>
            <li>
              Credit/debit card numbers are replaced with <code>[REDACTED_CARD]</code>
            </li>
            <li>
              Bank account numbers are replaced with <code>[REDACTED_ACCOUNT]</code>
            </li>
            <li>
              One-Time Passwords (OTPs) and PINs are replaced with <code>[REDACTED_SECRET]</code>
            </li>
            <li>
              Aadhaar and PAN IDs are replaced with <code>[REDACTED_ID]</code>
            </li>
          </ul>
          <p className="text-sm text-muted-foreground font-semibold">
            All opted-in samples are permanently purged by an automated retention script after 30
            days.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-primary">3. Safe URL Defanging (No SSRF)</h2>
          <p className="text-sm text-muted-foreground">
            Our web servers never query, fetch, or browse third-party destination URLs from user
            messages. This ensures our servers cannot be exploited for Server-Side Request Forgery
            (SSRF) and your IP address is never revealed to scam hosters. All displayed links are
            rendered strictly in defanged format (e.g. <code>hxxp://example[.]com</code>) and are
            completely unclickable.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-primary">4. Zero Commercial Tracking</h2>
          <p className="text-sm text-muted-foreground">
            ScamShield does not use third-party advertising cookies, trackers, or marketing pixels.
            We operate strictly under public interest digital safety guidelines.
          </p>
        </section>

        <section className="space-y-3 border-t pt-6">
          <h2 className="text-lg font-bold">5. Contact & Official Authorities</h2>
          <p className="text-sm text-muted-foreground">
            For active financial fraud, immediately report to the Indian Ministry of Home Affairs
            Cyber Crime division via toll-free helpline <strong>1930</strong> or visit{' '}
            <a href="https://cybercrime.gov.in" className="text-primary underline font-medium">
              cybercrime.gov.in
            </a>
            .
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/20 py-6 text-center text-xs text-muted-foreground">
        <p>ScamShield — Safeguarding Indian Digital Citizens</p>
      </footer>
    </div>
  );
}
