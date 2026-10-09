import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import { MailIcon, MailCheckIcon, ShieldIcon } from '../components/icons';
import { validateEmail } from '../utils/validation';
import '../components/LoginPanel.css';
import '../styles/authPages.css';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const validate = (): boolean => {
    const err = validateEmail(email);
    setError(err);
    return !err;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!validate()) {
      return;
    }

    setSubmittedEmail(email.trim());
    setSubmitted(true);
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
          Enter the work email address associated with your IntellMeet enterprise account and we&apos;ll prepare password recovery instructions.
        </p>
      </div>

      {submitted ? (
        <div className="im-success-card" role="region" aria-label="Password Reset Confirmation">
          <div className="im-success-icon-badge" aria-hidden="true">
            <MailCheckIcon />
          </div>
          <h2>Reset Instructions Prepared</h2>
          <p>
            If an active IntellMeet enterprise workspace account matches <strong>{submittedEmail}</strong>, password reset instructions would be generated.
          </p>
          <div className="im-success-demo-badge">
            <span>Frontend Simulation: In production, a secure reset token is emailed. No email was sent in this demo.</span>
          </div>
          <div className="im-success-actions">
            <Link to="/login" className="login-submit-btn" id="fp-return-btn">
              <span>Return to Sign In</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setEmail('');
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
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            placeholder="name@company.com"
            autoComplete="email"
            icon={<MailIcon />}
            helperText="We will prepare verification instructions for this enterprise address."
            error={error}
            required
          />

          <PrimaryButton type="submit" id="fp-submit-btn">
            Send Reset Instructions
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
