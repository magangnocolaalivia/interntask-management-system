import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bell, CheckCheck, CheckCircle2, 
  AlertTriangle, XCircle, Send 
} from 'lucide-react';

export const NotificationList: React.FC<{
  onSelectTask?: (taskId: number) => void;
}> = ({ onSelectTask }) => {
  const { currentUser, notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  if (!currentUser) return null;

  const userNotifications = notifications.filter(n => n.user_id === currentUser.id);
  const filteredNotifs = userNotifications.filter(n => filter === 'all' || !n.is_read);

  const getIcon = (type: string) => {
    switch (type) {
      case 'approval':
        return <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />;
      case 'revision':
        return <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
      case 'rejection':
        return <XCircle className="w-5 h-5 text-rose-600 shrink-0" />;
      case 'submission':
        return <Send className="w-5 h-5 text-teal-600 shrink-0" />;
      default:
        return <Bell className="w-5 h-5 text-slate-400 shrink-0" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Notifikasi Sistem</h1>
          <p className="text-xs text-slate-500 mt-1">
            Pemberitahuan perubahan status tugas, feedback mentor, dan pembaruan sistem
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl text-xs font-semibold flex items-center border border-slate-200">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filter === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Semua ({userNotifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filter === 'unread' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Belum Dibaca ({userNotifications.filter(n => !n.is_read).length})
            </button>
          </div>

          <button
            onClick={markAllNotificationsRead}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Tandai Semua Dibaca</span>
          </button>
        </div>
      </div>

      {/* Notification Cards */}
      <div className="space-y-3">
        {filteredNotifs.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400 shadow-sm">
            <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-medium">Tidak ada notifikasi pada kategori ini.</p>
          </div>
        ) : (
          filteredNotifs.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                markNotificationRead(notif.id);
                if (notif.task_id && onSelectTask) {
                  onSelectTask(notif.task_id);
                }
              }}
              className={`p-5 rounded-xl border transition-colors cursor-pointer flex items-start gap-4 ${
                !notif.is_read 
                  ? 'bg-teal-50/40 border-teal-200 hover:border-teal-300 shadow-xs' 
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              {getIcon(notif.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-xs font-bold ${!notif.is_read ? 'text-slate-900' : 'text-slate-700'}`}>
                    {notif.title}
                  </h4>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">
                    {notif.created_at}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {notif.message}
                </p>
                {notif.task_id && (
                  <span className="inline-block mt-2 text-[11px] font-medium text-teal-600 hover:underline">
                    Lihat detail tugas &rarr;
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
