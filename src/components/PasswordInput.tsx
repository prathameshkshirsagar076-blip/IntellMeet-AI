import React, { useState } from 'react';
import FormError from './FormError';

/* Lock SVG Icon */
const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

/* Eye Icon */
const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

/* Eye Off Icon */
const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  id: string;
  label: string;
  error?: string;
  rightAction?: React.ReactNode;
  helperText?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  label,
  error,
  rightAction,
  helperText,
  className = '',
  required,
  ...inputProps
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  return (
    <div className={`login-field-group ${error ? 'has-error' : ''}`}>
      <div className="login-field-row">
        <label className="login-label" htmlFor={id}>
          {label}
          {required && <span className="im-required-indicator" aria-hidden="true"> *</span>}
        </label>
        {rightAction}
      </div>

      <div className="login-input-wrapper">
        <span className="login-input-icon" aria-hidden="true">
          <LockIcon />
        </span>

        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          className={`login-input has-icon has-toggle ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          required={required}
          {...inputProps}
        />

        <button
          type="button"
          className="login-input-toggle"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          title={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>

      {helperText && !error && (
        <span id={helperId} className="im-field-helper">
          {helperText}
        </span>
      )}

      <FormError id={errorId} message={error} />
    </div>
  );
};

export default PasswordInput;
