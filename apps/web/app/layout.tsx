import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/components/LanguageProvider';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';

export const metadata: Metadata = {
  title: 'ScamShield — Real-Time Heuristic Threat Detector & Fraud Defense Engine',
  description:
    'Forensic neutralization against Indian telecom, UPI, KYC, and phishing attack vectors. Aligned with CERT-In & NCRP directives.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-surface text-on-surface antialiased min-h-screen selection:bg-primary-container selection:text-white">
        <div className="fixed inset-0 bg-grid-obsidian pointer-events-none opacity-40 z-0" />
        <ServiceWorkerRegister />
        <LanguageProvider>
          <div className="relative z-10 flex flex-col min-h-screen">{children}</div>
        </LanguageProvider>
      </body>
    </html>
  );
}
