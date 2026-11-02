import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ClassProvider } from './contexts/ClassContext';
import { ToastProvider } from './contexts/ToastContext';
import { AppLayout } from './components/layout/AppLayout';
import { RoleGuard } from './components/auth/RoleGuard';

// Auth pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForbiddenPage } from './pages/auth/ForbiddenPage';
import { NotFoundPage } from './pages/auth/NotFoundPage';

// Teacher pages
import { TeacherDashboardPage } from './pages/teacher/DashboardPage';
import { ClassesListPage } from './pages/teacher/ClassesListPage';
import { CreateClassPage } from './pages/teacher/CreateClassPage';
import { ClassDetailPage } from './pages/teacher/ClassDetailPage';
import { StudentsListPage } from './pages/teacher/StudentsListPage';
import { StudentImportWizardPage } from './pages/teacher/StudentImportWizardPage';
import { StudentProfile360Page } from './pages/teacher/StudentProfile360Page';
import { AttendancePage } from './pages/teacher/AttendancePage';
import { AssignmentsListPage } from './pages/teacher/AssignmentsListPage';
import { QuizzesPage } from './pages/teacher/QuizzesPage';
import { ResourcesPage } from './pages/teacher/ResourcesPage';
import { AiAssistantPage } from './pages/teacher/AiAssistantPage';
import { GradesPage } from './pages/teacher/GradesPage';
import { BehaviorPage } from './pages/teacher/BehaviorPage';
import { RewardsPage } from './pages/teacher/RewardsPage';
import { AlertsPage } from './pages/teacher/AlertsPage';
import { AnnouncementsPage } from './pages/teacher/AnnouncementsPage';
import { ReportsPage } from './pages/teacher/ReportsPage';
import { SchedulePage } from './pages/teacher/SchedulePage';

// Classroom Tools
import { WheelOfFortunePage } from './pages/teacher/tools/WheelOfFortunePage';
import { RandomPickerPage } from './pages/teacher/tools/RandomPickerPage';
import { CountdownTimerPage } from './pages/teacher/tools/CountdownTimerPage';
import { GroupMakerPage } from './pages/teacher/tools/GroupMakerPage';

// Student Portal pages
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';

// Parent Portal pages
import { ParentDashboardPage } from './pages/parent/ParentDashboardPage';

// Admin Portal pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

// Root redirector based on current user role
const RootRedirector: React.FC = () => {
  const { role, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const routes: Record<string, string> = {
    TEACHER: '/teacher/dashboard',
    STUDENT: '/student/dashboard',
    PARENT: '/parent/dashboard',
    ADMIN: '/admin/dashboard',
  };
  return <Navigate to={routes[role] || '/teacher/dashboard'} replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <ClassProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<RootRedirector />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/403" element={<ForbiddenPage />} />

              {/* Protected Teacher App Routes */}
              <Route
                path="/teacher"
                element={
                  <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                    <AppLayout />
                  </RoleGuard>
                }
              >
                <Route index element={<Navigate to="/teacher/dashboard" replace />} />
                <Route path="dashboard" element={<TeacherDashboardPage />} />
                <Route path="classes" element={<ClassesListPage />} />
                <Route path="classes/create" element={<CreateClassPage />} />
                <Route path="classes/:id" element={<ClassDetailPage />} />
                <Route path="students" element={<StudentsListPage />} />
                <Route path="students/import" element={<StudentImportWizardPage />} />
                <Route path="students/:id" element={<StudentProfile360Page />} />
                <Route path="attendance" element={<AttendancePage />} />
                <Route path="schedule" element={<SchedulePage />} />
                <Route path="assignments" element={<AssignmentsListPage />} />
                <Route path="grading" element={<AssignmentsListPage />} />
                <Route path="quizzes" element={<QuizzesPage />} />
                <Route path="resources" element={<ResourcesPage />} />
                <Route path="ai" element={<AiAssistantPage />} />
                <Route path="grades" element={<GradesPage />} />
                <Route path="behavior" element={<BehaviorPage />} />
                <Route path="rewards" element={<RewardsPage />} />
                <Route path="alerts" element={<AlertsPage />} />
                <Route path="announcements" element={<AnnouncementsPage />} />
                <Route path="reports" element={<ReportsPage />} />

                {/* Classroom tools */}
                <Route path="tools" element={<Navigate to="/teacher/tools/wheel" replace />} />
                <Route path="tools/wheel" element={<WheelOfFortunePage />} />
                <Route path="tools/random" element={<RandomPickerPage />} />
                <Route path="tools/timer" element={<CountdownTimerPage />} />
                <Route path="tools/groups" element={<GroupMakerPage />} />
              </Route>

              {/* Protected Student Portal Routes */}
              <Route
                path="/student"
                element={
                  <RoleGuard allowedRoles={['STUDENT', 'ADMIN']}>
                    <AppLayout />
                  </RoleGuard>
                }
              >
                <Route index element={<Navigate to="/student/dashboard" replace />} />
                <Route path="dashboard" element={<StudentDashboardPage />} />
                <Route path="schedule" element={<SchedulePage />} />
                <Route path="assignments" element={<StudentDashboardPage />} />
                <Route path="quizzes" element={<QuizzesPage />} />
                <Route path="resources" element={<ResourcesPage />} />
                <Route path="grades" element={<StudentDashboardPage />} />
                <Route path="attendance" element={<StudentDashboardPage />} />
                <Route path="achievements" element={<RewardsPage />} />
                <Route path="announcements" element={<AnnouncementsPage />} />
              </Route>

              {/* Protected Parent Portal Routes */}
              <Route
                path="/parent"
                element={
                  <RoleGuard allowedRoles={['PARENT', 'ADMIN']}>
                    <AppLayout />
                  </RoleGuard>
                }
              >
                <Route index element={<Navigate to="/parent/dashboard" replace />} />
                <Route path="dashboard" element={<ParentDashboardPage />} />
                <Route path="children" element={<ParentDashboardPage />} />
                <Route path="grades" element={<ParentDashboardPage />} />
                <Route path="attendance" element={<ParentDashboardPage />} />
                <Route path="assignments" element={<ParentDashboardPage />} />
                <Route path="achievements" element={<ParentDashboardPage />} />
                <Route path="announcements" element={<AnnouncementsPage />} />
              </Route>

              {/* Protected Admin Portal Routes */}
              <Route
                path="/admin"
                element={
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <AppLayout />
                  </RoleGuard>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="schools" element={<AdminDashboardPage />} />
                <Route path="academic" element={<AdminDashboardPage />} />
                <Route path="classes" element={<ClassesListPage />} />
                <Route path="teachers" element={<AdminDashboardPage />} />
                <Route path="students" element={<StudentsListPage />} />
                <Route path="parents" element={<AdminDashboardPage />} />
                <Route path="roles" element={<AdminDashboardPage />} />
                <Route path="audit-logs" element={<AdminDashboardPage />} />
                <Route path="backups" element={<AdminDashboardPage />} />
                <Route path="settings" element={<AdminDashboardPage />} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </ClassProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
