import { env } from '../config/env';
import {
  getAccessToken,
  getRefreshToken,
  storeAuthSession,
  clearAuthSession,
  getStoredUser,
} from '../utils/tokenStorage';
import type { RefreshTokenResponse, ApiErrorResponse } from '../types/auth';
import { toast } from '../components/toast/toast';

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Queue mechanism for handling concurrent requests during token refresh
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;
let hasNotifiedSessionExpired = false;

export const apiClient = {
  /**
   * Primary HTTP request method with automatic authorization,
   * single-flight token refresh on 401, request retry, and error normalization.
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), env.apiTimeoutMs);

    if (options.signal) {
      if (options.signal.aborted) {
        controller.abort();
      } else {
        options.signal.addEventListener('abort', () => controller.abort(), { once: true });
      }
    }

    // Endpoint resolution
    const base = env.apiBaseUrl.replace(/\/+$/, '');
    let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    if (base.endsWith('/api/v1') && cleanEndpoint.startsWith('/api/v1')) {
      cleanEndpoint = cleanEndpoint.slice(7);
      if (!cleanEndpoint.startsWith('/')) cleanEndpoint = `/${cleanEndpoint}`;
    }
    const primaryUrl = `${base}${cleanEndpoint}`;

    const method = (options.method || 'GET').toUpperCase();
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    let bodyPayload = options.body;
    if (method === 'POST' || method === 'PATCH' || method === 'PUT') {
      if (bodyPayload === undefined || bodyPayload === null) {
        bodyPayload = '{}';
      }
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }
    } else if (bodyPayload !== undefined) {
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }
    }

    // Attach Bearer token if available
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
          body: bodyPayload,
          credentials: 'include',
          signal: controller.signal,
        });
      } catch (err: unknown) {
        // Fallback to remoteApiBaseUrl if relative fetch fails in non-proxy environments
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

      // Handle 401 Unauthorized token refresh flow (except on auth endpoints itself)
      const isAuthEndpoint =
        cleanEndpoint.includes('/auth/login') ||
        cleanEndpoint.includes('/auth/register') ||
        cleanEndpoint.includes('/auth/refresh') ||
        cleanEndpoint.includes('/auth/forgot-password') ||
        cleanEndpoint.includes('/auth/reset-password');

      if (response.status === 401 && !isRetry && !isAuthEndpoint) {
        const newAccessToken = await this.refreshToken();
        if (newAccessToken) {
          // Retry the request once with the refreshed access token
          return this.request<T>(
            endpoint,
            {
              ...options,
              headers: {
                ...headers,
                Authorization: `Bearer ${newAccessToken}`,
              },
            },
            true
          );
        }
      }

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        let errorMessage = 'An error occurred while processing your request.';

        if (responseData) {
          const errorPayload = responseData as ApiErrorResponse;

          if (errorPayload.error?.code === 'INVALID_CREDENTIALS') {
            errorMessage = 'Invalid work email or password.';
          } else if (errorPayload.error?.code === 'EMAIL_ALREADY_EXISTS') {
            errorMessage = 'An account with this email address already exists.';
          } else if (errorPayload.error?.code === 'INVALID_RESET_TOKEN') {
            errorMessage = 'Invalid or expired password reset link. Please request a new one.';
          } else if (errorPayload.error?.details && errorPayload.error.details.length > 0) {
            const firstDetail = errorPayload.error.details[0];
            errorMessage = firstDetail.message
              ? `Validation error: ${firstDetail.message}`
              : errorPayload.message || 'Validation failed.';
          } else if (errorPayload.message) {
            errorMessage = errorPayload.message;
          }
        } else {
          errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
        }

        throw new ApiError(
          errorMessage,
          response.status,
          responseData?.error?.code,
          responseData?.error?.details
        );
      }

      return responseData as T;
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      const err = error as Error & { status?: number };
      if (err.name === 'AbortError') {
        if (options.signal?.aborted) {
          throw error;
        }
        throw new ApiError('Request timed out. Please check your connection and try again.', 408);
      }
      throw error;
    }
  },

  /**
   * Refreshes access token with concurrency-safe single-flight promise locking.
   * If multiple requests hit 401 simultaneously, only one refresh call is made.
   */
  async refreshToken(): Promise<string | null> {
    if (isRefreshing && refreshPromise) {
      return refreshPromise;
    }

    const currentRefreshToken = getRefreshToken();
    if (!currentRefreshToken) {
      this.handleSessionExpired();
      return null;
    }

    isRefreshing = true;

    refreshPromise = (async () => {
      try {
        const base = env.apiBaseUrl.replace(/\/+$/, '');
        const refreshUrl = `${base}/auth/refresh`;

        const response = await fetch(refreshUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ refreshToken: currentRefreshToken }),
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Refresh token rejected');
        }

        const data: RefreshTokenResponse = await response.json();

        if (data && data.success && data.data) {
          const { accessToken, refreshToken: newRefreshToken, user } = data.data;
          const currentUser = user || getStoredUser();

          if (currentUser) {
            storeAuthSession(accessToken, newRefreshToken || currentRefreshToken, currentUser);
          }

          hasNotifiedSessionExpired = false;
          return accessToken;
        }

        throw new Error('Invalid refresh response payload');
      } catch {
        this.handleSessionExpired();
        return null;
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  },

  /**
   * Cleans up invalid or expired session and redirects cleanly to login.
   */
  handleSessionExpired() {
    clearAuthSession();

    if (!hasNotifiedSessionExpired) {
      hasNotifiedSessionExpired = true;
      toast.warning('Your session has expired. Please sign in again.');
    }

    // Only redirect if currently on a protected route
    if (window.location.pathname.startsWith('/dashboard') || window.location.pathname.startsWith('/meetings') || window.location.pathname.startsWith('/settings')) {
      window.location.href = '/login';
    }
  },

  get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  patch<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  },
};

export default apiClient;
