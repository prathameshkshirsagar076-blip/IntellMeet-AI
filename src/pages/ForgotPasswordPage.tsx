import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import '../components/LoginPanel.css';
import '../styles/authPages.css';

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const MailCheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h9" />
    <polyline points="22,6 12,13 2,6" />
    <polyline points="16 19 19 22 24 17" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const validate = () => {
    if (!email.trim()) {
      setError('Work email is required.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid work email address.');
      return false;
    }
    setError(undefined);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!validate()) {
      return;
    }

    // Frontend-only confirmation state.
    // Explicit requirement: "Do not claim that an actual email was sent."
    setSubmittedEmail(email.trim());
    setSubmitted(true);
  };

  return (
    <div className="login-panel">
      {/* Top Bar with Brand & Back to Home */}
      <div className="login-top-bar">
        <BrandLogo to="/login" />

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
            onChange={(e) => {
              setEmail(e.target.value);
              if (touched) {
                if (!e.target.value.trim()) {
                  setError('Work email is required.');
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value.trim())) {
                  setError('Please enter a valid work email address.');
                } else {
                  setError(undefined);
                }
              }
            }}
            onBlur={() => {
              setTouched(true);
              validate();
            }}
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
