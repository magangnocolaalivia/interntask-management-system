import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { ForbiddenView } from './components/common/ForbiddenView';

// Views
import { LoginView } from './components/auth/LoginView';
import { InternDashboard } from './components/intern/InternDashboard';
import { DailyTaskList } from './components/intern/DailyTaskList';
import { InternProgress } from './components/intern/InternProgress';
import { InternAttendanceHistory } from './components/intern/InternAttendanceHistory';
import { MentorDashboard } from './components/mentor/MentorDashboard';
import { TaskReviewList } from './components/mentor/TaskReviewList';
import { InternMonitoring } from './components/mentor/InternMonitoring';
import { MentorAttendanceView } from './components/mentor/MentorAttendanceView';
import { DirectorDashboard } from './components/director/DirectorDashboard';
import { DirectorMonitoring } from './components/director/DirectorMonitoring';
import { DirectorAttendanceView } from './components/director/DirectorAttendanceView';
import { UserManagementView } from './components/director/UserManagementView';
import { CompanySettingsView } from './components/director/CompanySettingsView';
import { ReportView } from './components/reports/ReportView';
import { NotificationList } from './components/notifications/NotificationList';
import { ProfileView } from './components/profile/ProfileView';
import { DirectChatView } from './components/chat/DirectChatView';

// Route permissions definition (CheckRole Middleware Simulation - Laravel 11 bootstrap/app.php)
const ROLE_PERMISSIONS: Record<string, string[]> = {
  intern: [
    'intern-dashboard',
    'daily-tasks',
    'intern-attendance', // 📅 Riwayat Kehadiran Pribadi
    'intern-progress',
    'direct-chat',
    'reports', // Authorized for Intern (Data Scoped to Auth::id())
    'notifications',
    'profile',
  ],
  mentor: [
    'mentor-dashboard',
    'mentor-reviews',
    'mentor-monitoring',
    'mentor-interns',
    'mentor-attendance', // 📅 Monitoring Kehadiran Intern Bimbingan
    'direct-chat',
    'reports',
    'notifications',
    'profile',
  ],
  director: [
    'director-dashboard',
    'director-users',
    'director-interns',
    'director-attendance', // 📅 Monitoring Kehadiran Seluruh Intern (Read-Only)
    'director-activity',
    'reports',
    'director-settings',
    'notifications',
    'profile',
  ],
};

const TAB_URL_MAP: Record<string, string> = {
  'intern-dashboard': '/intern/dashboard',
  'daily-tasks': '/intern/tasks',
  'intern-attendance': '/intern/attendance',
  'intern-progress': '/intern/progress',
  'mentor-dashboard': '/mentor/dashboard',
  'mentor-reviews': '/mentor/reviews',
  'mentor-monitoring': '/mentor/monitoring',
  'mentor-interns': '/mentor/interns',
  'mentor-attendance': '/mentor/attendance',
  'director-dashboard': '/director/dashboard',
  'director-users': '/director/users',
  'director-interns': '/director/monitoring',
  'director-attendance': '/director/attendance',
  'director-activity': '/director/activity',
  'director-settings': '/director/settings',
  'direct-chat': '/chat',
  'reports': '/reports',
  'notifications': '/notifications',
  'profile': '/profile',
};

export const getTabUrl = (tab: string, role?: string): string => {
  if (tab === 'reports' && role === 'intern') {
    return '/intern/reports';
  }
  return TAB_URL_MAP[tab] || `/${tab}`;
};

const getDefaultDashboard = (role?: string): string => {
  if (role === 'intern') return 'intern-dashboard';
  if (role === 'mentor') return 'mentor-dashboard';
  return 'director-dashboard';
};

const AppContent: React.FC = () => {
  const { currentUser } = useApp();

  // Active view tab
  const [activeTab, setActiveTab] = useState<string>(() => {
    return currentUser ? getDefaultDashboard(currentUser.role) : 'login';
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync tab with role on user change / Role Switcher
  useEffect(() => {
    if (!currentUser) {
      setActiveTab('login');
      return;
    }

    const allowedTabs = ROLE_PERMISSIONS[currentUser.role] || [];
    // If current tab is not allowed for the new role, automatically redirect to their default dashboard
    if (!allowedTabs.includes(activeTab) && activeTab !== 'login') {
      setActiveTab(getDefaultDashboard(currentUser.role));
    }
  }, [currentUser]);

  // Render view depending on active tab with CheckRole Middleware Guard
  const renderCurrentView = () => {
    if (!currentUser || activeTab === 'login') {
      return (
        <LoginView
          onSuccess={(user) => {
            // Strict role redirection right after login
            const targetDashboard = getDefaultDashboard(user.role);
            setActiveTab(targetDashboard);
          }}
        />
      );
    }

    // Role Guard: Check if user's role is authorized for the active tab
    const allowedTabs = ROLE_PERMISSIONS[currentUser.role] || [];
    if (!allowedTabs.includes(activeTab)) {
      return (
        <ForbiddenView
          userRole={currentUser.role}
          attemptedPath={getTabUrl(activeTab, currentUser.role)}
          onBackToDashboard={() => setActiveTab(getDefaultDashboard(currentUser.role))}
        />
      );
    }

    switch (activeTab) {
      // Intern Views (/intern/...)
      case 'intern-dashboard':
        return (
          <InternDashboard 
            onNavigateToTasks={() => setActiveTab('daily-tasks')} 
            onNavigateToChat={() => setActiveTab('direct-chat')} 
            onNavigateToReports={() => setActiveTab('reports')} 
          />
        );
      case 'daily-tasks':
        return <DailyTaskList />;
      case 'intern-attendance':
        return <InternAttendanceHistory />;
      case 'intern-progress':
        return <InternProgress />;

      // Mentor Views (/mentor/...)
      case 'mentor-dashboard':
        return (
          <MentorDashboard
            onNavigateToReviews={() => setActiveTab('mentor-reviews')}
            onNavigateToMonitoring={() => setActiveTab('mentor-monitoring')}
          />
        );
      case 'mentor-interns':
      case 'mentor-monitoring':
        return <InternMonitoring onNavigateToChat={() => setActiveTab('direct-chat')} />;
      case 'mentor-attendance':
        return <MentorAttendanceView />;
      case 'mentor-reviews':
        return <TaskReviewList />;

      // Director Views (/director/...) - Read-Only for Tasks, CRUD for User Management
      case 'director-dashboard':
        return (
          <DirectorDashboard
            onNavigateToMonitoring={() => setActiveTab('director-interns')}
            onNavigateToReports={() => setActiveTab('reports')}
            onNavigateToUsers={() => setActiveTab('director-users')}
            onNavigateToSettings={() => setActiveTab('director-settings')}
          />
        );
      case 'director-users':
        return <UserManagementView />;
      case 'director-settings':
        return <CompanySettingsView />;
      case 'director-attendance':
        return <DirectorAttendanceView />;
      case 'director-interns':
      case 'director-activity':
        return <DirectorMonitoring />;

      // Direct Messaging (Intern <-> Mentor)
      case 'direct-chat':
        return <DirectChatView />;

      // Shared Views
      case 'reports':
        return <ReportView />;
      case 'notifications':
        return <NotificationList onSelectTask={() => setActiveTab(currentUser.role === 'mentor' ? 'mentor-reviews' : 'daily-tasks')} />;
      case 'profile':
        // key={currentUser.id} guarantees clean re-mount and total state reset on user switch
        return <ProfileView key={currentUser.id} />;

      default:
        return (
          <InternDashboard onNavigateToTasks={() => setActiveTab('daily-tasks')} />
        );
    }
  };

  // If not logged in, render the clean full-screen Corporate Login / Landing Page
  if (!currentUser) {
    return (
      <>
        <LoginView
          onSuccess={(user) => {
            // Dynamic redirect based on database role
            const targetDashboard = getDefaultDashboard(user.role);
            setActiveTab(targetDashboard);
          }}
        />
        <ToastContainer />
      </>
    );
  }

  // Prevent logged-in user from staying on 'login' tab
  if (activeTab === 'login') {
    setActiveTab(getDefaultDashboard(currentUser.role));
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans antialiased text-slate-800 selection:bg-teal-100 selection:text-teal-900">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* 2. Right Main View Column */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-slate-50">
        {/* Top Navigation Bar with Corporate Role Indicator */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Independent Scrollable Workspace Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            {renderCurrentView()}
          </div>
        </main>
      </div>

      {/* 3. Global Toast Notification Container */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
