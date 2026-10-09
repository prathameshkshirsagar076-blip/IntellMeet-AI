import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

/* Icons */
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const UserPlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);

const KeyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

const FileTextIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export const RouteSwitcher: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <nav className="im-floating-route-bar" aria-label="Route Navigator">
      <span className="im-route-label">Routes:</span>

      <NavLink
        to="/login"
        className={({ isActive }) => `im-route-pill-btn ${isActive ? 'active' : ''}`}
        id="route-btn-login"
        title="Login Page"
      >
        <LockIcon />
        <span>Sign In</span>
      </NavLink>

      <NavLink
        to="/signup"
        className={({ isActive }) => `im-route-pill-btn ${isActive ? 'active' : ''}`}
        id="route-btn-signup"
        title="Sign Up Page"
      >
        <UserPlusIcon />
        <span>Sign Up</span>
      </NavLink>

      <NavLink
        to="/forgot-password"
        className={({ isActive }) => `im-route-pill-btn ${isActive ? 'active' : ''}`}
        id="route-btn-forgot"
        title="Forgot Password Page"
      >
        <KeyIcon />
        <span>Forgot Password</span>
      </NavLink>

      {!collapsed && (
        <>
          <NavLink
            to="/terms"
            className={({ isActive }) => `im-route-pill-btn ${isActive ? 'active' : ''}`}
            id="route-btn-terms"
            title="Terms of Service"
          >
            <FileTextIcon />
            <span>Terms</span>
          </NavLink>

          <NavLink
            to="/privacy"
            className={({ isActive }) => `im-route-pill-btn ${isActive ? 'active' : ''}`}
            id="route-btn-privacy"
            title="Privacy Policy"
          >
            <ShieldIcon />
            <span>Privacy</span>
          </NavLink>

          <NavLink
            to="/landing"
            className={({ isActive }) => `im-route-pill-btn ${isActive ? 'active' : ''}`}
            id="route-btn-landing"
            title="Landing Page"
          >
            <HomeIcon />
            <span>Landing</span>
          </NavLink>

          <NavLink
            to="/non-existent-page"
            className={({ isActive }) => `im-route-pill-btn ${isActive ? 'active' : ''}`}
            id="route-btn-404"
            title="Test 404 Route"
          >
            <span>404</span>
          </NavLink>
        </>
      )}

      <button
        type="button"
        className="im-route-pill-btn"
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? 'Expand routes' : 'Collapse routes'}
        style={{ padding: '6px 8px', opacity: 0.7 }}
      >
        <span>{collapsed ? 'More +' : '−'}</span>
      </button>
    </nav>
  );
};

export default RouteSwitcher;
