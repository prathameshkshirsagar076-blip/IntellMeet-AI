import React from 'react';

const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="im-spinner" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
);

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
