import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthService } from '../services/auth.service';
import BrandLogo from '../components/BrandLogo';
import FormInput from '../components/FormInput';
import PasswordInput from '../components/PasswordInput';
import PrimaryButton from '../components/PrimaryButton';
import SocialLoginButton from '../components/SocialLoginButton';
import { type SSOProvider, SSO_PROVIDER_NAMES } from '../constants/auth';
import InfoNotice from '../components/InfoNotice';
import { MailIcon } from '../components/icons';
import { validateEmail, validatePassword } from '../utils/validation';
import { toast } from '../components/toast/toast';
import ThemeCustomizationPopover from '../components/theme/ThemeCustomizationPopover';
import '../components/LoginPanel.css';
import '../styles/authPages.css';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showThemePopover, setShowThemePopover] = useState(false);
  const themeBtnRef = useRef<HTMLButtonElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Validation state
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

  // SSO Notice
  const [ssoNotice, setSsoNotice] = useState<string | null>(null);

  // Check URL params for errors passed back from OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const err = params.get('error');
    const desc = params.get('error_description');
    if (err) {
      let friendlyMsg = desc || 'Google sign-in could not be completed.';
      if (err === 'access_denied') {
        friendlyMsg = 'Google sign-in was cancelled or consent was denied. Please try again.';
      } else if (err === 'INVALID_OAUTH_STATE') {
        friendlyMsg = 'Authentication security state expired or was invalid. Please try again.';
      } else if (err === 'ACCOUNT_DISABLED') {
        friendlyMsg = 'This account is currently disabled. Please contact your workspace administrator.';
      }
      setApiError(friendlyMsg);
      toast.error(friendlyMsg);
    }
  }, [location.search]);

  // If already authenticated, redirect to destination
  useEffect(() => {
    if (isAuthenticated) {
      const state = location.state as { from?: { pathname: string } } | undefined;
      const destination = state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Validation helper
  const validateForm = (): boolean => {
    const nextErrors: { email?: string; password?: string } = {};

    const emailErr = validateEmail(email);
    if (emailErr) nextErrors.email = emailErr;

    const passErr = validatePassword(password, { minLength: 6 });
    if (passErr) nextErrors.password = passErr;

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setTouched({ email: true, password: true });
    setApiError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await login({
        email: email.trim().toLowerCase(),
        password,
        rememberMe: remember,
      });

      const successMsg = response.message || 'Login successful';
      toast.success(successMsg);

      const state = location.state as { from?: { pathname: string } } | undefined;
      const destination = state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err: unknown) {
      const error = err as Error & { code?: string };
      const errorMsg =
        error.message ||
        'Invalid work email or password. Please verify your credentials or register an account.';

      setApiError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSSOClick = async (provider: SSOProvider) => {
    if (provider === 'google') {
      if (isGoogleLoading || isSubmitting) return;
      setIsGoogleLoading(true);
      setApiError(null);
      setSsoNotice(null);
      try {
        await AuthService.initiateGoogleAuth('login');
      } catch (err: unknown) {
        const error = err as Error;
        const msg = error.message || 'Google Workspace sign-in is currently unavailable.';
        setApiError(msg);
        toast.error(msg);
        setIsGoogleLoading(false);
      }
      return;
    }

    setSsoNotice(
      `SSO Integration Notice: Enterprise sign-in via ${SSO_PROVIDER_NAMES[provider]} requires an active Identity Provider integration. Please use your work email and password or register a new workspace account.`
    );
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (touched.email) {
      setErrors((prev) => ({ ...prev, email: validateEmail(val) }));
    }
  };

  const handleEmailBlur = () => {
    setTouched((prev) => ({ ...prev, email: true }));
    setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    if (touched.password) {
      setErrors((prev) => ({
        ...prev,
        password: validatePassword(val, { minLength: 6 }),
      }));
    }
  };

  const handlePasswordBlur = () => {
    setTouched((prev) => ({ ...prev, password: true }));
    setErrors((prev) => ({
      ...prev,
      password: validatePassword(password, { minLength: 6 }),
    }));
  };

  return (
    <div className="login-panel">
      {/* Top Bar with Brand & Back to Home */}
      <div className="login-top-bar">
        <BrandLogo to="/" />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <button
              ref={themeBtnRef}
              type="button"
              className="login-back-home-btn"
              onClick={() => setShowThemePopover(!showThemePopover)}
              aria-label="Customize theme"
              style={{ cursor: 'pointer' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
              </svg>
              <span>Theme</span>
            </button>
            {showThemePopover && (
              <ThemeCustomizationPopover
                onClose={() => setShowThemePopover(false)}
                triggerRef={themeBtnRef}
              />
            )}
          </div>

          <Link
            to="/"
            className="login-back-home-btn"
            aria-label="View Product Landing Page"
          >
            <span>Home</span>
          </Link>
        </div>
      </div>

      {/* Mode Switch Tabs: Sign In & Sign Up buttons */}
      <div className="login-mode-switch-wrapper" role="tablist" aria-label="Authentication modes">
        <button
          type="button"
          className="login-mode-tab-btn active"
          id="tab-btn-signin"
          role="tab"
          aria-selected="true"
        >
          Sign In
        </button>
        <button
          type="button"
          className="login-mode-tab-btn"
          id="tab-btn-signup"
          role="tab"
          aria-selected="false"
          onClick={() => navigate('/signup')}
        >
          Sign Up
        </button>
      </div>

      {/* Welcome Heading */}
      <div className="login-heading-block">
        <h1>Welcome to IntellMeet</h1>
        <p>Sign in to access your AI meeting intelligence, live summaries, and workspaces.</p>
      </div>

      {/* API Error Notice */}
      {apiError && (
        <InfoNotice
          variant="error"
          title="Authentication Notice"
          onDismiss={() => setApiError(null)}
        >
          {apiError}
        </InfoNotice>
      )}

      {/* SSO Notice Banner */}
      {ssoNotice && (
        <InfoNotice
          variant="info"
          title="Enterprise Identity Provider Notice"
          onDismiss={() => setSsoNotice(null)}
        >
          {ssoNotice}
        </InfoNotice>
      )}

      {/* Login Form */}
      <form className="login-form" onSubmit={handleSubmit} noValidate>
        {/* Work Email Field */}
        <FormInput
          id="im-email"
          label="Work Email"
          type="email"
          value={email}
          disabled={isSubmitting}
          onChange={handleEmailChange}
          onBlur={handleEmailBlur}
          placeholder="name@company.com"
          autoComplete="email"
          icon={<MailIcon />}
          error={errors.email}
          required
        />

        {/* Password Field */}
        <PasswordInput
          id="im-password"
          label="Password"
          value={password}
          disabled={isSubmitting}
          onChange={handlePasswordChange}
          onBlur={handlePasswordBlur}
          placeholder="••••••••••••"
          autoComplete="current-password"
          rightAction={
            <Link to="/forgot-password" className="login-forgot-link" id="im-forgot-password">
              Forgot password?
            </Link>
          }
          error={errors.password}
          required
        />

        {/* Remember this device checkbox */}
        <label className="login-remember-label" htmlFor="im-remember">
          <input
            id="im-remember"
            type="checkbox"
            checked={remember}
            disabled={isSubmitting}
            onChange={(e) => setRemember(e.target.checked)}
            aria-label="Remember this device for 30 days"
          />
          <span className="login-remember-text">Remember this device for 30 days</span>
        </label>

        {/* Sign In Submit Button */}
        <PrimaryButton
          type="submit"
          id="im-signin-btn"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </PrimaryButton>
      </form>

      {/* Bottom Section: Google SSO & Footer */}
      <div className="login-bottom-section">
        {/* Divider */}
        <div className="login-divider">
          <span className="login-divider-line" />
          <span className="login-divider-text">or continue with</span>
          <span className="login-divider-line" />
        </div>

        {/* Google SSO Button placed at the bottom */}
        <div className="login-sso-group">
          <SocialLoginButton
            provider="google"
            label="Continue with Google Workspace"
            onClick={handleSSOClick}
            id="im-sso-google"
            loading={isGoogleLoading}
            disabled={isSubmitting || isGoogleLoading}
          />
        </div>

        {/* Footer */}
        <div className="login-footer">
          <p className="login-footer-text">
            Don't have an account?{' '}
            <Link to="/signup" id="im-signup-link" className="login-footer-link">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
