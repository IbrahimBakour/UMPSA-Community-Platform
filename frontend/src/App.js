import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { theme } from './theme';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import Dashboard from './pages/Dashboard';
import ClubsPage from './pages/ClubsPage';
import ClubDetailPage from './pages/ClubDetailPage';
import MyClubsPage from './pages/MyClubsPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import ReportsPage from './pages/ReportsPage';
import SubmitReportPage from './pages/SubmitReportPage';
import UsersPage from './pages/UsersPage';
import EventsPage from './pages/EventsPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import CreateClubPage from './pages/CreateClubPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NewsFeedPage from './pages/NewsFeedPage';
import './App.css';

function App() {
  // Check if user is authenticated
  const isAuthenticated = () => {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo !== null;
  };

  // Check if current path should hide header
  const shouldHideHeader = () => {
    const path = window.location.pathname;
    return ['/login', '/register', '/change-password', '/forgot-password'].includes(path);
  };

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="App">
          {!shouldHideHeader() && <Header />}
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clubs" element={<ClubsPage />} />
            <Route path="/clubs/:clubId" element={<ClubDetailPage />} />
            <Route path="/my-clubs" element={<MyClubsPage />} />
            <Route path="/my-memberships" element={<MyClubsPage />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/submit-report" element={<SubmitReportPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/create-club" element={<CreateClubPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/news-feed" element={<NewsFeedPage />} />
          </Routes>
        </div>
      </ThemeProvider>
    </Router>
  );
}

export default App;
