import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { Dashboard } from './pages/Dashboard';
import { Matter } from './pages/Matter';
import { Feedback } from './pages/Feedback';
import { MarkerDashboard } from './pages/MarkerDashboard';
import { MarkerReview } from './pages/MarkerReview';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminAudit } from './pages/AdminAudit';
import { PrivacyPage } from './pages/PrivacyPage';
import { MembershipInactivePage } from './pages/MembershipInactivePage';
import { TaskBuilder } from './pages/TaskBuilder';
import { Portfolio } from './pages/Portfolio';
import { TermsPage } from './pages/TermsPage';
import { CookiePage } from './pages/CookiePage';
import { useAuth } from './hooks/useAuth';
export default function App() {
  const { user, loading, csrfToken, refreshSession } = useAuth();

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-beige-bg">
        <div className="animate-pulse rounded-full h-8 w-8 bg-navy"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Layout user={user} csrfToken={csrfToken}>
        <Routes>
          <Route path="/" element={<Navigate to="/signin" replace />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/membership-inactive" element={<MembershipInactivePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/matter" element={<Matter />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/marker/dashboard" element={<MarkerDashboard />} />
          <Route path="/marker/review/:id" element={<MarkerReview />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/audit" element={<AdminAudit />} />
          <Route path="/admin/task-builder/:taskId" element={<TaskBuilder />} />
          <Route path="/admin/task-builder" element={<TaskBuilder />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/cookies" element={<CookiePage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

declare global {
  interface Window {
    __LM_CSRF_TOKEN__: string;
  }
}
