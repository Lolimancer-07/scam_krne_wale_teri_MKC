import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResultCard, DetectionResultData } from '../../components/ResultCard';

describe('ResultCard Component', () => {
  const fakeResult: DetectionResultData = {
    verdict: 'likely_scam',
    score: 85,
    category: 'bank_kyc',
    redFlags: [
      {
        id: 'kyc_lure-27',
        signal: 'kyc_lure',
        snippet: 'KYC expires today',
        reason: 'Claims KYC is expired to create urgency',
        weight: 40,
        startIndex: 27,
        endIndex: 44,
      },
      {
        id: 'account_block_threat-78',
        signal: 'account_block_threat',
        snippet: 'account will be blocked',
        reason: 'Threatens account blockage',
        weight: 35,
        startIndex: 78,
        endIndex: 101,
      },
    ],
    signals: [],
    ruleScore: 75,
    fusionDetails: {
      ruleScore: 75,
      mlScore: 0,
      urlScore: 70,
      aiNudge: 0,
      finalScore: 85,
      formula: '0.60*rules + 0.40*url',
    },
    urlAnalysis: {
      url: 'http://sbi-kyc-update.xyz',
      defanged: 'hxxp://sbi-kyc-update[.]xyz',
      riskScore: 70,
      flags: ['brand_impersonation', 'risky_tld'],
      isShortener: false,
      hasIpHost: false,
      hasRiskyTld: true,
      lookalikeBrand: 'sbi',
      lookalikeDomain: 'sbi.co.in',
    },
  };

  const sampleText =
    'Dear Customer, your SBI KYC expires today, verify via http://sbi-kyc-update.xyz or account will be blocked';

  it('renders "Likely Scam" verdict banner and risk score', () => {
    render(<ResultCard originalText={sampleText} result={fakeResult} onReset={vi.fn()} />);

    expect(screen.getByText('Likely Scam')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('/100')).toBeInTheDocument();
    expect(screen.getByText(/BANK KYC/i)).toBeInTheDocument();
  });

  it('renders highlighted red flags and details', () => {
    render(<ResultCard originalText={sampleText} result={fakeResult} onReset={vi.fn()} />);

    expect(screen.getByText(/2 Red Flags Detected/i)).toBeInTheDocument();
    expect(screen.getByText(/Claims KYC is expired to create urgency/i)).toBeInTheDocument();
  });

  it('displays defanged URL and lookalike spoofing alert', () => {
    render(<ResultCard originalText={sampleText} result={fakeResult} onReset={vi.fn()} />);

    expect(screen.getByText('hxxp://sbi-kyc-update[.]xyz')).toBeInTheDocument();
    expect(screen.getByText(/Brand Spoofing Alert/i)).toBeInTheDocument();
  });
});
