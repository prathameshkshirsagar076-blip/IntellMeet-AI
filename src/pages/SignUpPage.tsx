import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import FormInput from '../components/FormInput';
import PasswordInput from '../components/PasswordInput';
import PrimaryButton from '../components/PrimaryButton';
import SocialLoginButton from '../components/SocialLoginButton';
import { type SSOProvider, SSO_PROVIDER_NAMES } from '../constants/auth';
import InfoNotice from '../components/InfoNotice';
import {
  UserIcon,
  MailIcon,
  BuildingIcon,
  BriefcaseIcon,
  ShieldIcon,
  CheckCircleIcon,
} from '../components/icons';
import {
  validateFullName,
  validateEmail,
  validatePassword,
} from '../utils/validation';
import '../components/LoginPanel.css';
import '../styles/authPages.css';

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

    const nameErr = validateFullName(fullName);
    if (nameErr) errs.fullName = nameErr;

    const emailErr = validateEmail(email);
    if (emailErr) errs.email = emailErr;

    if (!companyName.trim()) {
      errs.companyName = 'Company name is required.';
    }

    const passErr = validatePassword(password, { minLength: 8, requireAlphaNum: true });
    if (passErr) errs.password = passErr;

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
    setSsoNotice(
      `SSO Registration Notice: Self-service sign up with ${SSO_PROVIDER_NAMES[provider]} requires enterprise domain federation. Please complete the registration form below to provision a demo workspace.`
    );
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
                const val = e.target.value;
                setFullName(val);
                if (touched.fullName) {
                  setErrors((p) => ({ ...p, fullName: validateFullName(val) }));
                }
              }}
              onBlur={() => {
                setTouched((p) => ({ ...p, fullName: true }));
                setErrors((p) => ({ ...p, fullName: validateFullName(fullName) }));
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
                const val = e.target.value;
                setEmail(val);
                if (touched.email) {
                  setErrors((p) => ({ ...p, email: validateEmail(val) }));
                }
              }}
              onBlur={() => {
                setTouched((p) => ({ ...p, email: true }));
                setErrors((p) => ({ ...p, email: validateEmail(email) }));
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
                  const val = e.target.value;
                  setCompanyName(val);
                  if (touched.companyName) {
                    setErrors((p) => ({
                      ...p,
                      companyName: val.trim() ? undefined : 'Company name is required.',
                    }));
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
                  setErrors((p) => ({
                    ...p,
                    password: validatePassword(val, { minLength: 8, requireAlphaNum: true }),
                  }));
                }
                if (touched.confirmPassword && confirmPassword) {
                  setErrors((p) => ({
                    ...p,
                    confirmPassword: confirmPassword !== val ? 'Passwords do not match.' : undefined,
                  }));
                }
              }}
              onBlur={() => {
                setTouched((p) => ({ ...p, password: true }));
                setErrors((p) => ({
                  ...p,
                  password: validatePassword(password, { minLength: 8, requireAlphaNum: true }),
                }));
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
