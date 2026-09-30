import React, { useState } from 'react';
import { User, TaskPriority, TaskCategory } from '../../types';
import { useApp } from '../../context/AppContext';
import { UserAvatar } from '../common/UserAvatar';
import { 
  X, CheckSquare, Calendar, Clock, AlertCircle, 
  Send, Sparkles, UserCheck, Building2, BookOpen,
  Paperclip, Globe, UploadCloud, Trash2, FileText, ExternalLink
} from 'lucide-react';

interface AssignTaskModalProps {
  intern: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AssignTaskModal: React.FC<AssignTaskModalProps> = ({
  intern,
  isOpen,
  onClose,
}) => {
  const { assignTask, showToast } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadlineDate, setDeadlineDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [deadlineTime, setDeadlineTime] = useState('17:00');
  const [priority, setPriority] = useState<TaskPriority>('High');
  const [category, setCategory] = useState<TaskCategory>('Development');
  const [estimatedDuration, setEstimatedDuration] = useState<number>(4);
  const [referenceUrl, setReferenceUrl] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentData, setAttachmentData] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !intern) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Ukuran file maksimal adalah 10 MB.');
      return;
    }

    setAttachmentName(file.name);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachmentData(event.target?.result as string || file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setAttachmentName('');
    setAttachmentData(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg('Judul tugas wajib diisi.');
      return;
    }

    if (!description.trim()) {
      setErrorMsg('Deskripsi instruksi tugas wajib diisi.');
      return;
    }

    if (!deadlineDate) {
      setErrorMsg('Tenggat waktu (deadline) wajib ditentukan.');
      return;
    }

    const fullDeadline = `${deadlineDate} ${deadlineTime || '17:00'}:00`;

    setIsSubmitting(true);
    const result = assignTask(intern.id, {
      title: title.trim(),
      description: description.trim(),
      deadline: fullDeadline,
      priority,
      category,
      estimated_duration: Number(estimatedDuration) || 4,
      mentor_attachment_path: attachmentData || (attachmentName ? `/uploads/documents/${attachmentName}` : null),
      mentor_reference_url: referenceUrl.trim() || null,
    });
    setIsSubmitting(false);

    if (result.success) {
      // Reset form & close
      setTitle('');
      setDescription('');
      setReferenceUrl('');
      setAttachmentName('');
      setAttachmentData(null);
      setErrorMsg(null);
      onClose();
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-6">
        {/* Header Modal */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center shrink-0">
              <CheckSquare className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span>Beri Tugas Baru (Assign Task)</span>
              </h2>
              <p className="text-xs text-slate-500">
                Instruksikan penugasan kerja wajib untuk peserta magang
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Intern Mini Profile Card */}
        <div className="px-5 pt-4 pb-1">
          <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-xl flex items-center gap-3">
            <UserAvatar user={intern} size="md" className="ring-1 ring-teal-200" />
            <div className="space-y-0.5 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-slate-800 truncate">{intern.name}</h4>
                <span className="text-[10px] font-semibold text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded-full">
                  Penerima Tugas
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{intern.institution || 'Politeknik Negeri Malang'}</span>
                <span>•</span>
                <BookOpen className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{intern.study_program || 'Teknik Informatika'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs max-h-[72vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-start gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Judul Tugas */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Judul Tugas <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Implementasi Modul Autentikasi OAuth2 atau Riset Arsitektur"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none transition-all"
            />
          </div>

          {/* Deskripsi Instruksi */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Deskripsi Instruksi &amp; Kriteria Penerimaan <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan detail instruksi, langkah pengerjaan, format deliverable, atau batasan teknologi..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none transition-all"
            />
          </div>

          {/* Lampiran File (Opsional) */}
          <div className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-700 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-teal-600" />
                <span>Lampiran File (Opsional)</span>
              </label>
              <span className="text-[10px] text-slate-400">PDF, ZIP, RAR, JPG, PNG (Maks 10MB)</span>
            </div>

            {attachmentName ? (
              <div className="flex items-center justify-between p-2.5 bg-white border border-teal-200 rounded-lg text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">{attachmentName}</span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                  title="Hapus file lampiran"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="file"
                  id="mentor-file-upload"
                  accept=".pdf,.zip,.rar,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="mentor-file-upload"
                  className="flex items-center justify-center gap-2 p-2.5 bg-white border border-dashed border-slate-300 hover:border-teal-400 hover:bg-teal-50/30 rounded-lg cursor-pointer transition-all text-slate-600 text-xs font-medium"
                >
                  <UploadCloud className="w-4 h-4 text-slate-400" />
                  <span>Pilih file referensi tugas...</span>
                </label>
              </div>
            )}
          </div>

          {/* Link Referensi / Repository (Opsional) */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-teal-600" />
              <span>Link Referensi / Repository (Opsional)</span>
            </label>
            <input
              type="url"
              value={referenceUrl}
              onChange={(e) => setReferenceUrl(e.target.value)}
              placeholder="https://github.com/organization/repo atau https://figma.com/..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Grid: Kategori & Prioritas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Kategori Pekerjaan
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none cursor-pointer"
              >
                <option value="Development">Development (Koding / Backend / Frontend)</option>
                <option value="Testing">Testing &amp; QA</option>
                <option value="Documentation">Documentation &amp; Report</option>
                <option value="Meeting">Meeting &amp; Koordinasi</option>
                <option value="Research">Research &amp; Analisis</option>
                <option value="Design">Design &amp; UI/UX</option>
                <option value="Other">Other (Lainnya)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tingkat Prioritas <span className="text-rose-500">*</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none cursor-pointer"
              >
                <option value="Low">🟢 Low (Rendah)</option>
                <option value="Medium">🟡 Medium (Sedang)</option>
                <option value="High">🟠 High (Tinggi)</option>
                <option value="Urgent">🔴 Urgent (Mendesak / Kritis)</option>
              </select>
            </div>
          </div>

          {/* Grid: Tenggat Waktu & Estimasi Jam */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tenggat Waktu (Due Date) <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  required
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                <input
                  type="time"
                  value={deadlineTime}
                  onChange={(e) => setDeadlineTime(e.target.value)}
                  className="w-24 px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Estimasi Waktu (Jam Kerja)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(Number(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                <span className="text-xs text-slate-500 font-medium shrink-0">Jam</span>
              </div>
            </div>
          </div>

          {/* Notice box */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <span>
              Tugas ini akan otomatis masuk ke halaman <strong>Daily Tasks</strong> milik {intern.name} dengan badge khusus <strong>&ldquo;Dari Mentor&rdquo;</strong> dan berstatus <em>In Progress</em>.
            </span>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Menugaskan...' : 'Kirim Penugasan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
