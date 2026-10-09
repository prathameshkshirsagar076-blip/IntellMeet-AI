import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LockIcon,
  UserIcon,
  LayoutDashboardIcon,
  FileTextIcon,
  ShieldIcon,
} from './icons';

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const KeyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

export const RouteSwitcher: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <nav className="im-floating-route-bar" aria-label="Route Navigator">
      <span className="im-route-label">Routes:</span>

      <NavLink
        to="/"
        end
        className={({ isActive }) => `im-route-pill-btn ${isActive ? 'active' : ''}`}
        id="route-btn-home"
        title="Landing Page (Root)"
      >
        <HomeIcon />
        <span>Landing (/)</span>
      </NavLink>

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
        <UserIcon />
        <span>Sign Up</span>
      </NavLink>

      <NavLink
        to="/dashboard"
        className={({ isActive }) => `im-route-pill-btn ${isActive ? 'active' : ''}`}
        id="route-btn-dashboard"
        title="Enterprise Dashboard (Protected)"
      >
        <LayoutDashboardIcon />
        <span>Dashboard</span>
      </NavLink>

      {!collapsed && (
        <>
          <NavLink
            to="/forgot-password"
            className={({ isActive }) => `im-route-pill-btn ${isActive ? 'active' : ''}`}
            id="route-btn-forgot"
            title="Forgot Password Page"
          >
            <KeyIcon />
            <span>Forgot Password</span>
          </NavLink>

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
            to="/non-existent-page"
            className={({ isActive }) => `im-route-pill-btn ${isActive ? 'active' : ''}`}
            id="route-btn-404"
            title="Test 404 Catch-All Route"
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
