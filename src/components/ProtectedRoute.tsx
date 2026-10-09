import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  redirectTo?: string;
}

/**
 * Route guard component that protects private pages (e.g., /dashboard).
 * If the user has not established a demo session, redirects to /login.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/login',
}) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login while preserving the attempted path for return navigation
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return <>{children || <Outlet />}</>;
};

export default ProtectedRoute;
