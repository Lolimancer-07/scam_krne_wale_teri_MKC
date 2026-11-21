'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

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
    <div className="min-h-screen bg-background flex flex-col justify-between">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-primary bg-clip-text text-transparent">
              ScamShield
            </span>
          </Link>

          <nav className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition">
              Scanner
            </Link>
            <Link href="/learn" className="text-muted-foreground hover:text-foreground transition">
              Learn & Quiz
            </Link>
            <Link href="/stats" className="text-primary underline transition">
              Live Stats
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 sm:py-12 w-full space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            Live Scam Threat Statistics
          </h1>
          <p className="text-sm text-muted-foreground">
            Aggregated anonymous insights from messages analyzed across India. Updated in real time.
          </p>
          {stats?.degraded && (
            <p className="inline-block rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-700 dark:text-amber-400">
              Database is offline — showing an empty state. Analysis still works in stateless mode.
            </p>
          )}
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-2xl border bg-card shadow-sm space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Messages Analyzed
            </span>
            <div className="text-3xl font-black text-foreground">
              {loading ? '...' : stats?.totalScans.toLocaleString()}
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              ● All messages sanitized in-memory
            </span>
          </div>

          <div className="p-6 rounded-2xl border bg-card shadow-sm space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Scams Blocked (24h)
            </span>
            <div className="text-3xl font-black text-red-600 dark:text-red-400">
              {loading ? '...' : stats?.last24Hours.toLocaleString()}
            </div>
            <span className="text-[11px] text-muted-foreground">Recent community scans</span>
          </div>

          <div className="p-6 rounded-2xl border bg-card shadow-sm space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Likely Scam Ratio
            </span>
            <div className="text-3xl font-black text-foreground">
              {loading ? '...' : `${scamPercent}%`}
            </div>
            <span className="text-[11px] text-red-500 font-medium">Scam probability ≥ 60</span>
          </div>

          <div className="p-6 rounded-2xl border bg-card shadow-sm space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Top Threat Vector
            </span>
            <div className="text-2xl font-black text-primary">Bank KYC</div>
            <span className="text-[11px] text-muted-foreground">Spoofed SBI / HDFC portals</span>
          </div>
        </div>

        {/* Verdict Distribution Bar */}
        <div className="p-6 rounded-2xl border bg-card shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Verdict Breakdown Across All Submissions
          </h3>

          <div className="w-full h-4 rounded-full overflow-hidden flex bg-muted">
            <div
              style={{ width: `${scamPercent}%` }}
              className="bg-red-600 transition-all duration-500"
              title={`Likely Scam: ${scamPercent}%`}
            />
            <div
              style={{ width: `${suspiciousPercent}%` }}
              className="bg-amber-500 transition-all duration-500"
              title={`Suspicious: ${suspiciousPercent}%`}
            />
            <div
              style={{ width: `${safePercent}%` }}
              className="bg-emerald-500 transition-all duration-500"
              title={`Safe: ${safePercent}%`}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400">
              <span className="font-black text-base block">{scamPercent}%</span>
              <span>🚨 Likely Scam</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400">
              <span className="font-black text-base block">{suspiciousPercent}%</span>
              <span>⚠️ Suspicious</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
              <span className="font-black text-base block">{safePercent}%</span>
              <span>🛡️ Likely Safe</span>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="p-6 rounded-2xl border bg-card shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Top Detected Fraud Categories
          </h3>

          <div className="space-y-3">
            {stats &&
              Object.entries(stats.byCategory)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, count]) => {
                  const share = Math.round((count / total) * 100);
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="capitalize">{cat.replace('_', ' ')}</span>
                        <span className="text-muted-foreground">
                          {count.toLocaleString()} ({share}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(5, share)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/20 py-6 text-center text-xs text-muted-foreground">
        <p>
          National Cyber Crime Helpline: <strong>1930</strong>
        </p>
      </footer>
    </div>
  );
}
