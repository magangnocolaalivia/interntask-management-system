import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserAvatar } from './UserAvatar';
import { 
  Bell, LogOut, Menu, 
  User as UserIcon, Shield, Award, UserCheck, 
  ChevronDown, CheckCheck, MessageSquare
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const { 
    currentUser, 
    logout, 
    notifications, 
    unreadNotificationCount, 
    unreadMessageCount,
    markNotificationRead, 
    markAllNotificationsRead 
  } = useApp();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userNotifications = notifications.filter(
    n => currentUser && n.user_id === currentUser.id
  ).slice(0, 10);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'director':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <Shield className="w-3.5 h-3.5 text-slate-600" />
            DIREKTUR (READ-ONLY)
          </span>
        );
      case 'mentor':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            MENTOR / PEMBIMBING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200">
            <UserCheck className="w-3.5 h-3.5 text-teal-600" />
            PESERTA MAGANG
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs shrink-0">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus:outline-none cursor-pointer"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <img 
              src="/images/logo.png" 
              alt="InternTask Logo" 
              className="h-9 w-auto object-contain shrink-0" 
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-slate-800 tracking-tight">
                  Intern<span className="text-teal-600">Task</span>
                </span>
                <span className="hidden sm:inline-block text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  Sistem Magang
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">
                Manajemen, Monitoring &amp; Evaluasi Tugas Harian
              </p>
            </div>
          </div>
        </div>

        {/* Center: User & Role Status Badge */}
        {currentUser && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-teal-500"></span>
            <span className="text-slate-500 font-medium">Akun Aktif:</span>
            <span data-user-name className="font-bold text-slate-900 tracking-tight">{currentUser.name}</span>
            <span className="text-slate-400 font-bold">-</span>
            <span data-user-role className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
              currentUser.role === 'director' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
              currentUser.role === 'mentor' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
              'bg-teal-100 text-teal-800 border border-teal-200'
            }`}>
              {currentUser.role === 'director' ? 'Direktur' : currentUser.role === 'mentor' ? 'Mentor' : 'Intern'}
            </span>
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Direct Messaging Chat Button (Hidden for Director) */}
          {currentUser && currentUser.role !== 'director' && (
            <button
              onClick={() => setActiveTab('direct-chat')}
              className={`relative p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus:outline-none transition-colors cursor-pointer ${
                activeTab === 'direct-chat' ? 'bg-teal-50 text-teal-700' : ''
              }`}
              title={currentUser.role === 'intern' ? 'Chat dengan Mentor Pembimbing' : 'Direct Chat dengan Peserta Magang'}
            >
              <MessageSquare className="w-5 h-5" />
              {unreadMessageCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-teal-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadMessageCount}
                </span>
              )}
            </button>
          )}

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus:outline-none transition-colors cursor-pointer"
              title="Notifikasi"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-teal-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Notifikasi Sistem</h3>
                    <p className="text-xs text-slate-500">
                      {unreadNotificationCount} notifikasi belum dibaca
                    </p>
                  </div>
                  {unreadNotificationCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Tandai Semua Dibaca
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {userNotifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      Tidak ada notifikasi baru
                    </div>
                  ) : (
                    userNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markNotificationRead(notif.id);
                          setNotificationsOpen(false);
                          setActiveTab('notifications');
                        }}
                        className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                          !notif.is_read ? 'bg-teal-50/40' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-semibold text-slate-800">
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                            {notif.created_at.substring(11, 16)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                          {notif.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 border-t border-slate-100 text-center">
                  <button
                    onClick={() => {
                      setNotificationsOpen(false);
                      setActiveTab('notifications');
                    }}
                    className="text-xs text-teal-600 hover:text-teal-700 font-medium cursor-pointer"
                  >
                    Lihat Semua Notifikasi &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          {currentUser && (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
              >
                <UserAvatar user={currentUser} size="sm" />
                <div className="hidden sm:block text-left">
                  <span className="block text-xs font-bold text-slate-800 leading-tight">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <span className="block text-[10px] text-slate-500 capitalize">
                    {currentUser.role}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    <div className="mt-1.5">{getRoleBadge(currentUser.role)}</div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setActiveTab('profile');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      Profil Saya
                    </button>
                    {currentUser.role !== 'director' && (
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setActiveTab('direct-chat');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4 text-slate-400" />
                        Direct Chat ({currentUser.role === 'intern' ? 'Mentor' : 'Intern'})
                      </button>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Keluar (Logout)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
