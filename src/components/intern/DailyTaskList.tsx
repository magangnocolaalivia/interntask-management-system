import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, TaskStatus, TaskCategory, TaskPriority } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { TaskFormModal } from './TaskFormModal';
import { TaskDetailModal } from './TaskDetailModal';
import { 
  Plus, Search, Filter, Calendar, Clock, 
  ArrowUpDown, Eye, Edit, Trash2, Send, CheckCircle2,
  AlertTriangle, RefreshCw, Sparkles
} from 'lucide-react';

export const DailyTaskList: React.FC = () => {
  const { currentUser, tasks, deleteTask, submitTaskForReview } = useApp();

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [selectedDetailTaskId, setSelectedDetailTaskId] = useState<number | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'deadline' | 'progress' | 'priority'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  if (!currentUser) return null;

  // Filter tasks belonging to current intern
  const myTasks = tasks.filter(t => t.user_id === currentUser.id);

  // Filtered & sorted tasks
  const filteredTasks = useMemo(() => {
    return myTasks
      .filter(task => {
        // Search
        const matchesSearch = 
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (task.result && task.result.toLowerCase().includes(searchQuery.toLowerCase()));

        // Status
        const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;

        // Category
        const matchesCategory = categoryFilter === 'ALL' || task.category === categoryFilter;

        // Priority
        const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;

        // Date
        const matchesDate = !dateFilter || task.task_date === dateFilter;

        return matchesSearch && matchesStatus && matchesCategory && matchesPriority && matchesDate;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'date') {
          comparison = new Date(a.task_date).getTime() - new Date(b.task_date).getTime();
        } else if (sortBy === 'deadline') {
          comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        } else if (sortBy === 'progress') {
          comparison = a.progress - b.progress;
        } else if (sortBy === 'priority') {
          const priorityWeights = { Low: 1, Medium: 2, High: 3, Urgent: 4 };
          comparison = priorityWeights[a.priority] - priorityWeights[b.priority];
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [myTasks, searchQuery, statusFilter, categoryFilter, priorityFilter, dateFilter, sortBy, sortOrder]);

  // Paginated items
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleEdit = (task: Task) => {
    setTaskToEdit(task);
    setFormModalOpen(true);
  };

  const handleAddNew = () => {
    setTaskToEdit(null);
    setFormModalOpen(true);
  };

  const handleDelete = (task: Task) => {
    if (confirm(`Yakin ingin menghapus task draft "${task.title}"?`)) {
      deleteTask(task.id);
    }
  };

  const handleSubmitReview = (task: Task) => {
    if (confirm(`Kirim task "${task.title}" kepada mentor untuk direview?`)) {
      submitTaskForReview(task.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Manajemen Daily Task</h1>
          <p className="text-xs text-slate-500 mt-1">
            Pencatatan, pengelolaan progress, dan pengajuan review tugas harian peserta magang
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Tambah Daily Task</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative md:col-span-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari judul tugas, deskripsi, atau output..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition-all text-slate-800 placeholder-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-700 focus:outline-none bg-white"
            >
              <option value="ALL">Semua Status</option>
              <option value="Draft">Draft</option>
              <option value="In Progress">In Progress</option>
              <option value="Submitted">Waiting Review (Submitted)</option>
              <option value="Review">In Review</option>
              <option value="Revision">Perlu Revisi</option>
              <option value="Approved">Disetujui</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-700 focus:outline-none bg-white"
            >
              <option value="ALL">Semua Kategori</option>
              <option value="Development">Development</option>
              <option value="Testing">Testing</option>
              <option value="Documentation">Documentation</option>
              <option value="Meeting">Meeting</option>
              <option value="Research">Research</option>
              <option value="Design">Design</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Secondary Row: Priority, Date, Sort & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 text-slate-700 focus:outline-none bg-white"
            >
              <option value="ALL">Semua Prioritas</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>

            {/* Date Filter */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 text-slate-700 focus:outline-none bg-white"
              title="Filter Tanggal Pengerjaan"
            />

            {(searchQuery || statusFilter !== 'ALL' || categoryFilter !== 'ALL' || priorityFilter !== 'ALL' || dateFilter) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                  setCategoryFilter('ALL');
                  setPriorityFilter('ALL');
                  setDateFilter('');
                  setCurrentPage(1);
                }}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium ml-2 cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Reset Filter
              </button>
            )}
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 text-slate-700 focus:outline-none bg-white"
            >
              <option value="date">Tanggal Task</option>
              <option value="deadline">Deadline</option>
              <option value="progress">Progres</option>
              <option value="priority">Prioritas</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Ganti arah pengurutan"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Task List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4 min-w-[240px]">Judul Tugas</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Prioritas</th>
                <th className="py-3.5 px-4">Tanggal &amp; Deadline</th>
                <th className="py-3.5 px-4 w-32">Progres</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center w-36">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Tidak ada tugas harian yang sesuai filter pencarian.
                  </td>
                </tr>
              ) : (
                paginatedTasks.map((task, index) => (
                  <tr 
                    key={task.id} 
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                    onClick={() => setSelectedDetailTaskId(task.id)}
                  >
                    <td className="py-3.5 px-4 text-center font-mono text-slate-400">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-800 group-hover:text-teal-600 transition-colors">
                          {task.title}
                        </span>
                        {(task.is_assigned || task.assigned_by) && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                            <Sparkles className="w-3 h-3 text-teal-600" />
                            <span>Dari Mentor</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {task.description}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium text-[11px] border border-slate-200">
                        {task.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PriorityBadge priority={task.priority} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                      <div className="flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{task.task_date}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>DL: {task.deadline}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-between text-[11px] font-semibold mb-1 text-slate-600">
                        <span>{task.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200/60">
                        <div
                          className="bg-teal-600 h-1.5 rounded-full"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={task.status} size="sm" />
                    </td>
                    <td 
                      className="py-3.5 px-4 text-center whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedDetailTaskId(task.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer"
                          title="Lihat Detail"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {task.status !== 'Completed' && task.status !== 'Approved' && (
                          <button
                            onClick={() => handleEdit(task)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Edit Task"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {(task.status === 'Draft' || task.status === 'In Progress' || task.status === 'Revision') && (
                          <button
                            onClick={() => handleSubmitReview(task)}
                            className="p-1.5 rounded-lg text-teal-600 hover:text-teal-800 hover:bg-teal-50 transition-colors cursor-pointer"
                            title="Kirim ke Mentor"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {task.status === 'Draft' && (
                          <button
                            onClick={() => handleDelete(task)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus Draft"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Menampilkan {paginatedTasks.length} dari {filteredTasks.length} tugas
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-2.5 py-1 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold cursor-pointer ${
                    currentPage === p 
                      ? 'bg-teal-600 text-white shadow-2xs' 
                      : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-2.5 py-1 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <TaskFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        taskToEdit={taskToEdit}
      />

      <TaskDetailModal
        taskId={selectedDetailTaskId}
        onClose={() => setSelectedDetailTaskId(null)}
        onEdit={handleEdit}
      />
    </div>
  );
};
