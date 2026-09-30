import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserAvatar } from '../common/UserAvatar';
import { 
  Building2, BookOpen, Phone, Calendar, UserCheck, 
  Upload, Trash2, Shield, AlertCircle, CheckCircle2, 
  HardDrive, Info, FileImage, Lock, Key, Eye, EyeOff, Check
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { currentUser, getUserById, updateUserProfilePhoto, updateUserProfile, changePassword } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Edit fields synchronized with currentUser
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [institution, setInstitution] = useState(currentUser?.institution || '');
  const [studyProgram, setStudyProgram] = useState(currentUser?.study_program || '');

  // Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [isSubmittingPass, setIsSubmittingPass] = useState(false);

  // Form State Cleanup & Synchronization on Account Switch
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setInstitution(currentUser.institution || '');
      setStudyProgram(currentUser.study_program || '');
      setUploadError(null);
      setUploadSuccess(null);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPassError(null);
      setPassSuccess(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [currentUser?.id, currentUser?.name, currentUser?.email, currentUser?.phone]);

  if (!currentUser) return null;

  const mentor = currentUser.mentor_id ? getUserById(currentUser.mentor_id) : null;

  const validateAndProcessFile = (file: File) => {
    setUploadError(null);
    setUploadSuccess(null);

    // 1. Validate MIME type (JPG, PNG, JPEG)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Format file tidak didukung! File wajib berupa gambar format JPG, JPEG, atau PNG.');
      return;
    }

    // 2. Validate max size (2MB = 2 * 1024 * 1024 bytes)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setUploadError(`Ukuran file terlalu besar (${sizeMB} MB)! Maksimal ukuran foto profil adalah 2.00 MB.`);
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target?.result as string;
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `profiles/user_${currentUser.id}_${Date.now()}_${sanitizedFileName}`;
      
      updateUserProfilePhoto(result, storagePath);
      setIsProcessing(false);
      setUploadSuccess(`Foto profil berhasil diperbarui! Disimpan ke storage/app/public/${storagePath}`);
      
      setTimeout(() => {
        setUploadSuccess(null);
      }, 5000);
    };

    reader.onerror = () => {
      setIsProcessing(false);
      setUploadError('Gagal membaca file gambar. Silakan coba kembali.');
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemovePhoto = () => {
    if (confirm('Apakah Anda yakin ingin menghapus foto profil dan kembali ke avatar inisial default?')) {
      updateUserProfilePhoto(null, null);
      setUploadSuccess('Foto profil berhasil dihapus. Menggunakan inisial nama.');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveProfileData = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      phone,
      institution,
      study_program: studyProgram,
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (!oldPassword) {
      setPassError('Kata sandi lama wajib diisi.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPassError('Kata sandi baru minimal harus 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('Konfirmasi kata sandi baru tidak cocok. Silakan ketik ulang.');
      return;
    }

    setIsSubmittingPass(true);
    const result = changePassword(oldPassword, newPassword);
    setIsSubmittingPass(false);

    if (result.success) {
      setPassSuccess('Kata sandi akun Anda berhasil diperbarui!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassSuccess(null), 5000);
    } else {
      setPassError(result.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Manajemen Profil &amp; Foto Pengguna</h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola data diri, upload foto profil ke storage publik, dan tinjau hak akses role sistem
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border shadow-2xs ${
            currentUser.role === 'director' ? 'bg-rose-50 text-rose-700 border-rose-200' :
            currentUser.role === 'mentor' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
            'bg-teal-50 text-teal-700 border-teal-200'
          }`}>
            <Shield className="w-3.5 h-3.5" />
            <span>Role: {currentUser.role}</span>
          </span>
        </div>
      </div>

      {/* Grid: Photo Upload & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Photo Upload Form */}
        <div className="lg:col-span-1 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FileImage className="w-4 h-4 text-teal-600" />
              <span>Foto Profil Akun</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Tampil di Sidebar, Navbar, dan Riwayat Tugas
            </p>
          </div>

          {/* Current Avatar Display */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-3">
            <UserAvatar user={currentUser} size="xl" className="ring-4 ring-white shadow-md" />
            <div>
              <p data-user-name className="text-xs font-bold text-slate-800">{currentUser.name}</p>
              <p data-user-email className="text-[11px] text-slate-500 truncate max-w-[200px]">{currentUser.email}</p>
              <p className="text-[10px] font-mono text-slate-400 mt-1">
                Path: {currentUser.profile_photo_path || '(Avatar Default / Inisial)'}
              </p>
            </div>
          </div>

          {/* Upload Form with enctype multipart/form-data */}
          <form 
            onSubmit={(e) => e.preventDefault()} 
            encType="multipart/form-data"
            className="space-y-3"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/jpg"
              className="hidden"
              id="profile_photo_input"
            />

            {/* Drag & Drop Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`p-4 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
                isDragging 
                  ? 'border-teal-500 bg-teal-50/50' 
                  : 'border-slate-200 hover:border-teal-400 hover:bg-slate-50'
              }`}
            >
              <Upload className="w-6 h-6 text-teal-600 mx-auto mb-1.5" />
              <p className="text-xs font-bold text-slate-700">
                Pilih atau Tarik Foto ke Sini
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                PNG, JPG, atau JPEG (Maks. 2MB)
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="flex-1 py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isProcessing ? 'Memproses...' : 'Ganti Foto'}</span>
              </button>

              {(currentUser.profile_photo_path || currentUser.avatar) && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="py-2 px-3 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  title="Hapus foto dan gunakan avatar inisial default"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Hapus</span>
                </button>
              )}
            </div>

            {/* Validation Alerts */}
            {uploadError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="p-3 bg-teal-50 border border-teal-200 text-teal-800 text-xs rounded-lg flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-teal-600" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            {/* Backend Tech Spec Note */}
            <div className="pt-2 border-t border-slate-100">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[10px] text-slate-500 space-y-1">
                <div className="flex items-center gap-1 font-bold text-slate-700">
                  <HardDrive className="w-3 h-3 text-teal-600" />
                  <span>Spesifikasi Storage Laravel:</span>
                </div>
                <p>• Directory: <code className="font-mono text-slate-700">storage/app/public/profiles</code></p>
                <p>• Symlink: <code className="font-mono text-slate-700">php artisan storage:link</code></p>
                <p>• Kolom DB: <code className="font-mono text-slate-700">users.profile_photo_path</code></p>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Personal Data & Credentials */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Form */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Informasi Pribadi &amp; Akun</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Perbarui identitas profil dan kontak yang dapat dihubungi
                </p>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">ID Pengguna: #{currentUser.id}</span>
            </div>

            <form onSubmit={handleSaveProfileData} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    id="profile_input_name"
                    data-field="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Alamat Email (Akun Login)
                  </label>
                  <input
                    id="profile_input_email"
                    data-field="email"
                    type="email"
                    value={currentUser.email}
                    disabled
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed font-medium"
                    title="Alamat email akun bersifat permanen"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nomor WhatsApp / Telepon
                  </label>
                  <input
                    id="profile_input_phone"
                    data-field="phone"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+62 821-xxxx-xxxx"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Institusi / Universitas / Perusahaan
                  </label>
                  <input
                    id="profile_input_institution"
                    data-field="institution"
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Program Studi / Divisi Kerja
                  </label>
                  <input
                    id="profile_input_study_program"
                    data-field="study_program"
                    type="text"
                    value={studyProgram}
                    onChange={(e) => setStudyProgram(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs rounded-lg transition-colors shadow-2xs cursor-pointer"
                >
                  Simpan Perubahan Profil
                </button>
              </div>
            </form>
          </div>

          {/* Academic & Supervisor Detail Card */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-500" />
              <span>Detail Penugasan &amp; Pembimbing</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-medium">Periode Program:</span>
                <p className="font-bold text-slate-800 flex items-center gap-2 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  {currentUser.internship_start || '2026-07-01'} s/d {currentUser.internship_end || '2026-12-31'}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-medium">Divisi Operasional:</span>
                <p className="font-bold text-slate-800 flex items-center gap-2 text-xs">
                  <Building2 className="w-3.5 h-3.5 text-teal-600" />
                  {currentUser.division || 'Software Engineering'}
                </p>
              </div>

              {mentor && (
                <div className="p-3.5 bg-teal-50/50 rounded-xl border border-teal-200 space-y-1 sm:col-span-2">
                  <span className="text-teal-700 font-medium">Mentor Pembimbing Langsung:</span>
                  <p className="font-bold text-slate-800 flex items-center gap-2 text-xs">
                    <UserCheck className="w-4 h-4 text-teal-600" />
                    {mentor.name} ({mentor.email}) • {mentor.phone || '+62 812-3456-7890'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Keamanan Akun & Form Ganti Password (Vertical Stacking Layout for Mobile / iPhone 13 & Desktop) */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Key className="w-4 h-4 text-teal-600" />
                  <span>Keamanan Akun &amp; Ganti Password</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Perbarui kata sandi akun Anda secara berkala untuk menjaga keamanan data instansi
                </p>
              </div>
              <span className="px-2.5 py-1 bg-zinc-100 text-zinc-700 text-[10px] font-bold rounded-md border border-zinc-200 font-mono">
                Semua Role
              </span>
            </div>

            {passError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-start gap-2.5 text-xs animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{passError}</span>
              </div>
            )}

            {passSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-start gap-2.5 text-xs animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{passSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              {/* Vertical Field 1: Password Lama */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">
                  Kata Sandi Lama (Saat Ini) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showOldPass ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Masukkan kata sandi lama Anda"
                    required
                    className="w-full pl-9 pr-10 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none transition-all font-mono"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors cursor-pointer"
                    title={showOldPass ? 'Sembunyikan' : 'Tampilkan'}
                  >
                    {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Vertical Field 2: Password Baru */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-slate-700">
                    Kata Sandi Baru <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Minimal 6 karakter</span>
                </div>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter baru"
                    required
                    className="w-full pl-9 pr-10 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none transition-all font-mono"
                  />
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors cursor-pointer"
                    title={showNewPass ? 'Sembunyikan' : 'Tampilkan'}
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Vertical Field 3: Konfirmasi Password Baru */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">
                  Konfirmasi Kata Sandi Baru <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang kata sandi baru"
                    required
                    className={`w-full pl-9 pr-10 py-2.5 bg-zinc-50 border rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none transition-all font-mono ${
                      confirmPassword && newPassword !== confirmPassword
                        ? 'border-rose-300 bg-rose-50/30'
                        : confirmPassword && newPassword === confirmPassword
                        ? 'border-emerald-300 bg-emerald-50/30'
                        : 'border-zinc-200'
                    }`}
                  />
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors cursor-pointer"
                    title={showConfirmPass ? 'Sembunyikan' : 'Tampilkan'}
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>Kata sandi tidak cocok</span>
                  </p>
                )}
                {confirmPassword && newPassword === confirmPassword && (
                  <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Kata sandi cocok</span>
                  </p>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingPass}
                  className="w-full sm:w-auto px-5 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isSubmittingPass ? 'Menyimpan...' : 'Perbarui Kata Sandi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
