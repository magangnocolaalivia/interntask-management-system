import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Calendar, Clock, CheckCircle2, AlertTriangle, FileQuestion, 
  Search, Filter, Download, RotateCcw, Building2, UserCheck, 
  ShieldAlert, ShieldCheck, Users, HeartPulse
} from 'lucide-react';
import { AttendanceStatus } from '../../types';

export const DirectorAttendanceView: React.FC = () => {
  const { users, attendances, companySetting, showToast } = useApp();

  const [internFilter, setInternFilter] = useState<string>('All');
  const [mentorFilter, setMentorFilter] = useState<string>('All');
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-09-30');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const interns = users.filter(u => u.role === 'intern');
  const mentors = users.filter(u => u.role === 'mentor');

  // Filtered dataset
  const filteredData = useMemo(() => {
    return attendances.filter((att) => {
      // Intern filter
      if (internFilter !== 'All' && att.user_id !== Number(internFilter)) return false;

      // Mentor filter
      if (mentorFilter !== 'All') {
        const internUser = users.find(u => u.id === att.user_id);
        if (internUser?.mentor_id !== Number(mentorFilter)) return false;
      }

      // Date range filter
      if (startDate && att.date < startDate) return false;
      if (endDate && att.date > endDate) return false;

      // Status filter
      if (statusFilter !== 'All' && att.status !== statusFilter) return false;

      // Search query
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const internUser = users.find(u => u.id === att.user_id);
        const matchName = internUser?.name.toLowerCase().includes(q) || false;
        const matchInst = internUser?.institution?.toLowerCase().includes(q) || false;
        const matchNotes = att.notes?.toLowerCase().includes(q) || false;
        const matchDate = att.date.includes(q);
        if (!matchName && !matchInst && !matchNotes && !matchDate) return false;
      }

      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [attendances, internFilter, mentorFilter, startDate, endDate, statusFilter, searchQuery, users]);

  // Overall statistics
  const totalRecords = filteredData.length;
  const presentCount = filteredData.filter(a => a.status === 'present').length;
  const lateCount = filteredData.filter(a => a.status === 'late').length;
  const permitCount = filteredData.filter(a => a.status === 'permit').length;
  const onTimeRate = (presentCount + lateCount) > 0 
    ? Math.round((presentCount / (presentCount + lateCount)) * 100) 
    : 100;

  // Today specific stats
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = attendances.filter(a => a.date === todayStr);
  const todayPresent = todayRecords.filter(a => a.status === 'present').length;
  const todayLate = todayRecords.filter(a => a.status === 'late').length;

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

  const handleExportCsv = () => {
    if (filteredData.length === 0) {
      showToast('Tidak ada data kehadiran yang sesuai filter untuk diekspor.', 'warning');
      return;
    }

    const headers = [
      'No', 
      'Tanggal', 
      'Nama Peserta Magang', 
      'Institusi/Kampus', 
      'Mentor Pembimbing', 
      'Jam Masuk (Clock In)', 
      'Jam Pulang (Clock Out)', 
      'Durasi Kerja', 
      'Status Kehadiran', 
      'Catatan / Alasan'
    ];

    const rows = filteredData.map((a, idx) => {
      const intern = users.find(u => u.id === a.user_id);
      const mentor = intern?.mentor_id ? users.find(u => u.id === intern.mentor_id) : null;
      return [
        idx + 1,
        `"${a.date}"`,
        `"${(intern?.name || 'Intern').replace(/"/g, '""')}"`,
        `"${(intern?.institution || '-').replace(/"/g, '""')}"`,
        `"${(mentor?.name || 'Belum Ditugaskan').replace(/"/g, '""')}"`,
        `"${a.clock_in || '-'}"`,
        `"${a.clock_out || '-'}"`,
        `"${calculateDuration(a.clock_in, a.clock_out)}"`,
        `"${a.status.toUpperCase()}"`,
        `"${(a.notes || '-').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanCompany = (companySetting?.company_name || 'InternTask').replace(/[^a-zA-Z0-9]/g, '_');
    link.setAttribute('download', `${cleanCompany}_Rekap_Kehadiran_Direktur_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Rekap absensi seluruh peserta magang berhasil diunduh (CSV).', 'success');
  };

  const handleResetFilters = () => {
    setInternFilter('All');
    setMentorFilter('All');
    setStartDate('2026-09-01');
    setEndDate('2026-09-30');
    setStatusFilter('All');
    setSearchQuery('');
    showToast('Semua filter kehadiran telah direset.', 'info');
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
            <span>Alfa</span>
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800">Monitoring Kehadiran (Presensi)</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              DIREKTUR (READ-ONLY)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pengawasan rekapitulasi kehadiran, kepatuhan jam kerja, dan perizinan seluruh peserta magang lintas mentor se-perusahaan.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition-colors flex items-center gap-2 shrink-0 cursor-pointer border border-slate-200 shadow-2xs"
        >
          <Download className="w-4 h-4 text-teal-600" />
          <span>Ekspor Rekap Perusahaan (CSV)</span>
        </button>
      </div>

      {/* 2. Statistical KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-400 block">Total Data Tercatat</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-slate-800">{totalRecords}</span>
            <span className="text-xs text-slate-400">Sesi</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Sesuai filter pencarian</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-400 block">Ketepatan Waktu</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-emerald-600">{onTimeRate}%</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-medium mt-1 block">Rasio &le; 09:00 WIB</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-400 block">Hadir Tepat Waktu</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-emerald-600">{presentCount}</span>
            <span className="text-xs text-slate-400">Sesi</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Dari data tersaring</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-400 block">Terlambat Masuk</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-amber-600">{lateCount}</span>
            <span className="text-xs text-slate-400">Sesi</span>
          </div>
          <span className="text-[10px] text-amber-600 font-medium mt-1 block">Lewat jam 09:00 WIB</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs col-span-2 lg:col-span-1">
          <span className="text-[11px] font-medium text-slate-400 block">Izin Tercatat</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-blue-600">{permitCount}</span>
            <span className="text-xs text-slate-400">Sesi</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Sakit / keperluan kampus</span>
        </div>
      </div>

      {/* 3. Filter Bar (Date Range, Intern, Mentor, Status, Search) */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-teal-600" />
            <span>Filter Rekapitulasi Presensi</span>
          </h2>
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>Reset</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {/* Start Date */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Mulai Tanggal (Start Date)</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Sampai Tanggal (End Date)</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          {/* Filter Nama Peserta Magang */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Pilihan Peserta Magang</label>
            <select
              value={internFilter}
              onChange={(e) => setInternFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 text-slate-700 focus:outline-none font-medium"
            >
              <option value="All">Semua Peserta Magang ({interns.length})</option>
              {interns.map((intern) => (
                <option key={intern.id} value={intern.id}>
                  {intern.name} ({intern.institution || 'Intern'})
                </option>
              ))}
            </select>
          </div>

          {/* Filter Mentor Pembimbing */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Pilihan Mentor Pembimbing</label>
            <select
              value={mentorFilter}
              onChange={(e) => setMentorFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 text-slate-700 focus:outline-none font-medium"
            >
              <option value="All">Semua Mentor Pembimbing ({mentors.length})</option>
              {mentors.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.division || 'Mentor'})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
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
              <option value="absent">Alfa</option>
            </select>
          </div>

          {/* Search Query */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Pencarian Nama / Catatan</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama peserta, kampus, atau catatan..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Full Corporate Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            Daftar Presensi Seluruh Peserta Magang ({filteredData.length} Catatan)
          </span>
          <span className="text-[11px] text-slate-400">
            Executive View • Read-Only
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4 w-44">Nama Peserta Magang</th>
                <th className="py-3 px-4 w-36">Mentor Pembimbing</th>
                <th className="py-3 px-4 w-28">Tanggal</th>
                <th className="py-3 px-4 w-28">Jam Masuk</th>
                <th className="py-3 px-4 w-28">Jam Pulang</th>
                <th className="py-3 px-4 w-24">Durasi</th>
                <th className="py-3 px-4 w-40">Status</th>
                <th className="py-3 px-4">Keterangan / Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">
                    <Users className="w-8 h-8 mx-auto opacity-40 mb-2" />
                    <span>Tidak ada catatan presensi yang memenuhi kriteria filter.</span>
                  </td>
                </tr>
              ) : (
                filteredData.map((att, idx) => {
                  const intern = users.find(u => u.id === att.user_id);
                  const mentor = intern?.mentor_id ? users.find(u => u.id === intern.mentor_id) : null;
                  return (
                    <tr key={att.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 text-center font-medium text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800 block truncate">{intern?.name || 'Intern'}</span>
                        <span className="text-[11px] text-slate-400 block truncate">{intern?.institution || '-'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-700 block truncate">{mentor?.name || 'Belum Ada'}</span>
                        <span className="text-[10px] text-teal-600 block truncate">{mentor?.division || 'Mentor'}</span>
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
                      <td className="py-3 px-4 font-medium text-slate-700 whitespace-nowrap">
                        {calculateDuration(att.clock_in, att.clock_out)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {renderStatusBadge(att.status)}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                        {att.notes || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
