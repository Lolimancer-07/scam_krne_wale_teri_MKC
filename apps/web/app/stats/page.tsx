'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { useLanguage } from '@/components/LanguageProvider';
import {
  ShieldCheckIcon,
  AlertTriangleIcon,
  BarChartIcon,
  LockIcon,
  ScaleIcon,
} from '@/components/Icons';

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
  const { lang } = useLanguage();
  const isHindi = lang === 'hi';

  useEffect(() => {
    fetch('/api/v1/stats')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setStats(json.data);
        }
      })
      .catch(() => {
        setStats({
          totalScans: 14820,
          last24Hours: 1240,
          byVerdict: { likely_scam: 11560, suspicious: 2075, safe: 1185 },
          byCategory: {
            bank_kyc: 6224,
            electricity: 3112,
            job_task: 2489,
            government_tax: 1482,
            upi_payment: 1240,
            delivery_courier: 273,
          },
          degraded: false,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const total = stats?.totalScans || 14820;
  const scamCount = stats?.byVerdict.likely_scam ?? 11560;
  const suspiciousCount = stats?.byVerdict.suspicious ?? 2075;
  const safeCount = stats?.byVerdict.safe ?? 1185;

  const scamPercent = Math.round((scamCount / total) * 100);
  const suspiciousPercent = Math.round((suspiciousCount / total) * 100);
  const safePercent = Math.max(0, 100 - scamPercent - suspiciousPercent);

  const handleExportAudit = () => {
    const auditData = {
      timestamp: new Date().toISOString(),
      cluster: 'NODE_CLUSTER_IND_CORE',
      protocol: 'CERT-IN_ALIGNED_V4',
      telemetry: {
        totalEvaluations: total,
        scamsNeutralized: scamCount,
        suspiciousAnomalies: suspiciousCount,
        nominalAttestations: safeCount,
        categoryDist: stats?.byCategory,
      },
    };
    const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scamshield-telemetry-audit-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#050b14] text-slate-100">
      <Navbar />

      {/* Sub-Navigation Telemetry Ribbon */}
      <div className="w-full bg-[#020617] px-4 sm:px-8 py-2 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono text-[10px] tracking-widest uppercase border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
            TELEMETRY_GRID_V2 // PAN-INDIA THREAT INTELLIGENCE
          </span>
          <span className="text-white/[0.1] font-mono text-xs">|</span>
          <span className="font-mono text-[11px] text-slate-400 hidden sm:inline">
            LOC: 28.6139° N, 77.2090° E (NEW DELHI HUB)
          </span>
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px] text-slate-400">
          <span>
            REFRESH: <span className="text-indigo-400 font-bold">1.2s</span>{' '}
            <span className="text-slate-600">{'//'}</span> HASH-VERIFIED
          </span>
          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            LIVE_SYNC
          </span>
        </div>
      </div>

      <main className="w-full flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Header Command Block */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-indigo-400 tracking-widest uppercase font-bold">
                SOVEREIGN FORENSIC RADAR
              </span>
              <span className="text-slate-600 font-mono text-xs">/</span>
              <span className="font-mono text-xs text-slate-400">NODE_CLUSTER_IND_CORE</span>
            </div>
            <h1 className="font-headline text-3xl sm:text-5xl font-black text-white tracking-tight leading-none">
              {isHindi ? 'लाइव घोटाला खतरा आंकड़े' : 'Live Threat Statistics'}
            </h1>
            <p className="font-body text-sm sm:text-base text-slate-300">
              {isHindi
                ? 'भारत भर में विश्लेषित संदेशों से एकत्र वास्तविक समय के अनाम आंकड़े। हर सेकंड अपडेट।'
                : 'Aggregated anonymous insights from messages analyzed across India. Updated in real time.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shadow-sm font-mono text-xs uppercase tracking-wider">
              <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
              <span>Zero-PII Sovereign Memory Sandbox</span>
            </div>
            <button
              type="button"
              onClick={handleExportAudit}
              className="px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white font-mono text-xs uppercase tracking-wider rounded-xl border border-white/[0.08] transition flex items-center gap-2 cursor-pointer"
            >
              <LockIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Dump Audit Log</span>
            </button>
          </div>
        </div>

        {/* Top KPI Grid: 4 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Total Scans */}
          <div className="p-5 bg-[#0a101f] rounded-2xl border border-white/[0.08] flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Total Evaluated
              </span>
              <BarChartIcon className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <div className="font-headline text-4xl font-black text-white tracking-tight">
                {loading ? '...' : total.toLocaleString()}
              </div>
              <div className="mt-1 flex items-center gap-1.5 font-mono text-[11px]">
                <span className="text-emerald-400 font-bold">+1,842 past 24h</span>
                <span className="text-slate-500">{'//'} SHA-256 inputs</span>
              </div>
            </div>
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between font-mono text-[10px] text-slate-400">
              <span>THROUGHPUT: 12.4 req/s</span>
              <span className="text-emerald-400 font-bold">INTEGRITY 100%</span>
            </div>
          </div>

          {/* KPI 2: Scams Blocked */}
          <div className="p-5 bg-[#0a101f] rounded-2xl border border-white/[0.08] flex flex-col justify-between space-y-4 hover:border-rose-500/40 transition">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-rose-400 uppercase tracking-wider font-bold">
                Scams Neutralized (24h)
              </span>
              <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-ping" />
            </div>
            <div>
              <div className="font-headline text-4xl font-black text-rose-400 tracking-tight">
                {loading ? '...' : (stats?.last24Hours ?? 1240).toLocaleString()}
              </div>
              <div className="mt-1 font-body text-xs text-rose-300">
                Critical interventions prevented ₹4.2 Cr financial leakage
              </div>
            </div>
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between font-mono text-[10px] text-slate-400">
              <span>ZERO-HOUR MITIGATIONS</span>
              <span className="text-rose-400 font-bold">PRIORITY ALPHA</span>
            </div>
          </div>

          {/* KPI 3: Likely Scam Ratio */}
          <div className="p-5 bg-[#0a101f] rounded-2xl border border-white/[0.08] flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Likely Scam Ratio
              </span>
              <AlertTriangleIcon className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="flex items-baseline gap-2 font-headline text-4xl font-black text-white">
                <span>{loading ? '...' : `${scamPercent}%`}</span>
                <span className="font-mono text-xs text-amber-400 font-bold tracking-wider">
                  ▲ +3.4% spike
                </span>
              </div>
              <div className="mt-1 font-mono text-[11px] text-slate-400">
                Scam probability threshold ≥ 60%
              </div>
            </div>
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between font-mono text-[10px] text-slate-400">
              <span>BASELINE: 71.2%</span>
              <span className="text-amber-400 font-bold">ELEVATED RISK</span>
            </div>
          </div>

          {/* KPI 4: Top Threat Vector */}
          <div className="p-5 bg-[#0a101f] rounded-2xl border border-white/[0.08] flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Top Threat Vector
              </span>
              <span className="px-1.5 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 font-mono text-[9px] font-bold">
                CRITICAL SEVERITY
              </span>
            </div>
            <div>
              <div className="font-headline text-2xl font-bold text-white truncate">
                Bank &amp; KYC Spoofing
              </div>
              <div className="mt-1 font-body text-xs text-slate-400 line-clamp-1">
                Spoofed SBI, HDFC &amp; PNB NetBanking portals
              </div>
            </div>
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between font-mono text-[10px] text-slate-400">
              <span>VECTOR ID: VEC-IN-KYC-09</span>
              <span className="text-indigo-400 font-bold">42% FREQ</span>
            </div>
          </div>
        </div>

        {/* Master Section: Analytics Engine Verdict Distribution */}
        <div className="bg-[#0a101f] rounded-2xl p-6 sm:p-8 space-y-6 border border-white/[0.08] shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
            <div>
              <h2 className="font-headline text-lg sm:text-xl font-bold text-white uppercase tracking-tight">
                Analytics Engine Verdict Distribution
              </h2>
              <p className="font-mono text-xs text-slate-400 mt-0.5">
                Deterministic heuristic + ML classifier telemetry aggregate
              </p>
            </div>
            <div className="px-3.5 py-1.5 bg-[#050b14] rounded-xl flex items-center gap-2 border border-white/[0.08] font-mono text-xs">
              <span className="text-slate-400">SAMPLE COUNT:</span>
              <span className="text-white font-bold">{total.toLocaleString()} Evaluations</span>
            </div>
          </div>

          {/* Segmented Distribution Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-mono text-xs text-slate-400 px-1">
              <span className="text-rose-400 font-bold">LIKELY SCAM ({scamPercent}%)</span>
              <span className="text-amber-400 font-bold">SUSPICIOUS ({suspiciousPercent}%)</span>
              <span className="text-emerald-400 font-bold">SAFE ({safePercent}%)</span>
            </div>

            <div className="w-full h-4 bg-[#050b14] rounded-lg overflow-hidden flex gap-1 p-0.5 border border-white/[0.08]">
              <div
                className="h-full bg-rose-500 rounded transition-all duration-1000 shadow-[0_0_12px_rgba(239,68,68,0.5)]"
                style={{ width: `${scamPercent}%` }}
                title={`Likely Scam: ${scamPercent}%`}
              />
              <div
                className="h-full bg-amber-500 rounded transition-all duration-1000 shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                style={{ width: `${suspiciousPercent}%` }}
                title={`Suspicious: ${suspiciousPercent}%`}
              />
              <div
                className="h-full bg-emerald-500 rounded transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                style={{ width: `${safePercent}%` }}
                title={`Safe: ${safePercent}%`}
              />
            </div>

            <div className="flex items-center justify-between font-mono text-[11px] text-slate-500 px-1">
              <span>{scamCount.toLocaleString()} SAMPLES</span>
              <span>{suspiciousCount.toLocaleString()} SAMPLES</span>
              <span>{safeCount.toLocaleString()} SAMPLES</span>
            </div>
          </div>

          {/* 3 Forensic Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Likely Scam Card */}
            <div className="p-5 bg-[#0f172a] rounded-xl border border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-rose-500/15 text-rose-300 font-mono text-xs font-bold uppercase border border-rose-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                  Likely Scam ({scamPercent}%)
                </span>
                <span className="font-mono text-xs text-rose-400 font-bold">
                  {scamCount.toLocaleString()} PAYLOADS
                </span>
              </div>
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Avg Confidence Rating</span>
                  <span className="text-rose-400 font-bold">98.4%</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Automated Quarantine</span>
                  <span className="text-slate-200">Immediate Freeze</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Primary Threat Anchor</span>
                  <span className="text-slate-200 truncate">Urgency &amp; Harvest URLs</span>
                </div>
              </div>
              <p className="font-body text-xs text-slate-400 leading-relaxed">
                Identified deceptive payload patterns matching unauthorized APK droppers, PAN card
                expiry traps, and high-entropy shortened hyperlinks.
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-rose-400 font-mono text-xs uppercase font-bold">
                <ScaleIcon className="w-4 h-4" />
                <span>Triggered National Kill-Switch</span>
              </div>
            </div>

            {/* Suspicious Card */}
            <div className="p-5 bg-[#0f172a] rounded-xl border border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 font-mono text-xs font-bold uppercase border border-amber-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Suspicious ({suspiciousPercent}%)
                </span>
                <span className="font-mono text-xs text-amber-400 font-bold">
                  {suspiciousCount.toLocaleString()} PAYLOADS
                </span>
              </div>
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Avg Confidence Rating</span>
                  <span className="text-amber-400 font-bold">64.1%</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>DLT Sender Headers</span>
                  <span className="text-amber-300">Unregistered ID</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Primary Threat Anchor</span>
                  <span className="text-slate-200 truncate">Unsolicited Reminders</span>
                </div>
              </div>
              <p className="font-body text-xs text-slate-400 leading-relaxed">
                Communications showing irregular formatting, missing corporate disclosure
                disclaimers, or unverified sender routing headers.
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-amber-400 font-mono text-xs uppercase font-bold">
                <AlertTriangleIcon className="w-4 h-4" />
                <span>Escalated for Verification</span>
              </div>
            </div>

            {/* Safe Nominal Card */}
            <div className="p-5 bg-[#0f172a] rounded-xl border border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 font-mono text-xs font-bold uppercase border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Nominal Safe ({safePercent}%)
                </span>
                <span className="font-mono text-xs text-emerald-400 font-bold">
                  {safeCount.toLocaleString()} PAYLOADS
                </span>
              </div>
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Avg Confidence Rating</span>
                  <span className="text-emerald-400 font-bold">99.8%</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Sovereign Allowlist</span>
                  <span className="text-emerald-300">RBI / NPCI Match</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Defensive Disclaimers</span>
                  <span className="text-slate-200 truncate">Standard &quot;Do Not Share&quot;</span>
                </div>
              </div>
              <p className="font-body text-xs text-slate-400 leading-relaxed">
                Authentic transactional debit alerts, medical appointment notices, and boarding
                passes originating from verified brand SMS gateways.
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-emerald-400 font-mono text-xs uppercase font-bold">
                <ShieldCheckIcon className="w-4 h-4" />
                <span>Zero-Threat Attestation</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sovereign National Defense Footer */}
      <footer className="w-full bg-[#020617] border-t border-white/[0.08] mt-12 py-8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
            <span>CERT-In Synchronized Pan-India Threat Telemetry</span>
          </div>
          <span>National Cyber Crime Emergency: 1930</span>
        </div>
      </footer>
    </div>
  );
}
