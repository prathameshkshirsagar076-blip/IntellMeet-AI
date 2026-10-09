import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';
import FormInput from '../components/FormInput';
import PasswordInput from '../components/PasswordInput';
import PrimaryButton from '../components/PrimaryButton';
import SocialLoginButton from '../components/SocialLoginButton';
import { type SSOProvider, SSO_PROVIDER_NAMES } from '../constants/auth';
import InfoNotice from '../components/InfoNotice';
import { MailIcon, ShieldIcon } from '../components/icons';
import { validateEmail, validatePassword } from '../utils/validation';
import '../components/LoginPanel.css';
import '../styles/authPages.css';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);

  // Validation state
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

  // Feedback notifications
  const [ssoNotice, setSsoNotice] = useState<string | null>(null);
  const [demoNotice, setDemoNotice] = useState<string | null>(null);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    if (!validateForm()) {
      setDemoNotice(null);
      return;
    }

    // Authenticate demo session
    login(email);

    // Determine target location (defaulting to /dashboard)
    const state = location.state as { from?: { pathname: string } } | undefined;
    const destination = state?.from?.pathname || '/dashboard';
    navigate(destination, { replace: true });
  };

  const handleSSOClick = (provider: SSOProvider) => {
    setSsoNotice(
      `SSO Integration Notice: Enterprise sign-in via ${SSO_PROVIDER_NAMES[provider]} requires an active Identity Provider integration. In this frontend prototype, please use the email form or click "Create an Account" to test registration.`
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

        <Link
          to="/"
          className="login-back-home-btn"
          aria-label="View Product Landing Page"
        >
          <span>Home</span>
        </Link>
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
        <h1>Welcome back to IntellMeet</h1>
        <p>
          Enter your enterprise credentials to access your collaborative workspaces and real-time AI meeting intelligence.
        </p>
      </div>

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

      {/* SSO Buttons */}
      <div className="login-sso-group">
        <SocialLoginButton
          provider="google"
          label="Continue with Google Workspace"
          onClick={handleSSOClick}
          id="im-sso-google"
        />
        <SocialLoginButton
          provider="microsoft"
          label="Continue with Microsoft Azure AD / 365"
          onClick={handleSSOClick}
          id="im-sso-microsoft"
        />
        <SocialLoginButton
          provider="saml"
          label="Single Sign-On (SAML 2.0)"
          onClick={handleSSOClick}
          id="im-sso-saml"
        />
      </div>

      {/* Divider */}
      <div className="login-divider">
        <span className="login-divider-line" />
        <span className="login-divider-text">or continue with email</span>
        <span className="login-divider-line" />
      </div>

      {/* Demo Notice Banner after submit */}
      {demoNotice && (
        <InfoNotice
          variant="success"
          title="Validation Verified"
          onDismiss={() => setDemoNotice(null)}
        >
          {demoNotice}
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
        <label className="login-remember">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            aria-label="Remember this device for 30 days"
          />
          <span className="login-remember-text">Remember this device for 30 days</span>
        </label>

        {/* Sign In Submit Button */}
        <PrimaryButton type="submit" id="im-signin-btn">
          Sign In
        </PrimaryButton>
      </form>

      {/* Footer */}
      <div className="login-footer">
        <div className="login-security-badge">
          <ShieldIcon />
          SOC-2 Type II Certified &bull; 256-bit AES Enterprise Encryption
        </div>
        <p className="login-footer-links">
          Don't have an enterprise workspace?{' '}
          <Link to="/signup" id="im-signup-link">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
