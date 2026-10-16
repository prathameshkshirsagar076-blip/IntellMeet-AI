import { test, expect } from '@playwright/test';
import { seedAuthenticatedSession, mockUser } from './helpers/auth';

test.describe('Meetings Management - Authenticated UI & View States', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthenticatedSession(page);
  });

  test('meetings page loads correctly for an authenticated test session', async ({ page }) => {
    await page.goto('/meetings');
    await expect(page).toHaveURL(/\/meetings$/);

    // Verify page header
    const pageTitle = page.locator('.im-page-title');
    await expect(pageTitle).toBeVisible();
    await expect(pageTitle).toHaveText('Meetings Management');

    const pageSubtitle = page.locator('.im-page-subtitle');
    await expect(pageSubtitle).toBeVisible();
    await expect(pageSubtitle).toContainText('Manage your scheduled video calls');

    // Verify key action buttons and navigation links
    const calendarLink = page.locator('a:has-text("Calendar View")');
    await expect(calendarLink).toBeVisible();
    await expect(calendarLink).toHaveAttribute('href', '/schedule');

    const joinBtn = page.locator('button:has-text("Join with Code")');
    await expect(joinBtn).toBeVisible();

    const scheduleBtn = page.locator('button:has-text("Schedule Meeting")');
    await expect(scheduleBtn).toBeVisible();

    // Verify filter tabs group
    const filterTabs = page.locator('.im-tabs-group button[role="tab"]');
    await expect(filterTabs).toHaveCount(5);
    await expect(filterTabs.filter({ hasText: 'All Meetings' })).toBeVisible();
    await expect(filterTabs.filter({ hasText: 'Upcoming' })).toBeVisible();
    await expect(filterTabs.filter({ hasText: 'Invitations' })).toBeVisible();
    await expect(filterTabs.filter({ hasText: 'Completed' })).toBeVisible();
    await expect(filterTabs.filter({ hasText: 'Cancelled' })).toBeVisible();

    // Verify high-level statistics cards
    const statCards = page.locator('.im-meetings-stat-card');
    await expect(statCards).toHaveCount(4);
  });

  test('empty state renders when no meetings are scheduled', async ({ page }) => {
    // Session is seeded without pre-existing meetings
    await page.goto('/meetings');

    const emptyState = page.locator('.im-empty-state');
    await expect(emptyState).toBeVisible();

    const emptyTitle = emptyState.locator('.im-empty-state-title');
    await expect(emptyTitle).toHaveText('No meetings found');

    const scheduleAction = emptyState.locator('button:has-text("Schedule New Meeting")');
    await expect(scheduleAction).toBeVisible();
    await scheduleAction.click();

    // Should navigate to create meeting form
    await expect(page).toHaveURL(/\/meetings\/new$/);
  });

  test('displays meeting cards when meetings exist in local state', async ({ page }) => {
    const mockMeeting = {
      id: 'mtg-test-qa-001',
      title: 'Sprint Planning & Architecture Sync',
      description: 'Review upcoming user stories and system design.',
      date: '2026-10-25',
      startTime: '10:00',
      durationMinutes: 45,
      status: 'upcoming',
      organizer: {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        avatar: 'QE',
        role: 'host',
        isOnline: true,
      },
      participants: [
        {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          avatar: 'QE',
          role: 'host',
          isOnline: true,
        },
      ],
      meetingCode: 'qa-plan-001',
      passcode: '123456',
      timezone: 'UTC',
      myInvitationStatus: 'accepted',
      myRole: 'host',
      participantCount: 1,
      meetingLink: 'http://localhost:5173/meeting/qa-plan-001',
      isInstant: false,
      createdAt: new Date().toISOString(),
    };

    // Route meeting API to reliably return mock meeting data across all browser engines
    await page.route('**/api/v1/meetings', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              meetings: [mockMeeting],
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Also seed in localStorage
    await page.evaluate(
      (meeting) => {
        localStorage.setItem('intellmeet_meetings_v2', JSON.stringify([meeting]));
      },
      mockMeeting
    );

    await page.goto('/meetings');

    // Meeting card should render instead of empty state
    const meetingTitle = page.locator('.im-meeting-title');
    await expect(meetingTitle).toBeVisible();
    await expect(meetingTitle).toHaveText('Sprint Planning & Architecture Sync');

    const statusBadge = page.locator('.im-badge-upcoming');
    await expect(statusBadge).toBeVisible();
    await expect(statusBadge).toHaveText('upcoming');
  });
});

test.describe('Meetings - Form Validation & Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthenticatedSession(page);
  });

  test('create meeting form validates required fields on empty submit', async ({ page }) => {
    await page.goto('/meetings/new');
    await expect(page).toHaveURL(/\/meetings\/new$/);

    // Verify form card header
    const cardTitle = page.locator('.im-card-title');
    await expect(cardTitle).toBeVisible();
    await expect(cardTitle).toContainText('Schedule a New Meeting');

    // Attempt to submit empty form
    const submitBtn = page.locator('button[type="submit"]:has-text("Schedule Meeting")');
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Verify title error appears
    const titleError = page.locator('.im-input-error-msg').first();
    await expect(titleError).toBeVisible();
    await expect(titleError).toHaveText('Meeting title is required');

    // Verify title input indicates error
    const titleInput = page.locator('#meeting-title');
    await expect(titleInput).toHaveClass(/error/);

    // Typing a valid title clears the error message
    await titleInput.fill('Q4 Roadmap Review');
    await expect(titleError).not.toBeVisible();
  });

  test('create meeting form enforces minimum date to prevent past dates', async ({ page }) => {
    await page.goto('/meetings/new');

    const dateInput = page.locator('#meeting-date');
    await expect(dateInput).toBeVisible();

    // The min attribute must be set to prevent scheduling in the past
    const minAttr = await dateInput.getAttribute('min');
    expect(minAttr).toBeTruthy();
    expect(minAttr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('join meeting form validates missing meeting code', async ({ page }) => {
    await page.goto('/meetings/join');
    await expect(page).toHaveURL(/\/meetings\/join$/);

    // Verify lobby header
    const lobbyTitle = page.locator('.im-lobby-title');
    await expect(lobbyTitle).toBeVisible();
    await expect(lobbyTitle).toHaveText('Join Meeting Lobby');

    // Clear any pre-existing code and submit empty join form
    const joinCodeInput = page.locator('#join-code');
    await joinCodeInput.fill('');

    const joinSubmitBtn = page.locator('button[type="submit"]');
    await joinSubmitBtn.click();

    // Verify validation error
    const inputError = page.locator('.im-input-error-msg');
    await expect(inputError).toBeVisible();
    await expect(inputError).toHaveText('Please enter a valid Meeting ID or link');

    // Entering text clears the error
    await joinCodeInput.fill('meet-test-123');
    await expect(inputError).not.toBeVisible();
  });

  test('join meeting lobby toggles passcode visibility correctly', async ({ page }) => {
    await page.goto('/meetings/join');

    const passcodeField = page.locator('#join-passcode');
    await expect(passcodeField).toBeVisible();
    await expect(passcodeField).toHaveAttribute('type', 'password');

    // Click toggle button
    const toggleBtn = page.locator('.im-lobby-passcode-toggle');
    await toggleBtn.click();
    await expect(passcodeField).toHaveAttribute('type', 'text');

    // Click toggle button again to hide
    await toggleBtn.click();
    await expect(passcodeField).toHaveAttribute('type', 'password');
  });

  test('invalid or missing meeting ID displays not found state', async ({ page }) => {
    const invalidMeetingId = 'nonexistent-uuid-99999999';

    // Mock 404 response for nonexistent meeting to eliminate network latency
    await page.route(`**/api/v1/meetings/${invalidMeetingId}`, async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Meeting not found',
        }),
      });
    });

    await page.goto(`/meetings/${invalidMeetingId}`);

    // Verify Not Found empty state renders
    const emptyTitle = page.locator('.im-empty-state-title');
    await expect(emptyTitle).toBeVisible({ timeout: 10000 });
    await expect(emptyTitle).toHaveText('Meeting Not Found');

    const emptyDesc = page.locator('.im-empty-state-desc');
    await expect(emptyDesc).toBeVisible();
    await expect(emptyDesc).toContainText(invalidMeetingId);

    // Verify navigation button back to meetings list
    const returnBtn = page.locator('button:has-text("Return to All Meetings")');
    await expect(returnBtn).toBeVisible();
    await returnBtn.click();

    await expect(page).toHaveURL(/\/meetings$/);
  });
});

test.describe('Meetings - History & Archive', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthenticatedSession(page);
  });

  test('meeting history renders empty state when no meetings are completed', async ({ page }) => {
    await page.goto('/history');
    await expect(page).toHaveURL(/\/history$/);

    // Verify page header
    const pageTitle = page.locator('.im-page-title');
    await expect(pageTitle).toBeVisible();
    await expect(pageTitle).toHaveText('Meeting History & Archive');

    // Verify empty archive state
    const emptyTitle = page.locator('.im-empty-state-title');
    await expect(emptyTitle).toBeVisible();
    await expect(emptyTitle).toHaveText('No completed meetings found');

    // Verify navigation button back to meetings
    const viewScheduledBtn = page.locator('button:has-text("View Scheduled Meetings")');
    await expect(viewScheduledBtn).toBeVisible();
    await viewScheduledBtn.click();

    await expect(page).toHaveURL(/\/meetings$/);
  });

  test('meeting history renders completed meeting cards when present', async ({ page }) => {
    const completedMeeting = {
      id: 'mtg-completed-qa-002',
      title: 'Completed Architecture Review',
      description: 'Historical sync on database schema and indexes.',
      date: '2026-10-10',
      startTime: '14:00',
      durationMinutes: 60,
      status: 'completed',
      organizer: {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        avatar: 'QE',
        role: 'host',
        isOnline: false,
      },
      participants: [
        {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          avatar: 'QE',
          role: 'host',
          isOnline: false,
        },
      ],
      meetingCode: 'qa-arch-002',
      passcode: '987654',
      timezone: 'UTC',
      myInvitationStatus: 'accepted',
      myRole: 'host',
      participantCount: 1,
      meetingLink: 'http://localhost:5173/meeting/qa-arch-002',
      isInstant: false,
      createdAt: '2026-10-10T14:00:00.000Z',
    };

    // Route meeting API to reliably return mock meeting data across all browser engines
    await page.route('**/api/v1/meetings', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              meetings: [completedMeeting],
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.evaluate(
      (meeting) => {
        localStorage.setItem('intellmeet_meetings_v2', JSON.stringify([meeting]));
      },
      completedMeeting
    );

    await page.goto('/history');

    // Verify meeting appears in completed history
    const itemTitle = page.locator('.im-meeting-title');
    await expect(itemTitle).toBeVisible();
    await expect(itemTitle).toHaveText('Completed Architecture Review');

    const badge = page.locator('.im-badge-completed');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText('Completed');
  });
});

test.describe('Meetings - Live Remote Mutation Safety', () => {
  test('live meeting creation against remote database (safety check)', async () => {
    test.skip(
      true,
      'BLOCKED: Creating real meetings against the remote API requires active backend credentials and would pollute live production meeting data. Requires a dedicated test tenant or QA sandbox environment.'
    );
  });
});
