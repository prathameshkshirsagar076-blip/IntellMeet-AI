import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';
import { ArrowLeftIcon } from '../components/icons';
import './NotFoundPage.css';

export const NotFoundPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isOAuthCallback =
    (searchParams.has('code') && searchParams.has('state')) ||
    (searchParams.has('token') && searchParams.has('refreshToken')) ||
    (searchParams.has('error') && searchParams.has('state'));

  if (isOAuthCallback) {
    return <Navigate to={`/auth/google/callback${location.search}`} replace />;
  }

  const returnPath = isAuthenticated ? '/dashboard' : '/';
  const returnLabel = isAuthenticated ? 'Return to Dashboard' : 'Return to Home';

  return (
    <div className="im-404-root">
      <header className="im-404-navbar">
        <BrandLogo to={returnPath} />
        <Link to={isAuthenticated ? '/dashboard' : '/login'} className="im-legal-nav-btn secondary">
          {isAuthenticated ? 'Dashboard' : 'Sign In'}
        </Link>
      </header>

      <main className="im-404-container">
        <div className="im-404-card">
          <div className="im-404-badge">
            <span>Error 404</span>
          </div>

          <h1 className="im-404-title">Page Not Found</h1>

          <p className="im-404-desc">
            The page you are looking for doesn&apos;t exist, was moved, or the URL is incorrect.
            Please verify the web address or return to the IntellMeet workspace portal.
          </p>

          <div className="im-404-actions">
            <Link to={returnPath} className="im-404-primary-btn" id="im-404-return-btn">
              <ArrowLeftIcon />
              <span>{returnLabel}</span>
            </Link>

            <div className="im-404-links-group">
              <Link to="/signup">Create Account</Link>
              <span>&bull;</span>
              <Link to="/forgot-password">Reset Password</Link>
              <span>&bull;</span>
              <Link to="/terms">Terms of Service</Link>
              <span>&bull;</span>
              <Link to="/privacy">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="im-404-footer">
        <p>&copy; {new Date().getFullYear()} IntellMeet AI Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default NotFoundPage;
