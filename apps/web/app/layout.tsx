import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'ScamShield — AI & Heuristic Scam Message Detector',
  description:
    'Identify fake banks, delivery services, government threats, and phishing links in SMS and WhatsApp messages.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${mono.variable} font-sans bg-[#000f21] text-slate-100 min-h-screen selection:bg-indigo-500/30 selection:text-white`}
      >
        <div className="fixed inset-0 bg-grid-obsidian pointer-events-none opacity-40 z-0" />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
