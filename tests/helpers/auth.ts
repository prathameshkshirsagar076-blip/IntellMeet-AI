import type { Page } from '@playwright/test';

export const mockUser = {
  id: '652f1f77bcf86cd799439011',
  name: 'QA Test Engineer',
  email: 'qa.engineer@example.com',
  normalizedEmail: 'qa.engineer@example.com',
  role: 'user',
  isEmailVerified: true,
  isActive: true,
  authProvider: 'local',
  company: 'QA Enterprise Workspace',
  companyName: 'QA Enterprise Workspace',
  jobTitle: 'QA Lead',
  avatar: 'QE',
};

export const mockJwt =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NTJmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJleHAiOjIxNDc0ODM2NDd9.mock-signature';

/**
 * Seeds a valid authenticated session into localStorage for the current origin.
 * Must be called after navigating to a page on the app origin (e.g. /login).
 */
export async function seedAuthenticatedSession(
  page: Page,
  options?: { meetings?: unknown[] }
): Promise<void> {
  await page.goto('/login');
  await page.evaluate(
    ({ user, token, meetings }) => {
      localStorage.setItem('intellmeet_access_token', token);
      localStorage.setItem('intellmeet_refresh_token', token);
      localStorage.setItem('intellmeet_user', JSON.stringify(user));
      localStorage.setItem('accessToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      if (meetings) {
        localStorage.setItem('intellmeet_meetings_v2', JSON.stringify(meetings));
      }
    },
    { user: mockUser, token: mockJwt, meetings: options?.meetings }
  );
}
