'use client';

import React, { useState } from 'react';
import { analyzeText } from '@scamshield/detector';
import { createWorker } from 'tesseract.js';
import { DetectionResultData } from './ResultCard';
import {
  FileTextIcon,
  CameraIcon,
  LinkIcon,
  ShieldCheckIcon,
  SearchIcon,
  AlertTriangleIcon,
} from './Icons';
import { DetectionResult } from '@scamshield/detector';

interface AnalyzerFormProps {
  onAnalyzeSuccess: (data: DetectionResultData, text: string) => void;
  lang?: 'en' | 'hi';
  initialText?: string;
}

const SAMPLE_MESSAGES = [
  {
    label: 'SBI KYC Expiry',
    text: 'Dear Customer, your SBI KYC expires today, verify via http://sbi-kyc-update.xyz or account will be blocked',
  },
  {
    label: 'Electricity Disconnection',
    text: 'Dear Consumer, your electricity power will be disconnected tonight at 9:30 PM due to unpaid bill. Contact electricity officer at 9876543210 immediately.',
  },
  {
    label: 'Telegram Task Scam',
    text: 'Work from home opportunity! Earn Rs 3,000 to Rs 8,000 daily by liking YouTube videos. Join our Telegram group now: https://t.co/fakejob',
  },
  {
    label: 'Digital Arrest Notice',
    text: 'Supreme Court of India e-Challan notice: An FIR and digital arrest warrant has been issued against you. Join Skype interrogation immediately.',
  },
  {
    label: 'Legitimate Bank Alert',
    text: 'Your SBI a/c ending 4589 is debited for Rs 500.00 on 21-Nov-24 by UPI/P2A/Ref 432109876543. Avail balance: Rs 24,150.20.',
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
          ? 'कृपया जांच के लिए कोई संदेश दर्ज करें या ऊपर एक उदाहरण चुनें।'
          : 'Please enter or paste a message to analyze, or click one of the realistic samples above.',
      );
      return;
    }

    setLoading(true);
    setLoadingStep(isHindi ? 'संकेतों का विश्लेषण जारी है...' : 'Analyzing fraud signals...');
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

  return (
    <div className="w-full max-w-3xl rounded-2xl border border-indigo-500/20 bg-[#031427]/80 backdrop-blur-md p-6 sm:p-7 shadow-xl shadow-indigo-950/30 space-y-5">
      {/* Tab Switcher */}
      <div className="flex border-b border-indigo-500/15 pb-3 gap-2" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'text'}
          onClick={() => {
            setActiveTab('text');
            setErrorMessage(null);
          }}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 flex items-center gap-2 cursor-pointer ${
            activeTab === 'text'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20 border border-indigo-400/30'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <FileTextIcon className="w-4 h-4" />
          <span>{isHindi ? 'संदेश पेस्ट करें' : 'Paste Message'}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'image'}
          onClick={() => {
            setActiveTab('image');
            setErrorMessage(null);
          }}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 flex items-center gap-2 cursor-pointer ${
            activeTab === 'image'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20 border border-indigo-400/30'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <CameraIcon className="w-4 h-4" />
          <span>{isHindi ? 'स्क्रीनशॉट (OCR)' : 'Screenshot (OCR)'}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'url'}
          onClick={() => {
            setActiveTab('url');
            setErrorMessage(null);
          }}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 flex items-center gap-2 cursor-pointer ${
            activeTab === 'url'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20 border border-indigo-400/30'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          <span>{isHindi ? 'सीधा लिंक' : 'Check URL'}</span>
        </button>
      </div>

      {/* Privacy Notice Banner */}
      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/[0.08] border border-amber-500/20 text-xs text-amber-200 font-medium">
        <ShieldCheckIcon className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong className="text-amber-300">
            {isHindi ? 'गोपनीयता सुरक्षा:' : 'Privacy Guarantee:'}
          </strong>{' '}
          {isHindi
            ? 'हम कच्चे संदेशों को कभी संग्रहीत नहीं करते। कभी भी पासवर्ड या वास्तविक ओटीपी पेस्ट न करें।'
            : 'Raw messages are evaluated in-memory and never stored by default. Never paste passwords or active OTPs.'}
        </span>
      </div>

      {/* Tab 1: Text Analysis */}
      {activeTab === 'text' && (
        <form onSubmit={handleTextSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              maxLength={5000}
              rows={5}
              placeholder={
                isHindi
                  ? "संदिग्ध एसएमएस, व्हाट्सएप संदेश या ईमेल यहां पेस्ट करें... (उदा. 'प्रिय ग्राहक, आपका एसबीआई केवाईसी समाप्त हो गया है...')"
                  : "Paste suspicious SMS, WhatsApp message, email excerpt, or URL here... (e.g. 'Dear customer, your SBI KYC expires today...')"
              }
              className="w-full rounded-xl border border-white/10 bg-[#000814]/80 px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 resize-y font-mono leading-relaxed text-slate-100 placeholder:text-slate-500 transition"
            />
            <div className="flex justify-between items-center px-1 mt-1 text-xs text-slate-400">
              <span className="text-[11px] text-slate-400">
                Supports English, Hindi (हिंदी), and Hinglish
              </span>
              <span className="font-mono text-[11px] text-indigo-300">
                {text.length.toLocaleString()} / 5,000
              </span>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-2 font-mono uppercase tracking-wider">
              {isHindi ? 'यथार्थवादी उदाहरण आज़माएं:' : 'Try a Realistic Indian Scam Sample:'}
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_MESSAGES.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setText(s.text);
                    setErrorMessage(null);
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-indigo-500/15 hover:border-indigo-500/30 text-slate-300 hover:text-white transition cursor-pointer"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2.5 text-xs text-slate-400 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={storeRaw}
              onChange={(e) => setStoreRaw(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
            />
            <span>
              {isHindi
                ? 'साइबर अनुसंधान के लिए अनाम नमूना दान करें (ओटीपी और फोन नंबर स्वतः हटा दिए जाते हैं)'
                : 'Donate anonymized sample to improve open scam defense (all phone numbers and OTPs are auto-redacted)'}
            </span>
          </label>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 font-medium flex items-center gap-2 animate-in fade-in-50">
              <AlertTriangleIcon className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 border border-indigo-400/20 glow-indigo cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin inline-block" />
                  <span>{loadingStep || (isHindi ? 'विश्लेषण जारी है...' : 'Analyzing...')}</span>
                </>
              ) : (
                <>
                  <SearchIcon className="w-4 h-4" />
                  <span>{isHindi ? 'संदेश की जांच करें' : 'Analyze Message'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Screenshot OCR */}
      {activeTab === 'image' && (
        <form onSubmit={handleImageSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-indigo-500/20 rounded-2xl p-6 text-center hover:border-indigo-500/40 transition bg-[#000814]/50">
            {imagePreview ? (
              <div className="space-y-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Screenshot preview"
                  className="max-h-60 mx-auto rounded-lg shadow-sm border border-white/10"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold underline cursor-pointer"
                >
                  {isHindi ? 'चित्र हटाएं' : 'Remove Image'}
                </button>
              </div>
            ) : (
              <label className="cursor-pointer space-y-2 block">
                <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 w-fit mx-auto text-indigo-400">
                  <CameraIcon className="w-8 h-8" />
                </div>
                <span className="font-bold text-sm block text-white">
                  {isHindi
                    ? 'स्क्रीनशॉट चुनें या यहां खींचें'
                    : 'Select or Drag & Drop SMS / WhatsApp Screenshot'}
                </span>
                <span className="text-xs text-slate-400 block">
                  PNG, JPG, or WebP up to 5MB. Powered by Tesseract.js (English + Hindi)
                </span>
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
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 font-medium flex items-center gap-2 animate-in fade-in-50">
              <AlertTriangleIcon className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 border border-indigo-400/20 glow-indigo cursor-pointer"
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
        <form onSubmit={handleUrlSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5 font-mono uppercase tracking-wider">
              {isHindi ? 'जांच के लिए वेबसाइट लिंक दर्ज करें:' : 'Enter Suspicious Website Link:'}
            </label>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="e.g. http://sbi-kyc-update.xyz or http://192.168.1.100/pay"
              className="w-full rounded-xl border border-white/10 bg-[#000814]/80 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 font-mono text-slate-100 placeholder:text-slate-500"
            />
            <span className="text-[11px] text-slate-400 block mt-1">
              Checks against Indian brand allowlist (SBI, HDFC, ICICI, Paytm, PhonePe, India Post,
              etc.), homographs, and risky TLDs.
            </span>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 font-medium flex items-center gap-2 animate-in fade-in-50">
              <AlertTriangleIcon className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 border border-indigo-400/20 glow-indigo cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin inline-block" />
                  <span>{loadingStep || (isHindi ? 'जांच जारी है...' : 'Verifying...')}</span>
                </>
              ) : (
                <>
                  <LinkIcon className="w-4 h-4" />
                  <span>{isHindi ? 'लिंक की जांच करें' : 'Verify URL'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
