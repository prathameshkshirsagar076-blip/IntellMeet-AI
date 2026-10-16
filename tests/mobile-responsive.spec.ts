import { test, expect } from '@playwright/test';
import { seedAuthenticatedSession } from './helpers/auth';

const VIEWPORTS = [
  { name: '320x568-small-phone', width: 320, height: 568 },
  { name: '360x800-compact-android', width: 360, height: 800 },
  { name: '375x812-iphone-mini', width: 375, height: 812 },
  { name: '390x844-iphone-modern', width: 390, height: 844 },
  { name: '430x932-large-phone', width: 430, height: 932 },
  { name: '768x1024-tablet', width: 768, height: 1024 },
  { name: '1024x768-compact-desktop', width: 1024, height: 768 },
  { name: '1366x768-desktop', width: 1366, height: 768 },
];

test.describe('Mobile-First Responsive Layout & Overflow Audit', () => {
  for (const vp of VIEWPORTS) {
    test(`Landing Page does not overflow horizontally at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');

      // Wait for layout to settle
      await page.waitForLoadState('domcontentloaded');

      const overflow = await page.evaluate(() => {
        return {
          windowWidth: window.innerWidth,
          docScrollWidth: document.documentElement.scrollWidth,
          bodyScrollWidth: document.body.scrollWidth,
          hasOverflow:
            document.documentElement.scrollWidth > window.innerWidth ||
            document.body.scrollWidth > window.innerWidth,
        };
      });

      expect(overflow.hasOverflow, `Horizontal overflow on Landing Page at ${vp.name}: doc=${overflow.docScrollWidth}, body=${overflow.bodyScrollWidth}, win=${overflow.windowWidth}`).toBe(false);
    });

    test(`Authentication Pages do not overflow horizontally at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/login');
      await page.waitForLoadState('domcontentloaded');

      const loginOverflow = await page.evaluate(() => ({
        windowWidth: window.innerWidth,
        docScrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        hasOverflow:
          document.documentElement.scrollWidth > window.innerWidth ||
          document.body.scrollWidth > window.innerWidth,
      }));
      expect(loginOverflow.hasOverflow, `Login page overflow at ${vp.name}`).toBe(false);

      await page.goto('/signup');
      await page.waitForLoadState('domcontentloaded');
      const signupOverflow = await page.evaluate(() => ({
        windowWidth: window.innerWidth,
        docScrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        hasOverflow:
          document.documentElement.scrollWidth > window.innerWidth ||
          document.body.scrollWidth > window.innerWidth,
      }));
      expect(signupOverflow.hasOverflow, `Signup page overflow at ${vp.name}`).toBe(false);
    });

    test(`Authenticated Dashboard shell does not overflow horizontally at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await seedAuthenticatedSession(page);
      await page.goto('/dashboard');
      await page.waitForLoadState('domcontentloaded');

      const dashOverflow = await page.evaluate(() => ({
        windowWidth: window.innerWidth,
        docScrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        hasOverflow:
          document.documentElement.scrollWidth > window.innerWidth ||
          document.body.scrollWidth > window.innerWidth,
      }));
      expect(dashOverflow.hasOverflow, `Dashboard page overflow at ${vp.name}: doc=${dashOverflow.docScrollWidth}, body=${dashOverflow.bodyScrollWidth}, win=${dashOverflow.windowWidth}`).toBe(false);
    });

    test(`Meetings & Schedule views do not overflow horizontally at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await seedAuthenticatedSession(page);

      await page.goto('/meetings');
      await page.waitForLoadState('domcontentloaded');
      const meetingsOverflow = await page.evaluate(() => ({
        windowWidth: window.innerWidth,
        docScrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        hasOverflow:
          document.documentElement.scrollWidth > window.innerWidth ||
          document.body.scrollWidth > window.innerWidth,
      }));
      expect(meetingsOverflow.hasOverflow, `Meetings page overflow at ${vp.name}`).toBe(false);

      await page.goto('/schedule');
      await page.waitForLoadState('domcontentloaded');
      const scheduleOverflow = await page.evaluate(() => ({
        windowWidth: window.innerWidth,
        docScrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        hasOverflow:
          document.documentElement.scrollWidth > window.innerWidth ||
          document.body.scrollWidth > window.innerWidth,
      }));
      expect(scheduleOverflow.hasOverflow, `Schedule page overflow at ${vp.name}`).toBe(false);
    });

    test(`AI Assistant & Live Meeting do not overflow horizontally at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await seedAuthenticatedSession(page);

      await page.goto('/ai-assistant');
      await page.waitForLoadState('domcontentloaded');
      const aiOverflow = await page.evaluate(() => ({
        windowWidth: window.innerWidth,
        docScrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        hasOverflow:
          document.documentElement.scrollWidth > window.innerWidth ||
          document.body.scrollWidth > window.innerWidth,
      }));
      expect(aiOverflow.hasOverflow, `AI Assistant overflow at ${vp.name}`).toBe(false);

      await page.goto('/meeting/test-mobile-room');
      await page.waitForLoadState('domcontentloaded');
      const liveMeetingOverflow = await page.evaluate(() => ({
        windowWidth: window.innerWidth,
        docScrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        hasOverflow:
          document.documentElement.scrollWidth > window.innerWidth ||
          document.body.scrollWidth > window.innerWidth,
      }));
      expect(liveMeetingOverflow.hasOverflow, `Live Meeting overflow at ${vp.name}`).toBe(false);
    });
  }
});
