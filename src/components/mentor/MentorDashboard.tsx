import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task } from '../../types';
import { PriorityBadge } from '../common/PriorityBadge';
import { ReviewModal } from './ReviewModal';
import { TaskDetailModal } from '../intern/TaskDetailModal';
import { 
  Users, CheckCircle2, Clock, AlertTriangle, 
  BarChart2, PieChart, TrendingUp, Calendar, 
  ClipboardCheck, AlertCircle, ArrowRight, Eye, UserCheck 
} from 'lucide-react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { calculateDashboardMetrics } from '../../utils/dashboardMetrics';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

interface MentorDashboardProps {
  onNavigateToReviews: () => void;
  onNavigateToMonitoring: () => void;
}

export const MentorDashboard: React.FC<MentorDashboardProps> = ({
  onNavigateToReviews,
  onNavigateToMonitoring,
}) => {
  const { currentUser, tasks, users, attendances, getInternsForMentor } = useApp();

  const [selectedTaskForReview, setSelectedTaskForReview] = useState<Task | null>(null);
  const [selectedTaskIdForDetail, setSelectedTaskIdForDetail] = useState<number | null>(null);

  if (!currentUser) return null;

  // 1. RBAC Scope: Filter data strictly for mentored interns
  const myInterns = getInternsForMentor(currentUser.id);
  const myInternIds = myInterns.map(i => i.id);
  const mentorTasks = tasks.filter(t => myInternIds.includes(t.user_id));
  const mentorAttendances = attendances.filter(a => myInternIds.includes(a.user_id));

  // 2. Dynamic Calculation of all metrics
  const metrics = calculateDashboardMetrics(mentorTasks, mentorAttendances);
  const {
    totalTasks, completedTasks, inProgressTasks, waitingReviewTasks: waitingReviewCount,
    revisionTasks, overdueTasks, statusChartData, trendChartData, categoryChartData
  } = metrics;

  const waitingReviewTasks = mentorTasks.filter(t => t.status === 'Submitted' || t.status === 'Review');
  const totalInterns = myInterns.length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysTasks = mentorTasks.filter(t => t.task_date === todayStr).length;

  const now = new Date();
  const overdueTaskList = mentorTasks.filter(t => {
    if (['Completed', 'Approved'].includes(t.status)) return false;
    const dl = new Date(t.deadline);
    return dl < now;
  });

  const hasActivity = metrics.sevenDayMetrics.some(m => m.completedTasks > 0 || m.actualWorkHours > 0 || m.createdTasks > 0);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200">
              Mentor Workspace
            </span>
            <h1 className="text-xl sm:text-2xl font-bold mt-2 tracking-tight text-slate-800">
              Dashboard Pembimbing: {currentUser.name}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Supervisi pengerjaan, validasi review harian, dan evaluasi capaian peserta magang
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToReviews}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Review Tugas ({waitingReviewTasks.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metric Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Intern Dibimbing</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{totalInterns}</p>
          <span className="text-xs text-slate-500">Peserta aktif</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Task Hari Ini</span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{todaysTasks}</p>
          <span className="text-xs text-slate-500">Target hari ini</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700">Perlu Direview</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{waitingReviewTasks.length}</p>
          <span className="text-xs text-slate-500">Menunggu mentor</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Sedang Revisi</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{revisionTasks}</p>
          <span className="text-xs text-slate-500">Diperbaiki peserta</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-teal-700">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{completedTasks}</p>
          <span className="text-xs text-slate-500 font-medium">Disetujui</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700">Overdue Task</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{overdueTasks}</p>
          <span className="text-xs text-slate-500">Melewati deadline</span>
        </div>
      </div>

      {/* 3. Chart.js Visualizations (Slate & Teal Theme) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Tren Aktivitas & Kehadiran (7 Hari Terakhir) */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Tren Produktivitas &amp; Presensi</h3>
              <p className="text-xs text-slate-500">Tugas selesai &amp; jam kerja 7 hari terakhir</p>
            </div>
            <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              7 Hari
            </span>
          </div>
          <div className="h-60 flex items-center justify-center">
            {hasActivity ? (
              <Line
                data={trendChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 }, color: '#475569' } },
                  },
                  scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 10 } }, grid: { color: '#f8fafc' } },
                    x: { ticks: { font: { size: 10 } }, grid: { display: false } },
                  },
                }}
              />
            ) : (
              <div className="text-center p-4 bg-slate-50/70 border border-dashed border-slate-200 rounded-xl w-full">
                <BarChart2 className="w-7 h-7 mx-auto text-slate-300 mb-1.5" />
                <p className="text-xs font-semibold text-slate-600">Belum ada data aktivitas untuk ditampilkan</p>
                <p className="text-[11px] text-slate-400">Peserta bimbingan belum memiliki catatan pada rentang 7 hari</p>
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Distribusi Status Task (Donut) */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Distribusi Status Task</h3>
              <p className="text-xs text-slate-500">Proporsi seluruh tugas peserta bimbingan</p>
            </div>
            <span className="text-xs font-bold text-slate-700">{totalTasks} Task</span>
          </div>
          <div className="h-60 flex items-center justify-center">
            {totalTasks > 0 ? (
              <Doughnut
                data={statusChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 }, color: '#475569' } },
                  },
                  cutout: '65%',
                }}
              />
            ) : (
              <div className="text-center p-4 bg-slate-50/70 border border-dashed border-slate-200 rounded-xl w-full">
                <PieChart className="w-7 h-7 mx-auto text-slate-300 mb-1.5" />
                <p className="text-xs font-semibold text-slate-600">Belum ada data aktivitas untuk ditampilkan</p>
                <p className="text-[11px] text-slate-400">Belum ada tugas yang dibuat oleh anak bimbingan</p>
              </div>
            )}
          </div>
        </div>

        {/* Chart 3: Task Berdasarkan Kategori */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Task Berdasarkan Kategori</h3>
              <p className="text-xs text-slate-500">Sebaran topik pekerjaan magang</p>
            </div>
            <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              Kategori
            </span>
          </div>
          <div className="h-60 flex items-center justify-center">
            {totalTasks > 0 ? (
              <Bar
                data={categoryChartData}
                options={{
                  indexAxis: 'y',
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    x: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 10 } }, grid: { color: '#f8fafc' } },
                    y: { ticks: { font: { size: 10 } }, grid: { display: false } },
                  },
                }}
              />
            ) : (
              <div className="text-center p-4 bg-slate-50/70 border border-dashed border-slate-200 rounded-xl w-full">
                <TrendingUp className="w-7 h-7 mx-auto text-slate-300 mb-1.5" />
                <p className="text-xs font-semibold text-slate-600">Belum ada data aktivitas untuk ditampilkan</p>
                <p className="text-[11px] text-slate-400">Kategori tugas akan muncul saat task dibuat</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Task Menunggu Review (Quick Table) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-teal-600" />
              Tugas Menunggu Review ({waitingReviewTasks.length})
            </h3>
            <p className="text-xs text-slate-500">Validasi dan beri feedback segera kepada peserta</p>
          </div>
          <button
            onClick={onNavigateToReviews}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
          >
            Lihat Semua Review →
          </button>
        </div>

        {waitingReviewTasks.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-8 h-8 text-teal-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">Semua tugas telah selesai direview!</p>
            <p className="text-xs text-slate-500 mt-0.5">Tidak ada tugas peserta yang sedang menunggu validasi saat ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <th className="py-3 px-4">Intern</th>
                  <th className="py-3 px-4">Judul Tugas</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Prioritas</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4 text-center">Aksi Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {waitingReviewTasks.slice(0, 5).map((task) => {
                  const intern = users.find(u => u.id === task.user_id);
                  return (
                    <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{intern?.name}</div>
                        <div className="text-[11px] text-slate-400">{intern?.institution}</div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setSelectedTaskIdForDetail(task.id)}
                          className="font-bold text-slate-800 hover:text-teal-600 text-left line-clamp-1 transition-colors cursor-pointer"
                        >
                          {task.title}
                        </button>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{task.description}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 font-medium text-slate-700 border border-slate-200">
                          {task.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <PriorityBadge priority={task.priority} size="sm" />
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {task.progress}%
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedTaskForReview(task)}
                          className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium text-xs transition-colors shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <ClipboardCheck className="w-3.5 h-3.5" />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Guided Interns Cards */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Peserta Magang Bimbingan Anda</h3>
            <p className="text-xs text-slate-500">Ringkasan kemajuan dan beban kerja tiap intern</p>
          </div>
          <button
            onClick={onNavigateToMonitoring}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
          >
            Buka Halaman Monitoring →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myInterns.map((intern) => {
            const internAllTasks = tasks.filter(t => t.user_id === intern.id);
            const internCompleted = internAllTasks.filter(t => t.status === 'Completed' || t.status === 'Approved').length;
            const internRate = internAllTasks.length > 0 ? Math.round((internCompleted / internAllTasks.length) * 100) : 0;

            return (
              <div
                key={intern.id}
                onClick={onNavigateToMonitoring}
                className="p-5 rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-xs transition-colors cursor-pointer bg-white"
              >
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={intern.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'}
                    alt={intern.name}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-800 truncate">{intern.name}</h4>
                    <p className="text-[11px] text-slate-500 truncate">{intern.institution}</p>
                    <p className="text-[10px] text-slate-400">{intern.study_program}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Penyelesaian Tugas</span>
                    <span className="font-bold text-slate-800">{internCompleted} / {internAllTasks.length} ({internRate}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
                    <div
                      className="bg-teal-600 h-2 rounded-full"
                      style={{ width: `${internRate}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Modal */}
      {selectedTaskForReview && (
        <ReviewModal
          isOpen={!!selectedTaskForReview}
          onClose={() => setSelectedTaskForReview(null)}
          task={selectedTaskForReview}
          onSuccess={() => setSelectedTaskForReview(null)}
        />
      )}

      {/* Detail Modal */}
      <TaskDetailModal
        taskId={selectedTaskIdForDetail}
        onClose={() => setSelectedTaskIdForDetail(null)}
      />
    </div>
  );
};
