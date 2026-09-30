import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { TaskDetailModal } from '../intern/TaskDetailModal';
import { AssignTaskModal } from './AssignTaskModal';
import { UserAvatar } from '../common/UserAvatar';
import { User } from '../../types';
import { 
  Building2, BookOpen, Mail, BarChart3, 
  Eye, MessageSquare, Users, PlusCircle, CheckSquare, Sparkles
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const InternMonitoring: React.FC<{ onNavigateToChat?: () => void }> = ({ onNavigateToChat }) => {
  const { currentUser, tasks, users, getInternsForMentor } = useApp();

  const myInterns = useMemo(() => {
    return currentUser ? getInternsForMentor(currentUser.id) : [];
  }, [currentUser, getInternsForMentor]);

  const [selectedInternId, setSelectedInternId] = useState<number>(() => {
    return myInterns.length > 0 ? myInterns[0].id : 0;
  });

  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetailTaskId, setSelectedDetailTaskId] = useState<number | null>(null);
  const [assignModalIntern, setAssignModalIntern] = useState<User | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Sync selected intern if mentor's intern list changes
  useEffect(() => {
    if (myInterns.length > 0 && selectedInternId && !myInterns.some(i => i.id === selectedInternId)) {
      setSelectedInternId(myInterns[0].id);
    }
  }, [myInterns, selectedInternId]);

  // Selected intern details (null if default "Pilih Peserta Magang..." is chosen)
  const selectedIntern = useMemo(() => {
    if (!selectedInternId) return null;
    return users.find(u => u.id === selectedInternId) || null;
  }, [users, selectedInternId]);

  // Tasks of selected intern
  const allInternTasks = useMemo(() => {
    if (!selectedIntern) return [];
    return tasks.filter(t => t.user_id === selectedIntern.id);
  }, [tasks, selectedIntern]);

  // Metric calculation
  const totalTasks = allInternTasks.length;
  const completedTasks = allInternTasks.filter(t => t.status === 'Completed' || t.status === 'Approved').length;
  const inProgress = allInternTasks.filter(t => t.status === 'In Progress').length;
  const waitingReview = allInternTasks.filter(t => t.status === 'Submitted' || t.status === 'Review').length;
  const revisionTasks = allInternTasks.filter(t => t.status === 'Revision').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return allInternTasks.filter(t => {
      const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'All' || t.status === statusFilter;
      const matchCat = categoryFilter === 'All' || t.category === categoryFilter;
      const matchPriority = priorityFilter === 'All' || t.priority === priorityFilter;

      return matchSearch && matchStatus && matchCat && matchPriority;
    }).sort((a, b) => new Date(b.task_date).getTime() - new Date(a.task_date).getTime());
  }, [allInternTasks, searchQuery, statusFilter, categoryFilter, priorityFilter]);

  // Activity Chart by Day (Slate & Teal Theme)
  const activityDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const chartData = {
    labels: activityDays,
    datasets: [
      {
        label: 'Tugas Selesai',
        data: [2, 3, 2, 4, 3, 1],
        backgroundColor: '#0d9488', // teal-600
        borderRadius: 4,
      },
      {
        label: 'Tugas Dalam Pengerjaan',
        data: [1, 2, 3, 1, 2, 0],
        backgroundColor: '#64748b', // slate-500
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header & Intern Selector */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              <span>Kelola Intern &amp; Penugasan</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Pantau perkembangan individu, produktivitas, serta delegasikan tugas (Assign Task) secara langsung
            </p>
          </div>

          {/* Intern Select Dropdown Component */}
          <div className="w-full md:w-auto">
            <label htmlFor="intern-select" className="sr-only">
              Pilih Peserta Magang
            </label>
            <select
              id="intern-select"
              value={selectedInternId || ''}
              onChange={(e) => setSelectedInternId(Number(e.target.value) || 0)}
              className="bg-white border border-slate-300 text-slate-700 rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full md:w-64 p-2.5 text-xs sm:text-sm font-medium shadow-2xs transition-colors cursor-pointer"
            >
              <option value="">Pilih Peserta Magang...</option>
              {myInterns.map((intern) => (
                <option key={intern.id} value={intern.id}>
                  {intern.name} {intern.institution ? `(${intern.institution})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {!selectedIntern ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center shadow-sm space-y-3">
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Pilih Peserta Magang</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Silakan pilih salah satu peserta magang pada dropdown di atas untuk memantau perkembangan tugas, memberi tugas baru, dan histori evaluasi harian.
          </p>
        </div>
      ) : (
        <>
          {/* Selected Intern Profile Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-7 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <UserAvatar user={selectedIntern} size="xl" className="ring-1 ring-slate-200 shrink-0" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-800">{selectedIntern.name}</h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 uppercase">
                      Intern Bimbingan
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {selectedIntern.institution}
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      {selectedIntern.study_program}
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {selectedIntern.email}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Periode: {selectedIntern.internship_start || '2026-07-01'} s/d {selectedIntern.internship_end || '2026-12-31'}
                  </p>
                </div>
              </div>

              <div className="sm:text-right bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-slate-500 block">Overall Progress</span>
                  <span className="text-2xl font-bold text-slate-800">{completionRate}%</span>
                  <span className="text-xs text-slate-500 block">{completedTasks} dari {totalTasks} selesai</span>
                </div>

                {/* Tombol Aksi Utama: + Beri Tugas (Teal) & Chat Intern */}
                <div className="mt-3 flex items-center justify-end gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setAssignModalIntern(selectedIntern);
                      setIsAssignModalOpen(true);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer transform hover:-translate-y-0.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ Beri Tugas</span>
                  </button>

                  {onNavigateToChat && (
                    <button
                      type="button"
                      onClick={onNavigateToChat}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors border border-slate-200 shadow-2xs cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                      <span>Chat {selectedIntern.name.split(' ')[0]}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">Total Tugas</span>
              <p className="text-2xl font-bold text-slate-800 mt-1">{totalTasks}</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-teal-700">Completed</span>
              <p className="text-2xl font-bold text-slate-800 mt-1">{completedTasks}</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-700">In Progress</span>
              <p className="text-2xl font-bold text-slate-800 mt-1">{inProgress}</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-amber-700">Waiting Review</span>
              <p className="text-2xl font-bold text-slate-800 mt-1">{waitingReview}</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
              <span className="text-xs font-semibold text-rose-700">Perlu Revisi</span>
              <p className="text-2xl font-bold text-slate-800 mt-1">{revisionTasks}</p>
            </div>
          </div>

          {/* Activity Chart */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Grafik Aktivitas Mingguan Peserta</h3>
                <p className="text-xs text-slate-500">Intensitas pengerjaan tugas {selectedIntern.name}</p>
              </div>
              <BarChart3 className="w-4 h-4 text-slate-400" />
            </div>
            <div className="h-56">
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom' } },
                  scales: { y: { beginAtZero: true } },
                }}
              />
            </div>
          </div>

          {/* Tasks Filters & List */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-base font-bold text-slate-800">
                Histori Tugas Peserta ({filteredTasks.length})
              </h3>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari tugas..."
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-700 focus:outline-none"
                >
                  <option value="All">Semua Status</option>
                  <option value="Completed">Completed</option>
                  <option value="Submitted">Submitted</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Revision">Revision</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-700 focus:outline-none"
                >
                  <option value="All">Semua Kategori</option>
                  <option value="Development">Development</option>
                  <option value="Testing">Testing</option>
                  <option value="Documentation">Documentation</option>
                  <option value="Design">Design</option>
                </select>
              </div>
            </div>

            {/* Tasks Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                    <th className="py-3 px-4">Judul Tugas</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Prioritas</th>
                    <th className="py-3 px-4">Tanggal &amp; Deadline</th>
                    <th className="py-3 px-4">Progress</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Tidak ada tugas yang sesuai dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((t) => (
                      <tr
                        key={t.id}
                        className="hover:bg-slate-50 cursor-pointer"
                        onClick={() => setSelectedDetailTaskId(t.id)}
                      >
                        <td className="py-3 px-4 font-bold text-slate-800 line-clamp-1">{t.title}</td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 font-medium text-slate-700 border border-slate-200">
                            {t.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap"><PriorityBadge priority={t.priority} size="sm" /></td>
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{t.task_date} (DL: {t.deadline})</td>
                        <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">{t.progress}%</td>
                        <td className="py-3 px-4 whitespace-nowrap"><StatusBadge status={t.status} size="sm" /></td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDetailTaskId(t.id);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Task Detail Modal */}
      <TaskDetailModal
        taskId={selectedDetailTaskId}
        onClose={() => setSelectedDetailTaskId(null)}
      />

      {/* Assign Task Modal */}
      <AssignTaskModal
        intern={assignModalIntern}
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setAssignModalIntern(null);
        }}
      />
    </div>
  );
};
