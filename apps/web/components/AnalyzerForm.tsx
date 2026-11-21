'use client';

import React, { useState } from 'react';
import { DetectionResultData } from './ResultCard';

interface AnalyzerFormProps {
  onAnalyzeSuccess: (data: DetectionResultData, text: string) => void;
  lang?: 'en' | 'hi';
}

const SAMPLE_MESSAGES = [
  {
    label: '🏦 Fake SBI KYC Scam',
    text: 'Dear Customer, your SBI KYC expires today, verify via http://sbi-kyc-update.xyz or account will be blocked',
  },
  {
    label: '⚡ Electricity Bill Threat',
    text: 'Dear Consumer, your electricity power will be disconnected tonight at 9:30 PM due to unpaid bill. Contact electricity officer at 9876543210 immediately.',
  },
  {
    label: '💼 Part-Time Job Scam',
    text: 'Work from home opportunity! Earn Rs 3,000 to Rs 8,000 daily by liking YouTube videos. Join our Telegram group now: https://t.co/fakejob',
  },
  {
    label: '⚖️ Digital Arrest Notice',
    text: 'Supreme Court of India e-Challan notice: An FIR and digital arrest warrant has been issued against you. Join Skype interrogation immediately.',
  },
  {
    label: '✅ Legit Bank Alert',
    text: 'Your SBI a/c ending 4589 is debited for Rs 500.00 on 21-Nov-24 by UPI/P2A/Ref 432109876543. Avail balance: Rs 24,150.20.',
  },
];

export function AnalyzerForm({ onAnalyzeSuccess, lang = 'en' }: AnalyzerFormProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'url'>('text');
  const [text, setText] = useState('');
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
    if (!text.trim()) return;

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
    if (!urlInput.trim()) return;

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
    if (!imageFile) return;

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
    <div className="w-full max-w-3xl rounded-2xl border bg-card p-6 shadow-sm space-y-5">
      {/* Tab Switcher */}
      <div className="flex border-b pb-3 gap-2">
        <button
          type="button"
          onClick={() => {
            setActiveTab('text');
            setErrorMessage(null);
          }}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
            activeTab === 'text'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <span>📝</span>
          <span>{isHindi ? 'संदेश पेस्ट करें' : 'Paste Message'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('image');
            setErrorMessage(null);
          }}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
            activeTab === 'image'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <span>📷</span>
          <span>{isHindi ? 'स्क्रीनशॉट (OCR)' : 'Screenshot (OCR)'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('url');
            setErrorMessage(null);
          }}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
            activeTab === 'url'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <span>🔗</span>
          <span>{isHindi ? 'सीधा लिंक' : 'Check URL'}</span>
        </button>
      </div>

      {/* Privacy Notice Banner */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 font-medium">
        <span className="text-base">🛡️</span>
        <span>
          <strong>{isHindi ? 'गोपनीयता:' : 'Privacy Guarantee:'}</strong>{' '}
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
              onChange={(e) => setText(e.target.value)}
              maxLength={5000}
              rows={5}
              placeholder={
                isHindi
                  ? "संदिग्ध एसएमएस, व्हाट्सएप संदेश या ईमेल यहां पेस्ट करें... (उदा. 'प्रिय ग्राहक, आपका एसबीआई केवाईसी समाप्त हो गया है...')"
                  : "Paste suspicious SMS, WhatsApp message, email excerpt, or URL here... (e.g. 'Dear customer, your SBI KYC expires today...')"
              }
              className="w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-y font-sans leading-relaxed text-foreground placeholder:text-muted-foreground"
            />
            <div className="flex justify-between items-center px-1 mt-1 text-xs text-muted-foreground">
              <span>Supports English, Hindi (हिंदी), and Hinglish</span>
              <span>{text.length} / 5,000</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-muted-foreground block mb-2">
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
                  className="px-2.5 py-1 text-xs rounded-full border bg-muted/50 hover:bg-muted text-foreground transition"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={storeRaw}
              onChange={(e) => setStoreRaw(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span>
              {isHindi
                ? 'साइबर अनुसंधान के लिए अनाम नमूना दान करें (ओटीपी और फोन नंबर स्वतः हटा दिए जाते हैं)'
                : 'Donate anonymized sample to improve open scam defense (all phone numbers and OTPs are auto-redacted)'}
            </span>
          </label>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 font-medium">
              ⚠️ {errorMessage}
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <span className="animate-spin text-base">⏳</span>
                  <span>{loadingStep || (isHindi ? 'विश्लेषण जारी है...' : 'Analyzing...')}</span>
                </>
              ) : (
                <span>🔍 {isHindi ? 'संदेश की जांच करें' : 'Analyze Message'}</span>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Screenshot OCR */}
      {activeTab === 'image' && (
        <form onSubmit={handleImageSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-2xl p-6 text-center hover:border-primary/50 transition bg-muted/20">
            {imagePreview ? (
              <div className="space-y-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Screenshot preview"
                  className="max-h-60 mx-auto rounded-lg shadow-sm border"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="text-xs text-red-600 font-semibold underline"
                >
                  {isHindi ? 'चित्र हटाएं' : 'Remove Image'}
                </button>
              </div>
            ) : (
              <label className="cursor-pointer space-y-2 block">
                <span className="text-4xl block">📱</span>
                <span className="font-bold text-sm block text-foreground">
                  {isHindi
                    ? 'स्क्रीनशॉट चुनें या यहां खींचें'
                    : 'Select or Drag & Drop SMS / WhatsApp Screenshot'}
                </span>
                <span className="text-xs text-muted-foreground block">
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
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 font-medium">
              ⚠️ {errorMessage}
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading || !imageFile}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <span className="animate-spin text-base">⏳</span>
                  <span>{loadingStep || (isHindi ? 'ओसीआर चल रहा है...' : 'Running OCR...')}</span>
                </>
              ) : (
                <span>📸 {isHindi ? 'ओसीआर और जांच शुरू करें' : 'Run OCR & Analyze'}</span>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: URL Checker */}
      {activeTab === 'url' && (
        <form onSubmit={handleUrlSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
              {isHindi ? 'जांच के लिए वेबसाइट लिंक दर्ज करें:' : 'Enter Suspicious Website Link:'}
            </label>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="e.g. http://sbi-kyc-update.xyz or http://192.168.1.100/pay"
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-mono text-foreground"
            />
            <span className="text-[11px] text-muted-foreground block mt-1">
              Checks against Indian brand allowlist (SBI, HDFC, ICICI, Paytm, PhonePe, India Post,
              etc.), homographs, and risky TLDs.
            </span>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 font-medium">
              ⚠️ {errorMessage}
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading || !urlInput.trim()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <span className="animate-spin text-base">⏳</span>
                  <span>{loadingStep || (isHindi ? 'जांच जारी है...' : 'Verifying...')}</span>
                </>
              ) : (
                <span>🔗 {isHindi ? 'लिंक की जांच करें' : 'Verify URL'}</span>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
