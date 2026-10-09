import React, { useState } from 'react';
import './LoginPanel.css';

/* ---- Inline SVG icons ---- */
const BrandIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

const BackArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const MicrosoftIcon = () => (
  <svg viewBox="0 0 21 21" width="20" height="20">
    <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
    <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
    <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
    <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
  </svg>
);

const SamlIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5C7 5 2.73 8.11 1 12.5C2.73 16.89 7 20 12 20C17 20 21.27 16.89 23 12.5C21.27 8.11 17 5 12 5ZM12 17.5C9.24 17.5 7 15.26 7 12.5C7 9.74 9.24 7.5 12 7.5C14.76 7.5 17 9.74 17 12.5C17 15.26 14.76 17.5 12 17.5ZM12 9.5C10.34 9.5 9 10.84 9 12.5C9 14.16 10.34 15.5 12 15.5C13.66 15.5 15 14.16 15 12.5C15 10.84 13.66 9.5 12 9.5Z"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

interface LoginPanelProps {
  mode?: 'login' | 'signup';
  onSwitchMode?: (mode: 'login' | 'signup') => void;
  onBackToHome?: () => void;
}

const LoginPanel: React.FC<LoginPanelProps> = ({ 
  mode = 'login', 
  onSwitchMode, 
  onBackToHome 
}) => {
  const [internalMode, setInternalMode] = useState<'login' | 'signup'>(mode);
  const [email, setEmail] = useState('elena.rostova@enterprise.com');
  const [password, setPassword] = useState('••••••••••••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const activeMode = onSwitchMode ? mode : internalMode;

  const handleModeChange = (newMode: 'login' | 'signup') => {
    if (onSwitchMode) {
      onSwitchMode(newMode);
    } else {
      setInternalMode(newMode);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="login-panel">
      {/* Top Bar with Brand & Back to Home */}
      <div className="login-top-bar">
        <div 
          className="login-brand" 
          onClick={onBackToHome} 
          title="Go back to Home"
          style={{ cursor: onBackToHome ? 'pointer' : 'default' }}
        >
          <div className="login-brand-logo">
            <BrandIcon />
          </div>
          <div className="login-brand-text">
            <span className="login-brand-name">IntellMeet</span>
            <span className="login-brand-tag">ENTERPRISE WORKSPACE</span>
          </div>
        </div>

        {onBackToHome && (
          <button 
            type="button" 
            className="login-back-home-btn" 
            onClick={onBackToHome}
            aria-label="Back to Homepage"
          >
            <BackArrowIcon />
            <span>Home</span>
          </button>
        )}
      </div>

      {/* Mode Switcher: Sign In & Sign Up buttons */}
      <div className="login-mode-switch-wrapper">
        <button
          type="button"
          className={`login-mode-tab-btn ${activeMode === 'login' ? 'active' : ''}`}
          onClick={() => handleModeChange('login')}
          id="tab-btn-signin"
        >
          Sign In
        </button>
        <button
          type="button"
          className={`login-mode-tab-btn ${activeMode === 'signup' ? 'active' : ''}`}
          onClick={() => handleModeChange('signup')}
          id="tab-btn-signup"
        >
          Sign Up
        </button>
      </div>

      {/* Welcome Heading */}
      <div className="login-heading-block">
        <h1>
          {activeMode === 'login' 
            ? 'Welcome back to IntellMeet' 
            : 'Create your IntellMeet Account'}
        </h1>
        <p>
          {activeMode === 'login'
            ? 'Enter your enterprise credentials to access your collaborative workspaces and real-time AI meeting intelligence.'
            : 'Start your 30-day enterprise free trial. No credit card required. Connect with Google, Microsoft, or your work email.'}
        </p>
      </div>

      {/* SSO Buttons */}
      <div className="login-sso-group">
        <button type="button" className="login-sso-btn" id="im-sso-google">
          <span className="sso-icon">
            <GoogleIcon />
          </span>
          <span>{activeMode === 'login' ? 'Continue with Google Workspace' : 'Sign up with Google'}</span>
        </button>

        <button type="button" className="login-sso-btn" id="im-sso-microsoft">
          <span className="sso-icon">
            <MicrosoftIcon />
          </span>
          <span>{activeMode === 'login' ? 'Continue with Microsoft Azure AD / 365' : 'Sign up with Microsoft'}</span>
        </button>

        <button type="button" className="login-sso-btn" id="im-sso-saml">
          <span className="sso-icon">
            <SamlIcon />
          </span>
          <span>Single Sign-On (SAML 2.0)</span>
        </button>
      </div>

      {/* Divider */}
      <div className="login-divider">
        <span className="login-divider-line" />
        <span className="login-divider-text">
          {activeMode === 'login' ? 'or continue with email' : 'or register with work email'}
        </span>
        <span className="login-divider-line" />
      </div>

      {/* Form */}
      <form className="login-form" onSubmit={handleSubmit}>
        {/* Work Email Field */}
        <div className="login-field-group">
          <label className="login-label" htmlFor="im-email">Work Email</label>
          <div className="login-input-wrapper">
            <span className="login-input-icon" aria-hidden="true">
              <MailIcon />
            </span>
            <input
              id="im-email"
              type="email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              autoComplete="email"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="login-field-group">
          <div className="login-field-row">
            <label className="login-label" htmlFor="im-password">Password</label>
            {activeMode === 'login' && (
              <button type="button" className="login-forgot-link" id="im-forgot-password">
                Forgot password?
              </button>
            )}
          </div>
          <div className="login-input-wrapper">
            <span className="login-input-icon" aria-hidden="true">
              <LockIcon />
            </span>
            <input
              id="im-password"
              type={showPassword ? 'text' : 'password'}
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete={activeMode === 'login' ? 'current-password' : 'new-password'}
              required
            />
            <button
              type="button"
              className="login-input-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        {/* Remember */}
        {activeMode === 'login' ? (
          <label className="login-remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              aria-label="Remember this device for 30 days"
            />
            <span className="login-remember-text">Remember this device for 30 days</span>
          </label>
        ) : (
          <label className="login-remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              aria-label="Agree to Terms of Service"
            />
            <span className="login-remember-text">I agree to IntellMeet's Terms of Service &amp; Privacy Policy</span>
          </label>
        )}

        {/* Submit */}
        <button type="submit" className="login-submit-btn" id="im-signin-btn">
          {activeMode === 'login' ? 'Sign In' : 'Create Account'}
          <ArrowRightIcon />
        </button>
      </form>

      {/* Footer */}
      <div className="login-footer">
        <div className="login-security-badge">
          <ShieldIcon />
          SOC-2 Type II Certified &bull; 256-bit AES Enterprise Encryption
        </div>
        <p className="login-footer-links">
          {activeMode === 'login' ? (
            <>
              Don't have an enterprise workspace?{' '}
              <a 
                href="#signup" 
                id="im-signup-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleModeChange('signup');
                }}
              >
                Create an Account
              </a>
            </>
          ) : (
            <>
              Already have an enterprise workspace?{' '}
              <a 
                href="#login" 
                id="im-login-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleModeChange('login');
                }}
              >
                Sign In
              </a>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default LoginPanel;
