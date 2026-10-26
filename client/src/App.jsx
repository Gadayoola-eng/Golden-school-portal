import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/useAuthStore';

// Layout & Route Guards
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherClasses from './pages/teacher/TeacherClasses';
import ClassDetail from './pages/teacher/ClassDetail';
import AssignmentDetail from './pages/teacher/AssignmentDetail';
import Gradebook from './pages/teacher/Gradebook';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentClasses from './pages/student/StudentClasses';
import StudentAssignment from './pages/student/StudentAssignment';
import StudentGrades from './pages/student/StudentGrades';

// Parent & Billing Pages
import ParentDashboard from './pages/parent/ParentDashboard';
import BillingPage from './pages/billing/BillingPage';

// Phase 1: Attendance, Timetable & Terminal Report Cards
import TeacherAttendance from './pages/attendance/TeacherAttendance';
import StudentAttendance from './pages/attendance/StudentAttendance';
import TimetablePage from './pages/timetable/TimetablePage';
import ReportCardPage from './pages/reports/ReportCardPage';

// Phase 2: Admissions & Public Acquisition
import ApplyPage from './pages/admissions/ApplyPage';

// Phase 3: Public Website & Knowledge Base
import LandingPage from './pages/public/LandingPage';
import NewsPage from './pages/public/NewsPage';
import DownloadsPage from './pages/public/DownloadsPage';

// Phase 4: Communication & Careers
import CareersPage from './pages/public/CareersPage';
import FloatingActionBar from './components/common/FloatingActionBar';

// Admin Executive Console
import AdminDashboard from './pages/admin/AdminDashboard';

// Shared Pages
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

import { ToastProvider } from './context/ToastContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function RootRedirect() {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user.role === 'TEACHER') return <Navigate to="/teacher" replace />;
  if (user.role === 'PARENT') return <Navigate to="/parent" replace />;
  return <Navigate to="/student" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Public Website & Knowledge Base Routes (Phase 3) */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/downloads" element={<DownloadsPage />} />

          {/* Public Admissions & Acquisition Routes (Phase 2) */}
          <Route path="/apply" element={<ApplyPage />} />
          <Route path="/admissions" element={<ApplyPage />} />
          <Route path="/visit" element={<ApplyPage />} />
          <Route path="/track" element={<ApplyPage />} />

          {/* Careers & Employment Opportunities (Phase 4) */}
          <Route path="/careers" element={<CareersPage />} />

          {/* Portal Gateway Redirect */}
          <Route path="/portal" element={<RootRedirect />} />

          {/* Protected App Routes (Wrapped in Layout Shell) */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Admin Management Protected Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Teacher Protected Routes (Admin also has full access) */}
            <Route
              path="/teacher"
              element={
                <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/classes"
              element={
                <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                  <TeacherClasses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/classes/:id"
              element={
                <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                  <ClassDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/classes/:classId/gradebook"
              element={
                <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                  <Gradebook />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/assignments/:id"
              element={
                <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                  <AssignmentDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/attendance"
              element={
                <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                  <TeacherAttendance />
                </ProtectedRoute>
              }
            />

            {/* Student Protected Routes (Admin also has full access) */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/classes"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
                  <StudentClasses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/browse"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
                  <StudentClasses defaultBrowse={true} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/classes/:classId"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
                  <StudentClasses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/classes/:classId/grades"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
                  <StudentGrades />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/assignments/:id"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN', 'TEACHER']}>
                  <StudentAssignment />
                </ProtectedRoute>
              }
            />

            {/* Parent Portal Protected Routes (Admin also has access) */}
            <Route
              path="/parent"
              element={
                <ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}>
                  <ParentDashboard />
                </ProtectedRoute>
              }
            />

            {/* Fee Management & Billing Protected Route */}
            <Route
              path="/billing"
              element={
                <ProtectedRoute allowedRoles={['PARENT', 'STUDENT', 'TEACHER', 'ADMIN']}>
                  <BillingPage />
                </ProtectedRoute>
              }
            />

            {/* Attendance (Student, Parent, Teacher, Admin) */}
            <Route
              path="/attendance"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'PARENT', 'TEACHER', 'ADMIN']}>
                  <StudentAttendance />
                </ProtectedRoute>
              }
            />

            {/* Timetable Schedule (Shared) */}
            <Route
              path="/timetable"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'PARENT', 'TEACHER', 'ADMIN']}>
                  <TimetablePage />
                </ProtectedRoute>
              }
            />

            {/* Terminal Report Cards & Result Checker (Shared) */}
            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'PARENT', 'TEACHER', 'ADMIN']}>
                  <ReportCardPage />
                </ProtectedRoute>
              }
            />

            {/* Shared Profile Route */}
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Omnipresent Floating Action Bar (WhatsApp, Call, AI Assistant) */}
        <FloatingActionBar />
      </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}
