import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { ReportController, ReportFilterOptions } from '../../controllers/reports/ReportController';
import { 
  FileText, FileSpreadsheet, Download, Calendar, Search, 
  Filter, RotateCcw, Building2, User, Award, 
  CheckCircle2, Clock, AlertTriangle, TrendingUp, PieChart,
  Eye, Printer, X, ShieldCheck
} from 'lucide-react';

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

export const ReportView: React.FC = () => {
  const { currentUser, tasks, users, companySetting, showToast } = useApp();

  // Filters State
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-09-30');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [internFilter, setInternFilter] = useState('All');
  const [mentorFilter, setMentorFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // PDF Preview Modal
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [pdfHtmlContent, setPdfHtmlContent] = useState('');

  if (!currentUser) return null;

  // Filter options bundle
  const filterOptions: ReportFilterOptions = useMemo(() => ({
    startDate,
    endDate,
    status: statusFilter,
    category: categoryFilter,
    internId: currentUser.role === 'intern' ? currentUser.id : internFilter,
    mentorId: currentUser.role === 'intern' ? (currentUser.mentor_id || undefined) : mentorFilter,
    searchQuery,
  }), [startDate, endDate, statusFilter, categoryFilter, internFilter, mentorFilter, searchQuery, currentUser]);

  // Filtered dataset using Controller logic (Role Scoped + Filter Validated)
  const reportData = useMemo(() => {
    return ReportController.filterTasksForExport(tasks, users, currentUser, filterOptions);
  }, [tasks, users, currentUser, filterOptions]);

  // Aggregated Metrics
  const totalTasks = reportData.length;
  const completedCount = reportData.filter(t => t.status === 'Completed' || t.status === 'Approved').length;
  const inProgressCount = reportData.filter(t => t.status === 'In Progress').length;
  const reviewCount = reportData.filter(t => t.status === 'Submitted' || t.status === 'Review').length;
  const revisionCount = reportData.filter(t => t.status === 'Revision').length;
  const draftCount = reportData.filter(t => t.status === 'Draft' || t.status === 'Rejected').length;
  const totalDuration = reportData.reduce((acc, t) => acc + (t.estimated_duration || 0), 0);
  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // 1. Chart 1: Doughnut Chart - Distribusi Status Tugas (Teal, Emerald, Amber, Rose, Slate)
  const doughnutData = {
    labels: ['Completed', 'In Progress', 'Waiting Review', 'Revision', 'Draft / Overdue'],
    datasets: [
      {
        data: [completedCount, inProgressCount, reviewCount, revisionCount, draftCount],
        backgroundColor: [
          '#10b981', // Emerald
          '#0d9488', // Teal
          '#6366f1', // Indigo
          '#f59e0b', // Amber
          '#f43f5e', // Rose
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 4,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          padding: 12,
          font: { size: 11, family: 'Inter, sans-serif' },
          color: '#475569',
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const val = context.raw || 0;
            const pct = totalTasks > 0 ? ((val / totalTasks) * 100).toFixed(1) : '0';
            return ` ${context.label}: ${val} tugas (${pct}%)`;
          },
        },
      },
    },
    cutout: '68%',
  };

  // 2. Chart 2: Line Chart - Aktivitas Mingguan (Smooth Curve, tension 0.4, transparent fill)
  const weeklyLabels = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  const weeklyLineData = {
    labels: weeklyLabels,
    datasets: [
      {
        label: 'Tugas Diselesaikan',
        data: [3, 5, 8, 6, 7, 3, 2],
        fill: true,
        backgroundColor: 'rgba(13, 148, 136, 0.12)', // Transparent Teal fill
        borderColor: '#0d9488', // Teal border
        borderWidth: 2.5,
        tension: 0.4, // Smooth curve requested
        pointBackgroundColor: '#0d9488',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Tugas Ditinjau (Review)',
        data: [2, 4, 5, 3, 6, 2, 1],
        fill: false,
        borderColor: '#64748b', // Slate
        borderWidth: 1.5,
        borderDash: [4, 4],
        tension: 0.4,
        pointRadius: 3,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          padding: 10,
          font: { size: 11, family: 'Inter, sans-serif' },
          color: '#475569',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' },
        ticks: { font: { size: 10 }, color: '#64748b', stepSize: 2 },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 }, color: '#64748b' },
      },
    },
  };

  // Handle Export Excel
  const handleExportExcel = () => {
    if (reportData.length === 0) {
      showToast('Tidak ada data tugas yang sesuai dengan kriteria filter untuk diekspor.', 'warning');
      return;
    }
    ReportController.exportExcel(reportData, users, 'Laporan_Aktivitas_InternTask', companySetting);
    showToast(`Laporan Excel berhasil di-generate (${reportData.length} data tugas terunduh).`, 'success');
  };

  // Handle Export PDF
  const handleExportPdf = () => {
    if (reportData.length === 0) {
      showToast('Tidak ada data tugas yang sesuai dengan kriteria filter untuk diekspor.', 'warning');
      return;
    }
    const html = ReportController.generatePdfHtml(reportData, users, filterOptions, currentUser, companySetting);
    setPdfHtmlContent(html);
    setPdfPreviewOpen(true);
  };

  // Print PDF from preview modal
  const handlePrintPdf = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(pdfHtmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setStartDate('2026-09-01');
    setEndDate('2026-09-30');
    setStatusFilter('All');
    setCategoryFilter('All');
    setInternFilter('All');
    setMentorFilter('All');
    setSearchQuery('');
    showToast('Filter laporan telah direset ke kondisi awal.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Export Actions */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center flex-wrap gap-2">
            <h1 className="text-xl font-bold text-slate-800">Laporan &amp; Analitik</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              currentUser.role === 'director' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
              currentUser.role === 'mentor' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
              'bg-teal-100 text-teal-800 border border-teal-200'
            }`}>
              {currentUser.role === 'director' ? 'Akses Penuh Direktur' : currentUser.role === 'mentor' ? 'Akses Mentor' : 'Akses Mandiri Intern'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5">
              <Building2 className="w-3 h-3 text-teal-600" />
              <span>{companySetting.company_name}</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Rekapitulasi log pengerjaan tugas, evaluasi durasi kerja, dan ekspor dokumen resmi berformat PDF &amp; Excel.
          </p>
        </div>

        {/* Action Buttons: 📄 Export PDF & 📊 Export Excel */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* PDF Button (Rose / Dark Slate) */}
          <button
            onClick={handleExportPdf}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            title="Download atau cetak dokumen resmi PDF (barryvdh/laravel-dompdf)"
          >
            <FileText className="w-4 h-4" />
            <span>📄 Export PDF</span>
          </button>

          {/* Excel Button (Emerald / Green) */}
          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            title="Download file spreadsheet Excel (maatwebsite/excel)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>📊 Export Excel</span>
          </button>
        </div>
      </div>

      {/* 2. Dynamic Filter Form */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Formulir Filter Laporan</h3>
          </div>
          <button
            onClick={handleResetFilters}
            className="text-xs font-semibold text-slate-500 hover:text-teal-700 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filter</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Tanggal Mulai */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Tanggal Mulai (Start Date)</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          {/* Tanggal Selesai */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Tanggal Selesai (End Date)</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Status Tugas</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 text-slate-700 focus:outline-none font-medium"
            >
              <option value="All">Semua Status</option>
              <option value="Completed">Completed (Selesai)</option>
              <option value="In Progress">In Progress (Sedang Dikerjakan)</option>
              <option value="Submitted">Waiting Review (Menunggu Review)</option>
              <option value="Revision">Revision (Perlu Perbaikan)</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          {/* Kategori Filter */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Kategori Tugas</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 text-slate-700 focus:outline-none font-medium"
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

          {/* Intern Selection (for Mentor & Director) */}
          {currentUser.role !== 'intern' && (
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Pilihan Peserta Magang (Intern)</label>
              <select
                value={internFilter}
                onChange={(e) => setInternFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 text-slate-700 focus:outline-none font-medium"
              >
                <option value="All">Semua Peserta Magang</option>
                {(currentUser.role === 'mentor' 
                  ? users.filter(u => u.mentor_id === currentUser.id) 
                  : users.filter(u => u.role === 'intern')
                ).map(i => (
                  <option key={i.id} value={i.id}>{i.name} ({i.institution || 'Intern'})</option>
                ))}
              </select>
            </div>
          )}

          {/* Mentor Selection (for Director) */}
          {currentUser.role === 'director' && (
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Pilihan Mentor Pembimbing</label>
              <select
                value={mentorFilter}
                onChange={(e) => setMentorFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 text-slate-700 focus:outline-none font-medium"
              >
                <option value="All">Semua Mentor Pembimbing</option>
                {users.filter(u => u.role === 'mentor').map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.division || 'Mentor'})</option>
                ))}
              </select>
            </div>
          )}

          {/* Search Query */}
          <div className={
            currentUser.role === 'intern' 
              ? 'sm:col-span-2 lg:col-span-4' 
              : currentUser.role === 'director' 
                ? 'sm:col-span-2' 
                : 'sm:col-span-3'
          }>
            <label className="block text-slate-600 font-semibold mb-1">Pencarian Judul Tugas / Keyword</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={currentUser.role === 'intern' ? 'Cari judul tugas atau deskripsi tugas Anda...' : 'Cari judul tugas, deskripsi, atau nama peserta...'}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Intern Data Scoping Notice */}
        {currentUser.role === 'intern' && (
          <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-lg text-teal-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-teal-600 shrink-0" />
              <span>
                <strong>Isolasi Data Tugas Aktif:</strong> Laporan dikhususkan untuk rekap tugas harian Anda (<strong>{currentUser.name}</strong> - ID: #{currentUser.id}).
              </span>
            </div>
            <span className="text-[11px] text-teal-700 font-medium bg-white/80 px-2 py-0.5 rounded border border-teal-200">
              Auth::id() Scoped
            </span>
          </div>
        )}

        {/* Filter Validation Banner */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="w-2 h-2 rounded-full bg-teal-500"></span>
            <span>
              Menampilkan <strong className="text-slate-900 font-bold">{reportData.length}</strong> tugas sesuai filter aktif.
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            * Data yang diekspor ke PDF dan Excel hanya mencakup data yang lolos kriteria pencarian di atas.
          </span>
        </div>
      </div>

      {/* 3. Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Total Tugas Terfilter</span>
          <p className="text-2xl font-bold text-slate-800 mt-1">{totalTasks}</p>
          <span className="text-[11px] text-slate-400">100% Volume Laporan</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-emerald-700">Tugas Selesai (Completed)</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{completedCount}</p>
          <span className="text-[11px] text-emerald-700 font-medium">{completionRate}% Lulus Evaluasi</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-teal-700">Sedang Dikerjakan</span>
          <p className="text-2xl font-bold text-teal-600 mt-1">{inProgressCount}</p>
          <span className="text-[11px] text-slate-400">Aktivitas Berjalan</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-amber-700">Review &amp; Revisi</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{reviewCount + revisionCount}</p>
          <span className="text-[11px] text-amber-700 font-medium">{reviewCount} Review, {revisionCount} Revisi</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-700">Total Akumulasi Durasi</span>
          <p className="text-2xl font-bold text-slate-800 mt-1">{totalDuration} Jam</p>
          <span className="text-[11px] text-slate-400">Jam Kerja Terverifikasi</span>
        </div>
      </div>

      {/* 4. Optimized Visualizations (Chart.js Light Mode Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafik 1: Doughnut Chart - Distribusi Status Tugas */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-teal-600" />
                <span>Distribusi Status Tugas</span>
              </h3>
              <p className="text-[11px] text-slate-500">Persentase komposisi tugas berdasarkan status pengerjaan</p>
            </div>
            <span className="text-xs font-bold text-slate-700">{totalTasks} Total</span>
          </div>

          <div className="h-64 sm:h-72 relative flex items-center justify-center">
            {totalTasks > 0 ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <div className="text-center text-slate-400 text-xs">
                Tidak ada data tugas untuk ditampilkan pada grafik.
              </div>
            )}
          </div>
        </div>

        {/* Grafik 2: Line Chart - Aktivitas Mingguan (Smooth Curve) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-600" />
                <span>Tren Aktivitas Mingguan</span>
              </h3>
              <p className="text-[11px] text-slate-500">Jumlah tugas yang diselesaikan per hari (Smooth Curve: 0.4)</p>
            </div>
            <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              Weekly Activity
            </span>
          </div>

          <div className="h-64 sm:h-72">
            <Line data={weeklyLineData} options={lineOptions} />
          </div>
        </div>
      </div>

      {/* 5. Detailed Data Table (Striped Rows & Clean Borders) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Tabel Rincian Tugas Laporan</h3>
            <p className="text-xs text-slate-500">
              Rincian tugas yang akan dicetak pada berkas PDF &amp; diekspor ke Excel
            </p>
          </div>
          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-lg border border-teal-200">
            {reportData.length} Baris Data
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 text-center">No</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Peserta Magang</th>
                <th className="py-3 px-4">Mentor</th>
                <th className="py-3 px-4">Judul Tugas</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-center">Durasi</th>
                <th className="py-3 px-4 text-center">Progres</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="font-semibold text-slate-600">Tidak ada data yang cocok dengan kriteria filter</p>
                    <p className="text-[11px] mt-0.5">Silakan sesuaikan tanggal atau pilihan filter lainnya.</p>
                  </td>
                </tr>
              ) : (
                reportData.map((task, idx) => {
                  const intern = users.find(u => u.id === task.user_id);
                  const mentor = intern?.mentor_id ? users.find(u => u.id === intern.mentor_id) : null;

                  return (
                    <tr key={task.id} className={idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}>
                      <td className="py-3 px-4 text-center text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4 font-mono whitespace-nowrap text-slate-600">{task.task_date}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {intern?.name || 'Peserta Magang'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {mentor?.name || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-800">{task.title}</p>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{task.description}</p>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{task.category}</span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap font-medium text-slate-700">
                        {task.estimated_duration || 0} Jam
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap font-bold text-slate-800">
                        {task.progress}%
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <StatusBadge status={task.status} size="sm" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Modal Preview Dokumen PDF Resmi */}
      {pdfPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden my-4">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-rose-600" />
                  <span>Pratinjau Dokumen PDF Resmi (Kop Surat Korporat)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Template Blade: <code className="text-teal-700 font-mono text-[11px]">resources/views/reports/pdf.blade.php</code>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintPdf}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / Print PDF</span>
                </button>
                <button
                  onClick={() => setPdfPreviewOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body / Iframe View */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 flex justify-center">
              <div className="bg-white shadow-lg border border-slate-300 w-full max-w-[210mm] min-h-[297mm] p-6 sm:p-8">
                <iframe
                  title="PDF Preview"
                  srcDoc={pdfHtmlContent}
                  className="w-full h-[650px] border-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
              <span>Paket Backend: <strong className="font-mono text-slate-700">barryvdh/laravel-dompdf</strong></span>
              <button
                onClick={() => setPdfPreviewOpen(false)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
