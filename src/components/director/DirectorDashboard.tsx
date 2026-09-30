import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, Eye, ArrowRight, TrendingUp, 
  PieChart, BarChart3, Users, Settings, BarChart2 
} from 'lucide-react';
import { TaskDetailModal } from '../intern/TaskDetailModal';
import { calculateDashboardMetrics } from '../../utils/dashboardMetrics';

// Chart.js imports
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

export const DirectorDashboard: React.FC<{
  onNavigateToMonitoring: () => void;
  onNavigateToReports: () => void;
  onNavigateToUsers?: () => void;
  onNavigateToSettings?: () => void;
}> = ({ onNavigateToMonitoring, onNavigateToUsers, onNavigateToSettings }) => {
  const { tasks, users, attendances } = useApp();

  const [selectedDetailTaskId, setSelectedDetailTaskId] = useState<number | null>(null);

  // 1. RBAC Scope: Global across all interns in the company
  const internUsers = users.filter(u => u.role === 'intern');
  const mentorUsers = users.filter(u => u.role === 'mentor');

  // 2. Dynamic Calculation of metrics
  const metrics = calculateDashboardMetrics(tasks, attendances);
  const { 
    totalTasks, completedTasks, inProgressTasks, waitingReviewTasks, 
    revisionTasks, overdueTasks, completionRate, statusChartData, trendChartData, categoryChartData 
  } = metrics;

  const now = new Date();
  const overdueTaskList = tasks.filter(t => {
    if (['Completed', 'Approved'].includes(t.status)) return false;
    return new Date(t.deadline) < now;
  });

  const hasActivity = metrics.sevenDayMetrics.some(m => m.completedTasks > 0 || m.actualWorkHours > 0 || m.createdTasks > 0);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
                EXECUTIVE MONITORING (READ-ONLY)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800">
              Executive Dashboard Direktur &amp; Manajemen
            </h1>
            <p className="text-xs text-slate-500">
              Monitoring performa seluruh peserta magang, supervisi mentor, dan evaluasi capaian operasional tanpa mengubah data.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {onNavigateToUsers && (
              <button
                onClick={onNavigateToUsers}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer border border-slate-200"
              >
                <Users className="w-4 h-4 text-teal-600" />
                <span>Manajemen Pengguna</span>
              </button>
            )}
            {onNavigateToSettings && (
              <button
                onClick={onNavigateToSettings}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer border border-slate-200"
              >
                <Settings className="w-4 h-4 text-teal-600" />
                <span>Pengaturan Perusahaan</span>
              </button>
            )}
            <button
              onClick={onNavigateToMonitoring}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <span>Buka Monitoring Intern</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Executive Summary Row */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-6">
            <span>Tingkat Kelulusan Task: <strong className="text-slate-800 font-bold">{completionRate}%</strong></span>
            <span>Total Beban Proyek: <strong className="text-slate-800 font-bold">{totalTasks} Tugas</strong></span>
          </div>
          <span className="text-[11px] text-slate-400">Data otomatis terupdate dari aktivitas mentor &amp; intern</span>
        </div>
      </div>

      {/* 2. Company Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3.5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Total Intern</span>
          <p className="text-2xl font-bold text-slate-800 mt-1">{internUsers.length}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Total Mentor</span>
          <p className="text-2xl font-bold text-slate-800 mt-1">{mentorUsers.length}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Total Tasks</span>
          <p className="text-2xl font-bold text-slate-800 mt-1">{totalTasks}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-teal-700">Completed</span>
          <p className="text-2xl font-bold text-slate-800 mt-1">{completedTasks}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-700">In Progress</span>
          <p className="text-2xl font-bold text-slate-800 mt-1">{inProgressTasks}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-amber-700">Waiting Review</span>
          <p className="text-2xl font-bold text-slate-800 mt-1">{waitingReviewTasks}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-amber-800">Revision</span>
          <p className="text-2xl font-bold text-slate-800 mt-1">{revisionTasks}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-rose-700">Overdue Task</span>
          <p className="text-2xl font-bold text-slate-800 mt-1">{overdueTasks}</p>
        </div>
      </div>

      {/* 3. Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Aktivitas Task & Presensi Mingguan */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Tren Produktivitas &amp; Presensi</h3>
              <p className="text-xs text-slate-500">Tugas selesai &amp; total jam kerja (7 Hari)</p>
            </div>
            <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              7 Hari Terakhir
            </span>
          </div>
          <div className="h-56 flex items-center justify-center">
            {hasActivity ? (
              <Line
                data={trendChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { 
                    legend: { 
                      position: 'bottom',
                      labels: { boxWidth: 10, font: { size: 10 }, color: '#475569' }
                    } 
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
                <p className="text-[11px] text-slate-400">Belum ada log tugas maupun presensi 7 hari terakhir</p>
              </div>
            )}
          </div>
        </div>

        {/* Distribusi Status */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Task Berdasarkan Status</h3>
              <p className="text-xs text-slate-500">Penyebaran status seluruh tugas aktif</p>
            </div>
            <span className="text-xs font-bold text-slate-700">{totalTasks} Task</span>
          </div>
          <div className="h-56 flex items-center justify-center">
            {totalTasks > 0 ? (
              <Doughnut
                data={statusChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { 
                    legend: { 
                      position: 'bottom',
                      labels: { boxWidth: 10, font: { size: 10 }, color: '#475569' }
                    } 
                  },
                  cutout: '65%',
                }}
              />
            ) : (
              <div className="text-center p-4 bg-slate-50/70 border border-dashed border-slate-200 rounded-xl w-full">
                <PieChart className="w-7 h-7 mx-auto text-slate-300 mb-1.5" />
                <p className="text-xs font-semibold text-slate-600">Belum ada data aktivitas untuk ditampilkan</p>
                <p className="text-[11px] text-slate-400">Belum ada data tugas yang terdaftar di sistem</p>
              </div>
            )}
          </div>
        </div>

        {/* Task Berdasarkan Kategori */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Task Berdasarkan Kategori</h3>
              <p className="text-xs text-slate-500">Sebaran bidang pekerjaan magang</p>
            </div>
            <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              Kategori
            </span>
          </div>
          <div className="h-56 flex items-center justify-center">
            {totalTasks > 0 ? (
              <Bar
                data={categoryChartData}
                options={{
                  indexAxis: 'y',
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { 
                    x: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 10 } }, grid: { color: '#f8fafc' } },
                    y: { ticks: { font: { size: 10 } }, grid: { display: false } },
                  },
                }}
              />
            ) : (
              <div className="text-center p-4 bg-slate-50/70 border border-dashed border-slate-200 rounded-xl w-full">
                <BarChart3 className="w-7 h-7 mx-auto text-slate-300 mb-1.5" />
                <p className="text-xs font-semibold text-slate-600">Belum ada data aktivitas untuk ditampilkan</p>
                <p className="text-[11px] text-slate-400">Kategori tugas akan muncul saat tugas dibuat</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Monitoring Intern Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Monitoring Peserta Magang Perusahaan</h3>
            <p className="text-xs text-slate-500">Ringkasan capaian seluruh intern (Klik untuk melihat detail aktivitas)</p>
          </div>
          <button
            onClick={onNavigateToMonitoring}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 cursor-pointer"
          >
            Buka Halaman Filter Lengkap &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-3.5 px-4">Intern</th>
                <th className="py-3.5 px-4">Mentor</th>
                <th className="py-3.5 px-4">Institusi &amp; Prodi</th>
                <th className="py-3.5 px-4 w-32">Progress</th>
                <th className="py-3.5 px-4 text-center">Total Task</th>
                <th className="py-3.5 px-4 text-center">Completed</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {internUsers.map((intern) => {
                const internTasks = tasks.filter(t => t.user_id === intern.id);
                const internCompleted = internTasks.filter(t => t.status === 'Completed' || t.status === 'Approved').length;
                const internProgressRate = internTasks.length > 0 ? Math.round((internCompleted / internTasks.length) * 100) : 0;
                const internMentor = users.find(u => u.id === intern.mentor_id);

                return (
                  <tr
                    key={intern.id}
                    onClick={onNavigateToMonitoring}
                    className="hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={intern.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60'}
                          alt={intern.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-800 group-hover:text-teal-600 transition-colors">{intern.name}</p>
                          <p className="text-[10px] text-slate-400">{intern.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-700">{internMentor?.name || '-'}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-medium">{intern.institution}</div>
                      <div className="text-[10px] text-slate-400">{intern.study_program}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                        <span>{internProgressRate}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className="bg-teal-600 h-1.5 rounded-full"
                          style={{ width: `${internProgressRate}%` }}
                        />
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-slate-800 whitespace-nowrap">
                      {internTasks.length}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-teal-700 whitespace-nowrap">
                      {internCompleted}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200/50">
                        Aktif Magang
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Detail Modal (Read-Only) */}
      <TaskDetailModal
        taskId={selectedDetailTaskId}
        onClose={() => setSelectedDetailTaskId(null)}
      />
    </div>
  );
};
