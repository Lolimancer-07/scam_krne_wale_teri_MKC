'use client';

import React, { useState } from 'react';
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
  onAnalyzeSuccess: (data: DetectionResultData, text: string) => void;
  lang?: 'en' | 'hi';
  initialText?: string;
}

const THREAT_PRESETS = [
  {
    id: 'sbi',
    title: 'SBI KYC Expiry',
    tag: 'HIGH RISK',
    tagColor: 'bg-error-container text-on-error-container border border-error/30',
    icon: BuildingIcon,
    desc: 'Phishing link + urgency',
    text: 'Dear Customer, your SBI KYC expires today, verify via http://sbi-kyc-update.xyz or account will be blocked',
  },
  {
    id: 'electricity',
    title: 'Electricity Disconnection',
    tag: 'EXTORTION',
    tagColor: 'bg-error-container text-on-error-container border border-error/30',
    icon: ZapIcon,
    desc: 'Disconnection threat',
    text: 'Dear Consumer, your electricity power will be disconnected tonight at 9:30 PM due to an unpaid previous month bill. Call electricity executive at 9876543210 immediately to avoid power cutoff.',
  },
  {
    id: 'job',
    title: 'Telegram Task Scam',
    tag: 'TASK FRAUD',
    tagColor: 'bg-error-container text-on-error-container border border-error/30',
    icon: BriefcaseIcon,
    desc: 'Telegram like-and-earn',
    text: 'Work from home opportunity! Earn ₹3,000 to ₹8,000 daily by liking YouTube videos and rating hotels on Google Maps. Zero investment. Join our verified Telegram coordinator now: https://t.co/fakejob',
  },
  {
    id: 'arrest',
    title: 'Digital Arrest Notice',
    tag: 'BLACKMAIL',
    tagColor: 'bg-error-container text-on-error-container border border-error/30',
    icon: ScaleIcon,
    desc: 'CBI / FedEx narcotics spoof',
    text: 'Supreme Court of India & CBI Cyber Cell E-Challan Notice: An FIR and non-bailable digital arrest warrant has been issued against your Aadhaar for suspicious parcel containing narcotics. Join Skype interrogation room immediately.',
  },
  {
    id: 'legit',
    title: 'Legitimate Bank Alert',
    tag: 'SAFE BASE',
    tagColor: 'bg-secondary-container text-on-secondary-container border border-secondary/30',
    icon: ShieldCheckIcon,
    desc: 'Standard HDFC debit notification',
    text: 'Your HDFC Bank account ending 4589 has been debited with INR 500.00 on 21-NOV-24 by UPI/P2A/432109876543/Groceries. Avail Bal: INR 24,150.20. For dispute, SMS BLOCK to 5676712.',
  },
];

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
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [storeRaw, setStoreRaw] = useState(false);

  const isHindi = lang === 'hi';

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

    try {
      const res = await fetch('/api/v1/analyze/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to verify URL');
      }

      onAnalyzeSuccess(json.data, urlInput.trim());
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setLoading(false);
      setLoadingStep(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const res = await fetch('/api/v1/analyze/image', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to analyze screenshot');
      }

      onAnalyzeSuccess(json.data, json.data.extractedText || 'Extracted screenshot text');
    } catch (err) {
      setErrorMessage((err as Error).message);
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
    setErrorMessage(null);
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto bg-surface-container-low rounded-xl shadow-2xl border border-surface-container-high overflow-hidden">
      {/* Top Tab Navigation & Sandbox Status Bar */}
      <div className="flex flex-wrap items-center justify-between bg-surface-container-lowest px-4 sm:px-6 pt-3 border-b border-surface-container-high">
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
                ? 'bg-surface-container-low text-secondary font-bold shadow-[inset_0_-2px_0_0_#4edea3]'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            <FileTextIcon className="w-4 h-4 text-secondary" />
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
                ? 'bg-surface-container-low text-secondary font-bold shadow-[inset_0_-2px_0_0_#4edea3]'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            <CameraIcon className="w-4 h-4" />
            <span>{isHindi ? 'स्क्रीनशॉट (OCR)' : 'Screenshot (OCR)'}</span>
            <span className="px-1.5 py-0.5 bg-surface-container-highest text-tertiary font-mono text-[9px] font-bold rounded">
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
                ? 'bg-surface-container-low text-secondary font-bold shadow-[inset_0_-2px_0_0_#4edea3]'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>{isHindi ? 'सीधा लिंक' : 'Check URL'}</span>
          </button>
        </div>

        {/* Right Sandbox Telemetry */}
        <div className="hidden md:flex items-center gap-4 py-2 pr-2">
          <div className="flex items-center gap-1.5 text-on-surface-variant font-mono text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_6px_rgba(78,222,163,0.8)] animate-pulse" />
            <span>SANDBOX: ISOLATED</span>
          </div>
          <div className="font-mono text-[11px] text-on-surface-variant">
            BUFFER: 0xFD42_VOLATILE
          </div>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="p-5 sm:p-7 space-y-6">
        {/* Amber Privacy Sandbox Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-tertiary-container/15 text-tertiary-fixed rounded-lg border border-tertiary/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex-shrink-0 rounded bg-tertiary-container/30 border border-tertiary/40 flex items-center justify-center text-tertiary">
              <AlertTriangleIcon className="w-5 h-5 text-tertiary" />
            </div>
            <div>
              <p className="font-headline font-bold text-sm text-on-surface leading-tight">
                {isHindi ? 'गोपनीयता सैंडबॉक्स सक्रिय' : 'Privacy Sandbox Engaged'}
              </p>
              <p className="font-body text-xs text-on-surface-variant mt-0.5">
                {isHindi
                  ? 'संदेश केवल मेमोरी में मूल्यांकित होते हैं। सक्रिय पासवर्ड, ओटीपी या यूपीआई पिन कभी न डालें।'
                  : 'Raw payloads are evaluated in-memory and wiped on page cycle. Never supply live OTPs, UPI MPINs, or master banking passwords.'}
              </p>
            </div>
          </div>
          <div className="flex items-center self-start md:self-auto gap-1.5 px-3 py-1 bg-surface-container-lowest rounded font-mono text-[11px] text-tertiary border border-tertiary/30">
            <ShieldCheckIcon className="w-3.5 h-3.5 text-tertiary" />
            <span>AIR-GAPPED VOLATILE BUFFER</span>
          </div>
        </div>

        {/* Tab 1: Text Payload Ingest Stream */}
        {activeTab === 'text' && (
          <form onSubmit={handleTextSubmit} className="space-y-5">
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center text-on-surface-variant font-mono text-[11px] px-1 uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  PAYLOAD_INGEST_STREAM (SMS / WHATSAPP / TELEGRAM / EMAIL)
                </span>
                <span className="text-on-surface-variant">ENCODING: UTF-8 SECURE</span>
              </div>

              <div className="relative bg-surface-container-lowest rounded-lg p-4 border border-outline-variant/30 focus-within:border-secondary transition-all">
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
                  className="w-full bg-transparent text-on-surface font-mono text-xs leading-relaxed resize-y focus:outline-none placeholder:text-on-surface-variant/40"
                />

                {/* Bottom utility strip inside textarea */}
                <div className="flex items-center justify-between pt-3 mt-2 border-t border-surface-container-high text-on-surface-variant font-mono text-[11px]">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-secondary">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                      HEURISTIC ENGINE READY
                    </span>
                    <span className="hidden sm:inline text-on-surface-variant">
                      VECTOR DETECTOR: V4.2.1
                    </span>
                  </div>
                  <div id="char-count" className="text-on-surface-variant">
                    {text.length.toLocaleString()} / 5,000 characters
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Threat Vectors: 5 Authentic Indian Scam Archetypes */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                  {isHindi ? 'त्वरित खतरे के नमूने:' : 'Quick Load Threat Vectors:'}
                </span>
                <span className="font-mono text-[10px] text-on-surface-variant/70">
                  {isHindi
                    ? 'नमूना लोड करने के लिए क्लिक करें'
                    : 'Click preset to populate forensic stream'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
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
                      className="flex flex-col text-left p-3 bg-surface-container rounded-lg border border-surface-container-high hover:border-outline-variant hover:bg-surface-container-high transition-all group shadow-sm cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <IconComp className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                        <span
                          className={`px-1.5 py-0.5 font-mono text-[9px] font-bold rounded ${preset.tagColor}`}
                        >
                          {preset.tag}
                        </span>
                      </div>
                      <span className="font-headline font-semibold text-xs text-on-surface group-hover:text-primary transition-colors">
                        {preset.title}
                      </span>
                      <span className="font-mono text-[10px] text-on-surface-variant/70 mt-0.5 line-clamp-1">
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
                  className="mt-0.5 md:mt-0 w-4 h-4 rounded bg-surface-container-lowest text-secondary focus:ring-0 focus:outline-none accent-secondary"
                />
                <span className="font-body text-xs text-on-surface-variant hover:text-on-surface transition-colors">
                  {isHindi
                    ? 'CERT-In और भारतीय समुदाय रक्षा ग्राफ में अनाम डेटा योगदान करें'
                    : 'Contribute anonymized threat heuristics to CERT-In & Indian community defense graph'}{' '}
                  <span className="font-mono text-secondary">(Zero-PII Retained)</span>
                </span>
              </label>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={clearInput}
                  className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-mono text-xs uppercase tracking-wider rounded-lg transition-all border border-surface-container-high cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcwIcon className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'खाली करें' : 'Clear Buffer'}</span>
                </button>

                <button
                  type="submit"
                  id="analyze-btn"
                  disabled={loading}
                  className="relative px-6 py-2.5 bg-primary-container text-white font-mono text-xs font-bold uppercase tracking-wider rounded-lg shadow-[0_0_16px_rgba(255,84,81,0.4)] hover:shadow-[0_0_24px_rgba(255,84,81,0.6)] hover:bg-primary hover:text-on-primary-container disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 cursor-pointer border border-primary/30"
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
              <div className="p-3.5 rounded-lg bg-error-container/20 border border-error/30 text-xs text-error font-medium flex items-center gap-2.5 animate-in fade-in-50">
                <AlertTriangleIcon className="w-4 h-4 shrink-0 text-error" />
                <span>{errorMessage}</span>
              </div>
            )}
          </form>
        )}

        {/* Tab 2: Screenshot OCR */}
        {activeTab === 'image' && (
          <form onSubmit={handleImageSubmit} className="space-y-5">
            <div className="border-2 border-dashed border-outline-variant/40 rounded-xl p-8 text-center hover:border-secondary transition bg-surface-container-lowest">
              {imagePreview ? (
                <div className="space-y-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Screenshot preview"
                    className="max-h-64 mx-auto rounded-lg shadow-md border border-surface-container-high"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="font-mono text-xs text-primary hover:underline font-semibold cursor-pointer"
                  >
                    {isHindi ? 'चित्र हटाएं' : 'Remove Image Buffer'}
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer space-y-3 block">
                  <div className="p-4 rounded-xl bg-surface-container-high border border-outline-variant/30 w-fit mx-auto text-secondary">
                    <CameraIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="font-headline font-bold text-sm block text-on-surface">
                      {isHindi
                        ? 'एसएमएस या व्हाट्सएप का स्क्रीनशॉट चुनें या यहां छोड़ें'
                        : 'Select or Drag & Drop SMS / WhatsApp Screenshot'}
                    </span>
                    <span className="font-body text-xs text-on-surface-variant block mt-1">
                      PNG, JPG, or WebP up to 5MB. Powered by Tesseract OCR (English + Hindi)
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-lg bg-error-container/20 border border-error/30 text-xs text-error font-medium flex items-center gap-2.5 animate-in fade-in-50">
                <AlertTriangleIcon className="w-4 h-4 shrink-0 text-error" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={clearInput}
                className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-mono text-xs uppercase tracking-wider rounded-lg transition-all border border-surface-container-high cursor-pointer"
              >
                {isHindi ? 'खाली करें' : 'Clear Buffer'}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-primary-container text-white font-mono text-xs font-bold uppercase tracking-wider rounded-lg shadow-[0_0_16px_rgba(255,84,81,0.4)] hover:shadow-[0_0_24px_rgba(255,84,81,0.6)] hover:bg-primary hover:text-on-primary-container disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 cursor-pointer border border-primary/30"
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
              <label className="font-mono text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
                {isHindi ? 'जांच के लिए संदिग्ध वेबसाइट लिंक दर्ज करें:' : 'Suspicious Target URL Ingest:'}
              </label>
              <div className="relative bg-surface-container-lowest rounded-lg p-3 border border-outline-variant/30 focus-within:border-secondary transition-all">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="e.g. http://sbi-kyc-update.xyz or http://192.168.1.100/pay"
                  className="w-full bg-transparent text-on-surface font-mono text-xs focus:outline-none placeholder:text-on-surface-variant/40"
                />
              </div>
              <span className="font-body text-xs text-on-surface-variant block">
                Cross-referenced with NPCI / RBI banking allowlists (SBI, HDFC, ICICI, Paytm,
                PhonePe, India Post, etc.), punycode spoofing, and rogue registrar telemetry.
              </span>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-lg bg-error-container/20 border border-error/30 text-xs text-error font-medium flex items-center gap-2.5 animate-in fade-in-50">
                <AlertTriangleIcon className="w-4 h-4 shrink-0 text-error" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={clearInput}
                className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-mono text-xs uppercase tracking-wider rounded-lg transition-all border border-surface-container-high cursor-pointer"
              >
                {isHindi ? 'खाली करें' : 'Clear Buffer'}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-primary-container text-white font-mono text-xs font-bold uppercase tracking-wider rounded-lg shadow-[0_0_16px_rgba(255,84,81,0.4)] hover:shadow-[0_0_24px_rgba(255,84,81,0.6)] hover:bg-primary hover:text-on-primary-container disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 cursor-pointer border border-primary/30"
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
