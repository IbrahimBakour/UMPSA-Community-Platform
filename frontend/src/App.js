import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import { gradients } from './theme';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ClubsPage from './pages/ClubsPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ClubDetailPage from './pages/ClubDetailPage';
import MyClubsPage from './pages/MyClubsPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import ReportsPage from './pages/ReportsPage';
import SubmitReportPage from './pages/SubmitReportPage';
import UsersPage from './pages/UsersPage';
import EventsPage from './pages/EventsPage';
import SettingsPage from './pages/SettingsPage';
import CreateClubPage from './pages/CreateClubPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NewsFeedPage from './pages/NewsFeedPage';

const NotFound = () => <div style={{ padding: 32 }}><h2>404</h2><p>Page not found.</p></div>;

function AppLayout() {
  const location = useLocation();
  // Hide header on login, register, change-password, and forgot-password pages
  const hideHeader = ['/login', '/register', '/change-password', '/forgot-password'].includes(location.pathname);
  return (
    <div className="App" style={{ minHeight: '100vh', background: gradients.tealBlue }}>
      {!hideHeader && <Header />}
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clubs" element={<ClubsPage />} />
        <Route path="/my-clubs" element={<MyClubsPage />} />
        <Route path="/my-memberships" element={<MyClubsPage />} />
        <Route path="/clubs/:clubId" element={<ClubDetailPage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/submit-report" element={<SubmitReportPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/create-club" element={<CreateClubPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/news" element={<NewsFeedPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
