import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import PasswordInput from '../components/PasswordInput';
import PrimaryButton from '../components/PrimaryButton';
import InfoNotice from '../components/InfoNotice';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import { CheckCircleIcon } from '../components/icons';
import { validatePassword } from '../utils/validation';
import { useAuth } from '../context/AuthContext';
import { toast } from '../components/toast/toast';
import '../components/LoginPanel.css';
import '../styles/authPages.css';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const { resetPassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [touched, setTouched] = useState<{ password?: boolean; confirmPassword?: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = (): boolean => {
    const nextErrors: { password?: string; confirmPassword?: string } = {};

    const passErr = validatePassword(password, { minLength: 8, requireAlphaNum: true });
    if (passErr) nextErrors.password = passErr;

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your new password.';
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setTouched({ password: true, confirmPassword: true });
    setApiError(null);

    if (!token) {
      const msg = 'Invalid or missing password reset token. Please request a new reset link.';
      setApiError(msg);
      toast.error(msg);
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await resetPassword({
        token: token.trim(),
        newPassword: password,
      });

      const msg =
        response.message ||
        'Password has been reset successfully. Please sign in with your new password.';
      setSuccessMessage(msg);
      setIsSuccess(true);
      toast.success(msg);

      // Clear sensitive fields
      setPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const error = err as Error & { code?: string };
      const msg =
        error.message || 'Invalid or expired password reset token. Please request a new link.';
      setApiError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-panel">
      {/* Top Bar with Brand & Back to Home */}
      <div className="login-top-bar">
        <BrandLogo to="/" />

        <Link
          to="/login"
          className="login-back-home-btn"
          aria-label="Back to Sign In"
        >
          <span>Sign In</span>
        </Link>
      </div>

      {/* Heading Block */}
      <div className="login-heading-block">
        <h1>Set new password</h1>
        <p>
          Choose a strong, enterprise-grade password to protect your IntellMeet workspace.
        </p>
      </div>

      {/* Missing Token Warning */}
      {!token && (
        <InfoNotice
          variant="warning"
          title="Missing Reset Token"
        >
          <div>
            No password reset token was detected in your URL. Please verify the reset link from your email, or request a new one below.
          </div>
          <div style={{ marginTop: '8px' }}>
            <Link
              to="/forgot-password"
              style={{ fontWeight: 600, color: '#b45309', textDecoration: 'underline' }}
            >
              Request a new password reset link &rarr;
            </Link>
          </div>
        </InfoNotice>
      )}

      {/* API Error Notice */}
      {apiError && (
        <InfoNotice
          variant="error"
          title="Reset Password Notice"
          onDismiss={() => setApiError(null)}
        >
          <div>{apiError}</div>
          <div style={{ marginTop: '6px' }}>
            <Link
              to="/forgot-password"
              style={{ fontWeight: 600, color: '#dc2626', textDecoration: 'underline' }}
            >
              Request a new reset link &rarr;
            </Link>
          </div>
        </InfoNotice>
      )}

      {/* Success View */}
      {isSuccess ? (
        <div className="im-success-card" role="region" aria-label="Password Reset Complete">
          <div className="im-success-icon-badge" aria-hidden="true">
            <CheckCircleIcon />
          </div>
          <h2>Password Reset Complete</h2>
          <p>{successMessage}</p>
          <div className="im-success-actions" style={{ marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => navigate('/login', { replace: true })}
              className="login-submit-btn"
              id="rp-goto-login-btn"
            >
              <span>Sign In with New Password</span>
            </button>
          </div>
        </div>
      ) : (
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {/* New Password */}
          <div>
            <PasswordInput
              id="rp-password"
              label="New Password"
              value={password}
              disabled={isSubmitting || !token}
              onChange={(e) => {
                const val = e.target.value;
                setPassword(val);
                if (touched.password) {
                  setErrors((p) => ({
                    ...p,
                    password: validatePassword(val, { minLength: 8, requireAlphaNum: true }),
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
            <PasswordStrengthMeter password={password} />
          </div>

          {/* Confirm Password */}
          <PasswordInput
            id="rp-confirm-password"
            label="Confirm New Password"
            value={confirmPassword}
            disabled={isSubmitting || !token}
            onChange={(e) => {
              const val = e.target.value;
              setConfirmPassword(val);
              if (touched.confirmPassword) {
                if (!val) {
                  setErrors((p) => ({ ...p, confirmPassword: 'Please confirm your new password.' }));
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
                setErrors((p) => ({ ...p, confirmPassword: 'Please confirm your new password.' }));
              } else if (confirmPassword !== password) {
                setErrors((p) => ({ ...p, confirmPassword: 'Passwords do not match.' }));
              }
            }}
            placeholder="Re-enter your new password"
            autoComplete="new-password"
            error={errors.confirmPassword}
            required
          />

          <PrimaryButton
            type="submit"
            id="rp-submit-btn"
            loading={isSubmitting}
            disabled={isSubmitting || !token}
          >
            {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
          </PrimaryButton>
        </form>
      )}

      {/* Footer */}
      <div className="login-footer">
        <p className="login-footer-text">
          Remembered your password?{' '}
          <Link to="/login" id="rp-back-to-login" className="login-footer-link">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
