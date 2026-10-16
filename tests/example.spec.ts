import { test, expect } from '@playwright/test';

test.describe('IntellMeet-AI Smoke Tests', () => {
  test('home page opens and displays meaningful visible content', async ({ page }) => {
    // Navigate to base URL (http://localhost:5173/)
    await page.goto('/');

    // Verify page title
    await expect(page).toHaveTitle(/IntellMeet/i);

    // Verify main hero heading
    const heroHeading = page.getByRole('heading', { level: 1, name: /Meet Smarter/i });
    await expect(heroHeading).toBeVisible();

    // Verify branding element in header navbar
    await expect(page.locator('.lp-navbar .lp-brand-name')).toContainText('IntellMeet');

    // Verify key action buttons are visible on the landing page
    await expect(page.locator('#lp-nav-signin')).toBeVisible();
    await expect(page.locator('#lp-nav-signup')).toBeVisible();
    await expect(page.locator('#lp-hero-signup')).toBeVisible();
  });

  test('login button navigates to the actual login page', async ({ page }) => {
    await page.goto('/');

    // Click the Sign In navigation link
    await page.locator('#lp-nav-signin').click();

    // Verify navigation to /login
    await expect(page).toHaveURL(/\/login$/);

    // Verify login page elements
    const loginHeading = page.getByRole('heading', { level: 1, name: /Welcome to IntellMeet/i });
    await expect(loginHeading).toBeVisible();

    // Verify required form inputs and submit button
    await expect(page.locator('#im-email')).toBeVisible();
    await expect(page.locator('#im-password')).toBeVisible();
    await expect(page.locator('#im-signin-btn')).toBeVisible();
  });

  test('register link opens the actual registration page from landing page', async ({ page }) => {
    await page.goto('/');

    // Click the Get Started navigation link
    const signupBtn = page.locator('#lp-nav-signup');
    await expect(signupBtn).toBeVisible();
    await signupBtn.click();

    // Verify navigation to /signup
    await expect(page).toHaveURL(/\/signup$/, { timeout: 10000 });

    // Verify registration page elements
    const registerHeading = page.getByRole('heading', { level: 1, name: /Create your IntellMeet account/i });
    await expect(registerHeading).toBeVisible();

    // Verify registration form fields and submit button
    await expect(page.locator('#su-name')).toBeVisible();
    await expect(page.locator('#su-email')).toBeVisible();
    await expect(page.locator('#su-company')).toBeVisible();
    await expect(page.locator('#su-password')).toBeVisible();
    await expect(page.locator('#su-submit-btn')).toBeVisible();
  });

  test('register link from login page navigates to registration page', async ({ page }) => {
    await page.goto('/login');

    // Click the Create an Account link in the login footer
    await page.locator('#im-signup-link').click();

    // Verify navigation to /signup
    await expect(page).toHaveURL(/\/signup$/);
    await expect(page.getByRole('heading', { level: 1, name: /Create your IntellMeet account/i })).toBeVisible();
  });

  test('unauthenticated visit to protected route redirects to login', async ({ page }) => {
    // Attempt to access a protected route directly without being logged in
    await page.goto('/dashboard');

    // App should redirect unauthenticated users to /login
    await expect(page).toHaveURL(/\/login$/);

    // Verify the login screen is rendered
    await expect(page.getByRole('heading', { level: 1, name: /Welcome to IntellMeet/i })).toBeVisible();
    await expect(page.locator('#im-email')).toBeVisible();
    await expect(page.locator('#im-password')).toBeVisible();
  });
});
