import React from 'react';
import {
  BuildingIcon,
  KeyIcon,
  QrCodeIcon,
  PackageIcon,
  ScaleIcon,
  AwardIcon,
  BriefcaseIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
  TargetIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  PhoneCallIcon,
} from './Icons';

interface CategoryMetadata {
  title: string;
  renderIcon: (className?: string) => React.ReactNode;
  whatTheyWant: string;
  nextSteps: string[];
}

export const CATEGORY_INFO: Record<string, CategoryMetadata> = {
  bank_kyc: {
    title: 'Bank / KYC Expiry Scam',
    renderIcon: (className = 'w-5 h-5 text-rose-400') => <BuildingIcon className={className} />,
    whatTheyWant:
      'The fraudster wants your NetBanking credentials, debit card details, or PAN/Aadhaar numbers to siphon funds out of your bank account.',
    nextSteps: [
      'Never click links in SMS claiming your bank account or KYC has expired.',
      'Banks NEVER ask you to update KYC via third-party web links or WhatsApp.',
      'Log in exclusively via your official mobile banking app (e.g. YONO SBI, HDFC Mobile, iMobile).',
      'If money was deducted, immediately call 1930 (National Cyber Crime Reporting) and inform your bank.',
    ],
  },
  otp_impersonation: {
    title: 'OTP / Credential Impersonation',
    renderIcon: (className = 'w-5 h-5 text-rose-400') => <KeyIcon className={className} />,
    whatTheyWant:
      'The scammer wants your one-time verification password (OTP) or UPI/ATM PIN to authorize an unauthorized fund transfer or hijack your WhatsApp/Telegram.',
    nextSteps: [
      'NEVER disclose an OTP to anyone, even if the caller claims to be your bank manager or customer support.',
      'Entering your UPI PIN ALWAYS debits money from your account — you NEVER need a PIN to receive cashback or payments.',
      'Block the sender and report the fraudulent number to your mobile carrier via 1909.',
    ],
  },
  upi_payment: {
    title: 'UPI / Fake Collect Request Scam',
    renderIcon: (className = 'w-5 h-5 text-emerald-400') => <QrCodeIcon className={className} />,
    whatTheyWant:
      'The scammer tricks you into scanning a QR code or approving a UPI Collect Request under the guise of sending you a payment or refund.',
    nextSteps: [
      'Remember the golden rule of UPI: Scanning a QR code or entering a PIN pays money, never receives it.',
      'Decline all unexpected collect requests in PhonePe, Google Pay, or Paytm.',
      'Report the receiver VPA (UPI ID) directly in your payment app as fraud.',
    ],
  },
  delivery_courier: {
    title: 'Postal / Courier Delivery Scam',
    renderIcon: (className = 'w-5 h-5 text-amber-400') => <PackageIcon className={className} />,
    whatTheyWant:
      'The fraudster asks for a nominal "re-delivery fee" (₹10–₹50) on a fake phishing portal to harvest your credit or debit card details.',
    nextSteps: [
      'Never pay redelivery charges through unverified links sent via SMS.',
      'Track parcels only on official tracking portals: indiapost.gov.in, bluedart.com, or delhivery.com.',
      'Legitimate delivery associates call you directly when at your address and do not demand payment links for standard packages.',
    ],
  },
  government_tax: {
    title: 'Government / Police / Digital Arrest Extortion',
    renderIcon: (className = 'w-5 h-5 text-rose-400') => <ScaleIcon className={className} />,
    whatTheyWant:
      'Extortionists threaten you with police arrest warrants, CBI/ED inquiries, customs drug seizure, or unpaid e-challans to coerce an instant money transfer.',
    nextSteps: [
      'The police, CBI, ED, and courts NEVER conduct "digital arrests" or interrogations over Skype/WhatsApp video.',
      'Do not panic or transfer money to "escrow verification accounts".',
      'File an immediate complaint on cybercrime.gov.in or report to your local police cyber cell.',
    ],
  },
  lottery_prize: {
    title: 'Lottery / Prize / Refund Bait',
    renderIcon: (className = 'w-5 h-5 text-amber-400') => <AwardIcon className={className} />,
    whatTheyWant:
      'Claims you won a massive jackpot (e.g. KBC, foreign lottery) and asks for an upfront "GST" or "processing fee" before releasing the nonexistent prize.',
    nextSteps: [
      'You cannot win a lottery or prize you never entered.',
      'Never pay advance fees to claim a gift, car, or monetary reward.',
      'Ignore, block, and delete the message.',
    ],
  },
  job_task: {
    title: 'Work-From-Home / Task Scam',
    renderIcon: (className = 'w-5 h-5 text-rose-400') => <BriefcaseIcon className={className} />,
    whatTheyWant:
      'Lures you with easy money for liking YouTube videos or writing reviews, gives a tiny payout to build trust, then demands thousands for "prepaid tasks" you can never recover.',
    nextSteps: [
      'Legitimate companies never ask employees to pay money upfront to receive tasks or salaries.',
      'Avoid joining unofficial Telegram VIP investment groups.',
      'Cut off all communication and report the Telegram channel / WhatsApp number.',
    ],
  },
  investment_crypto: {
    title: 'Guaranteed Returns / Crypto Scheme',
    renderIcon: (className = 'w-5 h-5 text-emerald-400') => (
      <TrendingUpIcon className={className} />
    ),
    whatTheyWant:
      'Promises guaranteed returns (e.g. 100%–200% profit) using fake stock market tips or automated crypto bots, then freezes your deposit.',
    nextSteps: [
      'All investments carry risk; ANY claim of "guaranteed returns with 0% risk" is guaranteed fraud.',
      'Only invest through SEBI-registered brokers and official Indian exchanges.',
      'Never deposit money into personal savings accounts for "crypto trading".',
    ],
  },
  other: {
    title: 'Suspicious / Unverified Message',
    renderIcon: (className = 'w-5 h-5 text-amber-400') => (
      <AlertTriangleIcon className={className} />
    ),
    whatTheyWant:
      'This message contains aggressive urgency, unverified links, or pressure tactics typical of social engineering campaigns.',
    nextSteps: [
      'Do not click any embedded links or call numbers provided inside the message.',
      'Independently verify any claim by contacting the organization through its publicly listed official portal.',
      'When in doubt, consult family, your bank, or dial 1930.',
    ],
  },
};

export function CategoryExplainer({ category }: { category: string }) {
  const info = CATEGORY_INFO[category] || CATEGORY_INFO.other;

  return (
    <div className="space-y-4 rounded-2xl border border-white/[0.08] bg-[#181b25] p-6 shadow-xl text-slate-100">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
          {info.renderIcon()}
        </div>
        <h3 className="font-headline text-base font-bold text-white">{info.title}</h3>
      </div>

      <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
        <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300 mb-1 flex items-center gap-1.5">
          <TargetIcon className="w-3.5 h-3.5 text-amber-400" />
          <span>What the scammer wants</span>
        </h4>
        <p className="font-body text-xs sm:text-sm text-slate-200 leading-relaxed">
          {info.whatTheyWant}
        </p>
      </div>

      <div className="space-y-2">
        <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-400" />
          <span>Recommended Action Steps</span>
        </h4>
        <ul className="space-y-2 font-body text-xs sm:text-sm text-slate-300">
          {info.nextSteps.map((step, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-3 border-t border-white/[0.08] font-mono text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <PhoneCallIcon className="w-3.5 h-3.5 text-rose-400" />
          <span>
            Emergency Helpline: <strong className="text-rose-400 font-bold">1930</strong>
          </span>
        </div>
        <span>
          National Portal:{' '}
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:underline font-semibold"
          >
            cybercrime.gov.in
          </a>
        </span>
      </div>
    </div>
  );
}
