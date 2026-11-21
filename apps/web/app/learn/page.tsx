'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Quiz } from '@/components/Quiz';

const SCAM_GUIDES = [
  {
    icon: '🏦',
    title: 'Bank & KYC Expiry Scams',
    threat: 'High',
    description:
      'Fraudsters claim your bank account, NetBanking, debit card, or PAN linking will be suspended within 24 hours. They provide a lookalike link (e.g. sbi-kyc.xyz) to steal login passwords and OTPs.',
    example:
      '"Dear Customer, your SBI account KYC expires today. Verify immediately via http://sbi-kyc.top or account will be blocked."',
    protection: [
      'Banks NEVER ask you to update KYC via web links sent over SMS.',
      'Check URL domains: only trust sbi.co.in, hdfcbank.com, icicibank.com.',
      'Always access banking through official mobile banking apps.',
    ],
  },
  {
    icon: '⚡',
    title: 'Electricity & Utility Disconnection',
    threat: 'Critical',
    description:
      'A panic message threatens that your power supply will be cut off tonight at 9:30 PM due to an unpaid bill. Victims are urged to call a personal 10-digit mobile number, leading to remote-access app downloads (AnyDesk, TeamViewer).',
    example:
      '"Dear Consumer, your electricity power will be disconnected tonight at 9:30 PM. Contact electricity officer at 9876543210 immediately."',
    protection: [
      'State electricity boards send formal printed notices, not urgent same-day SMS from mobile numbers.',
      'NEVER download APKs or screen-sharing apps (QuickSupport, AnyDesk) instructed over the phone.',
      'Pay bills exclusively via authorized utility apps or Bharat BillPay (BBPS).',
    ],
  },
  {
    icon: '💸',
    title: 'UPI "Receive Money" QR Code Scams',
    threat: 'High',
    description:
      'When selling goods on OLX or receiving refunds, scammers send a QR code or Collect Request saying "Scan this QR and enter your PIN to receive money in your bank account".',
    example:
      '"Payment of Rs 15,000 sent for your sofa. Scan this QR code and enter UPI PIN to receive money into your account."',
    protection: [
      'GOLDEN RULE: You NEVER enter your UPI PIN to receive money. Entering a PIN always debits your account.',
      'Scanning a QR code always sends money away from your wallet.',
      'Decline all unexpected collect requests in Google Pay, PhonePe, or Paytm.',
    ],
  },
  {
    icon: '⚖️',
    title: 'Digital Arrest & Police Extortion',
    threat: 'Severe',
    description:
      'Scammers impersonate police, CBI, ED, or customs officers. They place video calls in fake police station setups and claim a parcel containing illegal drugs was intercepted in your name, threatening immediate arrest.',
    example:
      '"Supreme Court digital arrest warrant issued. Remain on video camera for digital custody interrogation."',
    protection: [
      '"Digital arrest" DOES NOT EXIST under Indian law.',
      'Police and courts never conduct arrests or interrogations via Skype or WhatsApp video.',
      'Never transfer money to "RBI verification escrow accounts". Hang up and call 1930.',
    ],
  },
  {
    icon: '📦',
    title: 'Postal & Courier Customs Fee Bait',
    threat: 'Medium',
    description:
      'Messages pretending to be India Post or BlueDart claim your shipment is held due to an incomplete house number. You are asked to pay a tiny fee (₹10–₹25) on a phishing website.',
    example:
      '"India Post: Your package is held at depot due to incomplete address. Update address and pay ₹25 fee at http://indiapost-update.xyz"',
    protection: [
      'Official India Post domains end strictly in .gov.in (epostoffice.gov.in, indiapost.gov.in).',
      'Never pay redelivery charges through SMS links.',
      'Track parcels directly on official courier portals.',
    ],
  },
  {
    icon: '💻',
    title: 'Work-from-Home & Video Like Traps',
    threat: 'High',
    description:
      'Offers high daily income (₹3,000–₹8,000) for liking YouTube videos or writing reviews. After giving small payouts (₹150), they lure you into Telegram VIP groups demanding large prepaid deposits.',
    example:
      '"Part-time job offer! Earn ₹5,000 daily by liking YouTube videos. Join our official Telegram group."',
    protection: [
      'No genuine company pays thousands per day for clicking likes.',
      'Any job that asks you to pay money upfront to receive tasks is 100% fraud.',
      'Block and report the Telegram or WhatsApp recruiter.',
    ],
  },
];

export default function LearnPage() {
  const [activeTab, setActiveTab] = useState<'guides' | 'quiz'>('guides');

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
            <Link href="/learn" className="text-primary underline transition">
              Learn & Quiz
            </Link>
            <Link href="/stats" className="text-muted-foreground hover:text-foreground transition">
              Live Stats
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 sm:py-12 w-full space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            Learn Scam Defense
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Understand how digital fraudsters manipulate urgency, fear, and greed. Master the red
            flags and test your skills with our interactive quiz.
          </p>

          {/* Tab Selector */}
          <div className="inline-flex p-1 rounded-xl bg-muted border mt-4">
            <button
              onClick={() => setActiveTab('guides')}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition ${
                activeTab === 'guides'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              📚 Scam Guide Hub
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition ${
                activeTab === 'quiz'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              🎯 10-Question Quiz
            </button>
          </div>
        </div>

        {activeTab === 'quiz' ? (
          <Quiz />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SCAM_GUIDES.map((guide, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm space-y-4 hover:border-primary/40 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl">{guide.icon}</span>
                    <div>
                      <h3 className="font-bold text-base text-foreground">{guide.title}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300">
                        Threat: {guide.threat}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">{guide.description}</p>

                {/* Example SMS */}
                <div className="p-3 rounded-lg bg-muted/60 border text-xs font-mono text-foreground leading-relaxed select-all">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                    Realistic Scam Example:
                  </span>
                  {guide.example}
                </div>

                {/* Protection steps */}
                <div className="pt-2 border-t space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-primary tracking-wider block">
                    🛡️ How to Protect Yourself:
                  </span>
                  <ul className="space-y-1 text-xs text-foreground/90">
                    {guide.protection.map((step, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-1.5">
                        <span className="text-primary font-bold">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/20 py-6 text-center text-xs text-muted-foreground">
        <div className="max-w-5xl mx-auto px-4 space-y-1">
          <p>
            Emergency Cyber Helpline: <strong className="text-foreground">1930</strong> | National
            Reporting:{' '}
            <a href="https://cybercrime.gov.in" className="underline text-primary">
              cybercrime.gov.in
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
