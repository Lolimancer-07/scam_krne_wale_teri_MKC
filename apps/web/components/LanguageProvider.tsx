'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export type Lang = 'en' | 'hi';

const STORAGE_KEY = 'scamshield-lang';

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggle: () => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
  toggle: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    const stored =
      typeof window !== 'undefined' ? (localStorage.getItem(STORAGE_KEY) as Lang | null) : null;
    if (stored === 'en' || stored === 'hi') {
      setLang(stored);
    }
    document.documentElement.lang = lang;
  }, [lang]);

  const setLangAndPersist = (next: Lang) => {
    setLang(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage unavailable (private mode) — language simply won't persist.
    }
  };

  const toggle = () => setLangAndPersist(lang === 'en' ? 'hi' : 'en');

  return (
    <LanguageContext.Provider value={{ lang, setLang: setLangAndPersist, toggle }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
