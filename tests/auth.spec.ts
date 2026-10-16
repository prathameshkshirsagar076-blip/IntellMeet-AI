import { test, expect } from '@playwright/test';

test.describe('Authentication - Login Form Validation', () => {
  test('empty login submission displays required field validation errors', async ({ page }) => {
    await page.goto('/login');

    // Attempt to submit empty login form
    await page.locator('#im-signin-btn').click();

    // Verify email field validation error
    const emailError = page.locator('#im-email-error');
    await expect(emailError).toBeVisible();
    await expect(emailError).toContainText('Work email is required.');

    // Verify password field validation error
    const passwordError = page.locator('#im-password-error');
    await expect(passwordError).toBeVisible();
    await expect(passwordError).toContainText('Password is required.');

    // Verify inputs carry aria-invalid attribute
    await expect(page.locator('#im-email')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#im-password')).toHaveAttribute('aria-invalid', 'true');
  });

  test('invalid email format and short password display validation errors', async ({ page }) => {
    await page.goto('/login');

    // Enter invalid email format and too-short password (< 6 chars)
    await page.locator('#im-email').fill('not-an-email');
    await page.locator('#im-password').fill('123');
    await page.locator('#im-signin-btn').click();

    // Verify invalid email message
    const emailError = page.locator('#im-email-error');
    await expect(emailError).toBeVisible();
    await expect(emailError).toContainText('Please enter a valid work email address.');

    // Verify password length message
    const passwordError = page.locator('#im-password-error');
    await expect(passwordError).toBeVisible();
    await expect(passwordError).toContainText('Password must be at least 6 characters.');
  });
});

test.describe('Authentication - Credential Verification', () => {
  test('submitting invalid credentials displays the API error notice', async ({ page }) => {
    await page.goto('/login');

    // Enter well-formed but invalid/nonexistent credentials
    await page.locator('#im-email').fill('nonexistent.qa.test@example.com');
    await page.locator('#im-password').fill('InvalidPassword999!');
    await page.locator('#im-signin-btn').click();

    // The API responds with 401 INVALID_CREDENTIALS, triggering the InfoNotice error alert on the login panel
    const errorNotice = page.locator('.login-panel .im-notice-error');
    await expect(errorNotice).toBeVisible({ timeout: 10000 });
    await expect(errorNotice).toContainText('Invalid work email or password.');

    // The user should remain on the login page
    await expect(page).toHaveURL(/\/login$/);
  });

  test('successful login with valid credentials (conditionally executed)', async ({ page }) => {
    const testEmail = process.env.TEST_USER_EMAIL;
    const testPassword = process.env.TEST_USER_PASSWORD;
    const hasCredentials = Boolean(testEmail && testPassword);

    test.skip(
      !hasCredentials,
      'BLOCKED: No safe test account credentials provided in environment variables (TEST_USER_EMAIL, TEST_USER_PASSWORD). Requires pre-provisioned QA/sandbox user to run without polluting production.'
    );

    if (hasCredentials && testEmail && testPassword) {
      await page.goto('/login');
      await page.locator('#im-email').fill(testEmail);
      await page.locator('#im-password').fill(testPassword);
      await page.locator('#im-signin-btn').click();

      // Successful login should redirect to /dashboard
      await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    }
  });
});

test.describe('Authentication - Registration Form Validation', () => {
  test('empty registration form submission displays required field errors', async ({ page }) => {
    await page.goto('/signup');

    // Submit empty registration form
    await page.locator('#su-submit-btn').click();

    // Verify all required field error messages
    await expect(page.locator('#su-name-error')).toBeVisible();
    await expect(page.locator('#su-name-error')).toHaveText('Full name is required.');

    await expect(page.locator('#su-email-error')).toBeVisible();
    await expect(page.locator('#su-email-error')).toHaveText('Work email is required.');

    await expect(page.locator('#su-company-error')).toBeVisible();
    await expect(page.locator('#su-company-error')).toHaveText('Company name is required.');

    await expect(page.locator('#su-password-error')).toBeVisible();
    await expect(page.locator('#su-password-error')).toHaveText('Password is required.');

    await expect(page.locator('#su-confirm-password-error')).toBeVisible();
    await expect(page.locator('#su-confirm-password-error')).toHaveText('Please confirm your password.');

    // Terms of Service checkbox error
    const termsError = page.locator('.im-form-error').filter({ hasText: /Terms of Service/i });
    await expect(termsError).toBeVisible();
    await expect(termsError).toContainText('You must accept the Terms of Service and Privacy Policy to proceed.');
  });

  test('invalid field inputs display corresponding validation errors', async ({ page }) => {
    await page.goto('/signup');

    // Fill invalid data:
    // Name < 2 characters
    await page.locator('#su-name').fill('A');
    // Invalid email format
    await page.locator('#su-email').fill('not-a-valid-email');
    // Empty company name
    await page.locator('#su-company').fill('');
    // Password < 8 characters
    await page.locator('#su-password').fill('pass1');
    // Confirm password mismatch
    await page.locator('#su-confirm-password').fill('differentpassword');
    // Blur to settle field validation states before clicking submit
    await page.locator('#su-confirm-password').blur();

    await page.locator('#su-submit-btn').click();

    // Verify individual field validation messages
    await expect(page.locator('#su-name-error')).toHaveText('Full name must be at least 2 characters.');
    await expect(page.locator('#su-email-error')).toHaveText('Please enter a valid work email address.');
    await expect(page.locator('#su-company-error')).toHaveText('Company name is required.');
    await expect(page.locator('#su-password-error')).toHaveText('Password must be at least 8 characters.');
    await expect(page.locator('#su-confirm-password-error')).toHaveText('Passwords do not match.');
  });

  test('successful user registration (safety check)', async () => {
    test.skip(
      true,
      'BLOCKED: Creating users against the remote production database without approval or an isolated test database would pollute live records. Requires an isolated test database/tenant or mock auth flag.'
    );
  });
});

test.describe('Authentication - Session, Logout, and Protected Routes', () => {
  test('unauthenticated access to protected routes redirects to /login', async ({ page }) => {
    const protectedRoutes = ['/dashboard', '/meetings', '/schedule', '/ai-notes', '/settings'];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login$/);
      // Ensure login form is presented
      await expect(page.locator('#im-email')).toBeVisible();
      await expect(page.locator('#im-password')).toBeVisible();
    }
  });

  test('logout flow from authenticated dashboard clears session and protects routes', async ({ page }) => {
    // Navigate to /login first to establish origin
    await page.goto('/login');

    const mockUser = {
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

    // Unexpired mock JWT token (exp: 2147483647 -> year 2038)
    const mockJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NTJmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJleHAiOjIxNDc0ODM2NDd9.mock-signature';

    // Seed session in localStorage for this origin
    await page.evaluate(
      ({ user, token }) => {
        localStorage.setItem('intellmeet_access_token', token);
        localStorage.setItem('intellmeet_refresh_token', token);
        localStorage.setItem('intellmeet_user', JSON.stringify(user));
        localStorage.setItem('accessToken', token);
        localStorage.setItem('user', JSON.stringify(user));
      },
      { user: mockUser, token: mockJwt }
    );

    // Navigate to protected /dashboard with active session
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard$/);

    // Verify user profile is rendered in header
    await expect(page.locator('.im-profile-name').first()).toHaveText('QA Test Engineer');

    // Open the user profile dropdown
    const profileMenuButton = page.locator('button[aria-label="Open profile menu"]');
    await expect(profileMenuButton).toBeVisible();
    await profileMenuButton.click();

    // Intercept logout API call to respond immediately and prevent remote network latency
    await page.route('**/auth/logout', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Logged out successfully' }),
      });
    });

    // Verify dropdown is open and click Sign Out
    const dropdown = page.locator('.im-dropdown');
    await expect(dropdown).toBeVisible();
    const signOutBtn = dropdown.locator('button:has-text("Sign Out")');
    await expect(signOutBtn).toBeVisible();
    await signOutBtn.click();

    // Verify redirect to landing page (/)
    await expect(page).toHaveURL(/\/$/);

    // Verify that session storage has been cleaned up asynchronously by logout handler
    await expect
      .poll(async () => page.evaluate(() => localStorage.getItem('intellmeet_access_token')))
      .toBeNull();
    await expect
      .poll(async () => page.evaluate(() => localStorage.getItem('intellmeet_user')))
      .toBeNull();

    // Verify that subsequent access to /dashboard is blocked and redirects to /login
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator('#im-email')).toBeVisible();
  });
});

test.describe('Authentication - Google OAuth Flow & Profile Image Bounding', () => {
  test('Google login button initiates auth with valid redirect_uri', async ({ page }) => {
    await page.goto('/login');

    let interceptedUrl = '';
    await page.route('**/auth/google*', async (route) => {
      interceptedUrl = route.request().url();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            authUrl: 'https://accounts.google.com/o/oauth2/v2/auth?client_id=mock-client-id&response_type=code',
            state: 'mock-state.signature',
          },
        }),
      });
    });

    const googleBtn = page.locator('button:has-text("Continue with Google")');
    await expect(googleBtn).toBeVisible();
    await googleBtn.click();

    // Verify intercepted auth request passes the expected callback redirect_uri
    expect(interceptedUrl).toContain('redirect_uri=');
  });

  test('OAuthCallbackPage handles single-use ticket, purges URL query params, and establishes session', async ({ page }) => {
    const mockUser = {
      id: 'usr_google_12345',
      name: 'Yashodip Jejurkar',
      email: 'yashodip@example.com',
      authProvider: 'google',
      avatar: 'https://lh3.googleusercontent.com/a/mock-high-res-photo.jpg',
    };

    await page.route('**/auth/google/callback', async (route) => {
      const postData = route.request().postDataJSON();
      expect(postData.ticket).toBe('mock_exchange_ticket_xyz');

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            user: mockUser,
            accessToken: 'mock_jwt_access_token_123',
            refreshToken: 'mock_refresh_token_456',
          },
        }),
      });
    });

    // Mock getCurrentUser (/auth/me)
    await page.route('**/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { user: mockUser },
        }),
      });
    });

    // Navigate to callback page with ticket parameter
    await page.goto('/auth/google/callback?ticket=mock_exchange_ticket_xyz');

    // Should redirect to dashboard upon successful ticket exchange
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 10000 });

    // Verify tokens never remain in the URL query string
    expect(page.url()).not.toContain('ticket=');
    expect(page.url()).not.toContain('token=');
    expect(page.url()).not.toContain('refreshToken=');

    // Verify user profile is saved in localStorage
    const savedUser = await page.evaluate(() => localStorage.getItem('intellmeet_user'));
    expect(savedUser).toContain('Yashodip Jejurkar');
  });

  test('Profile avatar in topbar is strictly bounded and does not overflow layout', async ({ page }) => {
    await page.goto('/login');

    const mockUser = {
      id: 'usr_google_bounded_test',
      name: 'Yashodip Jejurkar',
      email: 'yashodip@example.com',
      authProvider: 'google',
      // High-resolution image simulation
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=500&fit=crop',
    };
    const mockJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfZ29vZ2xlX2JvdW5kZWRfdGVzdCIsImV4cCI6MjE0NzQ4MzY0N30.mock-sig';

    await page.evaluate(
      ({ user, token }) => {
        localStorage.setItem('intellmeet_access_token', token);
        localStorage.setItem('intellmeet_refresh_token', token);
        localStorage.setItem('intellmeet_user', JSON.stringify(user));
      },
      { user: mockUser, token: mockJwt }
    );

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard$/);

    const avatarContainer = page.locator('.im-profile-avatar').first();
    await expect(avatarContainer).toBeVisible();

    // Verify the bounding box of the avatar does not exceed 35px in width or height
    const box = await avatarContainer.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(35);
      expect(box.height).toBeLessThanOrEqual(35);
    }
  });

  test('OAuthCallbackPage handles access_denied error gracefully', async ({ page }) => {
    await page.goto('/auth/google/callback?error=access_denied&error_description=User+denied+consent');

    const errorHeading = page.getByRole('heading', { name: /Authentication Failed/i });
    await expect(errorHeading).toBeVisible();

    const returnBtn = page.getByRole('link', { name: /Return to Sign In/i });
    await expect(returnBtn).toBeVisible();
    await returnBtn.click();
  });

  test('JoinMeetingPage renders profile picture avatar when camera is off', async ({ page }) => {
    const mockUser = {
      id: 'usr_test_meet_avatar',
      name: 'Yashodip Jejurkar',
      email: 'yashodip@example.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      role: 'admin',
      isActive: true,
      isEmailVerified: true,
    };
    const mockJwt =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzcl90ZXN0X21lZXRfYXZhdGFyIiwiZXhwIjoxOTk5OTk5OTk5fQ.signature';

    await page.addInitScript(
      ({ user, token }) => {
        localStorage.setItem('intellmeet_access_token', token);
        localStorage.setItem('intellmeet_refresh_token', token);
        localStorage.setItem('intellmeet_user', JSON.stringify(user));
      },
      { user: mockUser, token: mockJwt }
    );

    await page.goto('/meetings/join');
    await expect(page).toHaveURL(/\/meetings\/join/);

    const placeholderAvatar = page.locator('.im-video-placeholder-avatar');
    await expect(placeholderAvatar).toBeVisible();

    const avatarImg = placeholderAvatar.locator('img.im-avatar-img');
    await expect(avatarImg).toBeVisible();
    await expect(avatarImg).toHaveAttribute('src', mockUser.avatar);
  });
});


