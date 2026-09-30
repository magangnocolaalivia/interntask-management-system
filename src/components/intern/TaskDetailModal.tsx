import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { 
  X, Calendar, Clock, GitPullRequest, Globe, 
  Figma, Paperclip, MessageSquare, History, 
  Send, Edit, Trash2, CheckCircle, ShieldAlert, 
  UserCheck, Download, ExternalLink, Sparkles 
} from 'lucide-react';
import { ReviewModal } from '../mentor/ReviewModal';

interface TaskDetailModalProps {
  taskId: number | null;
  onClose: () => void;
  onEdit?: (task: Task) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  taskId,
  onClose,
  onEdit,
}) => {
  const { 
    currentUser, 
    getTaskById, 
    submitTaskForReview, 
    deleteTask, 
    showToast 
  } = useApp();

  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  if (!taskId) return null;
  const task = getTaskById(taskId);
  if (!task) return null;

  const isOwner = currentUser?.id === task.user_id;
  const isMentor = currentUser?.role === 'mentor';
  const isDirector = currentUser?.role === 'director';

  const handleSendForReview = () => {
    if (confirm('Kirim task ini kepada Mentor untuk ditinjau dan divalidasi?')) {
      submitTaskForReview(task.id);
      onClose();
    }
  };

  const handleDelete = () => {
    if (confirm('Yakin ingin menghapus task draft ini?')) {
      deleteTask(task.id);
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-4xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-slate-700 font-bold bg-white px-2.5 py-1 rounded-md border border-slate-200">
                TASK-{task.id.toString().padStart(3, '0')}
              </span>
              <StatusBadge status={task.status} size="md" />
              <PriorityBadge priority={task.priority} size="md" />
            </div>

            <div className="flex items-center gap-2">
              {isDirector && (
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
                  Mode Monitoring Direktur (Read-Only)
                </span>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
            {/* Title & Description */}
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                {(task.is_assigned || task.assigned_by) && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    <span>Ditugaskan oleh Mentor {task.assigner_name ? `(${task.assigner_name})` : ''}</span>
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-800 leading-snug">
                {task.title}
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                  Intern: <strong className="text-slate-800">{task.user?.name || 'Peserta'}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Tanggal: <strong className="text-slate-700">{task.task_date}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Deadline: <strong className="text-slate-700">{task.deadline}</strong>
                </span>
                <span>•</span>
                <span>Estimasi: <strong>{task.estimated_duration} Jam</strong></span>
              </div>
            </div>

            {/* Description Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Deskripsi Tugas
              </h4>
              <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                {task.description}
              </p>
            </div>

            {/* Lampiran & Referensi dari Mentor (Jika ada) */}
            {(task.mentor_attachment_path || task.mentor_reference_url) && (
              <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    <span>Lampiran &amp; Referensi dari Mentor</span>
                  </h4>
                  <span className="text-[10px] font-semibold text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded">
                    Instruksi Khusus
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  {/* Unduh Lampiran Button */}
                  {task.mentor_attachment_path && (
                    <a
                      href={task.mentor_attachment_path}
                      download={task.mentor_attachment_path.startsWith('data:') ? `Lampiran_Tugas_${task.id}.pdf` : undefined}
                      target={task.mentor_attachment_path.startsWith('data:') ? undefined : '_blank'}
                      rel="noreferrer"
                      onClick={(e) => {
                        const path = task.mentor_attachment_path;
                        if (path && !path.startsWith('data:') && !path.startsWith('http')) {
                          e.preventDefault();
                          const fileName = path.split('/').pop() || 'lampiran_tugas.pdf';
                          showToast(`Mengunduh file lampiran: ${fileName}`, 'info');
                          const link = document.createElement('a');
                          link.href = path;
                          link.setAttribute('download', fileName);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        } else {
                          showToast('Mengunduh lampiran tugas dari mentor...', 'info');
                        }
                      }}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-teal-300 text-teal-800 hover:bg-teal-600 hover:text-white hover:border-teal-600 font-semibold text-xs shadow-2xs transition-all cursor-pointer group"
                    >
                      <Paperclip className="w-4 h-4 text-teal-600 group-hover:text-white transition-colors" />
                      <span>Unduh Lampiran</span>
                      <Download className="w-3.5 h-3.5 text-teal-500 group-hover:text-white transition-colors" />
                    </a>
                  )}

                  {/* Buka Tautan Referensi Button */}
                  {task.mentor_reference_url && (
                    <a
                      href={task.mentor_reference_url.startsWith('http') ? task.mentor_reference_url : `https://${task.mentor_reference_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-teal-300 text-teal-800 hover:bg-teal-600 hover:text-white hover:border-teal-600 font-semibold text-xs shadow-2xs transition-all cursor-pointer group"
                    >
                      <Globe className="w-4 h-4 text-teal-600 group-hover:text-white transition-colors" />
                      <span>Buka Tautan Referensi</span>
                      <ExternalLink className="w-3.5 h-3.5 text-teal-500 group-hover:text-white transition-colors" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Progress Section */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center text-xs font-semibold mb-2">
                <span className="text-slate-700">Tingkat Kemajuan (Progress)</span>
                <span className="text-teal-700 font-bold">{task.progress}% Selesai</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-teal-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>

            {/* Hasil & Kendala (2-Column) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-1.5">
                  Hasil / Output Pekerjaan
                </h4>
                <p className="text-xs text-slate-700 whitespace-pre-line">
                  {task.result || 'Belum ada ringkasan hasil yang dilaporkan.'}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-1.5">
                  Kendala / Hambatan (Obstacles)
                </h4>
                <p className="text-xs text-slate-700 whitespace-pre-line">
                  {task.obstacles || 'Tidak ada kendala yang dilaporkan.'}
                </p>
              </div>
            </div>

            {/* Tautan Proyek (Links) */}
            {(task.repository_link || task.deployment_link || task.figma_link) && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Tautan Bukti Pekerjaan
                </h4>
                <div className="flex flex-wrap gap-2 text-xs">
                  {task.repository_link && (
                    <a
                      href={task.repository_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-teal-700 hover:border-teal-300 shadow-2xs transition-colors"
                    >
                      <GitPullRequest className="w-3.5 h-3.5 text-slate-600" />
                      <span>Repository Code</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  )}

                  {task.deployment_link && (
                    <a
                      href={task.deployment_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-teal-700 hover:border-teal-300 shadow-2xs transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5 text-teal-600" />
                      <span>Live Deployment</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  )}

                  {task.figma_link && (
                    <a
                      href={task.figma_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-teal-700 hover:border-teal-300 shadow-2xs transition-colors"
                    >
                      <Figma className="w-3.5 h-3.5 text-rose-500" />
                      <span>Desain Figma</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Lampiran / File Bukti Upload */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5" />
                Lampiran Berkas ({task.attachments?.length || 0})
              </h4>
              {task.attachments && task.attachments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {task.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    >
                      <div className="truncate mr-2">
                        <p className="font-semibold text-slate-800 truncate">{att.file_name}</p>
                        <p className="text-[10px] text-slate-400">
                          {att.file_type} • {att.file_size || '1.2 MB'}
                        </p>
                      </div>
                      <button
                        onClick={() => showToast(`Mengunduh file: ${att.file_name}`, 'info')}
                        className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                        title="Unduh Lampiran"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  Tidak ada file lampiran yang diunggah.
                </p>
              )}
            </div>

            {/* Feedback Mentor Section */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                Catatan &amp; Evaluasi Mentor ({task.feedback?.length || 0})
              </h4>
              {task.feedback && task.feedback.length > 0 ? (
                <div className="space-y-2">
                  {task.feedback.map((fb) => (
                    <div
                      key={fb.id}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">
                          {fb.mentor_name || 'Mentor Pembimbing'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{fb.created_at}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed italic">
                        "{fb.message}"
                      </p>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        fb.action === 'approved' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                        fb.action === 'revision' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        Tindakan: {fb.action}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  Belum ada feedback dari mentor untuk tugas ini.
                </p>
              )}
            </div>

            {/* Timeline Activity Logs Section */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                Riwayat &amp; Timeline Aktivitas
              </h4>
              <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {task.activity_logs && task.activity_logs.length > 0 ? (
                  task.activity_logs.map((log) => (
                    <div key={log.id} className="relative">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-teal-600 ring-4 ring-white" />
                      <div className="text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{log.user_name || 'System'}</span>
                          <span className="text-[10px] font-mono text-slate-400">{log.created_at}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-mono border border-slate-200">
                            {log.action}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1 leading-snug">{log.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">Belum ada riwayat aktivitas yang tercatat.</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            >
              Tutup
            </button>

            <div className="flex items-center flex-wrap gap-2">
              {/* Intern Actions */}
              {isOwner && (
                <>
                  {task.status === 'Draft' && (
                    <button
                      onClick={handleDelete}
                      className="px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1.5 border border-rose-200 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Draft</span>
                    </button>
                  )}

                  {task.status !== 'Completed' && task.status !== 'Approved' && onEdit && (
                    <button
                      onClick={() => {
                        onClose();
                        onEdit(task);
                      }}
                      className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5 text-slate-500" />
                      <span>{task.status === 'Revision' ? 'Perbaiki Revisi' : 'Edit Task'}</span>
                    </button>
                  )}

                  {(task.status === 'Draft' || task.status === 'In Progress' || task.status === 'Revision') && (
                    <button
                      onClick={handleSendForReview}
                      className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{task.status === 'Revision' ? 'Submit Ulang Revisi' : 'Kirim untuk Review'}</span>
                    </button>
                  )}
                </>
              )}

              {/* Mentor Actions */}
              {isMentor && (
                <button
                  onClick={() => setReviewModalOpen(true)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Review Task Ini</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal for Mentor */}
      {reviewModalOpen && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          task={task}
          onSuccess={() => {
            setReviewModalOpen(false);
            onClose();
          }}
        />
      )}
    </>
  );
};
