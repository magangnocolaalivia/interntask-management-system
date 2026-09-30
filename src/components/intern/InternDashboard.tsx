import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { getRecommendedTasks } from '../../utils/priorityScoring';
import { Task } from '../../types';
import { 
  CheckCircle2, Clock, PlayCircle, AlertTriangle, 
  Calendar, Award, Sparkles, ArrowRight, FileText,
  Building2, BookOpen, User, MessageSquare
} from 'lucide-react';
import { TaskDetailModal } from './TaskDetailModal';
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
import { Doughnut, Line } from 'react-chartjs-2';
import { PieChart, TrendingUp, BarChart2 } from 'lucide-react';
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

export const InternDashboard: React.FC<{ 
  onNavigateToTasks: () => void;
  onNavigateToChat?: () => void;
  onNavigateToReports?: () => void;
}> = ({ onNavigateToTasks, onNavigateToChat, onNavigateToReports }) => {
  const { currentUser, tasks, attendances, getUserById } = useApp();

  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  if (!currentUser) return null;

  // 1. RBAC Scope: Filter tasks and attendances strictly for current intern
  const myTasks = tasks.filter(t => t.user_id === currentUser.id);
  const myAttendances = attendances.filter(a => a.user_id === currentUser.id);

  // 2. Dynamic Calculation of all metrics
  const metrics = calculateDashboardMetrics(myTasks, myAttendances);
  const { 
    totalTasks, completedTasks, inProgressTasks, waitingReviewTasks, 
    revisionTasks, overdueTasks, completionRate, statusChartData, trendChartData 
  } = metrics;

  // Check if there is any activity in the 7-day trend
  const hasWeeklyActivity = metrics.sevenDayMetrics.some(m => m.completedTasks > 0 || m.actualWorkHours > 0 || m.createdTasks > 0);

  // Internship period calculation
  const startDate = currentUser.internship_start ? new Date(currentUser.internship_start) : new Date('2026-07-01');
  const endDate = currentUser.internship_end ? new Date(currentUser.internship_end) : new Date('2026-12-31');
  const today = new Date();
  const totalDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const daysPassed = Math.max(0, Math.round((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const internshipProgress = Math.min(100, Math.max(0, Math.round((daysPassed / totalDays) * 100)));

  // Mentor info
  const mentor = currentUser.mentor_id ? getUserById(currentUser.mentor_id) : null;

  // Rule-based priority scoring recommendations
  const activeUnfinishedTasks = myTasks.filter(t => t.status !== 'Approved' && t.status !== 'Completed');
  const recommendedTasks = getRecommendedTasks(activeUnfinishedTasks).slice(0, 3);

  // Today's tasks
  const todayStr = '2026-09-25';
  const todaysTasks = myTasks.filter(t => t.task_date === todayStr || t.status === 'In Progress' || t.status === 'Revision');

  return (
    <div className="space-y-6">
      {/* 1. Profile Banner Card: Cleaned and streamlined without redundant action buttons */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <div className="flex items-start sm:items-center gap-4">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'}
              alt={currentUser.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover ring-1 ring-slate-200 shadow-xs shrink-0"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800">
                  {currentUser.name}
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200">
                  Peserta Magang Aktif
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {currentUser.institution || 'Politeknik Negeri Malang'}
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  {currentUser.study_program || 'Teknik Informatika'}
                </span>
                {mentor && (
                  <>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={onNavigateToChat}
                      className="inline-flex items-center gap-1.5 font-medium text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-2.5 py-0.5 rounded-full border border-teal-200 transition-colors cursor-pointer text-xs"
                      title="Klik untuk membuka sesi chat dengan mentor"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                      <span>Mentor: {mentor.name}</span>
                      <span className="text-[10px] bg-teal-200/60 text-teal-800 px-1 rounded font-bold">Chat</span>
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 pt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Periode: {currentUser.internship_start || '2026-07-01'} s/d {currentUser.internship_end || '2026-12-31'} ({daysPassed} dari {totalDays} hari)
                </span>
              </div>
            </div>
          </div>

          {/* Clean Completion Rate KPI Badge */}
          <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center shrink-0 bg-slate-50/70 sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-slate-100">
            <span className="text-xs text-slate-500 block font-medium">Tingkat Penyelesaian Tugas</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-teal-600 sm:text-slate-800 tracking-tight">{completionRate}%</span>
              <span className="text-[11px] text-slate-400 font-medium">selesai</span>
            </div>
          </div>
        </div>

        {/* Internship Progress Bar */}
        <div className="mt-5 pt-1">
          <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
            <span>Progres Durasi Magang</span>
            <span className="font-semibold text-slate-800">{internshipProgress}% Terlewati</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/60">
            <div
              className="h-2.5 rounded-full bg-teal-600 transition-all duration-500"
              style={{ width: `${internshipProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Key Stats Cards: bg-white rounded-xl border border-slate-200 shadow-sm */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Task</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{totalTasks}</p>
          <span className="text-xs text-slate-500">Seluruh tugas tercatat</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-teal-700">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{completedTasks}</p>
          <span className="text-xs text-slate-500 font-medium">Telah disetujui mentor</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">In Progress</span>
            <PlayCircle className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{inProgressTasks}</p>
          <span className="text-xs text-slate-500">Sedang dikerjakan</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700">Waiting Review</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{waitingReviewTasks}</p>
          <span className="text-xs text-slate-500">Menunggu validasi</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700">Perlu Revisi</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{revisionTasks}</p>
          <span className="text-xs text-slate-500 font-medium">Harus diperbaiki</span>
        </div>
      </div>

      {/* Visualisasi Data: Chart.js Light Mode Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafik 1: Doughnut Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-teal-600" />
                <span>Distribusi Status Tugas Saya</span>
              </h3>
              <p className="text-[11px] text-slate-500">Komposisi seluruh tugas berdasarkan status pengerjaan aktual</p>
            </div>
            <span className="text-xs font-bold text-slate-700">{totalTasks} Tugas</span>
          </div>
          <div className="h-60 relative flex items-center justify-center">
            {totalTasks > 0 ? (
              <Doughnut
                data={statusChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { boxWidth: 10, font: { size: 10 }, color: '#475569' },
                    },
                  },
                  cutout: '68%',
                }}
              />
            ) : (
              <div className="text-center p-6 bg-slate-50/70 border border-dashed border-slate-200 rounded-xl w-full">
                <BarChart2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">Belum ada data aktivitas untuk ditampilkan</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Buat tugas harian baru untuk melihat visualisasi status</p>
              </div>
            )}
          </div>
        </div>

        {/* Grafik 2: Dual-Metric Line Chart (Penyelesaian Task + Jam Kerja Kehadiran) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-600" />
                <span>Tren Kehadiran &amp; Produktivitas (7 Hari Terakhir)</span>
              </h3>
              <p className="text-[11px] text-slate-500">Kalkulasi harian tugas selesai &amp; jam kerja presensi aktual</p>
            </div>
            <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              7 Hari Terakhir
            </span>
          </div>
          <div className="h-60 relative flex items-center justify-center">
            {hasWeeklyActivity ? (
              <Line
                data={trendChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: true,
                      position: 'bottom',
                      labels: { boxWidth: 10, font: { size: 10 }, color: '#475569' },
                    },
                  },
                  scales: {
                    y: { 
                      beginAtZero: true, 
                      ticks: { stepSize: 1, font: { size: 10 } },
                      grid: { color: '#f1f5f9' },
                    },
                    x: { 
                      ticks: { font: { size: 10 } },
                      grid: { display: false },
                    },
                  },
                }}
              />
            ) : (
              <div className="text-center p-6 bg-slate-50/70 border border-dashed border-slate-200 rounded-xl w-full">
                <TrendingUp className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">Belum ada data aktivitas untuk ditampilkan</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Selesaikan tugas dan lakukan presensi harian untuk mencatat tren</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Recommended Tasks: Rule-Based Scoring Feature */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                Prioritasi Tugas Otomatis (Rule-Based Scoring)
                <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                  Algoritma Transparan
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Formula: Skor Prioritas (Urgent=40, High=30, Med=20, Low=10) + Skor Deadline + Skor Status (Revisi=+20).
              </p>
            </div>
          </div>
        </div>

        {recommendedTasks.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-xl text-center text-xs text-slate-500 border border-slate-200">
            Tidak ada tugas aktif yang mendesak saat ini. Semua tugas penting telah selesai!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendedTasks.map(({ task, totalScore, reasons }, idx) => (
              <div
                key={task.id}
                onClick={() => setSelectedTaskId(task.id)}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-teal-300 transition-colors cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[11px] font-medium text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                      #{idx + 1} Rekomendasi
                    </span>
                    <span className="text-xs font-bold text-slate-800 font-mono">
                      Skor: {totalScore}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-2 mb-2 hover:text-teal-600 transition-colors">
                    {task.title}
                  </h4>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <StatusBadge status={task.status} size="sm" />
                    <PriorityBadge priority={task.priority} size="sm" />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-500 space-y-1">
                  {reasons.slice(0, 2).map((r, i) => (
                    <p key={i} className="truncate">• {r}</p>
                  ))}
                  <p className="font-medium text-teal-600 mt-2 flex items-center justify-between text-xs">
                    <span>Deadline: {task.deadline}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Tugas Hari Ini (Today's Tasks) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Tugas Hari Ini &amp; Sedang Berjalan</h3>
            <p className="text-xs text-slate-500">Daftar tugas yang perlu dikerjakan atau ditindaklanjuti</p>
          </div>
          <button
            onClick={onNavigateToTasks}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
          >
            Lihat Semua Task ({totalTasks}) →
          </button>
        </div>

        {todaysTasks.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-500 mb-3">Belum ada daily task untuk hari ini.</p>
            <button
              onClick={onNavigateToTasks}
              className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-medium hover:bg-teal-700 transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Kelola di Menu Daily Tasks</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {todaysTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => setSelectedTaskId(task.id)}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 px-3 rounded-xl cursor-pointer border border-transparent hover:border-teal-200 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[11px] text-slate-400">#{task.id}</span>
                    <h4 className="text-xs font-bold text-slate-800 hover:text-teal-600 transition-colors">
                      {task.title}
                    </h4>
                    {(task.is_assigned || task.assigned_by) && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                        <Sparkles className="w-3 h-3 text-teal-600" />
                        <span>Dari Mentor</span>
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{task.category}</span>
                    <span>•</span>
                    <span className="text-slate-600">Deadline: {task.deadline}</span>
                    <span>•</span>
                    <span>Estimasi: {task.estimated_duration} Jam</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="w-24 sm:w-28 text-right">
                    <div className="flex justify-between text-xs font-semibold mb-1 text-slate-600">
                      <span>Progres</span>
                      <span className="text-slate-800">{task.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/60">
                      <div
                        className="bg-teal-600 h-2 rounded-full"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>

                  <StatusBadge status={task.status} size="sm" />
                  <PriorityBadge priority={task.priority} size="sm" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onEdit={(task) => {
          setSelectedTaskId(null);
        }}
      />
    </div>
  );
};
