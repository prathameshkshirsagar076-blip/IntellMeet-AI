import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import FormInput from '../components/FormInput';
import PasswordInput from '../components/PasswordInput';
import PrimaryButton from '../components/PrimaryButton';
import SocialLoginButton, { type SSOProvider } from '../components/SocialLoginButton';
import InfoNotice from '../components/InfoNotice';
import '../components/LoginPanel.css';
import '../styles/authPages.css';

/* Mail SVG Icon */
const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

/* Shield SVG Icon */
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  // Form state
  const [email, setEmail] = useState('elena.rostova@enterprise.com');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);

  // Validation state
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

  // Feedback notifications
  const [ssoNotice, setSsoNotice] = useState<string | null>(null);
  const [demoNotice, setDemoNotice] = useState<string | null>(null);

  // Validation helper
  const validateForm = () => {
    const nextErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      nextErrors.email = 'Work email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Please enter a valid work email address.';
    }

    if (!password) {
      nextErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.';
    }

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

    // Frontend validation passed
    // NOTE: Strict requirement: "Since no backend authentication exists, do not pretend that a real login has succeeded."
    setDemoNotice(
      `Frontend Validation Succeeded: Credentials format verified for ${email}. Note: No backend authentication service is connected in this prototype. To explore registration, click "Create an Account".`
    );
  };

  const handleSSOClick = (provider: SSOProvider) => {
    const providerNames: Record<SSOProvider, string> = {
      google: 'Google Workspace',
      microsoft: 'Microsoft Azure AD / 365',
      saml: 'Single Sign-On (SAML 2.0)',
    };

    setSsoNotice(
      `SSO Integration Notice: Enterprise sign-in via ${providerNames[provider]} requires an active Identity Provider integration. In this frontend prototype, please use the email form or click "Create an Account" to test registration.`
    );
  };

  return (
    <div className="login-panel">
      {/* Top Bar with Brand & Back to Home */}
      <div className="login-top-bar">
        <BrandLogo to="/login" />

        <Link
          to="/landing"
          className="login-back-home-btn"
          aria-label="View Product Landing Page"
        >
          <span>Home</span>
        </Link>
      </div>

      {/* Mode Switch Tabs: Sign In & Sign Up buttons (Navigates between routes) */}
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
          onChange={(e) => {
            setEmail(e.target.value);
            if (touched.email) {
              if (!e.target.value.trim()) {
                setErrors((prev) => ({ ...prev, email: 'Work email is required.' }));
              } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value.trim())) {
                setErrors((prev) => ({ ...prev, email: 'Please enter a valid work email address.' }));
              } else {
                setErrors((prev) => ({ ...prev, email: undefined }));
              }
            }
          }}
          onBlur={() => {
            setTouched((prev) => ({ ...prev, email: true }));
            if (!email.trim()) {
              setErrors((prev) => ({ ...prev, email: 'Work email is required.' }));
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
              setErrors((prev) => ({ ...prev, email: 'Please enter a valid work email address.' }));
            }
          }}
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
          onChange={(e) => {
            setPassword(e.target.value);
            if (touched.password) {
              if (!e.target.value) {
                setErrors((prev) => ({ ...prev, password: 'Password is required.' }));
              } else if (e.target.value.length < 6) {
                setErrors((prev) => ({ ...prev, password: 'Password must be at least 6 characters.' }));
              } else {
                setErrors((prev) => ({ ...prev, password: undefined }));
              }
            }
          }}
          onBlur={() => {
            setTouched((prev) => ({ ...prev, password: true }));
            if (!password) {
              setErrors((prev) => ({ ...prev, password: 'Password is required.' }));
            } else if (password.length < 6) {
              setErrors((prev) => ({ ...prev, password: 'Password must be at least 6 characters.' }));
            }
          }}
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
