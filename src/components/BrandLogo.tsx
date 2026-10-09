import React from 'react';
import { Link } from 'react-router-dom';

/* Brand Icon SVG matching original design */
export const BrandIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

interface BrandLogoProps {
  to?: string;
  tagline?: string;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  to = '/login',
  tagline = 'ENTERPRISE WORKSPACE',
  className = '',
}) => {
  return (
    <Link to={to} className={`login-brand ${className}`} title="IntellMeet Enterprise">
      <div className="login-brand-logo" aria-hidden="true">
        <BrandIcon />
      </div>
      <div className="login-brand-text">
        <span className="login-brand-name">IntellMeet</span>
        {tagline && <span className="login-brand-tag">{tagline}</span>}
      </div>
    </Link>
  );
};

export default BrandLogo;
