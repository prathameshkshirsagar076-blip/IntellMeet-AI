import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthService, handleGoogleCallback } from '../services/auth.service';
import { authApi } from '../api/auth.api';
import { normalizeAuthUser } from '../services/auth.service';
import type { AuthUser } from '../types/auth';
import BrandLogo from '../components/BrandLogo';
import { toast } from '../components/toast/toast';
import '../components/LoginPanel.css';
import '../styles/authPages.css';

export const OAuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthSessionState } = useAuth();

  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate processing in React StrictMode
    if (hasProcessedRef.current) return;
    hasProcessedRef.current = true;

    const processOAuthCallback = async () => {
      const searchParams = new URLSearchParams(location.search);
      const errorParam = searchParams.get('error');
      const errorDesc = searchParams.get('error_description');

      // 1. Handle error cases from Google OAuth redirect
      if (errorParam) {
        setStatus('error');
        let friendlyMessage = errorDesc || 'Google authentication could not be completed.';

        if (errorParam === 'access_denied') {
          friendlyMessage =
            'Google sign-in was cancelled or access was denied. Please try signing in again.';
        } else if (errorParam === 'INVALID_OAUTH_STATE') {
          friendlyMessage =
            'The authentication security session expired or was invalid. Please try again.';
        } else if (errorParam === 'ACCOUNT_DISABLED') {
          friendlyMessage =
            'Your workspace account is currently disabled. Please contact your administrator.';
        } else if (errorParam === 'OAUTH_CODE_EXPIRED' || errorParam === 'invalid_grant') {
          friendlyMessage =
            'The Google authorization code has expired. Please initiate sign-in again.';
        }

        setErrorMessage(friendlyMessage);
        toast.error(friendlyMessage);
        return;
      }

      // 2. Secure Single-Use Ticket Flow (Recommended - No tokens in URL)
      const ticket = searchParams.get('ticket');
      if (ticket) {
        try {
          // Immediately remove ticket from URL query string to protect history
          if (typeof window !== 'undefined' && window.history?.replaceState) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }

          const response = await (AuthService?.handleGoogleCallback || handleGoogleCallback)({ ticket });
          if (response?.data) {
            const { user, accessToken, refreshToken } = response.data;
            setAuthSessionState(user, accessToken, refreshToken);

            // Fetch fresh profile in background
            try {
              const meResponse = await authApi.getCurrentUser();
              if (meResponse?.data?.user) {
                const freshUser = normalizeAuthUser(meResponse.data.user);
                setAuthSessionState(freshUser, accessToken, refreshToken);
              }
            } catch (syncErr) {
              console.warn('[OAuthCallback] Background profile sync:', syncErr);
            }

            toast.success('Successfully authenticated with Google Workspace!');
            navigate('/dashboard', { replace: true });
            return;
          }
          throw new Error('Incomplete authentication response received from server.');
        } catch (err: unknown) {
          const error = err as Error;
          setStatus('error');
          const msg = error.message || 'Failed to complete Google authentication.';
          setErrorMessage(msg);
          toast.error(msg);
          return;
        }
      }

      // 3. Direct Backend Callback Flow (Legacy fallback with immediate URL query purge)
      const token = searchParams.get('token');
      const refreshToken = searchParams.get('refreshToken');
      const userParam = searchParams.get('user');

      if (token && refreshToken) {
        // Immediately sanitize URL bar so sensitive tokens do not persist in history
        if (typeof window !== 'undefined' && window.history?.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        try {
          // Parse user payload from query if available
          let initialUser: AuthUser = normalizeAuthUser({
            name: 'Google Workspace User',
            email: '',
            authProvider: 'google',
          });

          if (userParam) {
            try {
              const parsed = JSON.parse(decodeURIComponent(userParam));
              initialUser = normalizeAuthUser(parsed);
            } catch {
              // fallback to default
            }
          }

          // 1. Establish session in localStorage and React auth context immediately
          setAuthSessionState(initialUser, token, refreshToken);

          // 2. Fetch authenticated profile from /auth/me with the valid token to ensure complete profile data
          try {
            const meResponse = await authApi.getCurrentUser();
            if (meResponse?.data?.user) {
              const freshUser = normalizeAuthUser(meResponse.data.user);
              setAuthSessionState(freshUser, token, refreshToken);
            }
          } catch (syncErr) {
            console.warn('[OAuthCallback] Background profile sync:', syncErr);
          }

          toast.success('Successfully authenticated with Google Workspace!');
          navigate('/dashboard', { replace: true });
          return;
        } catch (err: unknown) {
          const error = err as Error;
          setStatus('error');
          const msg = error.message || 'Failed to establish authentication session.';
          setErrorMessage(msg);
          toast.error(msg);
          return;
        }
      }

      // 4. Frontend Authorization Code Flow: code & state in URL
      const code = searchParams.get('code');
      const state = searchParams.get('state') || undefined;

      if (code) {
        if (typeof window !== 'undefined' && window.history?.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        try {
          let stateRedirectUri: string | undefined;
          if (state && state.includes('.')) {
            try {
              const payloadB64 = state.split('.')[0];
              const jsonStr = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
              const parsedState = JSON.parse(jsonStr);
              if (parsedState?.redirectUri && typeof parsedState.redirectUri === 'string') {
                stateRedirectUri = parsedState.redirectUri;
              }
            } catch {
              // fallback to standard callback path
            }
          }

          const redirectUri = stateRedirectUri || `${window.location.origin}/auth/google/callback`;
          const response = await (AuthService?.handleGoogleCallback || handleGoogleCallback)({
            code,
            state,
            redirect_uri: redirectUri,
          });

          if (response?.data) {
            const { user, accessToken, refreshToken: newRefreshToken } = response.data;
            setAuthSessionState(user, accessToken, newRefreshToken);
            toast.success('Successfully authenticated with Google Workspace!');
            navigate('/dashboard', { replace: true });
            return;
          }

          throw new Error('Incomplete authentication response received from server.');
        } catch (err: unknown) {
          const error = err as Error & { code?: string };
          setStatus('error');
          let msg = error.message || 'Failed to verify Google authorization code.';

          if (error.code === 'INVALID_OAUTH_STATE') {
            msg = 'The authentication security state was invalid or expired. Please sign in again.';
          } else if (error.code === 'ACCOUNT_DISABLED') {
            msg = 'Your workspace account is disabled. Please contact your administrator.';
          }

          setErrorMessage(msg);
          toast.error(msg);
          return;
        }
      }

      // 4. Fallback if no relevant parameters were found
      setStatus('error');
      setErrorMessage(
        'No authentication credentials or authorization code was received. Please return to the login screen and try again.'
      );
    };

    processOAuthCallback();
  }, [location.search, navigate, setAuthSessionState]);

  return (
    <div className="login-panel" style={{ maxWidth: '480px', margin: '40px auto', padding: '32px 28px' }}>
      <div className="login-top-bar" style={{ justifyContent: 'center', marginBottom: '24px' }}>
        <BrandLogo to="/" />
      </div>

      {status === 'loading' && (
        <div style={{ textAlign: 'center', padding: '24px 0' }} role="status" aria-live="polite">
          <div
            style={{
              width: '44px',
              height: '44px',
              margin: '0 auto 20px',
              border: '3px solid rgba(79, 70, 229, 0.15)',
              borderTopColor: '#4f46e5',
              borderRadius: '50%',
              animation: 'im-spin 0.8s linear infinite',
            }}
          />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--im-text-primary)', marginBottom: '8px' }}>
            Authenticating with Google Workspace
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--im-text-muted)', lineHeight: '1.5' }}>
            Verifying your identity and setting up your secure session...
          </p>
        </div>
      )}

      {status === 'error' && (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              margin: '0 auto 16px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--im-text-primary)', marginBottom: '10px' }}>
            Authentication Failed
          </h2>

          <div
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#dc2626',
              fontSize: '0.875rem',
              lineHeight: '1.5',
              marginBottom: '24px',
              textAlign: 'left',
            }}
          >
            {errorMessage}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link
              to="/login"
              className="login-btn-primary"
              style={{
                display: 'block',
                textDecoration: 'none',
                textAlign: 'center',
                padding: '10px 16px',
                borderRadius: '8px',
                fontWeight: 600,
                backgroundColor: 'var(--im-primary, #4f46e5)',
                color: '#ffffff',
              }}
            >
              Return to Sign In
            </Link>

            <Link
              to="/signup"
              style={{
                display: 'block',
                textDecoration: 'none',
                textAlign: 'center',
                fontSize: '0.875rem',
                color: 'var(--im-text-muted)',
                marginTop: '4px',
              }}
            >
              Create a new workspace account instead
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default OAuthCallbackPage;
