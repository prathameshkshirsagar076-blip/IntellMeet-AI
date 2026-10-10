import { env } from '../config/env';
import type {
  RegisterPayload,
  RegisterResponse,
  LoginPayload,
  LoginResponse,
  ApiErrorResponse,
  AuthUser,
} from '../types/auth';
import {
  storeAuthSession,
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
} from '../utils/tokenStorage';

/**
 * Derives a 2-letter uppercase avatar initials from a user's full name.
 */
export const deriveAvatarInitials = (name?: string): string => {
  if (!name || !name.trim()) return 'IM';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Normalizes user object to guarantee properties needed across the UI.
 */
export const normalizeAuthUser = (
  rawUser: Partial<AuthUser> & { id?: string; _id?: string },
  fallbackCompanyName?: string
): AuthUser => {
  const name = rawUser.name || 'Enterprise User';
  const email = rawUser.email || '';
  const company =
    rawUser.company ||
    rawUser.companyName ||
    fallbackCompanyName ||
    'Enterprise Workspace';

  return {
    id: rawUser.id || rawUser._id || String(Date.now()),
    name,
    email,
    normalizedEmail: rawUser.normalizedEmail || email.toLowerCase(),
    role: rawUser.role || 'user',
    isEmailVerified: Boolean(rawUser.isEmailVerified),
    isActive: rawUser.isActive !== false,
    authProvider: rawUser.authProvider || 'local',
    organizationId: rawUser.organizationId || null,
    providerId: rawUser.providerId || null,
    company,
    companyName: company,
    jobTitle: rawUser.jobTitle || 'Team Member',
    avatar: rawUser.avatar || deriveAvatarInitials(name),
    lastLoginAt: rawUser.lastLoginAt || new Date().toISOString(),
    createdAt: rawUser.createdAt || new Date().toISOString(),
    updatedAt: rawUser.updatedAt || new Date().toISOString(),
  };
};

export class AuthService {
  /**
   * Dispatches an HTTP request with timeout and error handling.
   */
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), env.apiTimeoutMs);

    // Primary endpoint base
    const base = env.apiBaseUrl.replace(/\/+$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const primaryUrl = `${base}${cleanEndpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Attach existing access token if available
    const token = getAccessToken();
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      let response: Response;
      try {
        response = await fetch(primaryUrl, {
          ...options,
          headers,
          credentials: 'include',
          signal: controller.signal,
        });
      } catch (err: unknown) {
        // If relative URL failed (e.g. running in standalone mode or CORS fallback), try remoteApiBaseUrl
        const error = err as Error;
        if (
          error.name !== 'AbortError' &&
          env.remoteApiBaseUrl &&
          !primaryUrl.startsWith('http')
        ) {
          const remoteUrl = `${env.remoteApiBaseUrl.replace(/\/+$/, '')}${cleanEndpoint}`;
          response = await fetch(remoteUrl, {
            ...options,
            headers,
            credentials: 'include',
            signal: controller.signal,
          });
        } else {
          throw err;
        }
      }

      clearTimeout(timeoutId);

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        let errorMessage = 'An unexpected error occurred during request.';

        if (responseData) {
          const errorPayload = responseData as ApiErrorResponse;

          if (response.status === 409 || errorPayload.error?.code === 'EMAIL_ALREADY_EXISTS') {
            errorMessage = 'An account with this email address already exists. Please sign in instead.';
          } else if (errorPayload.error?.details && errorPayload.error.details.length > 0) {
            // Pick first validation error message
            const firstDetail = errorPayload.error.details[0];
            errorMessage = firstDetail.message
              ? `Validation error: ${firstDetail.message}`
              : errorPayload.message || 'Validation failed.';
          } else if (errorPayload.message) {
            errorMessage = errorPayload.message;
          }
        } else {
          errorMessage = `Server returned error (${response.status}: ${response.statusText})`;
        }

        const apiError = new Error(errorMessage) as Error & {
          status: number;
          code?: string;
          details?: unknown;
        };
        apiError.status = response.status;
        apiError.code = responseData?.error?.code;
        apiError.details = responseData?.error?.details;
        throw apiError;
      }

      return responseData as T;
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      const err = error as Error & { status?: number };
      if (err.name === 'AbortError') {
        const timeoutError = new Error('Request timed out. Please check your network and try again.') as Error & {
          status: number;
        };
        timeoutError.status = 408;
        throw timeoutError;
      }
      throw error;
    }
  }

  /**
   * Registers a new user account, stores authentication tokens in localStorage,
   * and returns the normalized response.
   */
  static async register(payload: RegisterPayload): Promise<RegisterResponse> {
    const sanitizedPayload: RegisterPayload = {
      name: payload.name.trim(),
      email: payload.email.toLowerCase().trim(),
      password: payload.password,
      companyName: payload.companyName.trim(),
    };

    const response = await this.request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(sanitizedPayload),
    });

    if (response?.data) {
      const { user, accessToken, refreshToken } = response.data;
      const normalizedUser = normalizeAuthUser(user, sanitizedPayload.companyName);

      // Persist in localStorage as requested
      storeAuthSession(accessToken, refreshToken, normalizedUser);

      return {
        ...response,
        data: {
          user: normalizedUser,
          accessToken,
          refreshToken,
        },
      };
    }

    return response;
  }

  /**
   * Authenticates user with email and password.
   */
  static async login(payload: LoginPayload): Promise<LoginResponse> {
    const sanitizedPayload: LoginPayload = {
      email: payload.email.toLowerCase().trim(),
      password: payload.password,
      rememberMe: payload.rememberMe ?? true,
    };

    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(sanitizedPayload),
    });

    if (response?.data) {
      const { user, accessToken, refreshToken } = response.data;
      const normalizedUser = normalizeAuthUser(user);

      // Persist in localStorage
      storeAuthSession(accessToken, refreshToken, normalizedUser);

      return {
        ...response,
        data: {
          user: normalizedUser,
          accessToken,
          refreshToken,
        },
      };
    }

    return response;
  }

  /**
   * Logs out current session, clearing local tokens.
   */
  static async logout(): Promise<void> {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) {
        await this.request('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        }).catch(() => {
          // Ignore server logout errors on client cleanup
        });
      }
    } finally {
      clearAuthSession();
    }
  }

  /**
   * Check if user is currently authenticated with a stored profile and token.
   */
  static isAuthenticated(): boolean {
    const token = getAccessToken();
    const user = getStoredUser();
    return Boolean(token && user);
  }
}

export default AuthService;
