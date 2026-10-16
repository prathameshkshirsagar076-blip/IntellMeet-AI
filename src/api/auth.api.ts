import { apiClient } from './client';
import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
  LogoutResponse,
  CurrentUserResponse,
} from '../types/auth';
import {
  storeAuthSession,
  clearAuthSession,
  getRefreshToken,
} from '../utils/tokenStorage';

export const authApi = {
  /**
   * Authenticate with email, password, and rememberMe flag.
   */
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      email: payload.email.toLowerCase().trim(),
      password: payload.password,
      rememberMe: Boolean(payload.rememberMe),
    });

    if (response?.data) {
      const { accessToken, refreshToken, user } = response.data;
      storeAuthSession(accessToken, refreshToken, user);
    }

    return response;
  },

  /**
   * Register a new user account.
   */
  async register(payload: RegisterPayload): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>('/auth/register', {
      name: payload.name.trim(),
      email: payload.email.toLowerCase().trim(),
      password: payload.password,
      companyName: payload.companyName.trim(),
    });

    if (response?.data) {
      const { accessToken, refreshToken, user } = response.data;
      storeAuthSession(accessToken, refreshToken, user);
    }

    return response;
  },

  /**
   * Request password reset instructions.
   */
  async forgotPassword(payload: ForgotPasswordPayload): Promise<ForgotPasswordResponse> {
    return apiClient.post<ForgotPasswordResponse>('/auth/forgot-password', {
      email: payload.email.toLowerCase().trim(),
    });
  },

  /**
   * Reset user password using token from reset flow and new password.
   */
  async resetPassword(payload: ResetPasswordPayload): Promise<ResetPasswordResponse> {
    return apiClient.post<ResetPasswordResponse>('/auth/reset-password', {
      token: payload.token.trim(),
      newPassword: payload.newPassword,
    });
  },

  /**
   * Revoke session and log out.
   */
  async logout(): Promise<LogoutResponse> {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) {
        return await apiClient.post<LogoutResponse>('/auth/logout', { refreshToken });
      }
      return { success: true, message: 'Logged out successfully' };
    } finally {
      clearAuthSession();
    }
  },

  /**
   * Fetch authenticated user details from /auth/me.
   */
  async getCurrentUser(): Promise<CurrentUserResponse> {
    return apiClient.get<CurrentUserResponse>('/auth/me');
  },

  /**
   * Request Google OAuth authorization URL from backend.
   */
  async getGoogleAuthUrl(params?: {
    redirectUri?: string;
    flow?: 'login' | 'signup';
  }): Promise<{ success: boolean; data: { authUrl: string; state: string } }> {
    const query = new URLSearchParams({ format: 'json' });
    if (params?.redirectUri) query.set('redirect_uri', params.redirectUri);
    if (params?.flow) query.set('flow', params.flow);
    return apiClient.get<{ success: boolean; data: { authUrl: string; state: string } }>(
      `/auth/google?${query.toString()}`
    );
  },

  /**
   * Exchange Google authorization code or single-use session ticket for session tokens.
   */
  async googleCallback(payload: {
    code?: string;
    ticket?: string;
    state?: string;
    redirect_uri?: string;
  }): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/google/callback', payload);

    if (response?.data) {
      const { accessToken, refreshToken, user } = response.data;
      storeAuthSession(accessToken, refreshToken, user);
    }

    return response;
  },
};

export default authApi;
