import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { UserController, UserFormData, ValidationErrors } from '../../controllers/director/UserController';
import { 
  Users, UserPlus, Search, Filter, Edit2, Trash2, Key, 
  RefreshCw, Eye, EyeOff, AlertCircle, CheckCircle2, 
  Building2, BookOpen, Calendar, ChevronLeft, ChevronRight, 
  X, Shield, Award, UserCheck, ShieldAlert, Phone, Mail
} from 'lucide-react';

export const UserManagementView: React.FC = () => {
  const { currentUser, users, createUser, updateUser, deleteUser, getUserById } = useApp();

  // Search, Filter & Pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteModalUser, setDeleteModalUser] = useState<User | null>(null);

  // Form states
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'intern',
    phone: '',
    institution: '',
    study_program: '',
    division: '',
    internship_start: '',
    internship_end: '',
    mentor_id: null,
  });

  const [formErrors, setFormErrors] = useState<ValidationErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active mentors list for intern assignment dropdown
  const activeMentors = useMemo(() => {
    return users.filter(u => u.role === 'mentor');
  }, [users]);

  // Filtered & searched users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Role filter
      if (roleFilter !== 'all' && user.role !== roleFilter) {
        return false;
      }

      // Search query
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const matchName = user.name.toLowerCase().includes(query);
      const matchEmail = user.email.toLowerCase().includes(query);
      const matchInst = user.institution?.toLowerCase().includes(query) || false;
      const matchStudy = user.study_program?.toLowerCase().includes(query) || false;
      const matchDivision = user.division?.toLowerCase().includes(query) || false;

      return matchName || matchEmail || matchInst || matchStudy || matchDivision;
    }).sort((a, b) => b.id - a.id);
  }, [users, roleFilter, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  // Reset to page 1 on search or filter change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleRoleFilterChange = (role: 'all' | UserRole) => {
    setRoleFilter(role);
    setCurrentPage(1);
  };

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: UserController.generateSecurePassword(),
      role: 'intern',
      phone: '',
      institution: '',
      study_program: '',
      division: '',
      internship_start: '2026-07-01',
      internship_end: '2026-12-31',
      mentor_id: activeMentors.length > 0 ? activeMentors[0].id : null,
    });
    setFormErrors({});
    setShowPassword(true);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Blank by default on edit
      role: user.role,
      phone: user.phone || '',
      institution: user.institution || '',
      study_program: user.study_program || '',
      division: user.division || '',
      internship_start: user.internship_start || '2026-07-01',
      internship_end: user.internship_end || '2026-12-31',
      mentor_id: user.mentor_id || (activeMentors.length > 0 ? activeMentors[0].id : null),
    });
    setFormErrors({});
    setShowPassword(false);
    setIsModalOpen(true);
  };

  // Handle form submission
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    if (editingUser) {
      // Update User
      const result = updateUser(editingUser.id, formData);
      setIsSubmitting(false);
      if (result.success) {
        setIsModalOpen(false);
      } else if (result.errors) {
        setFormErrors(result.errors);
      }
    } else {
      // Create User
      const result = createUser(formData);
      setIsSubmitting(false);
      if (result.success) {
        setIsModalOpen(false);
      } else if (result.errors) {
        setFormErrors(result.errors);
      }
    }
  };

  // Handle delete execution
  const handleConfirmDelete = () => {
    if (!deleteModalUser) return;
    deleteUser(deleteModalUser.id);
    setDeleteModalUser(null);
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = users.length;
    const interns = users.filter(u => u.role === 'intern').length;
    const mentors = users.filter(u => u.role === 'mentor').length;
    const directors = users.filter(u => u.role === 'director').length;
    return { total, interns, mentors, directors };
  }, [users]);

  // Helper for role badge
  const renderRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'director':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
            <Shield className="w-3 h-3" />
            <span>Direktur</span>
          </span>
        );
      case 'mentor':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200">
            <Award className="w-3 h-3" />
            <span>Mentor</span>
          </span>
        );
      case 'intern':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-100 text-teal-800 border border-teal-200">
            <UserCheck className="w-3 h-3" />
            <span>Intern</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Action Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-800">Manajemen Pengguna</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                CRUD Akses Direktur
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Kelola akun seluruh mentor dan peserta magang, tentukan pembimbing, serta perbarui kredensial akses.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenCreateModal}
              className="w-full sm:w-auto px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Tambah Pengguna Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Quick Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Pengguna</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">{stats.total} Akun</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-teal-700">Peserta Magang (Intern)</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">{stats.interns} Orang</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-indigo-700">Pembimbing (Mentor)</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">{stats.mentors} Orang</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-rose-700">Direktur Eksekutif</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">{stats.directors} Orang</p>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Cari nama, email, institusi, atau prodi..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Role Filters Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => handleRoleFilterChange('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
              roleFilter === 'all'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({users.length})
          </button>
          <button
            onClick={() => handleRoleFilterChange('intern')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
              roleFilter === 'intern'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Intern ({stats.interns})
          </button>
          <button
            onClick={() => handleRoleFilterChange('mentor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
              roleFilter === 'mentor'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Mentor ({stats.mentors})
          </button>
          <button
            onClick={() => handleRoleFilterChange('director')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
              roleFilter === 'director'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Direktur ({stats.directors})
          </button>
        </div>
      </div>

      {/* 4. Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Pengguna</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Institusi / Divisi</th>
                <th className="py-3.5 px-4">Mentor Pembimbing</th>
                <th className="py-3.5 px-4">Periode Magang</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="font-semibold text-slate-600">Tidak ada pengguna yang cocok dengan kriteria</p>
                    <p className="text-[11px] mt-0.5">Coba ubah kata kunci pencarian atau bersihkan filter role.</p>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const assignedMentor = user.mentor_id ? getUserById(user.mentor_id) : null;
                  const isCurrentDirector = currentUser?.id === user.id;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={user} size="sm" />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 truncate">{user.name}</p>
                            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                            {user.phone && (
                              <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Phone className="w-2.5 h-2.5" />
                                {user.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {renderRoleBadge(user.role)}
                      </td>

                      {/* Institution / Division */}
                      <td className="py-3.5 px-4">
                        {user.role === 'intern' ? (
                          <div>
                            <p className="font-semibold text-slate-700">{user.institution || '-'}</p>
                            <p className="text-[11px] text-slate-500">{user.study_program || '-'}</p>
                          </div>
                        ) : (
                          <div>
                            <p className="font-semibold text-slate-700">{user.division || 'PT. Flux IoT Indonesia'}</p>
                            <p className="text-[11px] text-slate-400">Staff Tetap</p>
                          </div>
                        )}
                      </td>

                      {/* Assigned Mentor */}
                      <td className="py-3.5 px-4">
                        {user.role === 'intern' ? (
                          assignedMentor ? (
                            <div className="flex items-center gap-2">
                              <UserAvatar user={assignedMentor} size="xs" />
                              <span className="font-medium text-slate-700">{assignedMentor.name}</span>
                            </div>
                          ) : (
                            <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-semibold border border-amber-200">
                              Belum Ditugaskan
                            </span>
                          )
                        ) : (
                          <span className="text-slate-400 font-mono">-</span>
                        )}
                      </td>

                      {/* Period */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {user.role === 'intern' && user.internship_start && user.internship_end ? (
                          <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{user.internship_start} s/d {user.internship_end}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(user)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer border border-transparent hover:border-teal-200"
                            title="Edit data pengguna"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setDeleteModalUser(user)}
                            disabled={isCurrentDirector}
                            className={`p-1.5 rounded-lg transition-colors border border-transparent ${
                              isCurrentDirector
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-500 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-200 cursor-pointer'
                            }`}
                            title={isCurrentDirector ? 'Tidak dapat menghapus akun Anda sendiri' : 'Hapus pengguna'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Menampilkan <span className="font-bold text-slate-800">{paginatedUsers.length}</span> dari{' '}
            <span className="font-bold text-slate-800">{filteredUsers.length}</span> pengguna
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-semibold text-slate-700">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Create / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden my-8">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-teal-600" />
                  <span>{editingUser ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Controller: <code className="text-teal-700 font-mono text-[11px]">App\Http\Controllers\Director\UserController</code>
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* General Validation Error Alert */}
            {formErrors.general && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{formErrors.general}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="p-5 sm:p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Full Name */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Muhammad Ilham Ramadhan"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none ${
                      formErrors.name ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200'
                    }`}
                  />
                  {formErrors.name && (
                    <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.name}
                    </p>
                  )}
                </div>

                {/* 2. Email Address */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Alamat Email (Unik) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none ${
                      formErrors.email ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200'
                    }`}
                  />
                  {formErrors.email && (
                    <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.email}
                    </p>
                  )}
                </div>

                {/* 3. Role Selector */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Role Pengguna <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none bg-white font-medium"
                  >
                    <option value="intern">Peserta Magang (Intern)</option>
                    <option value="mentor">Pembimbing (Mentor)</option>
                    <option value="director">Direktur (Executive)</option>
                  </select>
                </div>

                {/* 4. Password with Auto-generate */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700">
                      Kata Sandi (Password){' '}
                      {!editingUser ? <span className="text-rose-500">*</span> : <span className="text-slate-400 font-normal">(Kosongkan jika tidak diganti)</span>}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const newPass = UserController.generateSecurePassword();
                        setFormData({ ...formData, password: newPass });
                        setShowPassword(true);
                      }}
                      className="text-[11px] font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Auto-Generate Password</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={editingUser ? '••••••••' : 'Minimal 8 karakter'}
                      className={`w-full pl-3 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono ${
                        formErrors.password ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.password}
                    </p>
                  )}
                </div>

                {/* 5. Phone Number */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nomor WhatsApp / Telepon
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+62 821-xxxx-xxxx"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                {/* DYNAMIC FIELDS: ONLY FOR INTERN */}
                {formData.role === 'intern' && (
                  <div className="sm:col-span-2 p-4 bg-teal-50/60 rounded-xl border border-teal-200 space-y-4">
                    <div className="flex items-center gap-1.5 font-bold text-teal-900 border-b border-teal-200/80 pb-2">
                      <UserCheck className="w-4 h-4 text-teal-600" />
                      <span>Data Khusus Peserta Magang (Intern)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Institution */}
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Nama Institusi / Universitas / Sekolah <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.institution}
                          onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                          placeholder="Contoh: Universitas Diponegoro"
                          className={`w-full px-3 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none ${
                            formErrors.institution ? 'border-rose-300 bg-rose-50/50' : 'border-slate-300'
                          }`}
                        />
                        {formErrors.institution && (
                          <p className="text-[11px] text-rose-600 mt-1">{formErrors.institution}</p>
                        )}
                      </div>

                      {/* Study Program */}
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Program Studi / Jurusan <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.study_program}
                          onChange={(e) => setFormData({ ...formData, study_program: e.target.value })}
                          placeholder="Contoh: Teknik Informatika / RPL"
                          className={`w-full px-3 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none ${
                            formErrors.study_program ? 'border-rose-300 bg-rose-50/50' : 'border-slate-300'
                          }`}
                        />
                        {formErrors.study_program && (
                          <p className="text-[11px] text-rose-600 mt-1">{formErrors.study_program}</p>
                        )}
                      </div>

                      {/* Mentor Selection (Required for Intern) */}
                      <div className="sm:col-span-2">
                        <label className="block font-semibold text-slate-700 mb-1">
                          Pilih Mentor Pembimbing <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={formData.mentor_id || ''}
                          onChange={(e) => setFormData({ ...formData, mentor_id: Number(e.target.value) || null })}
                          className={`w-full px-3 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium ${
                            formErrors.mentor_id ? 'border-rose-300' : 'border-slate-300'
                          }`}
                        >
                          <option value="">Pilih Pembimbing Magang...</option>
                          {activeMentors.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} ({m.email}) - {m.division || 'Mentor IT'}
                            </option>
                          ))}
                        </select>
                        {formErrors.mentor_id && (
                          <p className="text-[11px] text-rose-600 mt-1">{formErrors.mentor_id}</p>
                        )}
                      </div>

                      {/* Internship Dates */}
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Tanggal Mulai Magang
                        </label>
                        <input
                          type="date"
                          value={formData.internship_start}
                          onChange={(e) => setFormData({ ...formData, internship_start: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Tanggal Selesai Magang
                        </label>
                        <input
                          type="date"
                          value={formData.internship_end}
                          onChange={(e) => setFormData({ ...formData, internship_end: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>

                      {formErrors.internship_dates && (
                        <p className="sm:col-span-2 text-[11px] text-rose-600">{formErrors.internship_dates}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Mentor Division Field */}
                {formData.role === 'mentor' && (
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Divisi / Bidang Pembimbingan
                    </label>
                    <input
                      type="text"
                      value={formData.division}
                      onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                      placeholder="Contoh: Rekayasa Perangkat Lunak & Mobile Apps"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : editingUser ? 'Simpan Perubahan' : 'Tambah Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Delete Confirmation Modal */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-rose-200 shadow-2xl max-w-md w-full p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto ring-8 ring-rose-50">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-800">Konfirmasi Hapus Pengguna</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Apakah Anda yakin ingin menghapus akun <span className="font-bold text-slate-900">"{deleteModalUser.name}"</span> ({deleteModalUser.email})?
              </p>
              <p className="text-[11px] text-rose-600 mt-1">
                Seluruh data tugas, ulasan review, dan riwayat aktivitas terkait pengguna ini akan terpengaruh.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteModalUser(null)}
                className="flex-1 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
              >
                Ya, Hapus Pengguna
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
