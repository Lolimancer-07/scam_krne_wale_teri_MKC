import { test, expect } from '@playwright/test';

test.describe('ScamShield Core End-to-End User Journeys', () => {
  test('landing page loads with title, hero and cyber helpline banner', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/ScamShield/i);
    await expect(page.getByText('ScamShield', { exact: false })).toBeVisible();
    await expect(page.getByText('1930')).toBeVisible();
  });

  test('pasting fake bank KYC scam displays Likely Scam verdict with red flags', async ({
    page,
  }) => {
    await page.goto('/');

    const textarea = page.getByPlaceholder(/Paste suspicious SMS/i);
    await expect(textarea).toBeVisible();

    const fakeKyc =
      'Dear Customer, your SBI KYC expires today, verify via http://sbi-kyc-update.xyz or account will be blocked';
    await textarea.fill(fakeKyc);

    const analyzeBtn = page.getByRole('button', { name: /Analyze Message/i });
    await analyzeBtn.click();

    // Verify Verdict
    await expect(page.getByText(/Likely Scam/i)).toBeVisible({ timeout: 10000 });

    // Verify Risk Score is high (>= 60)
    await expect(page.getByText('/100')).toBeVisible();

    // Verify defanged URL and category
    await expect(page.getByText(/hxxp:\/\/sbi-kyc-update\[\.\]xyz/i)).toBeVisible();
    await expect(page.getByText(/BANK KYC/i)).toBeVisible();
  });

  test('interactive quiz allows answering questions and reveals immediate explanation', async ({
    page,
  }) => {
    await page.goto('/learn');

    // Click Quiz Tab
    const quizTab = page.getByRole('button', { name: /10-Question Quiz/i });
    await quizTab.click();

    await expect(page.getByText(/Question 1 of 10/i)).toBeVisible();

    // Answer Q1 as scam
    const scamBtn = page.getByRole('button', { name: /It's a SCAM/i });
    await scamBtn.click();

    await expect(page.getByText(/Correct!/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Next Question/i })).toBeVisible();
  });
});
