import React, { useMemo } from 'react';

interface PasswordStrengthMeterProps {
  password: string;
}

export const evaluatePasswordSecurity = (password: string) => {
  const rules = {
    length: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password),
  };

  const score = Object.values(rules).filter(Boolean).length;

  let label: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
  let activeSegments = 1;

  if (password.length === 0) {
    activeSegments = 0;
    label = 'weak';
  } else if (score <= 2) {
    activeSegments = 1;
    label = 'weak';
  } else if (score === 3) {
    activeSegments = 2;
    label = 'fair';
  } else if (score === 4) {
    activeSegments = 3;
    label = 'good';
  } else {
    activeSegments = 4;
    label = 'strong';
  }

  return { rules, score, label, activeSegments };
};

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const { rules, label, activeSegments } = useMemo(
    () => evaluatePasswordSecurity(password),
    [password]
  );

  if (!password) {
    return null;
  }

  return (
    <div className="im-password-strength-container" aria-live="polite">
      {/* 4-segment progress bar */}
      <div className="im-strength-bar-wrapper">
        {[1, 2, 3, 4].map((segIndex) => (
          <div
            key={segIndex}
            className={`im-strength-segment ${
              segIndex <= activeSegments ? `active-${label}` : ''
            }`}
          />
        ))}
      </div>

      <div className="im-strength-status-row">
        <span className={`im-strength-label-text ${label}`}>
          Security: {label}
        </span>
        <span className="im-strength-hint">
          {label === 'strong'
            ? 'Enterprise-grade password'
            : label === 'good'
            ? 'Strong password'
            : 'Add numbers & symbols'}
        </span>
      </div>

      <div className="im-strength-checklist">
        <div className={`im-strength-rule ${rules.length ? 'met' : ''}`}>
          <svg className="im-strength-rule-icon" viewBox="0 0 20 20" fill="currentColor">
            {rules.length ? (
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            ) : (
              <circle cx="10" cy="10" r="3" />
            )}
          </svg>
          <span>8+ characters</span>
        </div>

        <div className={`im-strength-rule ${rules.hasUpper && rules.hasLower ? 'met' : ''}`}>
          <svg className="im-strength-rule-icon" viewBox="0 0 20 20" fill="currentColor">
            {rules.hasUpper && rules.hasLower ? (
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            ) : (
              <circle cx="10" cy="10" r="3" />
            )}
          </svg>
          <span>Upper & lowercase</span>
        </div>

        <div className={`im-strength-rule ${rules.hasNumber ? 'met' : ''}`}>
          <svg className="im-strength-rule-icon" viewBox="0 0 20 20" fill="currentColor">
            {rules.hasNumber ? (
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            ) : (
              <circle cx="10" cy="10" r="3" />
            )}
          </svg>
          <span>Number (0-9)</span>
        </div>

        <div className={`im-strength-rule ${rules.hasSpecial ? 'met' : ''}`}>
          <svg className="im-strength-rule-icon" viewBox="0 0 20 20" fill="currentColor">
            {rules.hasSpecial ? (
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            ) : (
              <circle cx="10" cy="10" r="3" />
            )}
          </svg>
          <span>Special symbol (@, #, !)</span>
        </div>
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
