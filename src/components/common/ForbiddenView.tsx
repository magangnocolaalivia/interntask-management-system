import React from 'react';
import { ShieldAlert, ArrowLeft, Lock, ShieldCheck } from 'lucide-react';
import { UserRole } from '../../types';

interface ForbiddenViewProps {
  userRole: UserRole;
  attemptedPath: string;
  onBackToDashboard: () => void;
}

export const ForbiddenView: React.FC<ForbiddenViewProps> = ({
  userRole,
  attemptedPath,
  onBackToDashboard,
}) => {
  const roleNameMap: Record<UserRole, string> = {
    intern: 'Intern (Peserta Magang)',
    mentor: 'Mentor (Pembimbing)',
    director: 'Direktur (Executive)',
  };

  const dashboardNameMap: Record<UserRole, string> = {
    intern: 'Dashboard Intern (/intern/dashboard)',
    mentor: 'Dashboard Mentor (/mentor/dashboard)',
    director: 'Dashboard Direktur (/director/dashboard)',
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl border border-rose-200 shadow-md p-6 sm:p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-600 ring-8 ring-rose-50">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
            <Lock className="w-3.5 h-3.5" />
            <span>HTTP 403 Forbidden</span>
          </div>

          <h2 className="text-xl font-bold text-slate-800">Akses Ditolak (Unauthorized Access)</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Anda tidak memiliki izin otorisasi untuk mengakses rute/halaman <code className="font-mono text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">{attemptedPath}</code>.
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left text-xs space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Akun Role Anda:</span>
            <span className="font-bold text-slate-800">{roleNameMap[userRole] || userRole}</span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Middleware Proteksi:</span>
            <span className="font-mono text-teal-700 font-bold">App\Http\Middleware\CheckRole</span>
          </div>
          <div className="flex items-start gap-1.5 text-slate-500 text-[11px] pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Sesuai Laravel 11 bootstrap/app.php, setiap role dikarantina ketat hanya pada rute yang berhak diakses.</span>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onBackToDashboard}
            className="w-full sm:w-auto px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs rounded-xl shadow-xs transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke {dashboardNameMap[userRole]}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
