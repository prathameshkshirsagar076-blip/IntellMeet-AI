import React from 'react';

export type NoticeVariant = 'info' | 'success' | 'warning';

interface InfoNoticeProps {
  variant?: NoticeVariant;
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

export const InfoNotice: React.FC<InfoNoticeProps> = ({
  variant = 'info',
  title,
  children,
  onDismiss,
  className = '',
}) => {
  return (
    <div className={`im-notice-banner im-notice-${variant} ${className}`} role="status">
      <div className="im-notice-icon-wrapper" aria-hidden="true">
        {variant === 'success' && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
        {variant === 'info' && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        )}
        {variant === 'warning' && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        )}
      </div>

      <div className="im-notice-content">
        {title && <strong className="im-notice-title">{title}</strong>}
        <div className="im-notice-text">{children}</div>
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="im-notice-dismiss"
          aria-label="Dismiss message"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default InfoNotice;
