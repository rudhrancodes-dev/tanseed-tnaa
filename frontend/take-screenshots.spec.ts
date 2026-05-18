
import { test, expect } from '@playwright/test';

test.describe('Take Screenshots', () => {
  test('should navigate through the application and take screenshots', async ({ page }) => {
    await page.goto('http://localhost:5174/');
    await page.screenshot({ path: 'screenshots/01-landing-page.png', fullPage: true });

    await page.getByRole('button', { name: 'Start New Application' }).click();

    await page.screenshot({ path: 'screenshots/02-step1-entity-eligibility.png', fullPage: true });

    await page.getByLabel('Entity Name').fill('Test Entity');
    await page.getByLabel('Registration Type').selectOption('Private Limited');
    await page.getByLabel('Location').selectOption('Tamil Nadu');
    await page.getByLabel('TANSIM ID').fill('TANSIM12345');
    await page.getByLabel('DPIIT ID').fill('DPIIT12345');
    await page.getByLabel('Employees').fill('10');
    await page.getByLabel('Startup Description').fill('This is a test description for the startup.');
    await page.getByRole('button', { name: 'Continue to financials' }).click();

    await page.screenshot({ path: 'screenshots/03-step2-financials.png', fullPage: true });

    await page.getByLabel('Average Profit (3 years, INR)').fill('100000');
    await page.getByLabel('Deep Tech/AI').click();
    await page.getByText('We have no outstanding government dues or material legal proceedings.').click();
    await page.getByText('We are not blacklisted by any government body or financial institution.').click();
    await page.getByRole('button', { name: 'Continue to documents' }).click();

    await page.screenshot({ path: 'screenshots/04-step3-document-upload.png', fullPage: true });

    await page.getByRole('button', { name: 'Submit and check eligibility' }).click();

    await page.screenshot({ path: 'screenshots/05-eligibility-results.png', fullPage: true });

    await page.getByRole('button', { name: /application draft/ }).click();

    await page.screenshot({ path: 'screenshots/06-application-draft.png', fullPage: true });
  });
});
