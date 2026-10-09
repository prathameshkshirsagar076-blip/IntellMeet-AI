import React from 'react';
import { ArrowRightIcon, SpinnerIcon } from './icons';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loading?: boolean;
  withArrow?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  loading = false,
  withArrow = true,
  variant = 'primary',
  className = '',
  disabled,
  ...buttonProps
}) => {
  return (
    <button
      className={`login-submit-btn im-btn-${variant} ${className}`}
      disabled={disabled || loading}
      {...buttonProps}
    >
      {loading ? (
        <>
          <SpinnerIcon />
          <span>Processing...</span>
        </>
      ) : (
        <>
          <span>{children}</span>
          {withArrow && <ArrowRightIcon />}
        </>
      )}
    </button>
  );
};

export default PrimaryButton;
