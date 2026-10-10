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

export class AuthService {
  /**
   * Registers a new user account through centralized authApi.
   */
  static async register(payload: RegisterPayload): Promise<RegisterResponse> {
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
  }

  /**
   * Authenticates user with email, password, and rememberMe flag.
   */
  static async login(payload: LoginPayload): Promise<LoginResponse> {
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
  }

  /**
   * Request password reset instructions.
   */
  static async forgotPassword(payload: ForgotPasswordPayload): Promise<ForgotPasswordResponse> {
    return authApi.forgotPassword(payload);
  }

  /**
   * Reset user password with token and new password.
   */
  static async resetPassword(payload: ResetPasswordPayload): Promise<ResetPasswordResponse> {
    return authApi.resetPassword(payload);
  }

  /**
   * Logs out current session, revoking refresh token on server and clearing local storage.
   */
  static async logout(): Promise<LogoutResponse> {
    return authApi.logout();
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
