import React from 'react';
import { Outlet } from 'react-router-dom';
import RightPanel from '../components/RightPanel';
import '../App.css';

interface AuthLayoutProps {
  children?: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="intellmeet-app">
      <aside className="im-left-panel" aria-label="Authentication form panel">
        {children || <Outlet />}
      </aside>
      <main className="im-right-panel" aria-label="IntellMeet AI intelligence showcase">
        <RightPanel />
      </main>
    </div>
  );
};

export default AuthLayout;
