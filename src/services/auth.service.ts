import { authApi } from '../api/auth.api';
import type {
  RegisterPayload,
  RegisterResponse,
  LoginPayload,
  LoginResponse,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
  LogoutResponse,
  AuthUser,
} from '../types/auth';
import {
  getAccessToken,
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

/**
 * Initiates Google OAuth authentication by redirecting to Google authorization endpoint.
 * If VITE_GOOGLE_CALLBACK_URL or customRedirectUri is configured, passes that redirect_uri;
 * otherwise, allows backend to use its registered GOOGLE_CALLBACK_URL.
 */
export const initiateGoogleAuth = async (
  flow: 'login' | 'signup' = 'login',
  customRedirectUri?: string
): Promise<void> => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  const defaultCallback = `${origin}/auth/google/callback`;
  const redirectUri =
    customRedirectUri ||
    import.meta.env.VITE_GOOGLE_CALLBACK_URL ||
    defaultCallback;

  try {
    const res = await authApi.getGoogleAuthUrl({ flow, redirectUri });
    if (res?.data?.authUrl) {
      window.location.href = res.data.authUrl;
      return;
    }
  } catch (err: unknown) {
    // If backend returned a clear API error (e.g. PROVIDER_NOT_CONFIGURED), rethrow so UI can notify user
    const apiErr = err as { status?: number; message?: string };
    if (apiErr?.status === 501 || apiErr?.message?.includes('not configured')) {
      throw new Error(
        apiErr.message || 'Google Workspace authentication is not configured on this server.',
        { cause: err }
      );
    }
    // Fallback: direct browser navigation to backend Google auth endpoint
  }
  const backendBase = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/+$/, '');
  const query = new URLSearchParams({ flow });
  if (redirectUri) {
    query.set('redirect_uri', redirectUri);
  }
  const directUrl = `${backendBase || ''}/api/v1/auth/google?${query.toString()}`;
  window.location.href = directUrl;
};

/**
 * Exchanges Google callback code or single-use session ticket and stores the normalized user session.
 */
export const handleGoogleCallback = async (payload: {
  code?: string;
  ticket?: string;
  state?: string;
  redirect_uri?: string;
}): Promise<LoginResponse> => {
  const response = await authApi.googleCallback(payload);
  if (response?.data) {
    const normalized = normalizeAuthUser(response.data.user);
    return {
      ...response,
      data: {
        ...response.data,
        user: normalized,
      },
    };
  }
  return response;
};

export const AuthService = {
  /**
   * Registers a new user account through centralized authApi.
   */
  register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const response = await authApi.register(payload);
    if (response?.data) {
      const normalized = normalizeAuthUser(response.data.user, payload.companyName);
      return {
        ...response,
        data: {
          ...response.data,
          user: normalized,
        },
      };
    }
    return response;
  },

  /**
   * Authenticates user with email, password, and rememberMe flag.
   */
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const response = await authApi.login(payload);
    if (response?.data) {
      const normalized = normalizeAuthUser(response.data.user);
      return {
        ...response,
        data: {
          ...response.data,
          user: normalized,
        },
      };
    }
    return response;
  },

  /**
   * Request password reset instructions.
   */
  forgotPassword: async (payload: ForgotPasswordPayload): Promise<ForgotPasswordResponse> => {
    return authApi.forgotPassword(payload);
  },

  /**
   * Reset user password with token and new password.
   */
  resetPassword: async (payload: ResetPasswordPayload): Promise<ResetPasswordResponse> => {
    return authApi.resetPassword(payload);
  },

  /**
   * Logs out current session, revoking refresh token on server and clearing local storage.
   */
  logout: async (): Promise<LogoutResponse> => {
    return authApi.logout();
  },

  /**
   * Initiates Google OAuth flow.
   */
  initiateGoogleAuth,

  /**
   * Exchanges Google callback code or ticket.
   */
  handleGoogleCallback,

  /**
   * Check if user is currently authenticated with a stored profile and token.
   */
  isAuthenticated: (): boolean => {
    const token = getAccessToken();
    const user = getStoredUser();
    return Boolean(token && user);
  },
};

export default AuthService;
