import type { AuthUser, AuthTokens } from '../types/auth';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'intellmeet_access_token',
  REFRESH_TOKEN: 'intellmeet_refresh_token',
  USER: 'intellmeet_user',
  // Backward/generic compatibility keys
  LEGACY_ACCESS_TOKEN: 'accessToken',
  LEGACY_REFRESH_TOKEN: 'refreshToken',
  LEGACY_USER: 'user',
} as const;

/**
 * Safely stores authentication tokens and user profile into localStorage.
 */
export const storeAuthSession = (
  accessToken: string,
  refreshToken: string,
  user: AuthUser
): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

    // Also mirror to common shorthand keys for developer convenience
    localStorage.setItem(STORAGE_KEYS.LEGACY_ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.LEGACY_REFRESH_TOKEN, refreshToken);
    localStorage.setItem(STORAGE_KEYS.LEGACY_USER, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to save authentication session to localStorage:', error);
  }
};

/**
 * Retrieves the stored access token.
 */
export const getAccessToken = (): string | null => {
  try {
    return (
      localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ||
      localStorage.getItem(STORAGE_KEYS.LEGACY_ACCESS_TOKEN) ||
      null
    );
  } catch {
    return null;
  }
};

/**
 * Retrieves the stored refresh token.
 */
export const getRefreshToken = (): string | null => {
  try {
    return (
      localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) ||
      localStorage.getItem(STORAGE_KEYS.LEGACY_REFRESH_TOKEN) ||
      null
    );
  } catch {
    return null;
  }
};

/**
 * Retrieves both stored tokens.
 */
export const getAuthTokens = (): AuthTokens | null => {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  if (accessToken && refreshToken) {
    return { accessToken, refreshToken };
  }
  return null;
};

/**
 * Retrieves the stored user profile.
 */
export const getStoredUser = (): AuthUser | null => {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEYS.USER) ||
      localStorage.getItem(STORAGE_KEYS.LEGACY_USER);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

/**
 * Checks if a JWT token has expired or is nearing expiration (within 15s).
 */
export const isJwtExpired = (token?: string | null): boolean => {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload) as { exp?: number };
    if (!decoded.exp) return false;
    // Buffer by 15 seconds
    return Date.now() >= decoded.exp * 1000 - 15000;
  } catch {
    return false;
  }
};

/**
 * Clears all authentication tokens and user data from localStorage and sessionStorage.
 */
export const clearAuthSession = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.LEGACY_ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.LEGACY_REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.LEGACY_USER);
    sessionStorage.removeItem('intellmeet_demo_auth_session');
  } catch (error) {
    console.error('Failed to clear auth session:', error);
  }
};
