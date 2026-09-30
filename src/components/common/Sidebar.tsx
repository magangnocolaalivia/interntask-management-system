import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserAvatar } from './UserAvatar';
import { 
  LayoutDashboard, CheckSquare, TrendingUp, Bell, 
  FileText, User, Users, ClipboardCheck, Activity, 
  BarChart3, X, MessageSquare, Settings, CalendarCheck, Clock
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const { currentUser, unreadNotificationCount, unreadMessageCount, tasks } = useApp();

  if (!currentUser) return null;

  // Pending reviews count for mentor
  const pendingReviewsCount = tasks.filter(t => t.status === 'Submitted').length;

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const renderNavLinks = () => {
    switch (currentUser.role) {
      case 'intern':
        return [
          { id: 'intern-dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'daily-tasks', label: 'Daily Tasks', icon: CheckSquare },
          { id: 'intern-attendance', label: 'Absensi & Kehadiran', icon: Clock },
          { id: 'intern-progress', label: 'My Progress', icon: TrendingUp },
          { 
            id: 'direct-chat', 
            label: 'Chat Mentor', 
            icon: MessageSquare,
            badge: unreadMessageCount > 0 ? unreadMessageCount : null,
            badgeColor: 'bg-teal-100 text-teal-800'
          },
          { 
            id: 'notifications', 
            label: 'Notifications', 
            icon: Bell, 
            badge: unreadNotificationCount > 0 ? unreadNotificationCount : null,
            badgeColor: 'bg-teal-100 text-teal-800'
          },
          { id: 'reports', label: 'Reports', icon: FileText },
          { id: 'profile', label: 'Profile', icon: User },
        ];
      case 'mentor':
        return [
          { id: 'mentor-dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'mentor-interns', label: 'Intern', icon: Users },
          { id: 'mentor-attendance', label: 'Kehadiran Intern', icon: CalendarCheck },
          { 
            id: 'direct-chat', 
            label: 'Chat Intern', 
            icon: MessageSquare,
            badge: unreadMessageCount > 0 ? unreadMessageCount : null,
            badgeColor: 'bg-teal-100 text-teal-800'
          },
          { 
            id: 'mentor-reviews', 
            label: 'Task Review', 
            icon: ClipboardCheck,
            badge: pendingReviewsCount > 0 ? pendingReviewsCount : null,
            badgeColor: 'bg-amber-100 text-amber-800 border border-amber-200'
          },
          { id: 'reports', label: 'Reports', icon: FileText },
          { 
            id: 'notifications', 
            label: 'Notifications', 
            icon: Bell, 
            badge: unreadNotificationCount > 0 ? unreadNotificationCount : null,
            badgeColor: 'bg-teal-100 text-teal-800'
          },
          { id: 'profile', label: 'Profile', icon: User },
        ];
      case 'director':
        return [
          { id: 'director-dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'director-users', label: 'Manajemen Pengguna', icon: Users },
          { id: 'director-interns', label: 'Pantau Kinerja', icon: TrendingUp },
          { id: 'director-attendance', label: 'Monitoring Kehadiran', icon: CalendarCheck },
          { id: 'reports', label: 'Reports', icon: BarChart3 },
          { id: 'director-settings', label: 'Pengaturan Perusahaan', icon: Settings },
          { 
            id: 'notifications', 
            label: 'Notifications', 
            icon: Bell, 
            badge: unreadNotificationCount > 0 ? unreadNotificationCount : null,
            badgeColor: 'bg-teal-100 text-teal-800'
          },
          { id: 'profile', label: 'Profile', icon: User },
        ];
      default:
        return [];
    }
  };

  const navLinks = renderNavLinks();

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container: Desktop w-64 md:flex, Mobile slide-out drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white text-slate-600 flex flex-col border-r border-slate-200 transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:h-screen md:shrink-0 ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand / Header in Sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <img 
              src="/images/logo.png" 
              alt="InternTask Logo" 
              className="h-9 w-auto object-contain shrink-0" 
            />
            <span className="text-xl font-bold text-slate-800 tracking-tight">
              Intern<span className="text-teal-600">Task</span>
            </span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card in Sidebar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <UserAvatar user={currentUser} size="md" />
            <div className="flex-1 min-w-0">
              <h4 data-user-name className="text-xs font-bold text-slate-800 truncate">
                {currentUser.name}
              </h4>
              <p data-user-role className="text-[11px] text-slate-500 capitalize truncate">
                {currentUser.role === 'intern' ? 'Peserta Magang' : currentUser.role === 'mentor' ? 'Pembimbing (Mentor)' : 'Direktur Perusahaan'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {currentUser.role.toUpperCase()} MENU
          </div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            const itemHref = link.id === 'reports'
              ? (currentUser.role === 'intern' ? '/intern/reports' : '/reports')
              : (link.id === 'intern-dashboard' ? '/intern/dashboard'
                : link.id === 'daily-tasks' ? '/intern/tasks'
                : link.id === 'intern-attendance' ? '/intern/attendance'
                : link.id === 'intern-progress' ? '/intern/progress'
                : link.id === 'mentor-dashboard' ? '/mentor/dashboard'
                : link.id === 'mentor-reviews' ? '/mentor/reviews'
                : link.id === 'mentor-monitoring' ? '/mentor/monitoring'
                : link.id === 'mentor-interns' ? '/mentor/interns'
                : link.id === 'mentor-attendance' ? '/mentor/attendance'
                : link.id === 'director-dashboard' ? '/director/dashboard'
                : link.id === 'director-users' ? '/director/users'
                : link.id === 'director-interns' ? '/director/monitoring'
                : link.id === 'director-attendance' ? '/director/attendance'
                : link.id === 'director-activity' ? '/director/activity'
                : link.id === 'director-settings' ? '/director/settings'
                : link.id === 'direct-chat' ? '/chat'
                : `/${link.id}`);

            return (
              <a
                key={link.id}
                href={itemHref}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.id);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs transition-colors cursor-pointer font-medium ${
                  isActive
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span className="truncate">{link.label}</span>
                </div>
                {link.badge && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      link.badgeColor || 'bg-teal-100 text-teal-800'
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </a>
            );
          })}
        </div>
      </aside>
    </>
  );
};
