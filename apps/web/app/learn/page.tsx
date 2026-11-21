'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Quiz } from '@/components/Quiz';
import { useLanguage } from '@/components/LanguageProvider';
import {
  BuildingIcon,
  ZapIcon,
  QrCodeIcon,
  ScaleIcon,
  PackageIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  BookOpenIcon,
  TargetIcon,
  SearchIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
} from '@/components/Icons';

const SCAM_GUIDES = [
  {
    code: 'VEC_01',
    icon: BuildingIcon,
    title: 'Bank KYC & PAN Suspension',
    threat: 'Critical Severity',
    threatColor: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    description:
      'Impersonates public/private Indian banks (SBI, HDFC, PNB) claiming your account, debit card, or netbanking will be suspended within 24 hours unless you click an external link to update KYC/PAN.',
    example:
      'Dear Customer, your SBI YONO account will be blocked today. Please click http://sbi-kyc-update.xyz to verify your PAN card immediately.',
    protection: [
      'Banks never ask you to update KYC or enter netbanking passwords via SMS links.',
      'Always check the sender ID: official bank SMS headers follow the format VM-SBIINB or AD-HDFCBK.',
      'Check account status exclusively through official mobile banking apps or official netbanking URLs.',
    ],
  },
  {
    code: 'VEC_02',
    icon: ZapIcon,
    title: 'Electricity Power Cutoff Threat',
    threat: 'High Threat',
    threatColor: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    description:
      'Pans victims with an emergency power disconnection notice scheduled for tonight at 9:30 PM due to an unpaid bill. Prompts calling an "officer" phone number.',
    example:
      'Dear Consumer, your electricity power will be disconnected tonight at 9:30 PM due to unpaid bill. Call electricity officer at 9876543210 immediately.',
    protection: [
      'State electricity boards (BSES, DHBVN, BESCOM, MSEDCL) send bill updates via official registered SMS headers.',
      'Official discoms never provide personal 10-digit mobile numbers for bill settlement.',
      'Pay bills only through the official utility portal, official electricity board app, or authorized BBPS apps.',
    ],
  },
  {
    code: 'VEC_03',
    icon: QrCodeIcon,
    title: 'UPI Reverse Charge & QR Scam',
    threat: 'Critical Severity',
    threatColor: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    description:
      'Fraudster pretends to buy an item on OLX or send advance payment, sends a QR code or UPI collect request claiming: "Scan this QR code or enter your UPI PIN to receive money."',
    example:
      'Scan this QR code on Google Pay / PhonePe and enter your 4-digit PIN to receive ₹15,000 advance payment for your sofa.',
    protection: [
      'GOLDEN RULE: You NEVER enter your UPI PIN to RECEIVE money.',
      'Scanning a QR code always DEBITS funds from your account, never credits it.',
      'Decline all collect requests on Google Pay, PhonePe, and Paytm from unknown parties.',
    ],
  },
  {
    code: 'VEC_04',
    icon: ScaleIcon,
    title: 'Digital Arrest & Law Enforcement Spoofing',
    threat: 'Severe Threat',
    threatColor: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    description:
      'Impersonates CBI, Mumbai Police, Narcotics Control Bureau (NCB), or FedEx. Claims a courier parcel with illegal drugs was sent in your name and demands Skype video isolation.',
    example:
      'Supreme Court & CBI Cyber Cell: An FIR and non-bailable digital arrest warrant is issued on your Aadhaar for suspicious drugs parcel. Join Skype interrogation room.',
    protection: [
      'There is NO legal concept of "digital arrest" under the Indian Penal Code or Code of Criminal Procedure.',
      'Police, CBI, and Customs never interrogate citizens or demand fund verification transfers over Skype or WhatsApp video.',
      'Immediately disconnect and report the incident to the National Cyber Crime Helpline: 1930.',
    ],
  },
  {
    code: 'VEC_05',
    icon: PackageIcon,
    title: 'India Post & Courier Failed Delivery',
    threat: 'Moderate Severity',
    threatColor: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    description:
      'Claims your parcel cannot be delivered due to an incorrect address or a pending ₹10 redelivery fee. Directs you to a phishing domain designed to steal credit card details.',
    example:
      'India Post: Your package cannot be delivered due to incomplete address. Update your address within 24 hours at http://indiapost-parcel-delivery.com or it will be returned.',
    protection: [
      'Official India Post domain is indiapost.gov.in — never trust .com, .top, or .xyz domains.',
      'Postal authorities do not request online redelivery fees via shortened SMS links.',
      'Track parcels directly on official courier tracking portals.',
    ],
  },
  {
    code: 'VEC_06',
    icon: BriefcaseIcon,
    title: 'Work-from-Home & Task Traps',
    threat: 'High Threat',
    threatColor: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    description:
      'Lures victims with high daily income (₹3,000–₹8,000) for liking YouTube videos or Google reviews. Small initial payouts are followed by demands for large prepaid deposits.',
    example:
      'Part-time job offer! Earn ₹5,000 daily by liking YouTube videos. Join our official Telegram group.',
    protection: [
      'No genuine organization pays thousands daily for clicking social media likes.',
      'Any job requiring you to pay money upfront to receive tasks is guaranteed fraud.',
      'Block and report the Telegram channel or recruiter number immediately.',
    ],
  },
];

export default function LearnPage() {
  const [activeTab, setActiveTab] = useState<'guides' | 'quiz'>('guides');
  const { lang } = useLanguage();
  const isHindi = lang === 'hi';

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0f131c] text-slate-100">
      <Navbar />

      <main className="w-full flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {/* Header & Telemetry Overview */}
        <section className="relative w-full overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/[0.08] pb-8">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.04] rounded-lg border border-white/[0.08]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-xs text-emerald-400 uppercase tracking-widest font-semibold">
                  TRAINING_MODULE_02 // CERT-IN ALIGNED
                </span>
              </div>
              <h1 className="font-headline text-3xl sm:text-5xl font-black text-white tracking-tight">
                {isHindi ? 'धोखाधड़ी से बचाव सीखें' : 'Learn Scam Defense'}
              </h1>
              <p className="font-body text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                {isHindi
                  ? 'जानें कि डिजिटल जालसाज तात्कालिकता, डर और लालच का कैसे फायदा उठाते हैं। भारतीय खतरों के लाल झंडे पहचानें और क्विज से अपनी परीक्षा लें।'
                  : 'Understand how digital fraudsters manipulate urgency, fear, and greed. Master red flags across Indian vectors and test your reflexes.'}
              </p>
            </div>

            {/* Readiness Telemetry Widget */}
            <div className="flex items-center gap-4 bg-[#181b25] p-4 rounded-2xl border border-white/[0.08] shadow-xl">
              <div className="relative w-14 h-14 flex items-center justify-center">
                <svg className="w-14 h-14 -rotate-90 text-emerald-500" viewBox="0 0 36 36">
                  <path
                    className="text-white/[0.08]"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="100, 100"
                    strokeLinecap="round"
                    strokeWidth="3"
                  />
                </svg>
                <span className="absolute font-mono text-xs text-white font-bold">06</span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-slate-400 uppercase">
                  Active Threat Vectors
                </span>
                <span className="font-headline font-bold text-sm text-white">
                  6 Core Defense Modules
                </span>
                <span className="font-mono text-[11px] text-emerald-400">HELPLINE: 1930 READY</span>
              </div>
            </div>
          </div>

          {/* Dual Tab Switcher */}
          <div className="mt-8 flex flex-wrap items-center gap-2 bg-[#181b25] p-1.5 rounded-xl border border-white/[0.08] w-fit shadow-sm">
            <button
              id="tab-guide"
              type="button"
              onClick={() => setActiveTab('guides')}
              className={`px-5 py-2.5 rounded-lg font-mono text-xs uppercase tracking-wider font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'guides'
                  ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.35)] font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <BookOpenIcon className="w-4 h-4" />
              <span>{isHindi ? 'गाइड संग्रह' : 'Scam Guide Hub'}</span>
            </button>

            <button
              id="tab-quiz"
              type="button"
              onClick={() => setActiveTab('quiz')}
              className={`px-5 py-2.5 rounded-lg font-mono text-xs uppercase tracking-wider font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'quiz'
                  ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.35)] font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <TargetIcon className="w-4 h-4" />
              <span>{isHindi ? '10-प्रश्नों की क्विज' : '10-Question Quiz'}</span>
            </button>
          </div>
        </section>

        {/* Dynamic Display: Guides Grid or 10-Question Quiz */}
        {activeTab === 'guides' ? (
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {SCAM_GUIDES.map((guide) => {
              const IconComp = guide.icon;
              return (
                <article
                  key={guide.code}
                  className="flex flex-col justify-between bg-[#181b25] rounded-2xl p-6 border border-white/[0.08] shadow-xl hover:border-emerald-500/40 transition-all space-y-4"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                          <IconComp className="w-5 h-5 text-emerald-400" />
                        </div>
                        <span className="font-mono text-xs text-slate-400 font-bold">
                          {guide.code}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-lg font-mono text-[10px] font-bold uppercase ${guide.threatColor}`}
                      >
                        {guide.threat}
                      </span>
                    </div>

                    <h2 className="font-headline font-bold text-lg text-white">{guide.title}</h2>
                    <p className="font-body text-xs text-slate-400 leading-relaxed">
                      {guide.description}
                    </p>

                    <div className="bg-[#0f131c] p-3.5 rounded-xl border border-white/[0.06] space-y-1">
                      <span className="font-mono text-[10px] text-rose-400 uppercase font-bold block">
                        Intercepted Bait Pattern
                      </span>
                      <p className="font-mono text-xs text-slate-200 leading-relaxed">
                        &quot;{guide.example}&quot;
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/[0.08] space-y-2">
                    <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-wider block font-bold">
                      Protection Checklist
                    </span>
                    <ul className="space-y-1.5 font-body text-xs text-slate-300">
                      {guide.protection.map((item, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2">
                          <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="pt-2">
                      <a
                        href={`/?text=${encodeURIComponent(guide.example)}`}
                        className="w-full px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 hover:text-white font-mono text-xs rounded-xl border border-emerald-500/30 transition flex items-center justify-center gap-1.5 font-semibold group cursor-pointer"
                      >
                        <SearchIcon className="w-3.5 h-3.5 text-emerald-400" />
                        <span>
                          {isHindi ? 'स्कैनर में इस पैटर्न की जांच करें' : 'Analyze Pattern in Scanner'}
                        </span>
                        <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <Quiz />
        )}
      </main>

      {/* Sovereign Footer */}
      <footer className="w-full bg-[#0a0e17] border-t border-white/[0.08] mt-12 py-8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
            <span>CERT-In &amp; NCRP Aligned Defense Knowledgebase</span>
          </div>
          <span>Emergency Cybercrime Helpline: 1930</span>
        </div>
      </footer>
    </div>
  );
}
