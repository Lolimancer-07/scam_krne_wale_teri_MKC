import { describe, it, expect } from 'vitest';
import { runRules } from '../src/rules/index.js';

describe('Detector Rules Engine', () => {
  it('detects KYC expiry threats with high score', () => {
    const text =
      'Dear Customer, your SBI account KYC has expired. Update immediately to prevent account blockage.';
    const result = runRules(text);

    expect(result.score).toBeGreaterThanOrEqual(60);
    expect(result.category).toBe('bank_kyc');
    expect(result.redFlags.some((f) => f.signal === 'kyc_lure')).toBe(true);
    expect(result.redFlags.some((f) => f.signal === 'urgency')).toBe(true);
  });

  it('detects OTP sharing requests', () => {
    const text =
      'Sir please share your 6-digit OTP verification code to confirm refund of Rs 4999.';
    const result = runRules(text);

    expect(result.category).toBe('otp_impersonation');
    expect(result.redFlags.some((f) => f.signal === 'otp_request')).toBe(true);
  });

  it('detects PIN / CVV requests', () => {
    const text = 'Enter your ATM PIN and CVV to claim cashback reward of Rs 2500.';
    const result = runRules(text);

    expect(result.redFlags.some((f) => f.signal === 'pin_cvv_request')).toBe(true);
  });

  it('detects arrest and police threats', () => {
    const text =
      'Arrest warrant issued by Crime Branch for parcel holding illegal substances. Immediate legal action pending.';
    const result = runRules(text);

    expect(result.category).toBe('government_tax');
    expect(result.redFlags.some((f) => f.signal === 'arrest_threat')).toBe(true);
  });

  it('detects Hindi Devanagari scam patterns', () => {
    const text =
      'प्रिय ग्राहक, आपका एसबीआई खाता केवाईसी समाप्त हो गया है। तुरंत अपडेट करें वरना खाता ब्लॉक हो जाएगा।';
    const result = runRules(text);

    expect(result.score).toBeGreaterThanOrEqual(50);
    expect(result.redFlags.length).toBeGreaterThan(0);
    expect(result.category).toBe('bank_kyc');
  });

  it('detects Hinglish scam patterns', () => {
    const text =
      'Aapka electricity connection aaj raat 9:30 baje kat jayega kyunki bill pending hai. Turant contact kare.';
    const result = runRules(text);

    expect(result.score).toBeGreaterThanOrEqual(30);
    expect(
      result.redFlags.some((f) => f.signal === 'account_block_threat' || f.signal === 'urgency'),
    ).toBe(true);
  });

  it('identifies work-from-home task scams', () => {
    const text =
      'Part-time job offer! Earn Rs 3000 to 5000 daily by simply liking YouTube videos. Work from home.';
    const result = runRules(text);

    expect(result.category).toBe('job_task');
    expect(result.redFlags.some((f) => f.signal === 'job_task_scam')).toBe(true);
  });

  it('identifies lottery and prize lures', () => {
    const text =
      'Congratulations! You have won Rs 25,00,000 in KBC Lucky Draw. Claim your lottery reward today.';
    const result = runRules(text);

    expect(result.category).toBe('lottery_prize');
    expect(result.redFlags.some((f) => f.signal === 'refund_prize_lure')).toBe(true);
  });

  it('detects malicious apk install lures', () => {
    const text =
      'Your parcel requires immediate Android package verification: install http://malware-delivery[.]com/remote.apk to continue the re-shipping process.';
    const result = runRules(text);

    expect(result.redFlags.some((f) => f.signal === 'apk_install_threat')).toBe(true);
  });

  it('gives low score to normal benign greeting', () => {
    const text = 'Hey Ramesh, are we still meeting for lunch at 1 PM today? Let me know!';
    const result = runRules(text);

    expect(result.score).toBeLessThan(30);
    expect(result.category).toBe('other');
  });
});
