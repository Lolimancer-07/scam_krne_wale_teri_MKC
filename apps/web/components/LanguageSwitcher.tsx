'use client';

import React from 'react';
import { useLanguage } from './LanguageProvider';
import { GlobeIcon } from './Icons';

export function LanguageSwitcher() {
  const { lang, toggle } = useLanguage();

  return (
    <button
      onClick={toggle}
      aria-pressed={lang === 'hi'}
      aria-label={lang === 'hi' ? 'Switch language to English' : 'हिंदी में बदलें'}
      title={lang === 'hi' ? 'Switch language to English' : 'हिंदी में बदलें'}
      className="px-2.5 py-1.5 rounded-lg border border-indigo-500/20 text-xs font-semibold bg-[#031427]/80 hover:bg-indigo-500/10 text-slate-300 hover:text-white transition flex items-center gap-1.5 shadow-sm"
    >
      <GlobeIcon className="w-3.5 h-3.5 text-indigo-400" />
      <span className="font-mono">{lang === 'hi' ? 'English' : 'हिंदी'}</span>
    </button>
  );
}
