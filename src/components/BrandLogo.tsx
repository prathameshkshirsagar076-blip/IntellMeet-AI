import React from 'react';
import { Link } from 'react-router-dom';
import { BrandIcon } from './icons';

export { BrandIcon };

interface BrandLogoProps {
  to?: string;
  tagline?: string;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  to = '/',
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
