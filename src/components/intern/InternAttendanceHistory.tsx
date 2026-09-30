import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Calendar, Clock, CheckCircle2, AlertTriangle, FileQuestion, 
  Search, Filter, Download, RotateCcw, UserCheck, ShieldAlert,
  FileText, Printer, X, Sparkles, Building2, HeartPulse
} from 'lucide-react';
import { AttendanceStatus } from '../../types';
import { AttendanceWidget } from './AttendanceWidget';
import { AttendanceReportController } from '../../controllers/attendance/AttendanceReportController';

export const InternAttendanceHistory: React.FC = () => {
  const { currentUser, users, getAttendancesForIntern, companySetting, showToast } = useApp();

  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-09-30');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // PDF Preview State
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [pdfHtmlContent, setPdfHtmlContent] = useState<string>('');

  if (!currentUser) return null;

  const rawAttendances = getAttendancesForIntern(currentUser.id);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return rawAttendances.filter((att) => {
      // Date filter
      if (startDate && att.date < startDate) return false;
      if (endDate && att.date > endDate) return false;

      // Status filter
      if (statusFilter !== 'All' && att.status !== statusFilter) return false;

      // Search notes
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchNotes = att.notes?.toLowerCase().includes(q) || false;
        const matchDate = att.date.includes(q);
        if (!matchNotes && !matchDate) return false;
      }

      return true;
    });
  }, [rawAttendances, startDate, endDate, statusFilter, searchQuery]);

  // Statistics calculation
  const totalRecords = rawAttendances.length;
  const presentCount = rawAttendances.filter(a => a.status === 'present').length;
  const lateCount = rawAttendances.filter(a => a.status === 'late').length;
  const permitCount = rawAttendances.filter(a => a.status === 'permit').length;
  const sickCount = rawAttendances.filter(a => a.status === 'sick').length;
  const absentCount = rawAttendances.filter(a => a.status === 'absent').length;

  const attendanceRate = totalRecords > 0 
    ? Math.round(((presentCount + lateCount) / totalRecords) * 100) 
    : 100;

  // Calculate duration between clock_in and clock_out
  const calculateDuration = (inTime: string | null, outTime: string | null) => {
    if (!inTime || !outTime) return '-';
    const [inH, inM, inS] = inTime.split(':').map(Number);
    const [outH, outM, outS] = outTime.split(':').map(Number);
    const inDate = new Date(2000, 0, 1, inH, inM, inS || 0);
    const outDate = new Date(2000, 0, 1, outH, outM, outS || 0);
    const diffMs = Math.max(0, outDate.getTime() - inDate.getTime());
    const hrs = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hrs}j ${mins}m`;
  };

  // Export CSV
  const handleExportCsv = () => {
    if (filteredData.length === 0) {
      showToast('Tidak ada data absensi untuk diekspor.', 'warning');
      return;
    }

    const headers = ['No', 'Tanggal', 'Jam Masuk (Clock In)', 'Jam Pulang (Clock Out)', 'Durasi Kerja', 'Status Kehadiran', 'Keterangan'];
    const rows = filteredData.map((a, idx) => [
      idx + 1,
      `"${a.date}"`,
      `"${a.clock_in || '-'}"`,
      `"${a.clock_out || '-'}"`,
      `"${calculateDuration(a.clock_in, a.clock_out)}"`,
      `"${a.status.toUpperCase()}"`,
      `"${(a.notes || '-').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Riwayat_Absensi_${currentUser.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Data riwayat absensi berhasil diunduh (CSV).', 'success');
  };

  // Export PDF with White-label letterhead & Intern/Mentor signatures
  const handleExportPdf = () => {
    if (filteredData.length === 0) {
      showToast('Tidak ada data absensi pada periode filter saat ini untuk diekspor ke PDF.', 'warning');
      return;
    }

    const mentor = currentUser.mentor_id ? users.find(u => u.id === currentUser.mentor_id) : null;
    const html = AttendanceReportController.generateMonthlyAttendancePdfHtml(
      filteredData,
      currentUser,
      mentor,
      startDate,
      endDate,
      companySetting
    );

    setPdfHtmlContent(html);
    setPdfPreviewOpen(true);
  };

  // Print PDF from modal
  const handlePrintPdf = () => {
    const iframe = document.getElementById('monthly-attendance-pdf-iframe') as HTMLIFrameElement | null;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } else {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(pdfHtmlContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 300);
      }
    }
  };

  const handleResetFilters = () => {
    setStartDate('2026-09-01');
    setEndDate('2026-09-30');
    setStatusFilter('All');
    setSearchQuery('');
    showToast('Filter riwayat kehadiran direset.', 'info');
  };

  const renderStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Hadir Tepat Waktu</span>
          </span>
        );
      case 'late':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Terlambat</span>
          </span>
        );
      case 'permit':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <FileQuestion className="w-3.5 h-3.5 text-amber-600" />
            <span>Izin</span>
          </span>
        );
      case 'sick':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
            <span>Sakit</span>
          </span>
        );
      case 'absent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>Tanpa Keterangan (Alfa)</span>
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Hub Utama: Panel Presensi Hari Ini (Clock In / Out) */}
      <AttendanceWidget />

      {/* 2. Header Banner & Action Buttons */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-800">Absensi &amp; Riwayat Kehadiran</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
              PUSAT PRESENSI MAGANG
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pusat pencatatan jam masuk &amp; pulang kerja harian serta rekapitulasi riwayat presensi resmi untuk administrasi magang.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Tombol Export Rekap Bulanan (PDF) */}
          <button
            type="button"
            onClick={handleExportPdf}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-xs transform hover:-translate-y-0.5"
            title="Cetak &amp; Unduh Rekapitulasi Presensi Resmi (PDF dengan Tanda Tangan)"
          >
            <FileText className="w-4 h-4 stroke-[2.2]" />
            <span>Export Rekap Bulanan (PDF)</span>
          </button>

          {/* Tombol Export CSV */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition-colors flex items-center gap-2 shrink-0 cursor-pointer border border-slate-200 shadow-2xs"
            title="Unduh Data Mentah Riwayat Presensi Format CSV"
          >
            <Download className="w-4 h-4 text-teal-600" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* 3. Statistical KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-400 block">Tingkat Kehadiran</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-slate-800">{attendanceRate}%</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-medium mt-1 block">Tepat waktu &amp; terlambat</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-400 block">Hadir Tepat Waktu</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-emerald-600">{presentCount}</span>
            <span className="text-xs text-slate-400">Hari</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Masuk &le; 09:00 WIB</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-400 block">Terlambat Masuk</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-amber-600">{lateCount}</span>
            <span className="text-xs text-slate-400">Hari</span>
          </div>
          <span className="text-[10px] text-amber-600 font-medium mt-1 block">Masuk &gt; 09:00 WIB</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-400 block">Izin &amp; Sakit</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-amber-600">{permitCount + sickCount}</span>
            <span className="text-xs text-slate-400">Hari</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">{permitCount} Izin • {sickCount} Sakit</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs col-span-2 lg:col-span-1">
          <span className="text-[11px] font-medium text-slate-400 block">Total Hari Tercatat</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-slate-800">{totalRecords}</span>
            <span className="text-xs text-slate-400">Hari</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Selama periode magang</span>
        </div>
      </div>

      {/* 4. Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-teal-600" />
            <span>Filter Periode Presensi &amp; Status</span>
          </h2>
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>Reset Filter</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Mulai Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Status Kehadiran</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 text-slate-700 focus:outline-none font-medium"
            >
              <option value="All">Semua Status</option>
              <option value="present">Hadir Tepat Waktu</option>
              <option value="late">Terlambat</option>
              <option value="permit">Izin</option>
              <option value="sick">Sakit</option>
              <option value="absent">Tanpa Keterangan (Alfa)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Pencarian Catatan</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari alasan izin / catatan..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Table of Attendances */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            Daftar Presensi ({filteredData.length} Catatan)
          </span>
          <span className="text-[11px] text-slate-400">
            Urutan: Tanggal terbaru ke terlama
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4 w-28">Tanggal</th>
                <th className="py-3 px-4 w-28">Clock In (Masuk)</th>
                <th className="py-3 px-4 w-28">Clock Out (Pulang)</th>
                <th className="py-3 px-4 w-28">Durasi Kerja</th>
                <th className="py-3 px-4 w-44">Status</th>
                <th className="py-3 px-4">Keterangan / Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Calendar className="w-8 h-8 mx-auto opacity-40 mb-2" />
                    <span>Tidak ada catatan riwayat kehadiran yang sesuai dengan filter.</span>
                  </td>
                </tr>
              ) : (
                filteredData.map((att, idx) => (
                  <tr key={att.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 text-center font-medium text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-800 whitespace-nowrap">
                      {att.date}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                      {att.clock_in ? (
                        <span className="flex items-center gap-1 text-slate-800">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {att.clock_in}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                      {att.clock_out ? (
                        <span className="flex items-center gap-1 text-slate-800">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {att.clock_out}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {calculateDuration(att.clock_in, att.clock_out)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {renderStatusBadge(att.status)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {att.notes || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Modal Preview Dokumen PDF Rekap Bulanan Resmi */}
      {pdfPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden my-4">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-rose-600" />
                  <span>Pratinjau Dokumen Rekapitulasi Presensi Bulanan (PDF)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Lengkap dengan Kop Surat White-Label dan Kolom Tanda Tangan Peserta &amp; Mentor
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintPdf}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / Print PDF</span>
                </button>
                <button
                  type="button"
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
                  id="monthly-attendance-pdf-iframe"
                  title="Attendance PDF Preview"
                  srcDoc={pdfHtmlContent}
                  className="w-full h-[650px] border-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Format Standar A4 • Terintegrasi Identitas Perusahaan</span>
              </div>
              <button
                type="button"
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
