import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { TaskDetailModal } from '../intern/TaskDetailModal';
import { 
  Search, Eye, ShieldAlert 
} from 'lucide-react';

export const DirectorMonitoring: React.FC = () => {
  const { tasks, users } = useApp();

  const [selectedDetailTaskId, setSelectedDetailTaskId] = useState<number | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [mentorFilter, setMentorFilter] = useState('All');
  const [internFilter, setInternFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const internUsers = users.filter(u => u.role === 'intern');
  const mentorUsers = users.filter(u => u.role === 'mentor');

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search
      const matchesSearch = 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.user?.name && task.user.name.toLowerCase().includes(searchQuery.toLowerCase()));

      // Intern
      const matchesIntern = internFilter === 'All' || task.user_id === Number(internFilter);

      // Mentor
      const taskIntern = users.find(u => u.id === task.user_id);
      const matchesMentor = mentorFilter === 'All' || (taskIntern && taskIntern.mentor_id === Number(mentorFilter));

      // Status
      const matchesStatus = statusFilter === 'All' || task.status === statusFilter;

      // Category
      const matchesCategory = categoryFilter === 'All' || task.category === categoryFilter;

      return matchesSearch && matchesIntern && matchesMentor && matchesStatus && matchesCategory;
    }).sort((a, b) => new Date(b.task_date).getTime() - new Date(a.task_date).getTime());
  }, [tasks, users, searchQuery, internFilter, mentorFilter, statusFilter, categoryFilter]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-800">Management Monitoring (Direktur)</h1>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                READ-ONLY
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Pengawasan seluruh aktivitas magang, kinerja per divisi, dan kepatuhan penyelesaian tugas
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium">
            <ShieldAlert className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Mode Direktur: Read-Only (Pengawasan Korporat Tanpa Hak Ubah Data)</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tugas atau nama peserta..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Filter Mentor */}
          <div>
            <select
              value={mentorFilter}
              onChange={(e) => setMentorFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-700 focus:outline-none"
            >
              <option value="All">Semua Mentor</option>
              {mentorUsers.map(m => (
                <option key={m.id} value={m.id}>Mentor: {m.name}</option>
              ))}
            </select>
          </div>

          {/* Filter Intern */}
          <div>
            <select
              value={internFilter}
              onChange={(e) => setInternFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-700 focus:outline-none"
            >
              <option value="All">Semua Intern</option>
              {internUsers.map(i => (
                <option key={i.id} value={i.id}>Intern: {i.name}</option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-700 focus:outline-none"
            >
              <option value="All">Semua Status</option>
              <option value="Completed">Completed</option>
              <option value="Submitted">Waiting Review</option>
              <option value="In Progress">In Progress</option>
              <option value="Revision">Revision</option>
              <option value="Draft">Draft</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Filter Category */}
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

      {/* Monitoring Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-700">
            Ditemukan <strong>{filteredTasks.length}</strong> tugas yang dipantau
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-3.5 px-4">Intern</th>
                <th className="py-3.5 px-4">Mentor Pembimbing</th>
                <th className="py-3.5 px-4 min-w-[220px]">Judul Tugas</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Prioritas</th>
                <th className="py-3.5 px-4">Deadline</th>
                <th className="py-3.5 px-4">Progres</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Lihat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Tidak ada tugas yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const taskIntern = users.find(u => u.id === task.user_id);
                  const taskMentor = taskIntern?.mentor_id ? users.find(u => u.id === taskIntern.mentor_id) : null;

                  return (
                    <tr
                      key={task.id}
                      onClick={() => setSelectedDetailTaskId(task.id)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 group-hover:text-teal-600 transition-colors">{taskIntern?.name}</div>
                        <div className="text-[10px] text-slate-400">{taskIntern?.institution}</div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-slate-700 font-medium">{taskMentor?.name || '-'}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 line-clamp-1 group-hover:text-teal-600 transition-colors">{task.title}</div>
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

                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {task.deadline}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-slate-800">
                        {task.progress}%
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={task.status} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDetailTaskId(task.id);
                          }}
                          className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                          title="Lihat Detail (Read-Only)"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Detail Modal (Strict Read-Only) */}
      <TaskDetailModal
        taskId={selectedDetailTaskId}
        onClose={() => setSelectedDetailTaskId(null)}
      />
    </div>
  );
};
