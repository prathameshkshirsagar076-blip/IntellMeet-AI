import React from 'react';
import FormError from './FormError';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  icon?: React.ReactNode;
  rightAction?: React.ReactNode;
  helperText?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  id,
  label,
  error,
  icon,
  rightAction,
  helperText,
  className = '',
  required,
  ...inputProps
}) => {
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
        {icon && (
          <span className="login-input-icon" aria-hidden="true">
            {icon}
          </span>
        )}

        <input
          id={id}
          className={`login-input ${icon ? 'has-icon' : ''} ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          required={required}
          {...inputProps}
        />
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

export default FormInput;
