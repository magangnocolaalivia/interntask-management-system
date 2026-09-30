import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import { 
  Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, 
  Building2, HelpCircle, X, CheckCircle2, AlertCircle, Sparkles
} from 'lucide-react';

interface LoginViewProps {
  onSuccess: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const { login, companySetting } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Alamat email dan kata sandi wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    const user = login(email.trim(), password);
    setIsSubmitting(false);

    if (user) {
      onSuccess(user);
    } else {
      setErrorMessage('Email atau kata sandi yang Anda masukkan tidak sesuai. Silakan periksa kembali.');
    }
  };

  const handleFillCredentials = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen w-full bg-zinc-50 flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 selection:bg-teal-100 selection:text-teal-900">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/images/logo.png" 
            alt="InternTask Logo" 
            className="h-9 w-auto object-contain shrink-0" 
          />
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-slate-800 tracking-tight">
              Intern<span className="text-teal-600">Task</span>
            </span>
            <span className="text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-zinc-200">
              Corporate Portal
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
          <Building2 className="w-4 h-4 text-teal-600" />
          <span>{companySetting?.company_name || 'PT InternTask Indonesia'}</span>
        </div>
      </div>

      {/* Main Form Center Card */}
      <div className="w-full max-w-md mx-auto my-auto py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-7 sm:p-9 space-y-6">
          {/* Logo & Headline */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 text-teal-600 mb-1">
              <img 
                src="/images/logo.png" 
                alt="InternTask" 
                className="h-9 w-auto object-contain"
              />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Selamat Datang Kembali
            </h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Silakan masuk ke portal manajemen magang &amp; evaluasi kinerja instansi
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-start gap-2.5 text-xs animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Alamat Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  autoFocus
                  className="w-full pl-9 pr-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none transition-all"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Password Input with Eye Toggle */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none transition-all font-mono"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors cursor-pointer"
                  title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-zinc-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                <span>Ingat saya</span>
              </label>

              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(true)}
                className="text-teal-600 hover:text-teal-700 font-semibold transition-colors cursor-pointer"
              >
                Lupa kata sandi?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              <span>{isSubmitting ? 'Memproses Masuk...' : 'Masuk ke Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Select Preset Helpers (Clean Accordion / Helper for Enterprise Users) */}
          <div className="pt-4 border-t border-zinc-100">
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
              <span className="font-semibold text-slate-600">Pilih Akun Instansi Terdaftar:</span>
              <span className="text-[10px] text-slate-400 font-mono">Password: password</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <button
                type="button"
                onClick={() => handleFillCredentials('director@example.com')}
                className="p-2 rounded-lg bg-zinc-50 hover:bg-teal-50 hover:text-teal-700 border border-zinc-200 text-[11px] font-medium text-slate-700 transition-colors cursor-pointer"
              >
                👔 Direktur
              </button>
              <button
                type="button"
                onClick={() => handleFillCredentials('mentor1@example.com')}
                className="p-2 rounded-lg bg-zinc-50 hover:bg-teal-50 hover:text-teal-700 border border-zinc-200 text-[11px] font-medium text-slate-700 transition-colors cursor-pointer"
              >
                🧑‍🏫 Mentor
              </button>
              <button
                type="button"
                onClick={() => handleFillCredentials('intern1@example.com')}
                className="p-2 rounded-lg bg-zinc-50 hover:bg-teal-50 hover:text-teal-700 border border-zinc-200 text-[11px] font-medium text-slate-700 transition-colors cursor-pointer"
              >
                🎓 Intern
              </button>
            </div>
          </div>

          {/* Enterprise Notice */}
          <div className="pt-2 text-center">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Pendaftaran akun baru dikelola secara terpusat oleh Departemen HRD &amp; Manajemen Perusahaan.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto w-full text-center text-xs text-slate-400">
        <p>© 2026 InternTask Platform. Dilindungi Hak Cipta Perusahaan.</p>
      </div>

      {/* Forgot Password Information Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2 text-slate-800">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold">Lupa Kata Sandi Akun</h3>
              </div>
              <button
                onClick={() => setShowForgotPasswordModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                Untuk menjaga keamanan data operasional perusahaan dan hak akses terverifikasi, prosedur pemulihan kata sandi dilakukan melalui Administrator instansi:
              </p>
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-slate-800 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>Petunjuk Pemulihan:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-500 pl-1">
                  <li>Hubungi <strong>Administrator Sistem</strong> atau <strong>Direktur Perusahaan</strong>.</li>
                  <li>Sebutkan <strong>NIM / Nama Lengkap / Email</strong> yang terdaftar pada sistem magang.</li>
                  <li>Admin akan mereset kata sandi Anda ke kata sandi default (<code className="font-mono text-teal-700">password</code>).</li>
                </ul>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(false)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
