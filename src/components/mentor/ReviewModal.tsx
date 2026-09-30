import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task } from '../../types';
import { 
  X, CheckCircle2, AlertTriangle, XCircle, 
  UserCheck 
} from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onSuccess: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  task,
  onSuccess,
}) => {
  const { reviewTask, showToast } = useApp();

  const [action, setAction] = useState<'approved' | 'revision' | 'rejected'>('approved');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if ((action === 'revision' || action === 'rejected') && !feedbackMessage.trim()) {
      showToast(
        action === 'revision' 
          ? 'Feedback revisi wajib diisi agar peserta tahu bagian yang harus diperbaiki!' 
          : 'Alasan penolakan tugas wajib diisi!',
        'error'
      );
      return;
    }

    const message = feedbackMessage.trim() || 'Tugas telah diverifikasi dan disetujui tanpa catatan tambahan.';
    const success = reviewTask(task.id, action, message);
    if (success) {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Validasi &amp; Review Tugas</h3>
              <p className="text-xs text-slate-500">Evaluasi pengerjaan peserta magang</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task Summary Banner */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs">
          <p className="font-semibold text-slate-800 line-clamp-1">{task.title}</p>
          <div className="flex items-center gap-3 text-slate-500 mt-1">
            <span>Intern: <strong className="text-slate-700">{task.user?.name}</strong></span>
            <span>&bull;</span>
            <span>Progress: <strong className="text-slate-700">{task.progress}%</strong></span>
            <span>&bull;</span>
            <span>Durasi: <strong className="text-slate-700">{task.estimated_duration} Jam</strong></span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Action Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Pilih Keputusan Review:
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {/* Approve */}
              <button
                type="button"
                onClick={() => setAction('approved')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  action === 'approved'
                    ? 'border-teal-500 bg-teal-50 text-teal-900 ring-2 ring-teal-500/20 font-bold'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className={`w-5 h-5 ${action === 'approved' ? 'text-teal-600' : 'text-slate-400'}`} />
                <span className="text-xs">Approve</span>
                <span className="text-[10px] text-slate-400 font-normal">Selesai 100%</span>
              </button>

              {/* Revision */}
              <button
                type="button"
                onClick={() => setAction('revision')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  action === 'revision'
                    ? 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-500/20 font-bold'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <AlertTriangle className={`w-5 h-5 ${action === 'revision' ? 'text-amber-600' : 'text-slate-400'}`} />
                <span className="text-xs">Revision</span>
                <span className="text-[10px] text-slate-400 font-normal">Perlu Perbaikan</span>
              </button>

              {/* Reject */}
              <button
                type="button"
                onClick={() => setAction('rejected')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  action === 'rejected'
                    ? 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-500/20 font-bold'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <XCircle className={`w-5 h-5 ${action === 'rejected' ? 'text-rose-600' : 'text-slate-400'}`} />
                <span className="text-xs">Reject</span>
                <span className="text-[10px] text-slate-400 font-normal">Tolak Tugas</span>
              </button>
            </div>
          </div>

          {/* Feedback Message */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Catatan &amp; Arahan Evaluasi Mentor{' '}
              {action !== 'approved' ? <span className="text-rose-500">* (Wajib diisi)</span> : '(Opsional)'}
            </label>
            <textarea
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              rows={4}
              placeholder={
                action === 'approved'
                  ? 'Opsional: Berikan apresiasi atau catatan positif kepada peserta magang...'
                  : action === 'revision'
                  ? 'Wajib: Jelaskan secara detail bagian mana yang harus diperbaiki, file/kode mana yang belum tuntas...'
                  : 'Wajib: Jelaskan alasan mengapa tugas ini tidak dapat diterima...'
              }
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              required={action !== 'approved'}
            />
          </div>

          {/* Action Button */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-xs font-semibold text-white rounded-xl shadow-xs transition-colors cursor-pointer ${
                action === 'approved'
                  ? 'bg-teal-600 hover:bg-teal-700'
                  : action === 'revision'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              Simpan Keputusan Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
