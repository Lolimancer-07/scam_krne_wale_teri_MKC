import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnalyzerForm } from '../../components/AnalyzerForm';

describe('AnalyzerForm Component Interactions', () => {
  const onAnalyzeSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('switches between Paste Message, Screenshot (OCR), and Check URL tabs', async () => {
    const user = userEvent.setup();
    render(<AnalyzerForm onAnalyzeSuccess={onAnalyzeSuccess} />);

    // Default tab is text analysis
    expect(screen.getByRole('button', { name: /Analyze Message/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Paste suspicious SMS/i)).toBeInTheDocument();

    // Click Screenshot (OCR) tab
    const ocrTab = screen.getByRole('tab', { name: /Screenshot \(OCR\)/i });
    await user.click(ocrTab);

    // Verify OCR view is active
    expect(
      screen.getByText(/Select or Drag & Drop SMS \/ WhatsApp Screenshot/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Run OCR & Analyze/i })).toBeInTheDocument();

    // Click Check URL tab
    const urlTab = screen.getByRole('tab', { name: /Check URL/i });
    await user.click(urlTab);

    // Verify URL view is active
    expect(screen.getByPlaceholderText(/e\.g\. http:\/\/sbi-kyc-update\.xyz/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Verify URL/i })).toBeInTheDocument();

    // Click back to Paste Message tab
    const messageTab = screen.getByRole('tab', { name: /Paste Message/i });
    await user.click(messageTab);
    expect(screen.getByRole('button', { name: /Analyze Message/i })).toBeInTheDocument();
  });

  it('populates text input when clicking a realistic scam sample', async () => {
    const user = userEvent.setup();
    render(<AnalyzerForm onAnalyzeSuccess={onAnalyzeSuccess} />);

    const sampleButton = screen.getByRole('button', { name: 'SBI KYC Expiry' });
    await user.click(sampleButton);

    const textarea = screen.getByPlaceholderText(/Paste suspicious SMS/i) as HTMLTextAreaElement;
    expect(textarea.value).toContain('SBI KYC expires today');
  });

  it('validates and shows helpful message if Analyze Message is clicked with empty text', async () => {
    const user = userEvent.setup();
    render(<AnalyzerForm onAnalyzeSuccess={onAnalyzeSuccess} />);

    const analyzeBtn = screen.getByRole('button', { name: /Analyze Message/i });
    await user.click(analyzeBtn);

    expect(screen.getByText(/Please enter or paste a message to analyze/i)).toBeInTheDocument();
  });

  it('submits text and triggers onAnalyzeSuccess when analyzed', async () => {
    const user = userEvent.setup();
    const fakeData = {
      verdict: 'likely_scam',
      score: 95,
      category: 'bank_kyc',
      redFlags: [],
      signals: [],
      ruleScore: 90,
      fusionDetails: {
        ruleScore: 90,
        mlScore: 0,
        urlScore: 95,
        aiNudge: 0,
        finalScore: 95,
        formula: '0.60*rules + 0.40*url',
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: fakeData }),
    } as any);

    render(<AnalyzerForm onAnalyzeSuccess={onAnalyzeSuccess} />);

    const sampleButton = screen.getByRole('button', { name: 'SBI KYC Expiry' });
    await user.click(sampleButton);

    const analyzeBtn = screen.getByRole('button', { name: /Analyze Message/i });
    await user.click(analyzeBtn);

    await waitFor(() => {
      expect(onAnalyzeSuccess).toHaveBeenCalledWith(fakeData, expect.stringContaining('SBI KYC'));
    });
  });

  it('validates and submits URL in Check URL tab', async () => {
    const user = userEvent.setup();
    const fakeUrlData = {
      verdict: 'likely_scam',
      score: 80,
      category: 'bank_kyc',
      redFlags: [],
      signals: [],
      ruleScore: 0,
      fusionDetails: {
        ruleScore: 0,
        mlScore: 0,
        urlScore: 80,
        aiNudge: 0,
        finalScore: 80,
        formula: 'urlScore',
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: fakeUrlData }),
    } as any);

    render(<AnalyzerForm onAnalyzeSuccess={onAnalyzeSuccess} />);

    // Switch to URL tab
    await user.click(screen.getByRole('tab', { name: /Check URL/i }));

    // Click without input -> validation
    const verifyBtn = screen.getByRole('button', { name: /Verify URL/i });
    await user.click(verifyBtn);
    expect(screen.getByText(/Please enter a website link to verify/i)).toBeInTheDocument();

    // Type URL and submit
    const input = screen.getByPlaceholderText(/e\.g\. http:\/\/sbi-kyc-update\.xyz/i);
    await user.type(input, 'http://sbi-fake.xyz');
    await user.click(verifyBtn);

    await waitFor(() => {
      expect(onAnalyzeSuccess).toHaveBeenCalledWith(fakeUrlData, 'http://sbi-fake.xyz');
    });
  });
});
