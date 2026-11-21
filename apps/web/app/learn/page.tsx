'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Quiz } from '@/components/Quiz';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useLanguage } from '@/components/LanguageProvider';

const SCAM_GUIDES = [
  {
    icon: '🏦',
    title: 'Bank & KYC Expiry Scams',
    threat: 'High',
    threatColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
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
    threatColor: 'bg-rose-600/30 text-rose-200 border-rose-500/50',
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
    threatColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
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
    threatColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
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
    threatColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
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
    threatColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
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
    <div className="min-h-screen flex flex-col justify-between selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-indigo-500/15 bg-[#000f21]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-lg shadow-sm">
              🛡️
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
              ScamShield
            </span>
          </Link>

          <nav className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/" className="text-slate-400 hover:text-white transition">
              Scanner
            </Link>
            <Link
              href="/learn"
              className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-medium transition"
            >
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
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 sm:py-12 w-full space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-xs text-indigo-300">
            <span className="font-mono text-[11px]">Digital Fraud Defense Curriculum</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Learn Scam Defense
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Understand how digital fraudsters manipulate urgency, fear, and greed. Master the red
            flags and test your skills with our interactive quiz.
          </p>

          {/* Tab Selector */}
          <div className="inline-flex p-1 rounded-xl bg-[#031427]/90 border border-indigo-500/20 mt-4 backdrop-blur-md">
            <button
              onClick={() => setActiveTab('guides')}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                activeTab === 'guides'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📚 Scam Guide Hub
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                activeTab === 'quiz'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🎯 10-Question Quiz
            </button>
          </div>
        </div>

        {/* Guides View */}
        {activeTab === 'guides' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {SCAM_GUIDES.map((guide, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/[0.08] bg-[#031427]/70 backdrop-blur-md p-6 shadow-xl space-y-4 hover:border-indigo-500/30 transition duration-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{guide.icon}</span>
                    <h3 className="text-base font-bold text-white font-mono">{guide.title}</h3>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono border ${guide.threatColor}`}
                  >
                    {guide.threat} Threat
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {guide.description}
                </p>

                <div className="p-3.5 rounded-xl bg-[#000814]/80 border border-white/10 font-mono text-xs text-rose-300 leading-relaxed">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">
                    Realistic Scam Example:
                  </span>
                  {guide.example}
                </div>

                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold font-mono block mb-1">
                    Defense Checklist:
                  </span>
                  {guide.protection.map((item, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="text-emerald-400 font-bold shrink-0">✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Quiz />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-indigo-500/10 bg-[#000f21]/60 py-6 text-center text-xs text-slate-500">
        <p>
          ScamShield Educational Portal — Emergency Cyber Crime Helpline:{' '}
          <strong className="text-slate-300 font-mono">1930</strong>
        </p>
      </footer>
    </div>
  );
}
