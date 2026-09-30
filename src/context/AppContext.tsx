import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, Task, Attachment, Feedback, Notification, TaskActivityLog, 
  TaskStatus, TaskCategory, TaskPriority, Message, CompanySetting,
  Attendance, AttendanceStatus
} from '../types';
import { 
  INITIAL_USERS, INITIAL_TASKS, INITIAL_ATTACHMENTS, 
  INITIAL_FEEDBACKS, INITIAL_NOTIFICATIONS, INITIAL_ACTIVITY_LOGS,
  INITIAL_MESSAGES, INITIAL_COMPANY_SETTING, INITIAL_ATTENDANCES
} from '../data/initialData';
import { updateGlobalUI } from '../utils/domSync';
import { UserController, UserFormData, ValidationErrors } from '../controllers/director/UserController';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  tasks: Task[];
  attachments: Attachment[];
  feedbacks: Feedback[];
  notifications: Notification[];
  activityLogs: TaskActivityLog[];
  messages: Message[];
  toasts: ToastMessage[];
  
  // Auth
  login: (email: string, password?: string) => User | null;
  logout: () => void;
  switchUser: (userId: number) => void;
  updateUserProfilePhoto: (photoUrl: string | null, photoPath?: string | null) => boolean;
  updateUserProfile: (updates: Partial<User>) => boolean;
  changePassword: (oldPassword: string, newPassword: string) => { success: boolean; message: string };

  // Director User Management (CRUD)
  createUser: (userData: UserFormData) => { success: boolean; errors?: ValidationErrors; user?: User };
  updateUser: (userId: number, updates: UserFormData) => { success: boolean; errors?: ValidationErrors; user?: User };
  deleteUser: (userId: number) => { success: boolean; message: string };

  // Company Settings (White-Label - Director Exclusive)
  companySetting: CompanySetting;
  updateCompanySetting: (updates: Partial<CompanySetting>) => boolean;

  // Attendance (Kehadiran Harian)
  attendances: Attendance[];
  getTodayAttendance: (userId?: number) => Attendance | undefined;
  clockIn: (notes?: string) => { success: boolean; message: string; attendance?: Attendance };
  clockOut: () => { success: boolean; message: string; attendance?: Attendance };
  submitPermit: (notes: string, leaveStatus?: 'permit' | 'sick') => { success: boolean; message: string; attendance?: Attendance };
  submitLeave: (status: 'permit' | 'sick', notes: string) => { success: boolean; message: string; attendance?: Attendance };
  getAttendancesForIntern: (userId: number) => Attendance[];
  getAttendancesForMentor: (mentorId: number) => Attendance[];
  
  // Task Operations
  createTask: (data: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Task;
  assignTask: (targetInternId: number, data: {
    title: string;
    description: string;
    deadline: string;
    priority: TaskPriority;
    category?: TaskCategory;
    estimated_duration?: number;
    mentor_attachment_path?: string | null;
    mentor_reference_url?: string | null;
  }) => { success: boolean; message: string; task?: Task };
  updateTask: (taskId: number, updates: Partial<Task>) => boolean;
  deleteTask: (taskId: number) => boolean;
  submitTaskForReview: (taskId: number) => boolean;
  reviewTask: (taskId: number, action: 'approved' | 'revision' | 'rejected', feedbackMessage: string) => boolean;
  
  // Attachments
  addAttachment: (taskId: number, file: { file_name: string; file_type: string; file_size: string; file_path: string }) => void;
  removeAttachment: (attachmentId: number) => void;
  
  // Notifications
  unreadNotificationCount: number;
  markNotificationRead: (id: number) => void;
  markAllNotificationsRead: () => void;

  // Direct Messaging
  unreadMessageCount: number;
  sendMessage: (receiverId: number, messageText: string) => Message | null;
  markMessagesAsRead: (contactId: number) => void;
  getUnreadMessagesCount: (contactId?: number) => number;
  getMessagesBetween: (user1Id: number, user2Id: number) => Message[];
  
  // Utilities
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  resetAllData: () => void;
  
  // Data Helpers
  getTaskById: (taskId: number) => Task | undefined;
  getUserById: (userId: number) => User | undefined;
  getTasksForUser: (userId: number) => Task[];
  getTasksForMentor: (mentorId: number) => Task[];
  getInternsForMentor: (mentorId: number) => User[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'interntask_current_user_id',
  USERS: 'interntask_users',
  TASKS: 'interntask_tasks',
  ATTACHMENTS: 'interntask_attachments',
  FEEDBACKS: 'interntask_feedbacks',
  NOTIFICATIONS: 'interntask_notifications',
  LOGS: 'interntask_activity_logs',
  MESSAGES: 'interntask_messages',
  COMPANY: 'interntask_company_setting',
  ATTENDANCES: 'interntask_attendances',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load Company Settings (White-Label)
  const [companySetting, setCompanySetting] = useState<CompanySetting>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPANY);
    return saved ? JSON.parse(saved) : INITIAL_COMPANY_SETTING;
  });

  // Load Attendances
  const [attendances, setAttendances] = useState<Attendance[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCES);
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCES;
  });

  // Load users
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  // Current logged in user (default Intern 1 for immediate hands-on test)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedId = localStorage.getItem(STORAGE_KEYS.USER);
    if (savedId) {
      const found = users.find(u => u.id === Number(savedId));
      if (found) return found;
    }
    // Default to intern 1 (Rizky Pratama)
    return users.find(u => u.id === 4) || users[0];
  });

  // Tasks
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  // Attachments
  const [attachments, setAttachments] = useState<Attachment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ATTACHMENTS);
    return saved ? JSON.parse(saved) : INITIAL_ATTACHMENTS;
  });

  // Feedbacks
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FEEDBACKS);
    return saved ? JSON.parse(saved) : INITIAL_FEEDBACKS;
  });

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Activity Logs
  const [activityLogs, setActivityLogs] = useState<TaskActivityLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
  });

  // Direct Messages
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.USER, String(currentUser.id));
      updateGlobalUI(currentUser);
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATTACHMENTS, JSON.stringify(attachments));
  }, [attachments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(feedbacks));
  }, [feedbacks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(companySetting));
  }, [companySetting]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCES, JSON.stringify(attendances));
  }, [attendances]);

  // Toast helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Auth
  const login = (email: string, password: string = 'password'): User | null => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user && (password === 'password' || password === user.password || (user.password && password === user.password))) {
      setCurrentUser(user);
      showToast(`Login berhasil! Selamat datang, ${user.name}`, 'success');
      return user;
    }
    showToast('Email atau kata sandi tidak valid. Silakan periksa kembali kredensial Anda.', 'error');
    return null;
  };

  const logout = () => {
    setCurrentUser(null);
    showToast('Anda telah berhasil keluar dari sistem.', 'info');
  };

  const switchUser = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      showToast(`Beralih akun ke: ${user.name} (${user.role.toUpperCase()})`, 'info');
    }
  };

  const updateUserProfilePhoto = (photoUrl: string | null, photoPath?: string | null): boolean => {
    if (!currentUser) return false;

    const newPhotoPath = photoPath ?? (photoUrl ? `profiles/user_${currentUser.id}_${Date.now()}.png` : null);
    const updatedUser: User = {
      ...currentUser,
      avatar: photoUrl || undefined,
      profile_photo_path: newPhotoPath,
    };

    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));

    if (photoUrl) {
      showToast('Foto profil berhasil diunggah ke storage/app/public/profiles.', 'success');
    } else {
      showToast('Foto profil dihapus. Menggunakan inisial default.', 'info');
    }
    return true;
  };

  const updateUserProfile = (updates: Partial<User>): boolean => {
    if (!currentUser) return false;

    const updatedUser: User = {
      ...currentUser,
      ...updates,
    };

    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    showToast('Informasi profil berhasil diperbarui.', 'success');
    return true;
  };

  const changePassword = (oldPassword: string, newPassword: string): { success: boolean; message: string } => {
    if (!currentUser) {
      return { success: false, message: 'Harap login terlebih dahulu.' };
    }

    // Verify current password
    const currentPass = currentUser.password || 'password';
    if (oldPassword !== currentPass && oldPassword !== 'password') {
      showToast('Gagal: Kata sandi lama yang Anda masukkan tidak sesuai.', 'error');
      return { success: false, message: 'Kata sandi lama salah.' };
    }

    if (!newPassword || newPassword.length < 6) {
      showToast('Gagal: Kata sandi baru minimal harus 6 karakter.', 'error');
      return { success: false, message: 'Kata sandi baru minimal 6 karakter.' };
    }

    if (newPassword === oldPassword) {
      showToast('Gagal: Kata sandi baru tidak boleh sama dengan kata sandi lama.', 'warning');
      return { success: false, message: 'Kata sandi baru tidak boleh sama.' };
    }

    const updatedUser: User = {
      ...currentUser,
      password: newPassword,
    };

    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    showToast('Kata sandi berhasil diperbarui! Gunakan kata sandi baru untuk login berikutnya.', 'success');
    return { success: true, message: 'Kata sandi berhasil diubah.' };
  };

  // Director User Management CRUD
  const createUser = (userData: UserFormData): { success: boolean; errors?: ValidationErrors; user?: User } => {
    if (currentUser?.role !== 'director') {
      showToast('Otorisasi Ditolak: Hanya Direktur yang memiliki hak akses manajemen pengguna.', 'error');
      return { success: false, errors: { general: 'Akses ditolak.' } };
    }

    const { isValid, errors } = UserController.validate(userData, users);
    if (!isValid) {
      showToast('Validasi gagal. Silakan periksa kembali input data pengguna.', 'error');
      return { success: false, errors };
    }

    const newId = (users.reduce((max, u) => (u.id > max ? u.id : max), 0) || 0) + 1;
    const defaultAvatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    ];
    const assignedAvatar = defaultAvatars[newId % defaultAvatars.length];

    const newUser: User = {
      id: newId,
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      role: userData.role,
      password: userData.password || 'password',
      phone: userData.phone?.trim() || undefined,
      institution: userData.role === 'intern' ? userData.institution?.trim() : undefined,
      study_program: userData.role === 'intern' ? userData.study_program?.trim() : undefined,
      division: userData.division?.trim() || (userData.role === 'mentor' ? 'Teknologi Informasi & Rekayasa Perangkat Lunak' : 'Peserta Magang'),
      internship_start: userData.role === 'intern' ? (userData.internship_start || '2026-07-01') : undefined,
      internship_end: userData.role === 'intern' ? (userData.internship_end || '2026-12-31') : undefined,
      mentor_id: userData.role === 'intern' ? (userData.mentor_id ? Number(userData.mentor_id) : null) : null,
      avatar: assignedAvatar,
      profile_photo_path: null,
    };

    setUsers(prev => [...prev, newUser]);
    showToast(`Pengguna baru "${newUser.name}" (${newUser.role.toUpperCase()}) berhasil ditambahkan!`, 'success');
    return { success: true, user: newUser };
  };

  const updateUser = (userId: number, updates: UserFormData): { success: boolean; errors?: ValidationErrors; user?: User } => {
    if (currentUser?.role !== 'director') {
      showToast('Otorisasi Ditolak: Hanya Direktur yang memiliki hak akses manajemen pengguna.', 'error');
      return { success: false, errors: { general: 'Akses ditolak.' } };
    }

    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) {
      showToast('Pengguna tidak ditemukan.', 'error');
      return { success: false, errors: { general: 'Pengguna tidak ditemukan.' } };
    }

    const { isValid, errors } = UserController.validate(updates, users, userId);
    if (!isValid) {
      showToast('Validasi gagal. Silakan periksa kembali input formulir.', 'error');
      return { success: false, errors };
    }

    const updatedUser: User = {
      ...targetUser,
      name: updates.name.trim(),
      email: updates.email.trim().toLowerCase(),
      role: updates.role,
      password: updates.password && updates.password.length > 0 ? updates.password : targetUser.password,
      phone: updates.phone?.trim() || targetUser.phone,
      institution: updates.role === 'intern' ? updates.institution?.trim() : undefined,
      study_program: updates.role === 'intern' ? updates.study_program?.trim() : undefined,
      division: updates.division?.trim() || targetUser.division,
      internship_start: updates.role === 'intern' ? (updates.internship_start || targetUser.internship_start) : undefined,
      internship_end: updates.role === 'intern' ? (updates.internship_end || targetUser.internship_end) : undefined,
      mentor_id: updates.role === 'intern' ? (updates.mentor_id ? Number(updates.mentor_id) : null) : null,
    };

    setUsers(prev => prev.map(u => (u.id === userId ? updatedUser : u)));
    if (currentUser.id === userId) {
      setCurrentUser(updatedUser);
      updateGlobalUI(updatedUser);
    }
    showToast(`Data pengguna "${updatedUser.name}" berhasil diperbarui.`, 'success');
    return { success: true, user: updatedUser };
  };

  const deleteUser = (userId: number): { success: boolean; message: string } => {
    if (currentUser?.role !== 'director') {
      showToast('Otorisasi Ditolak: Hanya Direktur yang memiliki hak akses manajemen pengguna.', 'error');
      return { success: false, message: 'Akses ditolak.' };
    }

    if (currentUser.id === userId) {
      showToast('Gagal: Anda tidak dapat menghapus akun Direktur yang sedang aktif digunakan.', 'error');
      return { success: false, message: 'Tidak dapat menghapus akun Anda sendiri.' };
    }

    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) {
      showToast('Pengguna tidak ditemukan.', 'error');
      return { success: false, message: 'Pengguna tidak ditemukan.' };
    }

    // Remove user
    setUsers(prev => prev.filter(u => u.id !== userId));
    showToast(`Pengguna "${targetUser.name}" (${targetUser.role.toUpperCase()}) berhasil dihapus dari sistem.`, 'success');
    return { success: true, message: 'Pengguna berhasil dihapus.' };
  };

  // Company Settings Management (White-Label - Director Exclusive)
  const updateCompanySetting = (updates: Partial<CompanySetting>): boolean => {
    if (currentUser?.role !== 'director') {
      showToast('Akses Ditolak: Hanya Direktur yang memiliki hak akses untuk mengubah pengaturan perusahaan.', 'error');
      return false;
    }

    if (updates.company_name !== undefined && updates.company_name.trim().length === 0) {
      showToast('Nama perusahaan wajib diisi.', 'error');
      return false;
    }

    const updated: CompanySetting = {
      ...companySetting,
      ...updates,
      company_name: updates.company_name !== undefined ? updates.company_name.trim() : companySetting.company_name,
      company_address: updates.company_address !== undefined ? updates.company_address.trim() : companySetting.company_address,
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setCompanySetting(updated);
    showToast('Pengaturan profil perusahaan berhasil disimpan!', 'success');
    return true;
  };

  // --- Attendance (Kehadiran Harian) Operations ---
  const getTodayDateString = (): string => {
    return new Date().toISOString().split('T')[0];
  };

  const getTodayAttendance = (userId?: number): Attendance | undefined => {
    const targetUserId = userId || currentUser?.id;
    if (!targetUserId) return undefined;
    const today = getTodayDateString();
    return attendances.find(a => a.user_id === targetUserId && a.date === today);
  };

  const clockIn = (notes?: string): { success: boolean; message: string; attendance?: Attendance } => {
    if (!currentUser) {
      return { success: false, message: 'Harap login terlebih dahulu.' };
    }
    if (currentUser.role !== 'intern') {
      showToast('Akses Ditolak: Hanya peserta magang yang dapat melakukan absensi masuk.', 'error');
      return { success: false, message: 'Hanya peserta magang yang dapat melakukan absensi masuk.' };
    }

    const today = getTodayDateString();
    const existing = attendances.find(a => a.user_id === currentUser.id && a.date === today);

    // Rule 1: One-time Clock In validation
    if (existing && existing.clock_in) {
      showToast(`Peringatan: Anda sudah melakukan Clock In hari ini pada pukul ${existing.clock_in}.`, 'warning');
      return { success: false, message: `Anda sudah Clock In hari ini pada pukul ${existing.clock_in}.`, attendance: existing };
    }

    if (existing && (existing.status === 'permit' || existing.status === 'sick')) {
      const label = existing.status === 'sick' ? 'Sakit' : 'Izin';
      showToast(`Status kehadiran Anda hari ini sudah tercatat sebagai ${label}.`, 'warning');
      return { success: false, message: `Status kehadiran hari ini adalah ${label}.`, attendance: existing };
    }

    // Current time formatting
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Rule 2: Dynamic status calculation based on active companySetting.late_tolerance_time (default: '09:00')
    const toleranceStr = companySetting.late_tolerance_time || '09:00';
    const [tolH, tolM] = toleranceStr.split(':').map(Number);
    const tolHour = isNaN(tolH) ? 9 : tolH;
    const tolMin = isNaN(tolM) ? 0 : tolM;

    const isLate = hours > tolHour || (hours === tolHour && (minutes > tolMin || (minutes === tolMin && seconds > 0)));
    const status: AttendanceStatus = isLate ? 'late' : 'present';

    // Requirement: If late (> late_tolerance_time), notes is mandatory
    if (isLate && (!notes || notes.trim().length === 0)) {
      showToast(`Gagal: Anda terlambat (melewati batas toleransi ${toleranceStr} WIB). Kolom Keterangan/Alasan wajib diisi.`, 'error');
      return { success: false, message: `Kolom Keterangan/Alasan wajib diisi karena terlambat (melewati batas toleransi ${toleranceStr} WIB).` };
    }

    const finalNotes = notes && notes.trim().length > 0 
      ? notes.trim() 
      : (isLate ? 'Terlambat masuk kerja' : 'Hadir tepat waktu');

    const newAttendance: Attendance = {
      id: existing ? existing.id : Date.now(),
      user_id: currentUser.id,
      date: today,
      clock_in: timeStr,
      clock_out: null,
      status,
      notes: finalNotes,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setAttendances(prev => {
      const filtered = prev.filter(a => !(a.user_id === currentUser.id && a.date === today));
      return [newAttendance, ...filtered];
    });

    const msg = isLate 
      ? `Clock In berhasil dicatat pada ${timeStr} (Status: Terlambat - Catatan tersimpan)` 
      : `Clock In berhasil dicatat pada ${timeStr} (Status: Hadir Tepat Waktu)`;
    showToast(msg, isLate ? 'warning' : 'success');

    return { success: true, message: msg, attendance: newAttendance };
  };

  const clockOut = (): { success: boolean; message: string; attendance?: Attendance } => {
    if (!currentUser) {
      return { success: false, message: 'Harap login terlebih dahulu.' };
    }
    if (currentUser.role !== 'intern') {
      showToast('Akses Ditolak: Hanya peserta magang yang dapat melakukan absensi pulang.', 'error');
      return { success: false, message: 'Hanya peserta magang yang dapat melakukan absensi pulang.' };
    }

    const today = getTodayDateString();
    const existing = attendances.find(a => a.user_id === currentUser.id && a.date === today);

    // Rule 1: Must already have clock_in
    if (!existing || !existing.clock_in) {
      showToast('Gagal: Anda belum melakukan Clock In masuk pada hari ini.', 'error');
      return { success: false, message: 'Anda belum melakukan Clock In masuk hari ini.' };
    }

    // Rule 2: Cannot clock out more than once
    if (existing.clock_out) {
      showToast(`Peringatan: Anda sudah melakukan Clock Out pulang hari ini pada pukul ${existing.clock_out}.`, 'warning');
      return { success: false, message: `Anda sudah Clock Out hari ini pada pukul ${existing.clock_out}.`, attendance: existing };
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const updated: Attendance = {
      ...existing,
      clock_out: timeStr,
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setAttendances(prev => prev.map(a => a.id === existing.id ? updated : a));
    showToast(`Clock Out berhasil dicatat pada pukul ${timeStr}. Selamat beristirahat!`, 'success');

    return { success: true, message: `Clock Out berhasil pada ${timeStr}.`, attendance: updated };
  };

  const submitPermit = (notes: string, leaveStatus: 'permit' | 'sick' = 'permit'): { success: boolean; message: string; attendance?: Attendance } => {
    if (!currentUser) {
      return { success: false, message: 'Harap login terlebih dahulu.' };
    }
    if (currentUser.role !== 'intern') {
      showToast('Akses Ditolak: Hanya peserta magang yang dapat mengajukan laporan kehadiran.', 'error');
      return { success: false, message: 'Hanya peserta magang yang dapat mengajukan laporan kehadiran.' };
    }

    if (!notes || notes.trim().length === 0) {
      const label = leaveStatus === 'sick' ? 'Sakit' : 'Izin';
      showToast(`Gagal: Keterangan/Catatan wajib diisi untuk status ${label}.`, 'error');
      return { success: false, message: `Keterangan/Catatan wajib diisi untuk status ${label}.` };
    }

    const today = getTodayDateString();
    const existing = attendances.find(a => a.user_id === currentUser.id && a.date === today);

    if (existing) {
      showToast('Gagal: Data presensi untuk hari ini sudah ada dalam sistem.', 'warning');
      return { success: false, message: 'Data absensi hari ini sudah ada.', attendance: existing };
    }

    const leaveAttendance: Attendance = {
      id: Date.now(),
      user_id: currentUser.id,
      date: today,
      clock_in: null,
      clock_out: null,
      status: leaveStatus,
      notes: notes.trim(),
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setAttendances(prev => [leaveAttendance, ...prev]);
    const label = leaveStatus === 'sick' ? 'Sakit' : 'Izin';
    showToast(`Laporan kehadiran (${label}) hari ini berhasil disimpan.`, 'info');

    return { success: true, message: `Laporan ${label} berhasil dicatat.`, attendance: leaveAttendance };
  };

  const submitLeave = (status: 'permit' | 'sick', notes: string) => submitPermit(notes, status);

  const getAttendancesForIntern = (userId: number): Attendance[] => {
    return attendances
      .filter(a => a.user_id === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getAttendancesForMentor = (mentorId: number): Attendance[] => {
    const supervisedInternIds = users
      .filter(u => u.mentor_id === mentorId)
      .map(u => u.id);
    return attendances
      .filter(a => supervisedInternIds.includes(a.user_id))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Task Helper functions
  const getUserById = (userId: number) => users.find(u => u.id === userId);

  const getTaskById = (taskId: number): Task | undefined => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return undefined;
    const taskAttachments = attachments.filter(a => a.task_id === taskId);
    const taskFeedbacks = feedbacks.filter(f => f.task_id === taskId);
    const taskLogs = activityLogs.filter(l => l.task_id === taskId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const taskUser = getUserById(task.user_id);
    const taskMentor = taskUser?.mentor_id ? getUserById(taskUser.mentor_id) : undefined;

    return {
      ...task,
      user: taskUser,
      mentor: taskMentor,
      attachments: taskAttachments,
      feedback: taskFeedbacks,
      activity_logs: taskLogs,
    };
  };

  const getTasksForUser = (userId: number): Task[] => {
    return tasks.filter(t => t.user_id === userId).map(t => getTaskById(t.id) || t);
  };

  const getTasksForMentor = (mentorId: number): Task[] => {
    const internIds = users.filter(u => u.mentor_id === mentorId).map(u => u.id);
    return tasks.filter(t => internIds.includes(t.user_id)).map(t => getTaskById(t.id) || t);
  };

  const getInternsForMentor = (mentorId: number): User[] => {
    return users.filter(u => u.mentor_id === mentorId && u.role === 'intern');
  };

  // Log Activity Helper
  const logActivity = (taskId: number, action: string, description: string) => {
    if (!currentUser) return;
    const newLog: TaskActivityLog = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      task_id: taskId,
      user_id: currentUser.id,
      user_name: currentUser.name,
      action,
      description,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // Send Notification Helper
  const sendNotification = (userId: number, title: string, message: string, type: Notification['type'], taskId?: number) => {
    const newNotification: Notification = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      user_id: userId,
      title,
      message,
      type,
      is_read: false,
      task_id: taskId,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  // CRUD Operations
  const createTask = (data: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Task => {
    if (!currentUser) throw new Error('Unauthenticated');
    if (currentUser.role !== 'intern') {
      throw new Error('Hanya peserta magang yang dapat membuat daily task.');
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newId = Math.max(...tasks.map(t => t.id), 0) + 1;
    
    const newTask: Task = {
      ...data,
      id: newId,
      user_id: currentUser.id,
      created_at: now,
      updated_at: now,
    };

    setTasks(prev => [newTask, ...prev]);
    logActivity(newId, 'CREATED', `Task dibuat dengan status ${data.status}`);

    if (data.status === 'Submitted') {
      if (currentUser.mentor_id) {
        sendNotification(
          currentUser.mentor_id,
          'Task Baru Menunggu Review',
          `${currentUser.name} telah mengirimkan task "${newTask.title}" untuk direview.`,
          'submission',
          newId
        );
      }
    }

    showToast(`Task "${newTask.title}" berhasil dibuat!`, 'success');
    return newTask;
  };

  const assignTask = (targetInternId: number, data: {
    title: string;
    description: string;
    deadline: string;
    priority: TaskPriority;
    category?: TaskCategory;
    estimated_duration?: number;
    mentor_attachment_path?: string | null;
    mentor_reference_url?: string | null;
  }): { success: boolean; message: string; task?: Task } => {
    if (!currentUser) return { success: false, message: 'Harap login terlebih dahulu.' };
    if (currentUser.role !== 'mentor' && currentUser.role !== 'director') {
      showToast('Akses Ditolak: Hanya Mentor atau Direktur yang dapat memberikan penugasan.', 'error');
      return { success: false, message: 'Unauthorized' };
    }

    const intern = users.find(u => u.id === targetInternId);
    if (!intern) {
      showToast('Peserta magang tidak ditemukan.', 'error');
      return { success: false, message: 'Peserta magang tidak ditemukan.' };
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const todayStr = getTodayDateString();
    const newId = Math.max(...tasks.map(t => t.id), 0) + 1;

    const newTask: Task = {
      id: newId,
      user_id: targetInternId,
      title: data.title.trim(),
      description: data.description.trim(),
      task_date: todayStr,
      deadline: data.deadline,
      category: data.category || 'Development',
      priority: data.priority,
      estimated_duration: data.estimated_duration || 4,
      progress: 0,
      status: 'In Progress',
      assigned_by: currentUser.id,
      assigner_name: currentUser.name,
      is_assigned: true,
      mentor_attachment_path: data.mentor_attachment_path || null,
      mentor_reference_url: data.mentor_reference_url ? data.mentor_reference_url.trim() : null,
      created_at: now,
      updated_at: now,
    };

    setTasks(prev => [newTask, ...prev]);

    // Log Activity
    logActivity(newId, 'ASSIGNED', `Task diberikan oleh ${currentUser.role === 'mentor' ? 'Mentor' : 'Direktur'} ${currentUser.name} kepada ${intern.name}`);

    // Send Notification to Intern
    sendNotification(
      targetInternId,
      'Penugasan Tugas Baru dari Pembimbing',
      `${currentUser.name} telah memberikan tugas baru: "${newTask.title}". Silakan periksa detailnya pada menu Daily Tasks.`,
      'submission',
      newId
    );

    showToast(`Tugas "${newTask.title}" berhasil ditugaskan ke ${intern.name}!`, 'success');
    return { success: true, message: 'Tugas berhasil diberikan.', task: newTask };
  };

  const updateTask = (taskId: number, updates: Partial<Task>): boolean => {
    if (!currentUser) return false;
    const existing = tasks.find(t => t.id === taskId);
    if (!existing) {
      showToast('Task tidak ditemukan', 'error');
      return false;
    }

    // Authorization: Intern can only edit their own task, and not if it is approved/completed
    if (currentUser.role === 'intern') {
      if (existing.user_id !== currentUser.id) {
        showToast('Unauthorized: Anda tidak dapat mengedit task milik peserta lain.', 'error');
        return false;
      }
      if (existing.status === 'Completed' || existing.status === 'Approved') {
        showToast('Task yang sudah disetujui / selesai tidak dapat diedit kembali.', 'warning');
        return false;
      }
    }

    // Director cannot edit tasks (Read-Only)
    if (currentUser.role === 'director') {
      showToast('Akses Ditolak: Direktur memiliki akses read-only dan tidak dapat mengubah task.', 'error');
      return false;
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const updatedTask: Task = {
      ...existing,
      ...updates,
      updated_at: now,
    };

    setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));

    // Log activity
    if (updates.progress !== undefined && updates.progress !== existing.progress) {
      logActivity(taskId, 'PROGRESS_UPDATE', `Progress diperbarui menjadi ${updates.progress}%`);
    } else {
      logActivity(taskId, 'UPDATED', 'Informasi task diperbarui');
    }

    showToast('Perubahan task berhasil disimpan.', 'success');
    return true;
  };

  const deleteTask = (taskId: number): boolean => {
    if (!currentUser) return false;
    const existing = tasks.find(t => t.id === taskId);
    if (!existing) return false;

    if (currentUser.role !== 'intern' || existing.user_id !== currentUser.id) {
      showToast('Anda tidak memiliki hak untuk menghapus task ini.', 'error');
      return false;
    }

    if (existing.status !== 'Draft') {
      showToast('Hanya task dengan status Draft yang dapat dihapus.', 'warning');
      return false;
    }

    setTasks(prev => prev.filter(t => t.id !== taskId));
    setAttachments(prev => prev.filter(a => a.task_id !== taskId));
    setFeedbacks(prev => prev.filter(f => f.task_id !== taskId));
    setActivityLogs(prev => prev.filter(l => l.task_id !== taskId));

    showToast('Task berhasil dihapus.', 'info');
    return true;
  };

  const submitTaskForReview = (taskId: number): boolean => {
    if (!currentUser) return false;
    const existing = tasks.find(t => t.id === taskId);
    if (!existing) return false;

    if (currentUser.role !== 'intern' || existing.user_id !== currentUser.id) {
      showToast('Hanya pemilik task yang dapat mengirimkan task untuk review.', 'error');
      return false;
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'Submitted', updated_at: now } : t));

    logActivity(taskId, 'SUBMITTED', 'Task dikirim ke mentor untuk direview');

    if (currentUser.mentor_id) {
      sendNotification(
        currentUser.mentor_id,
        'Task Baru Menunggu Review',
        `${currentUser.name} telah mengirimkan task "${existing.title}" untuk direview`,
        'submission',
        taskId
      );
    }

    showToast('Task berhasil dikirim untuk review oleh Mentor!', 'success');
    return true;
  };

  const reviewTask = (
    taskId: number, 
    action: 'approved' | 'revision' | 'rejected', 
    feedbackMessage: string
  ): boolean => {
    if (!currentUser) return false;
    if (currentUser.role !== 'mentor') {
      showToast('Hanya mentor yang dapat melakukan review task.', 'error');
      return false;
    }

    const existing = tasks.find(t => t.id === taskId);
    if (!existing) return false;

    // Check if intern belongs to this mentor
    const intern = users.find(u => u.id === existing.user_id);
    if (intern?.mentor_id !== currentUser.id) {
      showToast('Anda hanya dapat mereview task dari peserta magang yang Anda bimbing.', 'error');
      return false;
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    let nextStatus: TaskStatus;
    let notifTitle: string;
    let notifMessage: string;
    let logAction: string;

    if (action === 'approved') {
      nextStatus = 'Completed';
      notifTitle = 'Tugas Disetujui';
      notifMessage = `Tugas "${existing.title}" telah disetujui oleh mentor ${currentUser.name}. Status: Selesai (Completed).`;
      logAction = 'APPROVED';
    } else if (action === 'revision') {
      nextStatus = 'Revision';
      notifTitle = 'Permintaan Revisi Tugas';
      notifMessage = `Mentor ${currentUser.name} meminta revisi pada tugas "${existing.title}": ${feedbackMessage}`;
      logAction = 'REVISION_REQUESTED';
    } else {
      nextStatus = 'Rejected';
      notifTitle = 'Tugas Ditolak';
      notifMessage = `Tugas "${existing.title}" ditolak oleh mentor ${currentUser.name}. Alasan: ${feedbackMessage}`;
      logAction = 'REJECTED';
    }

    // 1. Update task status
    setTasks(prev => prev.map(t => t.id === taskId ? { 
      ...t, 
      status: nextStatus, 
      progress: action === 'approved' ? 100 : t.progress,
      updated_at: now 
    } : t));

    // 2. Add feedback record
    const newFeedback: Feedback = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      task_id: taskId,
      mentor_id: currentUser.id,
      mentor_name: currentUser.name,
      message: feedbackMessage,
      action,
      created_at: now,
    };
    setFeedbacks(prev => [newFeedback, ...prev]);

    // 3. Log activity
    logActivity(taskId, logAction, `Mentor ${currentUser.name} mereview: ${action.toUpperCase()} - "${feedbackMessage}"`);

    // 4. Notify intern
    sendNotification(existing.user_id, notifTitle, notifMessage, action === 'approved' ? 'approval' : action === 'revision' ? 'revision' : 'rejection', taskId);

    showToast(`Review berhasil disimpan: Task ditandai ${nextStatus}.`, 'success');
    return true;
  };

  // Attachments
  const addAttachment = (taskId: number, file: { file_name: string; file_type: string; file_size: string; file_path: string }) => {
    const newAttachment: Attachment = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      task_id: taskId,
      ...file,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setAttachments(prev => [...prev, newAttachment]);
    logActivity(taskId, 'ATTACHMENT_ADDED', `File bukti diunggah: ${file.file_name}`);
    showToast(`Bukti file "${file.file_name}" berhasil dilampirkan.`, 'success');
  };

  const removeAttachment = (attachmentId: number) => {
    const att = attachments.find(a => a.id === attachmentId);
    if (att) {
      setAttachments(prev => prev.filter(a => a.id !== attachmentId));
      logActivity(att.task_id, 'ATTACHMENT_REMOVED', `File bukti dihapus: ${att.file_name}`);
      showToast('File lampiran berhasil dihapus.', 'info');
    }
  };

  // Notification management
  const unreadNotificationCount = notifications.filter(n => currentUser && n.user_id === currentUser.id && !n.is_read).length;

  const markNotificationRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllNotificationsRead = () => {
    if (!currentUser) return;
    setNotifications(prev => prev.map(n => n.user_id === currentUser.id ? { ...n, is_read: true } : n));
    showToast('Semua notifikasi ditandai telah dibaca.', 'info');
  };

  // Direct Messaging Logic
  const unreadMessageCount = messages.filter(
    m => currentUser && m.receiver_id === currentUser.id && !m.is_read
  ).length;

  const getUnreadMessagesCount = (contactId?: number) => {
    if (!currentUser) return 0;
    if (contactId) {
      return messages.filter(m => m.receiver_id === currentUser.id && m.sender_id === contactId && !m.is_read).length;
    }
    return messages.filter(m => m.receiver_id === currentUser.id && !m.is_read).length;
  };

  const getMessagesBetween = (user1Id: number, user2Id: number) => {
    return messages
      .filter(
        m => (m.sender_id === user1Id && m.receiver_id === user2Id) ||
             (m.sender_id === user2Id && m.receiver_id === user1Id)
      )
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  };

  const markMessagesAsRead = (contactId: number) => {
    if (!currentUser) return;
    setMessages(prev =>
      prev.map(m =>
        m.receiver_id === currentUser.id && m.sender_id === contactId && !m.is_read
          ? { ...m, is_read: true, updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19) }
          : m
      )
    );
  };

  const sendMessage = (receiverId: number, messageText: string): Message | null => {
    if (!currentUser) {
      showToast('Silakan login terlebih dahulu untuk mengirim pesan.', 'error');
      return null;
    }

    if (!messageText.trim()) {
      showToast('Pesan tidak boleh kosong.', 'warning');
      return null;
    }

    // Role-based Access Control
    if (currentUser.role === 'director') {
      showToast('Akses ditolak: Direktur tidak memiliki akses ke fitur chat privat antara Mentor dan Intern.', 'error');
      return null;
    }

    if (currentUser.role === 'intern') {
      if (currentUser.mentor_id !== receiverId) {
        showToast('Peserta magang hanya dapat mengirim pesan ke mentor pembimbing langsung.', 'error');
        return null;
      }
    }

    if (currentUser.role === 'mentor') {
      const receiver = users.find(u => u.id === receiverId);
      if (!receiver || receiver.mentor_id !== currentUser.id) {
        showToast('Mentor hanya dapat mengirim pesan ke peserta magang yang dibimbing.', 'error');
        return null;
      }
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newMsg: Message = {
      id: Date.now(),
      sender_id: currentUser.id,
      receiver_id: receiverId,
      message: messageText.trim(),
      is_read: false,
      created_at: now,
      updated_at: now,
    };

    setMessages(prev => [...prev, newMsg]);
    return newMsg;
  };

  const resetAllData = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setTasks(INITIAL_TASKS);
    setAttachments(INITIAL_ATTACHMENTS);
    setFeedbacks(INITIAL_FEEDBACKS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setMessages(INITIAL_MESSAGES);
    setCompanySetting(INITIAL_COMPANY_SETTING);
    setAttendances(INITIAL_ATTENDANCES);
    setCurrentUser(INITIAL_USERS.find(u => u.id === 4) || INITIAL_USERS[0]);
    showToast('Data demo berhasil direset ke kondisi awal.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        tasks,
        attachments,
        feedbacks,
        notifications,
        activityLogs,
        messages,
        toasts,
        login,
        logout,
        switchUser,
        updateUserProfilePhoto,
        updateUserProfile,
        changePassword,
        createUser,
        updateUser,
        deleteUser,
        companySetting,
        updateCompanySetting,
        attendances,
        getTodayAttendance,
        clockIn,
        clockOut,
        submitPermit,
        submitLeave,
        getAttendancesForIntern,
        getAttendancesForMentor,
        createTask,
        assignTask,
        updateTask,
        deleteTask,
        submitTaskForReview,
        reviewTask,
        addAttachment,
        removeAttachment,
        unreadNotificationCount,
        markNotificationRead,
        markAllNotificationsRead,
        unreadMessageCount,
        sendMessage,
        markMessagesAsRead,
        getUnreadMessagesCount,
        getMessagesBetween,
        showToast,
        resetAllData,
        getTaskById,
        getUserById,
        getTasksForUser,
        getTasksForMentor,
        getInternsForMentor,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
