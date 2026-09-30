import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  TrendingUp, CheckCircle2, Clock, Calendar, 
  Award, MessageSquare, BookOpen, Building2 
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export const InternProgress: React.FC = () => {
  const { currentUser, tasks, feedbacks, getUserById, getAttendancesForIntern } = useApp();

  if (!currentUser) return null;

  const myTasks = tasks.filter(t => t.user_id === currentUser.id);
  const completedTasks = myTasks.filter(t => t.status === 'Completed' || t.status === 'Approved');
  const myFeedbacks = feedbacks.filter(f => myTasks.some(t => t.id === f.task_id));
  const myAttendances = getAttendancesForIntern(currentUser.id);

  // Calculate total actual contribution hours from present and late attendances (clock_out - clock_in)
  const totalActualHours = myAttendances
    .filter(a => (a.status === 'present' || a.status === 'late') && a.clock_in && a.clock_out)
    .reduce((acc, a) => {
      const [inH, inM, inS] = a.clock_in!.split(':').map(Number);
      const [outH, outM, outS] = a.clock_out!.split(':').map(Number);
      const inDate = new Date(2000, 0, 1, inH, inM, inS || 0);
      const outDate = new Date(2000, 0, 1, outH, outM, outS || 0);
      const diffMs = Math.max(0, outDate.getTime() - inDate.getTime());
      return acc + (diffMs / (1000 * 60 * 60));
    }, 0);

  const formattedHours = Number.isInteger(totalActualHours)
    ? totalActualHours
    : Number(totalActualHours.toFixed(1));

  // Category counts
  const categories = ['Development', 'Testing', 'Documentation', 'Meeting', 'Research', 'Design'];
  const catStats = categories.map(cat => ({
    name: cat,
    total: myTasks.filter(t => t.category === cat).length,
    completed: completedTasks.filter(t => t.category === cat).length,
  }));

  const completionRate = myTasks.length > 0 ? Math.round((completedTasks.length / myTasks.length) * 100) : 0;

  // Calculate Internship Duration Progress based on Start & End Date
  const startDateStr = currentUser.internship_start || '2026-07-01';
  const endDateStr = currentUser.internship_end || '2026-12-31';
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  const now = new Date();

  const totalDurationMs = Math.max(1, endDate.getTime() - startDate.getTime());
  const elapsedMs = Math.max(0, Math.min(now.getTime() - startDate.getTime(), totalDurationMs));
  const durationPercentage = Math.min(100, Math.max(0, Math.round((elapsedMs / totalDurationMs) * 100)));
  const totalDays = Math.ceil(totalDurationMs / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.ceil(elapsedMs / (1000 * 60 * 60 * 24));
  const remainingDays = Math.max(0, totalDays - elapsedDays);

  const assignedMentor = currentUser.mentor_id ? getUserById(currentUser.mentor_id) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-xl font-bold text-slate-800">Perkembangan Magang Saya</h1>
        <p className="text-xs text-slate-500 mt-1">
          Pantau pencapaian target mingguan, evaluasi kategori tugas, dan catatan pembimbing
        </p>
      </div>

      {/* Internship Timeline & Duration Card */}
      <div className="bg-gradient-to-br from-teal-900 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-teal-800/60 pb-5">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <Calendar className="w-3.5 h-3.5" />
              <span>Periode Program Magang</span>
            </span>
            <h2 className="text-lg font-bold text-white mt-1">
              {currentUser.institution || 'Institusi Pendidikan'}
            </h2>
            <p className="text-xs text-teal-200/80">
              {currentUser.study_program || 'Program Studi'} • Pembimbing: <strong className="text-white">{assignedMentor?.name || 'Belum Ditentukan'}</strong>
            </p>
          </div>

          <div className="flex items-center gap-4 bg-teal-950/60 px-4 py-3 rounded-xl border border-teal-700/40 shrink-0">
            <div className="text-right">
              <span className="text-[11px] text-teal-300 font-medium block">Progress Durasi</span>
              <span className="text-2xl font-black text-white font-mono">{durationPercentage}%</span>
            </div>
            <div className="w-px h-8 bg-teal-800" />
            <div>
              <span className="text-[11px] text-teal-300 font-medium block">Sisa Waktu</span>
              <span className="text-xs font-bold text-teal-100">{remainingDays} Hari Lagi</span>
            </div>
          </div>
        </div>

        {/* Timeline Progress Bar */}
        <div className="mt-5 space-y-2">
          <div className="flex justify-between text-xs font-medium text-teal-200">
            <span>Mulai: {startDateStr}</span>
            <span className="text-white font-bold">{elapsedDays} dari {totalDays} Hari Berjalan</span>
            <span>Selesai: {endDateStr}</span>
          </div>
          <div className="w-full bg-teal-950/80 h-3 rounded-full overflow-hidden border border-teal-700/50 p-0.5">
            <div
              className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${durationPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Tingkat Penyelesaian Keseluruhan</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-slate-800">{completionRate}%</span>
              <span className="text-xs text-slate-500">({completedTasks.length} dari {myTasks.length} tugas)</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mt-4 border border-slate-200/60">
            <div
              className="bg-teal-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Total Jam Kontribusi</span>
          <p className="text-3xl font-bold text-slate-800 mt-2">
            {formattedHours}{' '}
            <span className="text-sm font-semibold text-slate-500">Jam Kerja</span>
          </p>
          <p className="text-xs text-slate-500 mt-2">Berdasarkan akumulasi jam kerja kehadiran aktual</p>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Review &amp; Feedback Diterima</span>
          <p className="text-3xl font-bold text-teal-600 mt-2">
            {myFeedbacks.length}{' '}
            <span className="text-sm font-semibold text-slate-500">Catatan Mentor</span>
          </p>
          <p className="text-xs text-slate-500 mt-2">Ulasan dan arahan perbaikan teknis dari pembimbing</p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 mb-4">Sebaran Tugas Per Kategori</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {catStats.map((cat) => {
            const pct = cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0;
            return (
              <div key={cat.name} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800 mb-1">
                  <span>{cat.name}</span>
                  <span className="text-teal-700">{cat.completed} / {cat.total}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden mt-2">
                  <div
                    className="bg-teal-600 h-1.5 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feedback Timeline */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 mb-4">Riwayat Catatan &amp; Evaluasi Mentor</h3>
        {myFeedbacks.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Belum ada catatan evaluasi mentor yang tercatat.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {myFeedbacks.map((f) => {
              const mentor = getUserById(f.mentor_id);
              const relatedTask = myTasks.find(t => t.id === f.task_id);
              return (
                <div key={f.id} className="py-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      {mentor?.name || 'Mentor'} —{' '}
                      <span className="text-slate-500 font-normal">{relatedTask?.title}</span>
                    </span>
                    <span className="text-[11px] text-slate-400">{f.created_at}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      f.action === 'approved' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                      f.action === 'revision' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {f.action}
                    </span>
                    <p className="text-xs text-slate-600 italic">"{f.message}"</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
