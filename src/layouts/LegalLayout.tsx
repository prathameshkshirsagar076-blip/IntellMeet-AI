import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import '../styles/legalPages.css';

interface LegalLayoutProps {
  children?: React.ReactNode;
  activeDoc?: 'terms' | 'privacy';
}

export const LegalLayout: React.FC<LegalLayoutProps> = ({ children, activeDoc }) => {
  return (
    <div className="im-legal-page-root">
      {/* Enterprise Top Navigation Header */}
      <header className="im-legal-navbar">
        <div className="im-legal-nav-container">
          <div className="im-legal-brand-wrapper">
            <BrandLogo to="/login" />
          </div>

          <div className="im-legal-doc-switcher" role="tablist" aria-label="Legal document tabs">
            <Link
              to="/terms"
              className={`im-legal-tab ${activeDoc === 'terms' ? 'active' : ''}`}
              role="tab"
              aria-selected={activeDoc === 'terms'}
            >
              Terms of Service
            </Link>
            <Link
              to="/privacy"
              className={`im-legal-tab ${activeDoc === 'privacy' ? 'active' : ''}`}
              role="tab"
              aria-selected={activeDoc === 'privacy'}
            >
              Privacy Policy
            </Link>
          </div>

          <div className="im-legal-nav-actions">
            <Link to="/signup" className="im-legal-nav-btn secondary">
              ← Back to Sign Up
            </Link>
            <Link to="/login" className="im-legal-nav-btn primary">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Document Content */}
      <main className="im-legal-main-content">
        <div className="im-legal-container">
          {children || <Outlet />}
        </div>
      </main>

      {/* Enterprise Legal Footer */}
      <footer className="im-legal-footer">
        <div className="im-legal-footer-container">
          <div className="im-legal-footer-info">
            <p>&copy; {new Date().getFullYear()} IntellMeet AI Inc. All rights reserved.</p>
            <p className="im-legal-footer-sub">Enterprise AI Meeting &amp; Collaboration Platform</p>
          </div>
          <div className="im-legal-footer-links">
            <Link to="/login">Sign In</Link>
            <Link to="/signup">Create Account</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LegalLayout;
