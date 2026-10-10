import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import InfoNotice from '../components/InfoNotice';
import { MailIcon, MailCheckIcon, ShieldIcon } from '../components/icons';
import { validateEmail } from '../utils/validation';
import { useAuth } from '../context/AuthContext';
import { toast } from '../components/toast/toast';
import '../components/LoginPanel.css';
import '../styles/authPages.css';

export const ForgotPasswordPage: React.FC = () => {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Success view state
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [serverMessage, setServerMessage] = useState('');

  const validate = (): boolean => {
    const err = validateEmail(email);
    setError(err);
    return !err;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setTouched(true);
    setApiError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await forgotPassword({
        email: email.trim().toLowerCase(),
      });

      const message =
        response.message ||
        'If an account with that email exists, a password reset link has been sent.';

      setServerMessage(message);
      setSubmittedEmail(email.trim());
      setSubmitted(true);
      toast.success(message);
    } catch (err: unknown) {
      const apiErr = err as Error;
      const errorMsg =
        apiErr.message || 'Unable to process password reset request. Please try again.';
      setApiError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (touched) {
      setError(validateEmail(val));
    }
  };

  const handleEmailBlur = () => {
    setTouched(true);
    validate();
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
        <h1>Reset your password</h1>
        <p>
          Enter the work email address associated with your IntellMeet enterprise account and we&apos;ll send recovery instructions.
        </p>
      </div>

      {/* API Error Notice */}
      {apiError && (
        <InfoNotice
          variant="error"
          title="Reset Request Notice"
          onDismiss={() => setApiError(null)}
        >
          {apiError}
        </InfoNotice>
      )}

      {submitted ? (
        <div className="im-success-card" role="region" aria-label="Password Reset Confirmation">
          <div className="im-success-icon-badge" aria-hidden="true">
            <MailCheckIcon />
          </div>
          <h2>Reset Request Processed</h2>
          <p>
            {serverMessage}
          </p>
          <div className="im-user-details-summary" style={{ textAlign: 'center', marginTop: '10px' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Target email address:</span>
            <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>
              {submittedEmail}
            </div>
          </div>
          <div className="im-success-actions" style={{ marginTop: '18px' }}>
            <Link to="/login" className="login-submit-btn" id="fp-return-btn">
              <span>Return to Sign In</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setEmail('');
                setServerMessage('');
                setApiError(null);
              }}
              className="login-submit-btn im-btn-secondary"
            >
              <span>Try Another Email</span>
            </button>
          </div>
        </div>
      ) : (
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <FormInput
            id="fp-email"
            label="Work Email"
            type="email"
            value={email}
            disabled={isSubmitting}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            placeholder="name@company.com"
            autoComplete="email"
            icon={<MailIcon />}
            helperText="We will send a secure password reset link to this address."
            error={error}
            required
          />

          <PrimaryButton
            type="submit"
            id="fp-submit-btn"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending Request...' : 'Send Reset Instructions'}
          </PrimaryButton>
        </form>
      )}

      {/* Footer */}
      <div className="login-footer">
        <div className="login-security-badge">
          <ShieldIcon />
          SOC-2 Type II Certified &bull; 256-bit AES Enterprise Encryption
        </div>
        <p className="login-footer-links">
          Remember your credentials?{' '}
          <Link to="/login" id="fp-back-to-login">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
