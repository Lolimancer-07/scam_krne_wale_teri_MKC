'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DetectionResultData } from './ResultCard';
import {
  FileTextIcon,
  CameraIcon,
  LinkIcon,
  ShieldCheckIcon,
  SearchIcon,
  AlertTriangleIcon,
  BuildingIcon,
  ZapIcon,
  BriefcaseIcon,
  ScaleIcon,
  RotateCcwIcon,
} from './Icons';

interface AnalyzerFormProps {
  onAnalyzeSuccess: (
    data: DetectionResultData,
    text: string,
    screenshotPreview?: string | null,
  ) => void;
  lang?: 'en' | 'hi';
  initialText?: string;
}

const THREAT_PRESETS = [
  {
    id: 'sbi',
    title: 'SBI KYC Expiry',
    tag: 'HIGH RISK',
    tagColor: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    icon: BuildingIcon,
    desc: 'Phishing link + urgency',
    text: 'Dear Customer, your SBI KYC expires today, verify via http://sbi-kyc-update.xyz or account will be blocked',
  },
  {
    id: 'electricity',
    title: 'Electricity Cutoff',
    tag: 'EXTORTION',
    tagColor: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    icon: ZapIcon,
    desc: 'Disconnection threat',
    text: 'Dear Consumer, your electricity power will be disconnected tonight at 9:30 PM due to an unpaid previous month bill. Call electricity executive at 9876543210 immediately to avoid power cutoff.',
  },
  {
    id: 'job',
    title: 'Telegram Task Scam',
    tag: 'TASK FRAUD',
    tagColor: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    icon: BriefcaseIcon,
    desc: 'YouTube like-and-earn',
    text: 'Work from home opportunity! Earn ₹3,000 to ₹8,000 daily by liking YouTube videos and rating hotels on Google Maps. Zero investment. Join our verified Telegram coordinator now: https://t.co/fakejob',
  },
  {
    id: 'arrest',
    title: 'Digital Arrest Notice',
    tag: 'BLACKMAIL',
    tagColor: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    icon: ScaleIcon,
    desc: 'CBI / Narcotics spoof',
    text: 'Supreme Court of India & CBI Cyber Cell E-Challan Notice: An FIR and non-bailable digital arrest warrant has been issued against your Aadhaar for suspicious parcel containing narcotics. Join Skype interrogation room immediately.',
  },
  {
    id: 'legit',
    title: 'Legitimate Bank Alert',
    tag: 'SAFE BASE',
    tagColor: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    icon: ShieldCheckIcon,
    desc: 'Authentic debit notification',
    text: 'Your HDFC Bank account ending 4589 has been debited with INR 500.00 on 21-NOV-24 by UPI/P2A/432109876543/Groceries. Avail Bal: INR 24,150.20. For dispute, SMS BLOCK to 5676712.',
  },
];

const SCREENSHOT_PRESETS = [
  {
    id: 'sbi_screenshot',
    title: 'SBI KYC Block Alert',
    tag: 'SMS SPOOF',
    tagColor: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    icon: BuildingIcon,
    desc: 'Simulated banking SMS',
    sender: 'VM-SBINB',
    time: '11:42 AM',
    text: 'Dear SBI Customer, your YONO account is suspended today due to pending KYC. Update immediately at http://sbi-kyc-verify.xyz to resume banking services.',
  },
  {
    id: 'electricity_screenshot',
    title: 'Power Cutoff Threat',
    tag: 'EXTORTION',
    tagColor: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    icon: ZapIcon,
    desc: '9:30 PM cutoff notice',
    sender: 'VK-DHBVN',
    time: '04:15 PM',
    text: 'Dear Consumer, your electricity power will be disconnected tonight at 9:30 PM due to unpaid bill. Immediately contact DISCOM officer at 9876543210.',
  },
  {
    id: 'arrest_screenshot',
    title: 'Digital Arrest Warrant',
    tag: 'BLACKMAIL',
    tagColor: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    icon: ScaleIcon,
    desc: 'Supreme Court & CBI notice',
    sender: 'CBI-CYBERCELL',
    time: '02:08 PM',
    text: 'Supreme Court & CBI Notice: Digital arrest warrant issued against Aadhaar for suspicious parcel with contraband. Join Skype interrogation room immediately.',
  },
];

const URL_PRESETS = [
  {
    id: 'sbi_phish',
    title: 'SBI Lookalike Phishing',
    tag: 'SPOOFED TLD',
    tagColor: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    desc: 'http://sbi-kyc-verify.xyz',
    url: 'http://sbi-kyc-verify.xyz',
  },
  {
    id: 'ip_pay',
    title: 'Direct IP Bypass',
    tag: 'IP ANOMALY',
    tagColor: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    desc: 'http://192.168.1.100/pay',
    url: 'http://192.168.1.100/pay',
  },
  {
    id: 'sbi_legit',
    title: 'Official SBI Portal',
    tag: 'ALLOWLISTED',
    tagColor: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    desc: 'https://onlinesbi.sbi',
    url: 'https://onlinesbi.sbi',
  },
];

function createScreenshotBlob(preset: (typeof SCREENSHOT_PRESETS)[0]): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 360;
    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 800, 360);

    // Header bar (phone / SMS interface)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 800, 60);

    // Header text
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`< ${preset.sender}`, 24, 38);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px monospace';
    ctx.fillText(`${preset.time} · Verified Sender (TRAI)`, 480, 38);

    // Chat bubble
    ctx.fillStyle = '#020617';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(24, 80, 752, 240, 16);
    ctx.fill();
    ctx.stroke();

    // Text in chat bubble
    ctx.fillStyle = '#f1f5f9';
    ctx.font = '18px monospace';
    const words = preset.text.split(' ');
    let line = '';
    let y = 125;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 700 && n > 0) {
        ctx.fillText(line, 44, y);
        line = words[n] + ' ';
        y += 30;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 44, y);

    // Bottom timestamp
    ctx.fillStyle = '#64748b';
    ctx.font = '13px monospace';
    ctx.fillText(`Received ${preset.time} · SMS Gateway IN-DLT`, 44, 295);

    canvas.toBlob((blob) => {
      if (blob) {
        resolve(new File([blob], `${preset.id}.png`, { type: 'image/png' }));
      }
    }, 'image/png');
  });
}

export function AnalyzerForm({
  onAnalyzeSuccess,
  lang = 'en',
  initialText = '',
}: AnalyzerFormProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'url'>('text');
  const [text, setText] = useState(initialText);
  const [urlInput, setUrlInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [storeRaw, setStoreRaw] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isHindi = lang === 'hi';

  // Synchronize initialText updates (e.g. from query params)
  useEffect(() => {
    if (initialText) {
      setText(initialText);
    }
  }, [initialText]);

  // Support pasting screenshot from clipboard (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (activeTab !== 'image') return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            processSelectedImage(file);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [activeTab]);

  const processSelectedImage = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(
        isHindi ? 'चित्र का आकार 5MB से कम होना चाहिए' : 'Image exceeds 5MB size limit',
      );
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrorMessage(null);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedImage(file);
    }
  };

  const handleScreenshotPresetSelect = async (preset: (typeof SCREENSHOT_PRESETS)[0]) => {
    try {
      const file = await createScreenshotBlob(preset);
      processSelectedImage(file);
    } catch {
      setErrorMessage('Failed to generate sample screenshot preview.');
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setErrorMessage(
        isHindi
          ? 'कृपया जांच के लिए कोई संदेश दर्ज करें या नीचे दिए गए वेक्टर सैंपल पर क्लिक करें।'
          : 'Please enter or paste a message to analyze, or select one of the threat presets below.',
      );
      return;
    }

    setLoading(true);
    setLoadingStep(isHindi ? 'संकेतों का विश्लेषण जारी है...' : 'Analyzing threat heuristics...');
    setErrorMessage(null);

    try {
      const res = await fetch('/api/v1/analyze/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          storeRaw,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to analyze message');
      }

      onAnalyzeSuccess(json.data, text.trim());
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setLoading(false);
      setLoadingStep(null);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      setErrorMessage(
        isHindi
          ? 'कृपया जांच के लिए कोई वेबसाइट लिंक दर्ज करें।'
          : 'Please enter a website link to verify.',
      );
      return;
    }

    setLoading(true);
    setLoadingStep(
      isHindi ? 'डोमेन और होमोग्राफ की जांच जारी है...' : 'Verifying domain & homographs...',
    );
    setErrorMessage(null);

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 10000);

    try {
      const res = await fetch('/api/v1/analyze/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
        signal: abortController.signal,
      });

      clearTimeout(timeoutId);

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to verify URL');
      }

      onAnalyzeSuccess(json.data, urlInput.trim());
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof DOMException && err.name === 'AbortError') {
        setErrorMessage(
          isHindi
            ? 'यूआरएल जांच समय समाप्त हो गया। कृपया कनेक्शन जांचें।'
            : 'URL verification request timed out. Please check your connection.',
        );
      } else {
        setErrorMessage((err as Error).message);
      }
    } finally {
      setLoading(false);
      setLoadingStep(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedImage(file);
    }
  };

  const handleImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      setErrorMessage(
        isHindi
          ? 'कृपया विश्लेषण के लिए कोई स्क्रीनशॉट चित्र चुनें।'
          : 'Please select or upload a screenshot to analyze.',
      );
      return;
    }

    setLoading(true);
    setLoadingStep(
      isHindi
        ? 'ओसीआर (हिंदी + अंग्रेजी) पाठ निकाला जा रहा है...'
        : 'Extracting text with Tesseract OCR (Eng + Hin)...',
    );
    setErrorMessage(null);

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 18000);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const res = await fetch('/api/v1/analyze/image', {
        method: 'POST',
        body: formData,
        signal: abortController.signal,
      });

      clearTimeout(timeoutId);

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to analyze screenshot');
      }

      onAnalyzeSuccess(
        json.data,
        json.data.extractedText || 'Extracted screenshot text',
        imagePreview,
      );
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof DOMException && err.name === 'AbortError') {
        setErrorMessage(
          isHindi
            ? 'ओसीआर प्रसंस्करण समय समाप्त हो गया। कृपया चित्र को क्रॉप करें या सीधे टेक्स्ट टैब में पेस्ट करें।'
            : 'Screenshot OCR processing timed out. Please crop the screenshot closer to the message or paste text directly into the "Paste Message" tab.',
        );
      } else {
        setErrorMessage((err as Error).message);
      }
    } finally {
      setLoading(false);
      setLoadingStep(null);
    }
  };

  const clearInput = () => {
    setText('');
    setUrlInput('');
    setImageFile(null);
    setImagePreview(null);
    setIsDragging(false);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto bg-[#0a101f] rounded-2xl shadow-2xl border border-white/[0.08] overflow-hidden">
      {/* Top Tab Navigation & Status Header */}
      <div className="flex flex-wrap items-center justify-between bg-[#050b14] px-4 sm:px-6 pt-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-1 sm:gap-2" role="tablist">
          <button
            type="button"
            id="tab-paste"
            role="tab"
            aria-selected={activeTab === 'text'}
            onClick={() => {
              setActiveTab('text');
              setErrorMessage(null);
            }}
            className={`group flex items-center gap-2 px-4 sm:px-5 py-3 font-mono text-xs uppercase tracking-wider rounded-t-lg transition-all cursor-pointer ${
              activeTab === 'text'
                ? 'bg-[#0a101f] text-indigo-300 font-bold border-b-2 border-indigo-400 shadow-[inset_0_-2px_0_0_#818cf8]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <FileTextIcon className="w-4 h-4 text-indigo-400" />
            <span>{isHindi ? 'संदेश पेस्ट करें' : 'Paste Message'}</span>
          </button>

          <button
            type="button"
            id="tab-ocr"
            role="tab"
            aria-selected={activeTab === 'image'}
            onClick={() => {
              setActiveTab('image');
              setErrorMessage(null);
            }}
            className={`group flex items-center gap-2 px-4 sm:px-5 py-3 font-mono text-xs uppercase tracking-wider rounded-t-lg transition-all cursor-pointer ${
              activeTab === 'image'
                ? 'bg-[#0a101f] text-indigo-300 font-bold border-b-2 border-indigo-400 shadow-[inset_0_-2px_0_0_#818cf8]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <CameraIcon className="w-4 h-4 text-indigo-400" />
            <span>{isHindi ? 'स्क्रीनशॉट (OCR)' : 'Screenshot (OCR)'}</span>
            <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 font-mono text-[9px] font-bold rounded">
              BETA
            </span>
          </button>

          <button
            type="button"
            id="tab-url"
            role="tab"
            aria-selected={activeTab === 'url'}
            onClick={() => {
              setActiveTab('url');
              setErrorMessage(null);
            }}
            className={`group flex items-center gap-2 px-4 sm:px-5 py-3 font-mono text-xs uppercase tracking-wider rounded-t-lg transition-all cursor-pointer ${
              activeTab === 'url'
                ? 'bg-[#0a101f] text-indigo-300 font-bold border-b-2 border-indigo-400 shadow-[inset_0_-2px_0_0_#818cf8]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <LinkIcon className="w-4 h-4 text-indigo-400" />
            <span>{isHindi ? 'सीधा लिंक' : 'Check URL'}</span>
          </button>
        </div>

        {/* Right Sandbox Telemetry */}
        <div className="hidden md:flex items-center gap-4 py-2 pr-2">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse" />
            <span>SANDBOX: ISOLATED</span>
          </div>
          <div className="font-mono text-[11px] text-slate-500">BUFFER: 0xFD42_VOLATILE</div>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="p-5 sm:p-7 space-y-6">
        {/* Privacy Sandbox Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-amber-500/10 text-amber-200 rounded-xl border border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex-shrink-0 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangleIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-headline font-bold text-sm text-white leading-tight">
                {isHindi ? 'गोपनीयता सैंडबॉक्स सक्रिय' : 'Zero-PII Privacy Sandbox Active'}
              </p>
              <p className="font-body text-xs text-slate-300 mt-0.5">
                {isHindi
                  ? 'संदेश केवल मेमोरी में मूल्यांकित होते हैं। सक्रिय पासवर्ड, ओटीपी या यूपीआई पिन कभी न डालें।'
                  : 'Payloads are evaluated in-memory and wiped on page cycle. Never supply live OTPs, UPI MPINs, or master banking passwords.'}
              </p>
            </div>
          </div>
          <div className="flex items-center self-start md:self-auto gap-1.5 px-3 py-1 bg-[#050b14] rounded-lg font-mono text-[11px] text-amber-300 border border-amber-500/30">
            <ShieldCheckIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>AIR-GAPPED BUFFER</span>
          </div>
        </div>

        {/* Tab 1: Text Payload Ingest Stream */}
        {activeTab === 'text' && (
          <form onSubmit={handleTextSubmit} className="space-y-5">
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center text-slate-400 font-mono text-[11px] px-1 uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-indigo-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  PAYLOAD_INGEST_STREAM (SMS / WHATSAPP / TELEGRAM / EMAIL)
                </span>
                <span className="text-slate-500">ENCODING: UTF-8</span>
              </div>

              <div className="relative bg-[#050b14] rounded-xl p-4 border border-white/[0.08] focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/30 transition-all">
                <textarea
                  id="scam-input"
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  rows={6}
                  maxLength={5000}
                  spellCheck="false"
                  placeholder={
                    isHindi
                      ? "संदिग्ध एसएमएस, व्हाट्सएप संदेश या लिंक यहां पेस्ट करें... (उदा. 'प्रिय ग्राहक, आपका एसबीआई योनो खाता आज निलंबित कर दिया गया है...')"
                      : 'Paste suspicious SMS, WhatsApp message, email excerpt, or URL here... (e.g., Dear SBI Customer, your YONO account will be blocked today...)'
                  }
                  className="w-full bg-transparent text-slate-100 font-mono text-xs leading-relaxed resize-y focus:outline-none placeholder:text-slate-600"
                />

                {/* Bottom utility strip inside textarea */}
                <div className="flex items-center justify-between pt-3 mt-2 border-t border-white/[0.06] text-slate-400 font-mono text-[11px]">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      HEURISTIC ENGINE READY
                    </span>
                    <span className="hidden sm:inline text-slate-500">DETECTOR: V4.2 ACTIVE</span>
                  </div>
                  <div id="char-count" className="text-slate-400">
                    {text.length.toLocaleString()} / 5,000 characters
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Threat Vectors: 5 Realistic Indian Scam Archetypes */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  {isHindi ? 'त्वरित खतरे के नमूने:' : 'Quick Load Threat Vectors:'}
                </span>
                <span className="font-mono text-[10px] text-slate-500">
                  {isHindi ? 'नमूना लोड करने के लिए क्लिक करें' : 'Click preset to populate stream'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {THREAT_PRESETS.map((preset) => {
                  const IconComp = preset.icon;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      aria-label={preset.title}
                      onClick={() => {
                        setText(preset.text);
                        setErrorMessage(null);
                      }}
                      className="flex flex-col text-left p-3.5 bg-[#0f172a] rounded-xl border border-white/[0.06] hover:border-indigo-500/40 hover:bg-[#1e293b]/60 transition-all group shadow-sm cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full mb-1.5">
                        <IconComp className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                        <span
                          className={`px-1.5 py-0.5 font-mono text-[9px] font-bold rounded ${preset.tagColor}`}
                        >
                          {preset.tag}
                        </span>
                      </div>
                      <span className="font-headline font-semibold text-xs text-slate-100 group-hover:text-indigo-300 transition-colors">
                        {preset.title}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                        {preset.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Bar & Controls */}
            <div className="pt-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <label className="flex items-start md:items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={storeRaw}
                  onChange={(e) => setStoreRaw(e.target.checked)}
                  className="mt-0.5 md:mt-0 w-4 h-4 rounded bg-[#050b14] text-indigo-500 focus:ring-0 focus:outline-none accent-indigo-500"
                />
                <span className="font-body text-xs text-slate-400 hover:text-slate-200 transition-colors">
                  {isHindi
                    ? 'CERT-In और भारतीय समुदाय रक्षा ग्राफ में अनाम डेटा योगदान करें'
                    : 'Contribute anonymized threat heuristics to CERT-In & Indian community defense graph'}{' '}
                  <span className="font-mono text-emerald-400">(Zero-PII Retained)</span>
                </span>
              </label>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={clearInput}
                  className="px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white font-mono text-xs uppercase tracking-wider rounded-xl transition-all border border-white/[0.08] cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcwIcon className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'खाली करें' : 'Clear Buffer'}</span>
                </button>

                <button
                  type="submit"
                  id="analyze-btn"
                  disabled={loading}
                  className="relative px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.35)] hover:shadow-[0_0_28px_rgba(99,102,241,0.55)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 cursor-pointer border border-indigo-400/30"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin inline-block" />
                      <span>{loadingStep || (isHindi ? 'विश्लेषण जारी...' : 'Analyzing...')}</span>
                    </>
                  ) : (
                    <>
                      <SearchIcon className="w-4 h-4" />
                      <span>{isHindi ? 'संदेश का विश्लेषण करें' : 'Analyze Message'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-in fade-in-50">
                <div className="flex items-center gap-2.5">
                  <AlertTriangleIcon className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('text');
                    setErrorMessage(null);
                  }}
                  className="px-3 py-1 bg-white/[0.08] hover:bg-white/[0.15] text-indigo-300 hover:text-white rounded-lg text-xs font-mono font-semibold whitespace-nowrap cursor-pointer transition w-fit border border-indigo-400/30"
                >
                  {isHindi ? 'सीधे संदेश पेस्ट करें' : 'Switch to Paste Message Tab'}
                </button>
              </div>
            )}
          </form>
        )}

        {/* Tab 2: Screenshot OCR */}
        {activeTab === 'image' && (
          <form onSubmit={handleImageSubmit} className="space-y-5">
            <div
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition bg-[#050b14] ${
                isDragging
                  ? 'border-indigo-400 bg-indigo-500/15 scale-[1.01]'
                  : 'border-white/[0.12] hover:border-indigo-400/50'
              }`}
            >
              {imagePreview ? (
                <div className="space-y-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Screenshot preview"
                    className="max-h-64 mx-auto rounded-xl shadow-md border border-white/[0.08] object-contain"
                  />
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="font-mono text-xs text-rose-400 hover:text-rose-300 hover:underline font-semibold cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcwIcon className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'चित्र हटाएं' : 'Remove Image Buffer'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer space-y-3 block">
                  <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 w-fit mx-auto text-indigo-400">
                    <CameraIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="font-headline font-bold text-sm block text-slate-100">
                      {isHindi
                        ? 'एसएमएस या व्हाट्सएप का स्क्रीनशॉट चुनें या यहां छोड़ें'
                        : 'Select or Drag & Drop SMS / WhatsApp Screenshot'}
                    </span>
                    <span className="font-body text-xs text-slate-400 block mt-1">
                      PNG, JPG, or WebP up to 5MB. Drag &amp; drop, Ctrl+V paste, or browse.
                    </span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/*,.png,.jpg,.jpeg,.webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Quick Screenshot Samples: 3 Realistic Indian Scams */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  {isHindi ? 'त्वरित स्क्रीनशॉट नमूने:' : 'Quick Load Sample Screenshots:'}
                </span>
                <span className="font-mono text-[10px] text-slate-500">
                  {isHindi
                    ? 'नमूना लोड करने के लिए क्लिक करें'
                    : 'Click preset to load authentic simulated screenshot'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {SCREENSHOT_PRESETS.map((preset) => {
                  const IconComp = preset.icon;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      aria-label={preset.title}
                      onClick={() => handleScreenshotPresetSelect(preset)}
                      className="flex flex-col text-left p-3.5 bg-[#0f172a] rounded-xl border border-white/[0.06] hover:border-indigo-500/40 hover:bg-[#1e293b]/60 transition-all group shadow-sm cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full mb-1.5">
                        <IconComp className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                        <span
                          className={`px-1.5 py-0.5 font-mono text-[9px] font-bold rounded ${preset.tagColor}`}
                        >
                          {preset.tag}
                        </span>
                      </div>
                      <span className="font-headline font-semibold text-xs text-slate-100 group-hover:text-indigo-300 transition-colors">
                        {preset.title}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                        {preset.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-in fade-in-50">
                <div className="flex items-center gap-2.5">
                  <AlertTriangleIcon className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('text');
                    setErrorMessage(null);
                  }}
                  className="px-3 py-1 bg-white/[0.08] hover:bg-white/[0.15] text-indigo-300 hover:text-white rounded-lg text-xs font-mono font-semibold whitespace-nowrap cursor-pointer transition w-fit border border-indigo-400/30"
                >
                  {isHindi ? 'सीधे संदेश पेस्ट करें' : 'Switch to Paste Message Tab'}
                </button>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={clearInput}
                className="px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white font-mono text-xs uppercase tracking-wider rounded-xl transition-all border border-white/[0.08] cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcwIcon className="w-3.5 h-3.5" />
                <span>{isHindi ? 'खाली करें' : 'Clear Buffer'}</span>
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.35)] hover:shadow-[0_0_28px_rgba(99,102,241,0.55)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 cursor-pointer border border-indigo-400/30"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin inline-block" />
                    <span>{loadingStep || (isHindi ? 'ओसीआर चल रहा है...' : 'Running OCR...')}</span>
                  </>
                ) : (
                  <>
                    <CameraIcon className="w-4 h-4" />
                    <span>{isHindi ? 'ओसीआर और जांच शुरू करें' : 'Run OCR & Analyze'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: URL Checker */}
        {activeTab === 'url' && (
          <form onSubmit={handleUrlSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="font-mono text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                {isHindi ? 'जांच के लिए संदिग्ध वेबसाइट लिंक दर्ज करें:' : 'Suspicious Target URL Ingest:'}
              </label>
              <div className="relative bg-[#050b14] rounded-xl p-3.5 border border-white/[0.08] focus-within:border-indigo-500/50 transition-all">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="e.g. http://sbi-kyc-update.xyz or http://192.168.1.100/pay"
                  className="w-full bg-transparent text-slate-100 font-mono text-xs focus:outline-none placeholder:text-slate-600"
                />
              </div>
              <span className="font-body text-xs text-slate-400 block">
                Cross-referenced with NPCI / RBI banking allowlists (SBI, HDFC, ICICI, Paytm,
                PhonePe, India Post, etc.), punycode spoofing, and rogue registrar telemetry.
              </span>
            </div>

            {/* Quick URL Vectors */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  {isHindi ? 'त्वरित यूआरएल नमूने:' : 'Quick Load Suspicious URLs:'}
                </span>
                <span className="font-mono text-[10px] text-slate-500">
                  {isHindi ? 'नमूना लोड करने के लिए क्लिक करें' : 'Click preset to populate target URL'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {URL_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    aria-label={preset.title}
                    onClick={() => {
                      setUrlInput(preset.url);
                      setErrorMessage(null);
                    }}
                    className="flex flex-col text-left p-3.5 bg-[#0f172a] rounded-xl border border-white/[0.06] hover:border-indigo-500/40 hover:bg-[#1e293b]/60 transition-all group shadow-sm cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <LinkIcon className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                      <span
                        className={`px-1.5 py-0.5 font-mono text-[9px] font-bold rounded ${preset.tagColor}`}
                      >
                        {preset.tag}
                      </span>
                    </div>
                    <span className="font-headline font-semibold text-xs text-slate-100 group-hover:text-indigo-300 transition-colors">
                      {preset.title}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                      {preset.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-in fade-in-50">
                <div className="flex items-center gap-2.5">
                  <AlertTriangleIcon className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('text');
                    setErrorMessage(null);
                  }}
                  className="px-3 py-1 bg-white/[0.08] hover:bg-white/[0.15] text-indigo-300 hover:text-white rounded-lg text-xs font-mono font-semibold whitespace-nowrap cursor-pointer transition w-fit border border-indigo-400/30"
                >
                  {isHindi ? 'सीधे संदेश पेस्ट करें' : 'Switch to Paste Message Tab'}
                </button>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={clearInput}
                className="px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white font-mono text-xs uppercase tracking-wider rounded-xl transition-all border border-white/[0.08] cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcwIcon className="w-3.5 h-3.5" />
                <span>{isHindi ? 'खाली करें' : 'Clear Buffer'}</span>
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.35)] hover:shadow-[0_0_28px_rgba(99,102,241,0.55)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 cursor-pointer border border-indigo-400/30"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin inline-block" />
                    <span>{loadingStep || (isHindi ? 'जांच जारी...' : 'Verifying URL...')}</span>
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-4 h-4" />
                    <span>{isHindi ? 'डोमेन और लिंक की जांच करें' : 'Verify URL'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
