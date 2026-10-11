import React, { useState, useRef } from 'react';
import { Link, Outlet } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import ThemeCustomizationPopover from '../components/theme/ThemeCustomizationPopover';
import '../styles/legalPages.css';

interface LegalLayoutProps {
  children?: React.ReactNode;
  activeDoc?: 'terms' | 'privacy';
}

export const LegalLayout: React.FC<LegalLayoutProps> = ({ children, activeDoc }) => {
  const [showThemePopover, setShowThemePopover] = useState(false);
  const themeButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="im-legal-page-root">
      {/* Enterprise Top Navigation Header */}
      <header className="im-legal-navbar">
        <div className="im-legal-nav-container">
          <div className="im-legal-brand-wrapper">
            <BrandLogo to="/" />
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
            <div className="im-theme-trigger-wrapper" style={{ position: 'relative' }}>
              <button
                ref={themeButtonRef}
                className="im-legal-nav-btn secondary"
                onClick={() => setShowThemePopover(!showThemePopover)}
                aria-label="Customize theme and appearance"
                style={{ cursor: 'pointer' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                  <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                  <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                  <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
                </svg>
                Theme
              </button>
              {showThemePopover && (
                <ThemeCustomizationPopover
                  onClose={() => setShowThemePopover(false)}
                  triggerRef={themeButtonRef}
                />
              )}
            </div>
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
