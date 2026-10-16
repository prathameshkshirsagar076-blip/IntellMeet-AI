import React from 'react';
import { Link } from 'react-router-dom';
import { BrandIcon } from './icons';

export { BrandIcon };

interface BrandLogoProps {
  to?: string;
  tagline?: string;
  className?: string;
  useImageBanner?: boolean;
  stacked?: boolean;
  iconSize?: number;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  to = '/',
  tagline = 'AI-Powered Enterprise Meeting & Collaboration Platform',
  className = '',
  useImageBanner = false,
  stacked = false,
  iconSize,
}) => {
  const resolvedIconSize = iconSize || (stacked ? 64 : 36);

  return (
    <Link
      to={to}
      className={`login-brand ${stacked ? 'stacked' : ''} ${className}`}
      title="IntellMeet — Meet Smarter With AI"
      style={{ textDecoration: 'none' }}
    >
      {useImageBanner ? (
        <img
          src="/intellmeet-logo.png"
          alt="IntellMeet Logo"
          className="login-brand-image-banner"
        />
      ) : (
        <>
          <div className="login-brand-logo" aria-hidden="true">
            <BrandIcon size={resolvedIconSize} />
          </div>
          <div className="login-brand-text">
            <span className="login-brand-name">
              <span className="login-brand-intell">Intell</span>
              <span className="login-brand-meet">Meet</span>
            </span>
            {tagline && <span className="login-brand-tag">{tagline}</span>}
          </div>
        </>
      )}
    </Link>
  );
};

export default BrandLogo;
