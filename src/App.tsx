import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import NotFoundPage from './pages/NotFoundPage';
import LandingPage from './components/LandingPage';
import RouteSwitcher from './components/RouteSwitcher';
import './App.css';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      {/* Centralized Enterprise Routing System */}
      <Routes>
        {/* Auth Flow: 2-column Desktop Layout with AI Showcase Panel */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Legal & Policy Pages: Focused Reader Layout */}
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        {/* Product Marketing Showcase */}
        <Route path="/landing" element={<LandingPage />} />

        {/* Default Root Redirect to /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Custom 404 Catch-All Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* Floating Route Navigator (Enables immediate verification of all routes) */}
      <RouteSwitcher />
    </BrowserRouter>
  );
};

export default App;
