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

/* Icons */
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const BuildingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <line x1="9" y1="22" x2="9" y2="22.01" />
    <line x1="15" y1="22" x2="15" y2="22.01" />
    <line x1="9" y1="6" x2="9" y2="6.01" />
    <line x1="15" y1="6" x2="15" y2="6.01" />
    <line x1="9" y1="10" x2="9" y2="10.01" />
    <line x1="15" y1="10" x2="15" y2="10.01" />
    <line x1="9" y1="14" x2="9" y2="14.01" />
    <line x1="15" y1="14" x2="15" y2="14.01" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

interface FormErrors {
  fullName?: string;
  email?: string;
  companyName?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();

  // Controlled form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Form errors and touched state
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // SSO Notice
  const [ssoNotice, setSsoNotice] = useState<string | null>(null);

  // Frontend-only submission success state
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    name: string;
    email: string;
    company: string;
  } | null>(null);

  const validateAll = (): boolean => {
    const errs: FormErrors = {};

    if (!fullName.trim()) {
      errs.fullName = 'Full name is required.';
    } else if (fullName.trim().length < 2) {
      errs.fullName = 'Full name must be at least 2 characters.';
    }

    if (!email.trim()) {
      errs.email = 'Work email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid work email address.';
    }

    if (!companyName.trim()) {
      errs.companyName = 'Company name is required.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters.';
    } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      errs.password = 'Password must include at least one letter and one number.';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Please confirm your password.';
    } else if (confirmPassword !== password) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    if (!agreeTerms) {
      errs.terms = 'You must accept the Terms of Service and Privacy Policy to proceed.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all as touched
    setTouched({
      fullName: true,
      email: true,
      companyName: true,
      password: true,
      confirmPassword: true,
      terms: true,
    });

    if (!validateAll()) {
      return;
    }

    // Frontend-only success state!
    // Never store passwords in localStorage/sessionStorage.
    // Do not call nonexistent backend.
    setSubmittedData({
      name: fullName.trim(),
      email: email.trim(),
      company: companyName.trim(),
    });
    setIsSuccess(true);
  };

  const handleResetForm = () => {
    setFullName('');
    setEmail('');
    setCompanyName('');
    setJobTitle('');
    setPassword('');
    setConfirmPassword('');
    setAgreeTerms(false);
    setErrors({});
    setTouched({});
    setIsSuccess(false);
    setSubmittedData(null);
  };

  const handleSSOClick = (provider: SSOProvider) => {
    const providerNames: Record<SSOProvider, string> = {
      google: 'Google Workspace',
      microsoft: 'Microsoft Azure AD / 365',
      saml: 'Single Sign-On (SAML 2.0)',
    };

    setSsoNotice(
      `SSO Registration Notice: Self-service sign up with ${providerNames[provider]} requires enterprise domain federation. Please complete the registration form below to provision a demo workspace.`
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

      {/* Mode Switch Tabs: Sign In & Sign Up buttons */}
      <div className="login-mode-switch-wrapper" role="tablist" aria-label="Authentication modes">
        <button
          type="button"
          className="login-mode-tab-btn"
          id="tab-btn-signin"
          role="tab"
          aria-selected="false"
          onClick={() => navigate('/login')}
        >
          Sign In
        </button>
        <button
          type="button"
          className="login-mode-tab-btn active"
          id="tab-btn-signup"
          role="tab"
          aria-selected="true"
        >
          Sign Up
        </button>
      </div>

      {/* Welcome Heading */}
      <div className="login-heading-block">
        <h1>Create your IntellMeet account</h1>
        <p>Start collaborating smarter with AI-powered meetings.</p>
      </div>

      {/* Success State View */}
      {isSuccess && submittedData ? (
        <div className="im-success-card" role="region" aria-label="Account Creation Confirmation">
          <div className="im-success-icon-badge" aria-hidden="true">
            <CheckCircleIcon />
          </div>
          <h2>Registration Prepared!</h2>
          <p>
            Welcome to IntellMeet, <strong>{submittedData.name}</strong>! An enterprise workspace profile for{' '}
            <strong>{submittedData.company}</strong> ({submittedData.email}) has been validated.
          </p>
          <div className="im-success-demo-badge">
            <span>Frontend Simulation: No live credentials were transmitted or stored.</span>
          </div>
          <div className="im-success-actions">
            <Link to="/login" className="login-submit-btn" id="su-success-signin-btn">
              <span>Proceed to Sign In</span>
            </Link>
            <button
              type="button"
              onClick={handleResetForm}
              className="login-submit-btn im-btn-secondary"
            >
              <span>Register Another Account</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* SSO Notice Banner */}
          {ssoNotice && (
            <InfoNotice
              variant="info"
              title="Enterprise SSO Registration"
              onDismiss={() => setSsoNotice(null)}
            >
              {ssoNotice}
            </InfoNotice>
          )}

          {/* SSO Buttons */}
          <div className="login-sso-group">
            <SocialLoginButton
              provider="google"
              label="Sign up with Google Workspace"
              onClick={handleSSOClick}
              id="im-signup-sso-google"
            />
            <SocialLoginButton
              provider="microsoft"
              label="Sign up with Microsoft Azure AD / 365"
              onClick={handleSSOClick}
              id="im-signup-sso-microsoft"
            />
            <SocialLoginButton
              provider="saml"
              label="Single Sign-On (SAML 2.0)"
              onClick={handleSSOClick}
              id="im-signup-sso-saml"
            />
          </div>

          {/* Divider */}
          <div className="login-divider">
            <span className="login-divider-line" />
            <span className="login-divider-text">or register with work email</span>
            <span className="login-divider-line" />
          </div>

          {/* Registration Form */}
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <FormInput
              id="su-name"
              label="Full Name"
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (touched.fullName) {
                  if (!e.target.value.trim()) {
                    setErrors((p) => ({ ...p, fullName: 'Full name is required.' }));
                  } else {
                    setErrors((p) => ({ ...p, fullName: undefined }));
                  }
                }
              }}
              onBlur={() => {
                setTouched((p) => ({ ...p, fullName: true }));
                if (!fullName.trim()) {
                  setErrors((p) => ({ ...p, fullName: 'Full name is required.' }));
                }
              }}
              placeholder="Elena Rostova"
              autoComplete="name"
              icon={<UserIcon />}
              error={errors.fullName}
              required
            />

            {/* Work Email */}
            <FormInput
              id="su-email"
              label="Work Email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (touched.email) {
                  if (!e.target.value.trim()) {
                    setErrors((p) => ({ ...p, email: 'Work email is required.' }));
                  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value.trim())) {
                    setErrors((p) => ({ ...p, email: 'Please enter a valid work email address.' }));
                  } else {
                    setErrors((p) => ({ ...p, email: undefined }));
                  }
                }
              }}
              onBlur={() => {
                setTouched((p) => ({ ...p, email: true }));
                if (!email.trim()) {
                  setErrors((p) => ({ ...p, email: 'Work email is required.' }));
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
                  setErrors((p) => ({ ...p, email: 'Please enter a valid work email address.' }));
                }
              }}
              placeholder="elena.rostova@enterprise.com"
              autoComplete="email"
              icon={<MailIcon />}
              error={errors.email}
              required
            />

            {/* Company & Job Title Row */}
            <div className="im-form-grid-2">
              <FormInput
                id="su-company"
                label="Company Name"
                type="text"
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value);
                  if (touched.companyName) {
                    if (!e.target.value.trim()) {
                      setErrors((p) => ({ ...p, companyName: 'Company name is required.' }));
                    } else {
                      setErrors((p) => ({ ...p, companyName: undefined }));
                    }
                  }
                }}
                onBlur={() => {
                  setTouched((p) => ({ ...p, companyName: true }));
                  if (!companyName.trim()) {
                    setErrors((p) => ({ ...p, companyName: 'Company name is required.' }));
                  }
                }}
                placeholder="Enterprise Inc."
                autoComplete="organization"
                icon={<BuildingIcon />}
                error={errors.companyName}
                required
              />

              <FormInput
                id="su-job-title"
                label="Job Title (Optional)"
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="VP of Engineering"
                autoComplete="organization-title"
                icon={<BriefcaseIcon />}
              />
            </div>

            {/* Password */}
            <PasswordInput
              id="su-password"
              label="Password"
              value={password}
              onChange={(e) => {
                const val = e.target.value;
                setPassword(val);
                if (touched.password) {
                  if (!val) {
                    setErrors((p) => ({ ...p, password: 'Password is required.' }));
                  } else if (val.length < 8) {
                    setErrors((p) => ({ ...p, password: 'Password must be at least 8 characters.' }));
                  } else if (!/[A-Za-z]/.test(val) || !/\d/.test(val)) {
                    setErrors((p) => ({ ...p, password: 'Include at least one letter and one number.' }));
                  } else {
                    setErrors((p) => ({ ...p, password: undefined }));
                  }
                }
                if (touched.confirmPassword && confirmPassword) {
                  if (confirmPassword !== val) {
                    setErrors((p) => ({ ...p, confirmPassword: 'Passwords do not match.' }));
                  } else {
                    setErrors((p) => ({ ...p, confirmPassword: undefined }));
                  }
                }
              }}
              onBlur={() => {
                setTouched((p) => ({ ...p, password: true }));
                if (!password) {
                  setErrors((p) => ({ ...p, password: 'Password is required.' }));
                } else if (password.length < 8) {
                  setErrors((p) => ({ ...p, password: 'Password must be at least 8 characters.' }));
                } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
                  setErrors((p) => ({ ...p, password: 'Include at least one letter and one number.' }));
                }
              }}
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
              helperText="Must be 8+ characters with at least one letter and one number."
              error={errors.password}
              required
            />

            {/* Confirm Password */}
            <PasswordInput
              id="su-confirm-password"
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => {
                const val = e.target.value;
                setConfirmPassword(val);
                if (touched.confirmPassword) {
                  if (!val) {
                    setErrors((p) => ({ ...p, confirmPassword: 'Please confirm your password.' }));
                  } else if (val !== password) {
                    setErrors((p) => ({ ...p, confirmPassword: 'Passwords do not match.' }));
                  } else {
                    setErrors((p) => ({ ...p, confirmPassword: undefined }));
                  }
                }
              }}
              onBlur={() => {
                setTouched((p) => ({ ...p, confirmPassword: true }));
                if (!confirmPassword) {
                  setErrors((p) => ({ ...p, confirmPassword: 'Please confirm your password.' }));
                } else if (confirmPassword !== password) {
                  setErrors((p) => ({ ...p, confirmPassword: 'Passwords do not match.' }));
                }
              }}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              error={errors.confirmPassword}
              required
            />

            {/* Terms of Service & Privacy Policy acceptance */}
            <div className={`login-field-group ${errors.terms ? 'has-error' : ''}`}>
              <label className="login-checkbox-label" htmlFor="su-terms">
                <input
                  id="su-terms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => {
                    setAgreeTerms(e.target.checked);
                    if (e.target.checked) {
                      setErrors((p) => ({ ...p, terms: undefined }));
                    }
                  }}
                  required
                />
                <span className="login-checkbox-text">
                  I agree to IntellMeet&apos;s{' '}
                  <Link to="/terms" target="_blank" rel="noopener noreferrer">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" target="_blank" rel="noopener noreferrer">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
              {errors.terms && (
                <div className="im-form-error" role="alert">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="im-error-icon" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{errors.terms}</span>
                </div>
              )}
            </div>

            {/* Primary Submit Button */}
            <PrimaryButton type="submit" id="su-submit-btn">
              Create Account
            </PrimaryButton>
          </form>
        </>
      )}

      {/* Footer */}
      <div className="login-footer">
        <div className="login-security-badge">
          <ShieldIcon />
          SOC-2 Type II Certified &bull; 256-bit AES Enterprise Encryption
        </div>
        <p className="login-footer-links">
          Already have an account?{' '}
          <Link to="/login" id="im-signin-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
