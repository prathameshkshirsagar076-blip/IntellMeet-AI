import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import './NotFoundPage.css';

const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

export const NotFoundPage: React.FC = () => {
  return (
    <div className="im-404-root">
      <header className="im-404-navbar">
        <BrandLogo to="/login" />
        <Link to="/login" className="im-legal-nav-btn secondary">
          Sign In
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
            <Link to="/login" className="im-404-primary-btn" id="im-404-return-btn">
              <ArrowLeftIcon />
              <span>Return to Sign In</span>
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
