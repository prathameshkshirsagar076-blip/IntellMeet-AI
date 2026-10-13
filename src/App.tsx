import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MeetingProvider } from './context/MeetingContext';
import ProtectedRoute from './components/ProtectedRoute';
import ToastContainer from './components/toast/ToastContainer';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardOverviewPage from './pages/DashboardOverviewPage';
import MeetingsPage from './pages/MeetingsPage';
import SchedulePage from './pages/SchedulePage';
import CreateMeetingPage from './pages/CreateMeetingPage';
import JoinMeetingPage from './pages/JoinMeetingPage';
import MeetingDetailPage from './pages/MeetingDetailPage';
import MeetingHistoryPage from './pages/MeetingHistoryPage';
import AiNotesPage from './pages/AiNotesPage';
import TeamPage from './pages/TeamPage';
import ChatPage from './pages/ChatPage';
import SettingsPage from './pages/SettingsPage';
import LiveMeetingRoomPage from './pages/LiveMeetingRoomPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MeetingProvider>
        <ToastContainer />
        <BrowserRouter>
          <Routes>
            {/* 1. Public Landing Page */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/landing" element={<Navigate to="/" replace />} />

            {/* 2. Authentication Flow */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>

            {/* 3. Protected Dashboard Shell & Subroutes */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardOverviewPage />} />
              <Route path="/meetings" element={<MeetingsPage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/meetings/new" element={<CreateMeetingPage />} />
              <Route path="/meetings/join" element={<JoinMeetingPage />} />
              <Route path="/meetings/:meetingId" element={<MeetingDetailPage />} />
              <Route path="/history" element={<MeetingHistoryPage />} />
              <Route path="/ai-notes" element={<AiNotesPage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* 4. Live Meeting Room (Zoom Workplace UI) */}
            <Route path="/meeting/:meetingId" element={<LiveMeetingRoomPage />} />
            <Route path="/meeting" element={<LiveMeetingRoomPage />} />

            {/* 5. Legal & Policy Documentation */}
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />

            {/* 6. Custom 404 Catch-All Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </MeetingProvider>
    </AuthProvider>
  );
};

export default App;
