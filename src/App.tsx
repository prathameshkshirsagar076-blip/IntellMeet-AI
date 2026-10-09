import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthLayout from './layouts/AuthLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import NotFoundPage from './pages/NotFoundPage';
import RouteSwitcher from './components/RouteSwitcher';
import './App.css';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Centralized Enterprise Routing Architecture */}
        <Routes>
          {/* 1. Public Landing Page as Root Entry Point */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing" element={<Navigate to="/" replace />} />

          {/* 2. Authentication Flow: 2-column Desktop Layout with AI Showcase */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* 3. Protected Dashboard (Guarded in demo mode) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* 4. Legal & Policy Documentation */}
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />

          {/* 5. Custom 404 Catch-All Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        {/* Floating Route Switcher (Enables fast inspection & verification of all journeys) */}
        <RouteSwitcher />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
