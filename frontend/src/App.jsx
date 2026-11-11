import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

// Layout & Pages
import AppLayout from './components/AppLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import FarmsPage from './pages/FarmsPage';
import SmartIrrigationPage from './pages/SmartIrrigationPage';
import AiChatPage from './pages/AiChatPage';
import IotPage from './pages/IotPage';
import WeatherPage from './pages/WeatherPage';
import EnvironmentalImpactPage from './pages/EnvironmentalImpactPage';
import FinancialPage from './pages/FinancialPage';
import ReportsPage from './pages/ReportsPage';
import PricingPage from './pages/PricingPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';

// Protected Route Guard
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 text-xs">
        Chargement d'AquaSmart...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes with Navbar */}
              <Route path="/" element={<AppLayout />}>
                <Route index element={<LandingPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="pricing" element={<PricingPage />} />

                {/* Authenticated Application Routes */}
                <Route path="dashboard" element={
                  <ProtectedRoute><DashboardPage /></ProtectedRoute>
                } />
                <Route path="farms" element={
                  <ProtectedRoute><FarmsPage /></ProtectedRoute>
                } />
                <Route path="irrigation" element={
                  <ProtectedRoute><SmartIrrigationPage /></ProtectedRoute>
                } />
                <Route path="ai" element={
                  <ProtectedRoute><AiChatPage /></ProtectedRoute>
                } />
                <Route path="iot" element={
                  <ProtectedRoute><IotPage /></ProtectedRoute>
                } />
                <Route path="weather" element={
                  <ProtectedRoute><WeatherPage /></ProtectedRoute>
                } />
                <Route path="impact" element={
                  <ProtectedRoute><EnvironmentalImpactPage /></ProtectedRoute>
                } />
                <Route path="finance" element={
                  <ProtectedRoute><FinancialPage /></ProtectedRoute>
                } />
                <Route path="reports" element={
                  <ProtectedRoute><ReportsPage /></ProtectedRoute>
                } />
                <Route path="admin" element={
                  <ProtectedRoute><AdminPage /></ProtectedRoute>
                } />
                <Route path="profile" element={
                  <ProtectedRoute><ProfilePage /></ProtectedRoute>
                } />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
