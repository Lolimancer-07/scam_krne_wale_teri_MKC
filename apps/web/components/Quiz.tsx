'use client';

import React, { useState } from 'react';
import {
  AlertOctagonIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  AwardIcon,
  RotateCcwIcon,
  ArrowRightIcon,
} from './Icons';

interface QuizQuestion {
  id: number;
  scenario: string;
  isScam: boolean;
  category: string;
  explanation: string;
  redFlags: string[];
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    scenario:
      'SMS from "AD-SBIINB": "Dear Customer, your SBI account KYC expires today. Verify immediately via http://sbi-kyc-update.xyz to avoid permanent account block."',
    isScam: true,
    category: 'Bank / KYC Scam',
    explanation:
      'Scammers use fake urgent KYC deadlines and spoofed links (.xyz domain) to steal your NetBanking login credentials. Banks never send links for KYC updates via SMS.',
    redFlags: ['Urgency (expires today)', 'Threat of account block', 'Lookalike .xyz domain'],
  },
  {
    id: 2,
    scenario:
      'SMS from "VM-HDFCBK": "849201 is your OTP for NetBanking login at 10:45 AM. Valid for 10 mins. Do NOT share this OTP with anyone, including bank employees."',
    isScam: false,
    category: 'Legitimate Bank Alert',
    explanation:
      'This is an authentic transaction verification OTP initiated by the user. Notice the standard defensive warning explicitly advising you NEVER to disclose the OTP to anyone.',
    redFlags: ['Includes explicit warning: Do NOT share OTP', 'Standard 6-character sender ID'],
  },
  {
    id: 3,
    scenario:
      'WhatsApp message from unknown number: "Dear Consumer, your electricity connection will be cut tonight at 9:30 PM because previous bill was not updated. Call electricity officer at 9876543210 immediately."',
    isScam: true,
    category: 'Electricity / Utility Bill Scam',
    explanation:
      'Electricity boards NEVER send cut-off notices from personal 10-digit mobile numbers or give a same-day 9:30 PM deadline. Real disconnections require formal postal notices.',
    redFlags: [
      'Personal 10-digit phone number',
      'Same-day 9:30 PM disconnection panic',
      'Sent from unverified sender',
    ],
  },
  {
    id: 4,
    scenario:
      'SMS from "Amazon": "Your order #402-182910 is out for delivery today with associate Ramesh (Phone: 9876501234). Share delivery PIN 4821 only upon receiving the parcel."',
    isScam: false,
    category: 'Legitimate E-commerce Delivery',
    explanation:
      'Legitimate delivery notifications include your specific order number, associate details, and instruct you to provide the delivery PIN only when the parcel is physically handed to you.',
    redFlags: ['References specific order ID', 'PIN is provided to verify receipt, not payment'],
  },
  {
    id: 5,
    scenario:
      'Telegram message: "Work from home opportunity! Earn ₹3,000 to ₹8,000 daily by simply liking YouTube videos. No experience required. Join our VIP prepaid task group now: https://t.co/taskjob"',
    isScam: true,
    category: 'Part-Time Job / Task Scam',
    explanation:
      'Classic task scam. They pay ₹150 for the first few likes to gain your trust, then demand ₹5,000–₹50,000 for "prepaid investment tasks" where your money is permanently trapped.',
    redFlags: [
      'Unrealistic income for trivial tasks',
      'Telegram recruitment',
      'Shortened URL redirect',
    ],
  },
  {
    id: 6,
    scenario:
      'SMS: "Your flight 6E-204 from Delhi to Bengaluru departs on time at 14:15. Check-in online on official IndiGo website: https://goindigo.in"',
    isScam: false,
    category: 'Legitimate Flight Confirmation',
    explanation:
      'Official flight update directing the user to the verified corporate domain (goindigo.in) with correct flight information and no panic or payment demands.',
    redFlags: [
      'Official brand domain with SSL',
      'Standard flight advisory without payment demands',
    ],
  },
  {
    id: 7,
    scenario:
      'WhatsApp Video Call: An officer in police uniform claims: "An FIR and Supreme Court digital arrest warrant has been issued against you for customs drug seizure in Mumbai. You must remain on video camera for digital detention."',
    isScam: true,
    category: 'Digital Arrest / Police Extortion',
    explanation:
      'Indian law enforcement agencies (Police, CBI, ED, Customs) NEVER conduct "digital arrests" or court proceedings via WhatsApp or Skype. This is an extortion tactic designed to panic you into transferring funds.',
    redFlags: [
      '"Digital arrest" does not exist under Indian law',
      'Interrogation demanded via video call',
      'Intimidation to transfer money to "clear name"',
    ],
  },
  {
    id: 8,
    scenario:
      'SMS from "SBI-UPI": "Your credit card bill of Rs 4,250 for card ending in 8192 is due on 05-Dec-2024. Pay conveniently via SBI Card Mobile App or NetBanking."',
    isScam: false,
    category: 'Legitimate Billing Reminder',
    explanation:
      'Authentic bank statement notification referencing masked card digits (8192), realistic due dates, and instructing the user to pay through official apps without suspicious third-party links.',
    redFlags: ['Mentions masked digits only', 'Guides to official app, not third-party links'],
  },
  {
    id: 9,
    scenario:
      'SMS from "India Post": "Your shipment #IN892182 is stopped at customs because house number is missing. Pay ₹25 redelivery charge to reschedule: http://indiapost-delivery.top"',
    isScam: true,
    category: 'Courier / Redelivery Scam',
    explanation:
      'India Post parcels are tracked exclusively on indiapost.gov.in. Scammers use fake ₹25 charges to steal card numbers, CVVs, and NetBanking passwords on phishing portals (.top TLD).',
    redFlags: [
      'Fake nominal fee bait (₹25)',
      'Phishing .top TLD instead of .gov.in',
      'Address incomplete panic',
    ],
  },
  {
    id: 10,
    scenario:
      'SMS from Apollo Clinic: "Appointment reminder: Consultation with Dr. Mehta tomorrow at 11:30 AM at Indiranagar clinic. To reschedule, call 080-25252525."',
    isScam: false,
    category: 'Legitimate Health Reminder',
    explanation:
      'Standard clinical appointment reminder with verified local landline number and no payment requests.',
    redFlags: ['Legitimate clinic landline', 'No demands for sensitive data or payment links'],
  },
];

export function Quiz() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQ = QUIZ_QUESTIONS[currentIndex];

  const handleAnswer = (answerIsScam: boolean) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answerIsScam);

    if (answerIsScam === currentQ.isScam) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizFinished(false);
  };

  if (quizFinished) {
    const percentage = Math.round((score / QUIZ_QUESTIONS.length) * 100);
    const badge =
      percentage >= 80
        ? {
            title: 'Cyber Guardian',
            color: 'text-emerald-400',
            desc: 'Outstanding! You can accurately spot fake Indian scams and distinguish authentic alerts.',
          }
        : percentage >= 50
          ? {
              title: 'Scam Vigilant',
              color: 'text-amber-400',
              desc: 'Good effort! Review the red flag breakdown below to catch evasive phishing campaigns.',
            }
          : {
              title: 'High Vulnerability',
              color: 'text-rose-400',
              desc: 'Be very careful! Review the Learn guide to protect yourself from fake KYC and digital arrest scams.',
            };

    return (
      <div className="w-full max-w-2xl mx-auto p-6 sm:p-8 rounded-2xl border border-indigo-500/20 bg-[#031427]/80 backdrop-blur-md text-center space-y-6 shadow-xl animate-in fade-in-50">
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 w-fit mx-auto text-indigo-400">
          <AwardIcon className="w-12 h-12" />
        </div>
        <div>
          <h2 className={`text-2xl font-black ${badge.color} font-mono`}>{badge.title}</h2>
          <p className="text-sm text-slate-300 mt-1">{badge.desc}</p>
        </div>

        <div className="p-6 rounded-xl bg-[#000814]/80 border border-white/10">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-bold font-mono">
            Your Final Score
          </span>
          <div className="text-5xl font-black text-white mt-1 font-mono">
            {score}{' '}
            <span className="text-xl text-slate-500 font-bold">/ {QUIZ_QUESTIONS.length}</span>
          </div>
          <span className="text-xs font-semibold text-indigo-400 mt-1 inline-block font-mono">
            ({percentage}% Accuracy)
          </span>
        </div>

        <button
          onClick={handleRestart}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm transition shadow-lg shadow-indigo-600/30 border border-indigo-400/20 flex items-center gap-2 mx-auto cursor-pointer"
        >
          <RotateCcwIcon className="w-4 h-4" />
          <span>Retake Quiz</span>
        </button>
      </div>
    );
  }

  const isAnswered = selectedAnswer !== null;
  const isCorrect = isAnswered && selectedAnswer === currentQ.isScam;

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl border border-indigo-500/20 bg-[#031427]/80 backdrop-blur-md p-6 sm:p-8 shadow-xl space-y-6">
      {/* Progress & Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono block">
            Spot the Scam Quiz
          </span>
          <h3 className="text-sm font-semibold text-slate-300 font-mono">
            Question {currentIndex + 1} of {QUIZ_QUESTIONS.length}
          </h3>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-bold uppercase font-mono block">
            Current Score
          </span>
          <div className="text-lg font-black text-white font-mono">
            {score}{' '}
            <span className="text-xs text-slate-500">/ {currentIndex + (isAnswered ? 1 : 0)}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#000814] h-2 rounded-full overflow-hidden border border-white/10">
        <div
          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
        />
      </div>

      {/* Scenario Box */}
      <div className="p-5 rounded-xl bg-[#000814]/90 border border-white/10 text-slate-200 font-mono text-sm leading-relaxed whitespace-pre-wrap select-all">
        {currentQ.scenario}
      </div>

      {/* Action Buttons */}
      {!isAnswered ? (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleAnswer(true)}
            className="p-4 rounded-xl border-2 border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold text-sm transition flex flex-col items-center gap-2 shadow-md shadow-rose-950/20 group cursor-pointer"
          >
            <AlertOctagonIcon className="w-6 h-6 group-hover:scale-110 transition" />
            <span className="font-mono">It&apos;s a SCAM</span>
          </button>

          <button
            onClick={() => handleAnswer(false)}
            className="p-4 rounded-xl border-2 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold text-sm transition flex flex-col items-center gap-2 shadow-md shadow-emerald-950/20 group cursor-pointer"
          >
            <ShieldCheckIcon className="w-6 h-6 group-hover:scale-110 transition" />
            <span className="font-mono">It&apos;s LEGITIMATE</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in-50">
          {/* Result banner */}
          <div
            className={`p-4 rounded-xl border text-sm font-semibold flex items-center gap-3 ${
              isCorrect
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-200'
            }`}
          >
            {isCorrect ? (
              <CheckCircleIcon className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <XCircleIcon className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <div>
              <div className="font-bold font-mono">
                {isCorrect ? 'Correct!' : 'Incorrect!'} This is{' '}
                {currentQ.isScam ? 'a SCAM' : 'LEGITIMATE'}.
              </div>
              <div className="text-xs font-normal mt-0.5 text-slate-300 font-mono">
                {currentQ.category}
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="p-4 rounded-xl bg-[#000814]/80 border border-white/10 text-xs leading-relaxed space-y-2">
            <p className="font-medium text-slate-200">{currentQ.explanation}</p>
            <div>
              <span className="font-bold uppercase tracking-wider text-slate-400 font-mono block mb-1">
                Key Indicators:
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                {currentQ.redFlags.map((flag, idx) => (
                  <li key={idx}>{flag}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm transition shadow-lg shadow-indigo-600/30 border border-indigo-400/20 flex items-center gap-1.5 cursor-pointer"
            >
              <span>
                {currentIndex + 1 === QUIZ_QUESTIONS.length
                  ? 'View Final Results'
                  : 'Next Question'}
              </span>
              {currentIndex + 1 < QUIZ_QUESTIONS.length && <ArrowRightIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
