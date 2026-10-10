/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import type { AuthUser, RegisterPayload, RegisterResponse, LoginPayload, LoginResponse } from '../types/auth';
import {
  getStoredUser,
  getAccessToken,
  getRefreshToken,
  storeAuthSession,
  clearAuthSession,
  isJwtExpired,
} from '../utils/tokenStorage';
import { AuthService, normalizeAuthUser } from '../services/auth.service';

export interface UserProfile extends AuthUser {
  company: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  register: (payload: RegisterPayload) => Promise<RegisterResponse>;
  login: (email: string, name?: string, company?: string) => void;
  loginWithCredentials: (payload: LoginPayload) => Promise<LoginResponse>;
  setAuthSessionState: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Derives a human-friendly display name from an email address
 */
const deriveNameFromEmail = (email: string): string => {
  const localPart = email.split('@')[0] || 'User';
  return localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from persistent localStorage
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = getStoredUser();
    if (stored) return stored;

    // Check legacy sessionStorage if present
    try {
      const demoStored = sessionStorage.getItem('intellmeet_demo_auth_session');
      if (demoStored) {
        return normalizeAuthUser(JSON.parse(demoStored));
      }
    } catch {
      // Ignore
    }
    return null;
  });

  const [accessToken, setAccessToken] = useState<string | null>(() => getAccessToken());
  const [refreshToken, setRefreshToken] = useState<string | null>(() => getRefreshToken());

  // Check valid token expiration on mount
  useEffect(() => {
    const currentToken = getAccessToken();
    if (currentToken && isJwtExpired(currentToken)) {
      // If access token is expired and no valid refresh, clear
      // For now, if refresh token exists, we keep session alive
      const currentRefresh = getRefreshToken();
      if (!currentRefresh) {
        clearAuthSession();
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
      }
    }
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

  const loginWithCredentials = useCallback(
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

  const login = useCallback(
    (email: string, name?: string, company?: string) => {
      const formattedEmail = email.trim();
      const formattedName = name?.trim() || deriveNameFromEmail(formattedEmail);
      const formattedCompany = company?.trim() || 'Enterprise Workspace';

      const newUser: AuthUser = normalizeAuthUser({
        name: formattedName,
        email: formattedEmail,
        company: formattedCompany,
        jobTitle: 'Product Lead',
      });

      // Dummy tokens for demo fallback if needed
      const dummyToken = 'demo-token-' + Date.now();
      setAuthSessionState(newUser, dummyToken, dummyToken);
    },
    [setAuthSessionState]
  );

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    AuthService.logout().catch(() => {
      // Cleanup locally regardless
      clearAuthSession();
    });
  }, []);

  const isAuthenticated = Boolean(user && accessToken);

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      accessToken,
      refreshToken,
      register,
      login,
      loginWithCredentials,
      setAuthSessionState,
      logout,
    }),
    [
      isAuthenticated,
      user,
      accessToken,
      refreshToken,
      register,
      login,
      loginWithCredentials,
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
