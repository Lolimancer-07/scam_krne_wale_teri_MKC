'use client';

import React from 'react';
import { useLanguage } from './LanguageProvider';

export function LanguageSwitcher() {
  const { lang, setLang, toggle } = useLanguage();

  return (
    <button
      onClick={toggle}
      aria-pressed={lang === 'hi'}
      aria-label={lang === 'hi' ? 'Switch language to English' : 'Switch language to Hindi'}
      title={lang === 'hi' ? 'Switch language to English' : 'Switch language to Hindi'}
      className="px-2.5 py-1 rounded-md border text-xs font-bold bg-muted hover:bg-muted/80 text-foreground transition"
    >
      {lang === 'hi' ? 'English 🌐' : 'हिंदी 🇮🇳'}
    </button>
  );
}
