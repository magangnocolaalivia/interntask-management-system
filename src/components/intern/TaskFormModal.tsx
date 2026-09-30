import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, TaskCategory, TaskPriority, TaskStatus } from '../../types';
import { 
  X, UploadCloud, Link as LinkIcon, FileText, 
  Trash2, AlertCircle, CheckCircle2, Clock, 
  HelpCircle, Calendar 
} from 'lucide-react';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
}) => {
  const { createTask, updateTask, addAttachment, showToast } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Development');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [estimatedDuration, setEstimatedDuration] = useState<number>(4);
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<TaskStatus>('In Progress');
  const [result, setResult] = useState('');
  const [obstacles, setObstacles] = useState('');
  const [repositoryLink, setRepositoryLink] = useState('');
  const [deploymentLink, setDeploymentLink] = useState('');
  const [figmaLink, setFigmaLink] = useState('');

  // Uploaded mock files
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; type: string; size: string }[]>([]);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setTaskDate(taskToEdit.task_date);
      setDeadline(taskToEdit.deadline);
      setCategory(taskToEdit.category);
      setPriority(taskToEdit.priority);
      setEstimatedDuration(taskToEdit.estimated_duration);
      setProgress(taskToEdit.progress);
      setStatus(taskToEdit.status);
      setResult(taskToEdit.result || '');
      setObstacles(taskToEdit.obstacles || '');
      setRepositoryLink(taskToEdit.repository_link || '');
      setDeploymentLink(taskToEdit.deployment_link || '');
      setFigmaLink(taskToEdit.figma_link || '');
    } else {
      // Reset form
      setTitle('');
      setDescription('');
      setTaskDate(new Date().toISOString().split('T')[0]);
      setDeadline(
        new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      );
      setCategory('Development');
      setPriority('Medium');
      setEstimatedDuration(4);
      setProgress(0);
      setStatus('In Progress');
      setResult('');
      setObstacles('');
      setRepositoryLink('');
      setDeploymentLink('');
      setFigmaLink('');
      setUploadedFiles([]);
    }
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newFile = {
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      };
      setUploadedFiles(prev => [...prev, newFile]);
      showToast(`File "${file.name}" berhasil dipilih sebagai lampiran.`, 'info');
    }
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (targetStatus: TaskStatus) => {
    if (!title.trim()) {
      showToast('Judul tugas wajib diisi!', 'error');
      return;
    }

    if (!description.trim()) {
      showToast('Deskripsi pekerjaan wajib diisi!', 'error');
      return;
    }

    if (taskToEdit) {
      updateTask(taskToEdit.id, {
        title,
        description,
        task_date: taskDate,
        deadline,
        category,
        priority,
        estimated_duration: Number(estimatedDuration),
        progress: Number(progress),
        status: targetStatus,
        result,
        obstacles,
        repository_link: repositoryLink,
        deployment_link: deploymentLink,
        figma_link: figmaLink,
      });

      // Attach any new files
      uploadedFiles.forEach(f => {
        addAttachment(taskToEdit.id, {
          file_name: f.name,
          file_type: f.type,
          file_size: f.size,
          file_path: `/uploads/${f.name}`,
        });
      });
    } else {
      const newTask = createTask({
        title,
        description,
        task_date: taskDate,
        deadline,
        category,
        priority,
        estimated_duration: Number(estimatedDuration),
        progress: Number(progress),
        status: targetStatus,
        result,
        obstacles,
        repository_link: repositoryLink,
        deployment_link: deploymentLink,
        figma_link: figmaLink,
      });

      // Attach any files to new task
      uploadedFiles.forEach(f => {
        addAttachment(newTask.id, {
          file_name: f.name,
          file_type: f.type,
          file_size: f.size,
          file_path: `/uploads/${f.name}`,
        });
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-3xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              {taskToEdit ? 'Edit Daily Task' : 'Tambah Daily Task Baru'}
            </h3>
            <p className="text-xs text-slate-500">
              Formulir pencatatan tugas harian peserta magang
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Section 1: Informasi Dasar */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              1. Informasi Pokok Tugas
            </h4>

            {/* Judul */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Judul Task <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Audit Fitur Reporting Asset & Optimasi Query"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-800"
                required
              />
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Deskripsi Pekerjaan <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Jelaskan secara spesifik apa yang akan dikerjakan, latar belakang, dan cakupan tugas..."
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-800"
                required
              />
            </div>

            {/* Tanggal & Deadline & Durasi */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Tanggal Task <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={taskDate}
                  onChange={(e) => setTaskDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-800 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Deadline <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-800 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Estimasi Durasi (Jam)
                </label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-800 bg-white"
                />
              </div>
            </div>

            {/* Kategori & Prioritas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Kategori Tugas <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TaskCategory)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-700 focus:outline-none bg-white"
                >
                  <option value="Development">Development (Fitur / Coding)</option>
                  <option value="Testing">Testing (QA / Bug Hunting)</option>
                  <option value="Documentation">Documentation (API / Manual)</option>
                  <option value="Meeting">Meeting (Daily Standup / Sync)</option>
                  <option value="Research">Research (Eksplorasi Teknologi)</option>
                  <option value="Design">Design (Figma / UI Mockup)</option>
                  <option value="Other">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Tingkat Prioritas <span className="text-rose-500">*</span>
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-700 focus:outline-none bg-white"
                >
                  <option value="Low">Low — Prioritas Rendah</option>
                  <option value="Medium">Medium — Prioritas Sedang</option>
                  <option value="High">High — Prioritas Tinggi</option>
                  <option value="Urgent">Urgent — Sangat Mendesak</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Progress & Output */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              2. Progress Pengerjaan &amp; Output
            </h4>

            {/* Slider Progress */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-800">
                  Kemajuan Pengerjaan (Progress): <span className="text-teal-700 font-bold">{progress}%</span>
                </label>
                <span className="text-[11px] text-slate-400">0% (Baru mulai) — 100% (Selesai)</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Hasil / Output */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Hasil / Output Pekerjaan
              </label>
              <textarea
                value={result}
                onChange={(e) => setResult(e.target.value)}
                rows={2}
                placeholder="Ringkas hasil yang telah diselesaikan (Contoh: Menambahkan 3 endpoint REST API dan migrasi tabel)."
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-800"
              />
            </div>

            {/* Kendala / Hambatan */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Kendala / Hambatan (Obstacles)
              </label>
              <textarea
                value={obstacles}
                onChange={(e) => setObstacles(e.target.value)}
                rows={2}
                placeholder="Tuliskan kendala teknis atau kebutuhan bantuan dari mentor jika ada..."
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-800"
              />
            </div>
          </div>

          {/* Section 3: Tautan Proyek */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              3. Tautan Bukti Pekerjaan (Repository, Deployment, Figma)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Link Repository (GitHub/GitLab)
                </label>
                <input
                  type="url"
                  value={repositoryLink}
                  onChange={(e) => setRepositoryLink(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Link Deployment / Staging
                </label>
                <input
                  type="url"
                  value={deploymentLink}
                  onChange={(e) => setDeploymentLink(e.target.value)}
                  placeholder="https://app-staging.domain.com"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Link Figma / Desain
                </label>
                <input
                  type="url"
                  value={figmaLink}
                  onChange={(e) => setFigmaLink(e.target.value)}
                  placeholder="https://figma.com/file/..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Upload Bukti Pekerjaan */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              4. Unggah File Bukti Pekerjaan (Screenshots / Dokumentasi)
            </h4>

            <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
              <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-700">
                Klik atau seret file ke sini untuk mengunggah
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Mendukung gambar (PNG, JPG), PDF, DOCX (Maks 10MB)
              </p>
              <input
                type="file"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
                title="Pilih file bukti tugas"
              />
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2 mt-2">
                {uploadedFiles.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                      <span className="font-medium text-slate-800 truncate">{file.name}</span>
                      <span className="text-slate-400 text-[11px] shrink-0">({file.size})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeUploadedFile(i)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>

          <div className="flex items-center flex-wrap gap-2">
            {/* Simpan sebagai Draft */}
            <button
              type="button"
              onClick={() => handleSubmit('Draft')}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors shadow-2xs cursor-pointer"
            >
              Simpan sbg Draft
            </button>

            {/* Simpan In Progress */}
            <button
              type="button"
              onClick={() => handleSubmit('In Progress')}
              className="px-4 py-2 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 rounded-xl transition-colors cursor-pointer"
            >
              Simpan &amp; Kerjakan
            </button>

            {/* Kirim Review */}
            <button
              type="button"
              onClick={() => handleSubmit('Submitted')}
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan &amp; Kirim Review</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
