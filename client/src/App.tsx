import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { Dashboard } from './pages/Dashboard';
import { Matter } from './pages/Matter';
import { Feedback } from './pages/Feedback';
import { Portfolio } from './pages/Portfolio';
import { NotificationsPage } from './pages/NotificationsPage';
import { AccountPage } from './pages/AccountPage';
import { MembershipInactivePage } from './pages/MembershipInactivePage';
import { MarkerDashboard } from './pages/MarkerDashboard';
import { MarkerReview } from './pages/MarkerReview';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminAudit } from './pages/AdminAudit';
import { UsersAndInvitesPage } from './pages/UsersAndInvitesPage';
import { TaskBuilder } from './pages/TaskBuilder';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { CookiePage } from './pages/CookiePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ErrorPage } from './pages/ErrorPage';
import { useAuth } from './hooks/useAuth';

/**
 * Root application component.
 *
 * Sets up the BrowserRouter, authentication state, and all application routes.
 * Every route is wrapped in the Layout component which provides the header,
 * navigation, and footer shell.
 *
 * Authentication flow:
 * 1. useAuth hook checks for a valid session on mount.
 * 2. While loading, a spinner is shown.
 * 3. Once loaded, routes are rendered based on the URL path.
 * 4. Role-based access is enforced on the server; the client shows/hides
 *    navigation links based on the user's role but does not duplicate
 *    authorization logic.
 *
 * Route groups:
 * - Public: Landing, sign in/up, forgot/reset password, verify email,
 *   privacy, terms, cookies, 404.
 * - Student: Dashboard, Matter, Feedback, Portfolio, Notifications,
 *   Account, Membership Inactive.
 * - Marker: Marker Dashboard, Marker Review.
 * - Admin: Admin Dashboard, Users & Invites, Audit Log, Task Builder.
 *
 * @returns JSX element with BrowserRouter, Layout, and Routes.
 */
export default function App() {
  const { user, loading, csrfToken, refreshSession } = useAuth();

  // Refresh session on mount to restore authentication from cookie.
  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  // Show loading spinner while session is being validated.
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-canvas">
        <div className="animate-pulse rounded-full h-8 w-8 bg-primary"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Layout user={user} csrfToken={csrfToken}>
        <Routes>
          // ============================================
          // Public routes (no authentication required)
          // ============================================
          <Route path="/" element={<LandingPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/membership-inactive" element={<MembershipInactivePage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/cookies" element={<CookiePage />} />

          // ============================================
          // Student routes (require sign-in + active membership)
          // ============================================
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/matter/:id?" element={<Matter />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/account" element={<AccountPage />} />

          // ============================================
          // Marker routes (require marker or admin role)
          // ============================================
          <Route path="/marker/dashboard" element={<MarkerDashboard />} />
          <Route path="/marker/review/:id" element={<MarkerReview />} />

          // ============================================
          // Admin routes (require administrator role)
          // ============================================
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UsersAndInvitesPage />} />
          <Route path="/admin/audit" element={<AdminAudit />} />
          <Route path="/admin/task-builder/:taskId?" element={<TaskBuilder />} />

          // ============================================
          // Fallback
          // ============================================
          <Route path="*" element={<NotFoundPage />} />
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
