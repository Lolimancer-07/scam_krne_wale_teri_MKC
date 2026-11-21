'use client';

import React, { useEffect, useState } from 'react';
import { SunIcon, MoonIcon } from './Icons';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'scamshield-theme';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'dark';
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    setTheme(getInitialTheme());
  }, []);

  const applyTheme = (next: Theme) => {
    setTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  return (
    <button
      onClick={() => applyTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to obsidian dark theme'}
      title={theme === 'dark' ? 'Switch to light theme' : 'Switch to obsidian dark theme'}
      className="p-1.5 rounded-lg border border-emerald-500/20 text-slate-400 hover:text-white bg-[#181b25]/80 hover:bg-emerald-500/10 transition flex items-center justify-center shadow-sm"
    >
      {theme === 'dark' ? (
        <SunIcon className="w-4 h-4 text-amber-300" />
      ) : (
        <MoonIcon className="w-4 h-4 text-emerald-300" />
      )}
    </button>
  );
}
