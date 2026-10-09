/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

export interface UserProfile {
  name: string;
  email: string;
  company: string;
  jobTitle?: string;
  avatar?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: (email: string, name?: string, company?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_STORAGE_KEY = 'intellmeet_demo_auth_session';

/**
 * Derives a human-friendly display name from an email address
 * e.g., 'elena.rostova@company.com' -> 'Elena Rostova'
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
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = sessionStorage.getItem(DEMO_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as UserProfile;
      }
    } catch {
      // In case sessionStorage is unavailable or corrupt
    }
    return null;
  });

  const isAuthenticated = Boolean(user);

  useEffect(() => {
    try {
      if (user) {
        sessionStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(user));
      } else {
        sessionStorage.removeItem(DEMO_STORAGE_KEY);
      }
    } catch {
      // Ignore sessionStorage errors
    }
  }, [user]);

  const login = (email: string, name?: string, company?: string) => {
    const formattedEmail = email.trim();
    const formattedName = name?.trim() || deriveNameFromEmail(formattedEmail);
    const formattedCompany = company?.trim() || 'Enterprise Workspace';

    const newUser: UserProfile = {
      name: formattedName,
      email: formattedEmail,
      company: formattedCompany,
      jobTitle: 'Product Lead',
      avatar: formattedName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
    };

    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
    try {
      sessionStorage.removeItem(DEMO_STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      login,
      logout,
    }),
    [isAuthenticated, user]
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
