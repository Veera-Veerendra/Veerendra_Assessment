import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import StudentDashboard from './pages/student/StudentDashboard';
import ProfilePage from './pages/student/ProfilePage';
import CoursesPage from './pages/student/CoursesPage';
import CourseDetailPage from './pages/student/CourseDetailPage'; // Import the new page
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminFeedbackPage from './pages/admin/AdminFeedbackPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminCoursesPage from './pages/admin/AdminCoursesPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { Role } from './types';
import MainLayout from './components/layout/MainLayout';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/dashboard" />} />
              
              {/* Student Routes */}
              <Route element={<ProtectedRoute allowedRoles={[Role.STUDENT]} />}>
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="courses" element={<CoursesPage />} />
                <Route path="courses/:courseId" element={<CourseDetailPage />} /> {/* Add new route */}
                <Route path="profile" element={<ProfilePage />} />
              </Route>
              
              {/* Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={[Role.ADMIN]} />}>
                <Route path="admin/dashboard" element={<AdminDashboard />} />
                <Route path="admin/feedback" element={<AdminFeedbackPage />} />
                <Route path="admin/users" element={<AdminUsersPage />} />
                <Route path="admin/courses" element={<AdminCoursesPage />} />
              </Route>
              
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;