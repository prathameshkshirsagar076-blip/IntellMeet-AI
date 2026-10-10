import React from 'react';
import { Link } from 'react-router-dom';
import { BrandIcon } from './icons';

export { BrandIcon };

interface BrandLogoProps {
  to?: string;
  tagline?: string;
  className?: string;
  useImageBanner?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  to = '/',
  tagline = 'MEET SMARTER WITH AI',
  className = '',
  useImageBanner = false,
}) => {
  return (
    <Link to={to} className={`login-brand ${className}`} title="IntellMeet — Meet Smarter With AI">
      {useImageBanner ? (
        <img
          src="/intellmeet-logo.png"
          alt="IntellMeet Logo"
          className="login-brand-image-banner"
        />
      ) : (
        <>
          <div className="login-brand-logo" aria-hidden="true">
            <img
              src="/intellmeet-icon.png"
              alt="IntellMeet Icon"
              className="login-brand-logo-img"
              onError={(e) => {
                // If image fails for any reason, hide img to show BrandIcon SVG
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
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
