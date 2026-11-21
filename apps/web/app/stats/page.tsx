'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useLanguage } from '@/components/LanguageProvider';

interface StatsData {
  totalScans: number;
  last24Hours: number;
  byVerdict: {
    likely_scam: number;
    suspicious: number;
    safe: number;
  };
  byCategory: Record<string, number>;
  degraded?: boolean;
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/stats')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setStats(json.data);
        }
      })
      .catch(() => {
        // Database unavailable: show a truthful empty state, not invented data.
        setStats({
          totalScans: 0,
          last24Hours: 0,
          byVerdict: { likely_scam: 0, suspicious: 0, safe: 0 },
          byCategory: {},
          degraded: true,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const total = stats?.totalScans || 1;
  const scamPercent = stats ? Math.round((stats.byVerdict.likely_scam / total) * 100) : 0;
  const suspiciousPercent = stats ? Math.round((stats.byVerdict.suspicious / total) * 100) : 0;
  const safePercent = stats ? Math.round((stats.byVerdict.safe / total) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-indigo-500/15 bg-[#000f21]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-lg shadow-sm">
              🛡️
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
              ScamShield
            </span>
          </Link>

          <nav className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/" className="text-slate-400 hover:text-white transition">
              Scanner
            </Link>
            <Link href="/learn" className="text-slate-400 hover:text-white transition">
              Learn & Quiz
            </Link>
            <Link
              href="/stats"
              className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-medium transition"
            >
              Live Stats
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 sm:py-12 w-full space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-xs text-indigo-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono text-[11px]">Real-Time Anonymous Telemetry</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Live Scam Threat Statistics
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Aggregated anonymous insights from messages analyzed across India. Updated in real time.
          </p>
          {stats?.degraded && (
            <p className="inline-block rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-medium text-amber-300 font-mono">
              Database is offline — showing an empty state. Analysis still works in stateless mode.
            </p>
          )}
        </div>

        {/* Top Metric Cards - Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#031427]/80 backdrop-blur-md shadow-xl space-y-2 hover:border-indigo-500/30 transition">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Total Messages Analyzed
            </span>
            <div className="text-3xl font-black text-white font-mono">
              {loading ? '...' : stats?.totalScans.toLocaleString()}
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold font-mono flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
              All messages sanitized in-memory
            </span>
          </div>

          <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#031427]/80 backdrop-blur-md shadow-xl space-y-2 hover:border-indigo-500/30 transition">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Scans Analyzed (24h)
            </span>
            <div className="text-3xl font-black text-rose-400 font-mono">
              {loading ? '...' : stats?.last24Hours.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Recent community scans</span>
          </div>

          <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#031427]/80 backdrop-blur-md shadow-xl space-y-2 hover:border-indigo-500/30 transition">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Likely Scam Ratio
            </span>
            <div className="text-3xl font-black text-white font-mono">
              {loading ? '...' : `${scamPercent}%`}
            </div>
            <span className="text-[11px] text-rose-400 font-mono">Scam probability ≥ 60</span>
          </div>

          <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#031427]/80 backdrop-blur-md shadow-xl space-y-2 hover:border-indigo-500/30 transition">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Top Threat Vector
            </span>
            <div className="text-2xl font-black text-indigo-400 font-mono">
              {stats && Object.keys(stats.byCategory).length > 0
                ? (Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1])[0][0] ?? 'bank_kyc')
                    .replace('_', ' ')
                    .toLowerCase()
                : 'bank_kyc'}
            </div>
            <span className="text-[11px] text-slate-400">Spoofed SBI / HDFC portals</span>
          </div>
        </div>

        {/* Verdict Distribution Bar */}
        <div className="p-6 rounded-2xl border border-indigo-500/20 bg-[#031427]/80 backdrop-blur-md shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              Verdict Breakdown Across All Submissions
            </h3>
            <span className="text-[11px] text-indigo-400 font-mono">Global Telemetry</span>
          </div>

          <div className="w-full h-4 rounded-full overflow-hidden flex bg-[#000814] border border-white/10">
            <div
              style={{ width: `${scamPercent}%` }}
              className="bg-gradient-to-r from-rose-600 to-red-500 transition-all duration-500"
              title={`Likely Scam: ${scamPercent}%`}
            />
            <div
              style={{ width: `${suspiciousPercent}%` }}
              className="bg-gradient-to-r from-amber-600 to-amber-500 transition-all duration-500"
              title={`Suspicious: ${suspiciousPercent}%`}
            />
            <div
              style={{ width: `${safePercent}%` }}
              className="bg-gradient-to-r from-emerald-600 to-teal-500 transition-all duration-500"
              title={`Safe: ${safePercent}%`}
            />
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
              <span className="font-black text-lg block font-mono text-white">{scamPercent}%</span>
              <span className="font-mono text-[11px]">🚨 Likely Scam</span>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
              <span className="font-black text-lg block font-mono text-white">
                {suspiciousPercent}%
              </span>
              <span className="font-mono text-[11px]">⚠️ Suspicious</span>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
              <span className="font-black text-lg block font-mono text-white">{safePercent}%</span>
              <span className="font-mono text-[11px]">🛡️ Safe</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-indigo-500/10 bg-[#000f21]/60 py-6 text-center text-xs text-slate-500">
        <p>
          ScamShield Telemetry — Anonymous threat intelligence · Cyber Helpline:{' '}
          <strong className="text-slate-300 font-mono">1930</strong>
        </p>
      </footer>
    </div>
  );
}
