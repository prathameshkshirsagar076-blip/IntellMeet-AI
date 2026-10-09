import React, { useState } from 'react';
import FormError from './FormError';
import { LockIcon, EyeIcon, EyeOffIcon } from './icons';

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
