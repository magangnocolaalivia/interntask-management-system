import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { ReviewModal } from './ReviewModal';
import { TaskDetailModal } from '../intern/TaskDetailModal';
import { 
  ClipboardCheck, Search, Eye, CheckCircle2,
  Calendar, Clock 
} from 'lucide-react';

export const TaskReviewList: React.FC = () => {
  const { currentUser, tasks, users, reviewTask } = useApp();

  const [statusFilter, setStatusFilter] = useState<'All' | 'Submitted' | 'Revision' | 'Completed'>('Submitted');
  const [selectedInternId, setSelectedInternId] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedTaskForReview, setSelectedTaskForReview] = useState<Task | null>(null);
  const [selectedTaskIdForDetail, setSelectedTaskIdForDetail] = useState<number | null>(null);

  if (!currentUser) return null;

  // Interns guided by this mentor
  const myInterns = users.filter(u => u.mentor_id === currentUser.id);
  const myInternIds = myInterns.map(u => u.id);

  // Filter tasks belonging only to my guided interns
  const mentorTasks = tasks.filter(t => myInternIds.includes(t.user_id));

  // Apply filters
  const filteredTasks = mentorTasks.filter(task => {
    // Status filter
    if (statusFilter === 'Submitted' && !(task.status === 'Submitted' || task.status === 'Review')) {
      return false;
    }
    if (statusFilter === 'Revision' && task.status !== 'Revision') {
      return false;
    }
    if (statusFilter === 'Completed' && !(task.status === 'Completed' || task.status === 'Approved')) {
      return false;
    }

    // Intern filter
    if (selectedInternId !== 'All' && task.user_id !== Number(selectedInternId)) {
      return false;
    }

    // Category filter
    if (categoryFilter !== 'All' && task.category !== categoryFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const intern = users.find(u => u.id === task.user_id);
      const matches = task.title.toLowerCase().includes(q) || 
                      (intern?.name && intern.name.toLowerCase().includes(q));
      if (!matches) return false;
    }

    return true;
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleQuickApprove = (task: Task) => {
    if (confirm(`Approve tugas "${task.title}" oleh ${task.user?.name || 'peserta'}? Progres akan menjadi 100% dan status Completed.`)) {
      reviewTask(task.id, 'approved', 'Tugas telah diverifikasi dan disetujui tanpa catatan tambahan.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800">Validasi &amp; Review Tugas Peserta</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200">
              Mentor Review
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Daftar tugas yang telah disubmit oleh peserta magang untuk diverifikasi
          </p>
        </div>

        {/* Tab Status Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto text-xs font-medium border border-slate-200">
          <button
            onClick={() => setStatusFilter('Submitted')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'Submitted' ? 'bg-white text-slate-800 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Menunggu Review ({mentorTasks.filter(t => t.status === 'Submitted' || t.status === 'Review').length})
          </button>
          <button
            onClick={() => setStatusFilter('Revision')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'Revision' ? 'bg-white text-slate-800 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Revisi ({mentorTasks.filter(t => t.status === 'Revision').length})
          </button>
          <button
            onClick={() => setStatusFilter('Completed')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'Completed' ? 'bg-white text-slate-800 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Disetujui ({mentorTasks.filter(t => t.status === 'Completed' || t.status === 'Approved').length})
          </button>
          <button
            onClick={() => setStatusFilter('All')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'All' ? 'bg-white text-slate-800 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Semua
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tugas peserta..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Intern Select */}
          <div>
            <select
              value={selectedInternId}
              onChange={(e) => setSelectedInternId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-700 focus:outline-none"
            >
              <option value="All">Semua Peserta Bimbingan</option>
              {myInterns.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} ({i.study_program})
                </option>
              ))}
            </select>
          </div>

          {/* Category Select */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-700 focus:outline-none"
            >
              <option value="All">Semua Kategori</option>
              <option value="Development">Development</option>
              <option value="Testing">Testing</option>
              <option value="Documentation">Documentation</option>
              <option value="Meeting">Meeting</option>
              <option value="Research">Research</option>
              <option value="Design">Design</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task Review Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-3.5 px-4">Intern</th>
                <th className="py-3.5 px-4 min-w-[240px]">Judul Tugas</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Prioritas</th>
                <th className="py-3.5 px-4">Tanggal &amp; Deadline</th>
                <th className="py-3.5 px-4">Progress</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Tidak ada tugas yang memerlukan tindakan pada kategori ini.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const intern = users.find(u => u.id === task.user_id);
                  return (
                    <tr 
                      key={task.id} 
                      className="hover:bg-slate-50 transition-colors group cursor-pointer"
                      onClick={() => setSelectedTaskIdForDetail(task.id)}
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{intern?.name}</div>
                        <div className="text-[11px] text-slate-400">{intern?.institution}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 group-hover:text-teal-600 transition-colors line-clamp-1">
                          {task.title}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{task.description}</div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 font-medium text-slate-700 border border-slate-200">
                          {task.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <PriorityBadge priority={task.priority} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-[11px] text-slate-600">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{task.task_date}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>DL: {task.deadline}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                        {task.progress}%
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={task.status} size="sm" />
                      </td>
                      <td 
                        className="py-3.5 px-4 text-center whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedTaskIdForDetail(task.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer"
                            title="Lihat Detail & Bukti"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setSelectedTaskForReview(task)}
                            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium text-xs transition-colors shadow-xs inline-flex items-center gap-1 cursor-pointer"
                          >
                            <ClipboardCheck className="w-3.5 h-3.5" />
                            <span>Review</span>
                          </button>

                          {(task.status === 'Submitted' || task.status === 'Review') && (
                            <button
                              onClick={() => handleQuickApprove(task)}
                              className="p-1.5 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors border border-teal-200 cursor-pointer"
                              title="1-Click Approve (Langsung Setujui)"
                            >
                              <CheckCircle2 className="w-4 h-4 text-teal-600" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
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
