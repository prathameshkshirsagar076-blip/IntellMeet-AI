/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import type {
  AuthUser,
  RegisterPayload,
  RegisterResponse,
  LoginPayload,
  LoginResponse,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
} from '../types/auth';
import {
  getStoredUser,
  getAccessToken,
  getRefreshToken,
  storeAuthSession,
  clearAuthSession,
  isJwtExpired,
} from '../utils/tokenStorage';
import { AuthService, normalizeAuthUser } from '../services/auth.service';
import { authApi } from '../api/auth.api';
import { chatSocketService } from '../services/chatSocket.service';

export interface UserProfile extends AuthUser {
  company: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (payload: LoginPayload) => Promise<LoginResponse>;
  register: (payload: RegisterPayload) => Promise<RegisterResponse>;
  forgotPassword: (payload: ForgotPasswordPayload) => Promise<ForgotPasswordResponse>;
  resetPassword: (payload: ResetPasswordPayload) => Promise<ResetPasswordResponse>;
  setAuthSessionState: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [accessToken, setAccessToken] = useState<string | null>(() => getAccessToken());
  const [refreshToken, setRefreshToken] = useState<string | null>(() => getRefreshToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Synchronize and validate session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = getAccessToken();
        const storedRefresh = getRefreshToken();
        const storedProfile = getStoredUser();

        if (storedToken && !isJwtExpired(storedToken) && storedProfile) {
          setUser(storedProfile);
          setAccessToken(storedToken);
          setRefreshToken(storedRefresh);

          // Verify session in background with /auth/me
          authApi.getCurrentUser()
            .then((res) => {
              if (res?.data?.user) {
                const normalized = normalizeAuthUser(res.data.user);
                setUser(normalized);
                if (storedToken && storedRefresh) {
                  storeAuthSession(storedToken, storedRefresh, normalized);
                }
              }
            })
            .catch(() => {
              // Ignore background sync errors; let interceptor handle if token expires
            });
        } else if (storedRefresh) {
          // Access token expired but refresh token exists - keep profile, apiClient refreshes token on demand
          if (!storedToken) {
            setUser(storedProfile);
          }
        } else {
          clearAuthSession();
          setUser(null);
          setAccessToken(null);
          setRefreshToken(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const setAuthSessionState = useCallback(
    (newUser: AuthUser, newAccessToken: string, newRefreshToken: string) => {
      storeAuthSession(newAccessToken, newRefreshToken, newUser);
      setUser(newUser);
      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);
    },
    []
  );

  const login = useCallback(
    async (payload: LoginPayload): Promise<LoginResponse> => {
      const response = await AuthService.login(payload);
      if (response?.data) {
        setAuthSessionState(
          response.data.user,
          response.data.accessToken,
          response.data.refreshToken
        );
      }
      return response;
    },
    [setAuthSessionState]
  );

  const register = useCallback(
    async (payload: RegisterPayload): Promise<RegisterResponse> => {
      const response = await AuthService.register(payload);
      if (response?.data) {
        setAuthSessionState(
          response.data.user,
          response.data.accessToken,
          response.data.refreshToken
        );
      }
      return response;
    },
    [setAuthSessionState]
  );

  const forgotPassword = useCallback(
    async (payload: ForgotPasswordPayload): Promise<ForgotPasswordResponse> => {
      return AuthService.forgotPassword(payload);
    },
    []
  );

  const resetPassword = useCallback(
    async (payload: ResetPasswordPayload): Promise<ResetPasswordResponse> => {
      return AuthService.resetPassword(payload);
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await AuthService.logout();
    } catch {
      // Local session cleaned up regardless
    } finally {
      chatSocketService.disconnect();
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      clearAuthSession();
    }
  }, []);

  const isAuthenticated = Boolean(user && accessToken);

  const value = useMemo(
    () => ({
      isAuthenticated,
      isLoading,
      user,
      accessToken,
      refreshToken,
      login,
      register,
      forgotPassword,
      resetPassword,
      setAuthSessionState,
      logout,
    }),
    [
      isAuthenticated,
      isLoading,
      user,
      accessToken,
      refreshToken,
      login,
      register,
      forgotPassword,
      resetPassword,
      setAuthSessionState,
      logout,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
