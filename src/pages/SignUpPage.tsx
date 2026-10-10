import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';
import FormInput from '../components/FormInput';
import PasswordInput from '../components/PasswordInput';
import PrimaryButton from '../components/PrimaryButton';
import SocialLoginButton from '../components/SocialLoginButton';
import { type SSOProvider, SSO_PROVIDER_NAMES } from '../constants/auth';
import InfoNotice from '../components/InfoNotice';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import type { AuthUser, AuthTokens } from '../types/auth';
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
import { toast } from '../components/toast/toast';
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
  const { register } = useAuth();

  // Controlled form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Form errors, submission, and touched state
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isEmailConflict, setIsEmailConflict] = useState(false);

  // SSO Notice
  const [ssoNotice, setSsoNotice] = useState<string | null>(null);

  // Registration outcome state
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<AuthUser | null>(null);
  const [registeredTokens, setRegisteredTokens] = useState<AuthTokens | null>(null);

  const validateAll = (): boolean => {
    const errs: FormErrors = {};

    const nameErr = validateFullName(fullName);
    if (nameErr) errs.fullName = nameErr;

    const emailErr = validateEmail(email);
    if (emailErr) errs.email = emailErr;

    if (!companyName.trim()) {
      errs.companyName = 'Company name is required.';
    } else if (companyName.trim().length < 2) {
      errs.companyName = 'Company name must be at least 2 characters.';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setIsEmailConflict(false);

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

    setIsSubmitting(true);

    try {
      const response = await register({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        companyName: companyName.trim(),
      });

      if (response && response.success) {
        setRegisteredUser(response.data.user);
        setRegisteredTokens({
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        });
        setIsSuccess(true);
        toast.success(response.message || 'Account created successfully!');
      } else {
        throw new Error(response?.message || 'Registration was not successful.');
      }
    } catch (err: unknown) {
      const error = err as Error & { status?: number; code?: string };
      const isConflict =
        error.status === 409 ||
        error.code === 'EMAIL_ALREADY_EXISTS' ||
        error.message.includes('already exists');

      if (isConflict) {
        setIsEmailConflict(true);
        const msg = `An account with the email ${email} already exists. Would you like to sign in instead?`;
        setApiError(msg);
        toast.error('An account with this email address already exists.');
      } else {
        const msg = error.message || 'Unable to complete registration. Please check your network and try again.';
        setApiError(msg);
        toast.error(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
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
    setApiError(null);
    setIsEmailConflict(false);
    setIsSuccess(false);
    setRegisteredUser(null);
    setRegisteredTokens(null);
  };

  const handleSSOClick = (provider: SSOProvider) => {
    setSsoNotice(
      `SSO Registration Notice: Self-service sign up with ${SSO_PROVIDER_NAMES[provider]} requires enterprise domain federation. Please complete the registration form below to provision your workspace.`
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

      {/* Live Registration Success State View - User stays here until clicking Continue */}
      {isSuccess && registeredUser ? (
        <div className="im-success-card" role="region" aria-label="Account Creation Confirmation">
          <div className="im-success-icon-badge" aria-hidden="true">
            <CheckCircleIcon />
          </div>
          <h2>Account Created Successfully!</h2>
          <p>
            Welcome to IntellMeet, <strong>{registeredUser.name}</strong>! Your account has been provisioned and your workspace session is now active.
          </p>

          {/* User Profile Summary */}
          <div className="im-user-details-summary">
            <div className="im-user-details-row">
              <span className="im-user-details-label">Full Name:</span>
              <span className="im-user-details-value">{registeredUser.name}</span>
            </div>
            <div className="im-user-details-row">
              <span className="im-user-details-label">Work Email:</span>
              <span className="im-user-details-value">{registeredUser.email}</span>
            </div>
            <div className="im-user-details-row">
              <span className="im-user-details-label">Organization:</span>
              <span className="im-user-details-value">{registeredUser.company || companyName}</span>
            </div>
            <div className="im-user-details-row">
              <span className="im-user-details-label">Account ID:</span>
              <span className="im-token-storage-key">{registeredUser.id}</span>
            </div>
          </div>

          {/* Token & LocalStorage status card */}
          <div className="im-token-storage-card">
            <div className="im-token-storage-header">
              <span>Authentication Session</span>
              <span className="im-token-storage-badge">
                ✓ Saved to LocalStorage
              </span>
            </div>
            <div className="im-token-storage-row">
              <span>Access Token:</span>
              <span className="im-token-storage-val" title={registeredTokens?.accessToken}>
                {registeredTokens?.accessToken ? `${registeredTokens.accessToken.slice(0, 20)}...` : 'Active'}
              </span>
            </div>
            <div className="im-token-storage-row">
              <span>Refresh Token:</span>
              <span className="im-token-storage-val" title={registeredTokens?.refreshToken}>
                {registeredTokens?.refreshToken ? `${registeredTokens.refreshToken.slice(0, 20)}...` : 'Active'}
              </span>
            </div>
            <div className="im-token-storage-row">
              <span>Storage Location:</span>
              <span style={{ fontSize: '11px', color: '#059669', fontWeight: 500 }}>
                browser localStorage
              </span>
            </div>
          </div>

          {/* Action buttons with Continue button navigating to Dashboard */}
          <div className="im-continue-actions">
            <PrimaryButton
              type="button"
              onClick={() => navigate('/dashboard', { replace: true })}
              id="su-continue-dashboard-btn"
            >
              Continue to Dashboard
            </PrimaryButton>
            <button
              type="button"
              onClick={handleResetForm}
              className="login-submit-btn im-btn-secondary"
              id="su-register-another-btn"
            >
              <span>Register Another Account</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* API Error Notice */}
          {apiError && (
            <InfoNotice
              variant="error"
              title="Registration Notice"
              onDismiss={() => {
                setApiError(null);
                setIsEmailConflict(false);
              }}
            >
              <div>{apiError}</div>
              {isEmailConflict && (
                <div style={{ marginTop: '6px' }}>
                  <Link
                    to="/login"
                    style={{
                      fontWeight: 600,
                      color: '#b91c1c',
                      textDecoration: 'underline',
                    }}
                  >
                    Click here to Sign In with this email &rarr;
                  </Link>
                </div>
              )}
            </InfoNotice>
          )}

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
              disabled={isSubmitting}
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
              placeholder="e.g. Yashodip Jejurkar"
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
              disabled={isSubmitting}
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
              placeholder="name@company.com"
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="VP of Engineering"
                autoComplete="organization-title"
                icon={<BriefcaseIcon />}
              />
            </div>

            {/* Password */}
            <div>
              <PasswordInput
                id="su-password"
                label="Password"
                value={password}
                disabled={isSubmitting}
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
                helperText="Must be 8+ characters with upper, lower, number, and symbol."
                error={errors.password}
                required
              />

              {/* Real-time Enterprise Password Security Meter */}
              <PasswordStrengthMeter password={password} />
            </div>

            {/* Confirm Password */}
            <PasswordInput
              id="su-confirm-password"
              label="Confirm Password"
              value={confirmPassword}
              disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
            <PrimaryButton
              type="submit"
              id="su-submit-btn"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
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
