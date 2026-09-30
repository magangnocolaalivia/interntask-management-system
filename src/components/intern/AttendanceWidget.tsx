import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Clock, LogIn, LogOut, CheckCircle2, AlertCircle, 
  Calendar, FileQuestion, Send, AlertTriangle, ShieldCheck, HeartPulse
} from 'lucide-react';
import { AttendanceStatus } from '../../types';

export const AttendanceWidget: React.FC = () => {
  const { currentUser, companySetting, getTodayAttendance, clockIn, clockOut, submitLeave } = useApp();

  // Current live clock state (updates every second)
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Form State for Today's Attendance
  const [selectedStatus, setSelectedStatus] = useState<'present' | 'permit' | 'sick'>('present');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!currentUser || currentUser.role !== 'intern') return null;

  const todayAttendance = getTodayAttendance(currentUser.id);

  // Dynamic Tolerance Time from active Company Setting (default: '09:00')
  const toleranceTime = companySetting.late_tolerance_time || '09:00';
  const [tolH, tolM] = toleranceTime.split(':').map(Number);
  const tolHour = isNaN(tolH) ? 9 : tolH;
  const tolMin = isNaN(tolM) ? 0 : tolM;

  // Time & Threshold calculation
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();
  
  // Threshold: cutoff at company's late_tolerance_time
  const isPastTolerance = hours > tolHour || (hours === tolHour && (minutes > tolMin || (minutes === tolMin && seconds > 0)));

  const timeDisplay = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const dateDisplay = currentTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Calculate elapsed time if currently working
  const getWorkingDuration = () => {
    if (!todayAttendance || !todayAttendance.clock_in) return null;
    const [inH, inM, inS] = todayAttendance.clock_in.split(':').map(Number);
    const inDate = new Date();
    inDate.setHours(inH, inM, inS || 0, 0);

    const outDate = todayAttendance.clock_out 
      ? (() => {
          const [outH, outM, outS] = todayAttendance.clock_out.split(':').map(Number);
          const d = new Date();
          d.setHours(outH, outM, outS || 0, 0);
          return d;
        })()
      : currentTime;

    const diffMs = Math.max(0, outDate.getTime() - inDate.getTime());
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHrs} Jam ${diffMins} Menit`;
  };

  // Form submit handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation Rules
    if (selectedStatus === 'present') {
      if (isPastTolerance && (!notes || notes.trim().length === 0)) {
        setFormError(`Waktu saat ini telah melewati batas toleransi ${toleranceTime} WIB (Terlambat). Kolom Keterangan / Alasan wajib diisi.`);
        return;
      }

      setIsSubmitting(true);
      const res = clockIn(notes.trim());
      setIsSubmitting(false);

      if (!res.success) {
        setFormError(res.message);
      } else {
        setNotes('');
      }
    } else {
      // Status 'permit' (Izin) or 'sick' (Sakit)
      const label = selectedStatus === 'sick' ? 'Sakit' : 'Izin';
      if (!notes || notes.trim().length === 0) {
        setFormError(`Kolom Keterangan / Alasan wajib diisi untuk pelaporan status ${label}.`);
        return;
      }
      if (notes.trim().length < 3) {
        setFormError(`Keterangan minimal 3 karakter untuk pelaporan status ${label}.`);
        return;
      }

      setIsSubmitting(true);
      const res = submitLeave(selectedStatus, notes.trim());
      setIsSubmitting(false);

      if (!res.success) {
        setFormError(res.message);
      } else {
        setNotes('');
      }
    }
  };

  const handleClockOut = () => {
    setIsSubmitting(true);
    clockOut();
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 relative overflow-hidden transition-all">
      {/* Top Accent Gradient Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-teal-400 to-indigo-500" />

      {/* Header Bar: Status Badge, Live Clock, and Shift Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
              PANEL PRESENSI HARI INI
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {dateDisplay}
            </span>
          </div>

          <div className="flex items-baseline gap-3 pt-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-slate-900">
              {timeDisplay}
            </span>
            <span className="text-xs font-semibold text-slate-400">WIB</span>
          </div>
        </div>

        <div className="text-left sm:text-right text-[11px] text-slate-500 space-y-0.5 bg-slate-50 sm:bg-transparent p-2.5 sm:p-0 rounded-lg border sm:border-0 border-slate-100">
          <p>
            Jadwal Shift: <strong className="text-slate-800">08:00 - 17:00 WIB</strong>
          </p>
          <p>
            Batas toleransi kehadiran: <strong className="text-slate-800">{toleranceTime} WIB</strong> <span className="text-[10px] text-teal-700 font-medium">(Sesuai kebijakan perusahaan)</span>
            {isPastTolerance && !todayAttendance && (
              <span className="ml-1.5 text-amber-600 font-bold block sm:inline">• Toleransi Lewat</span>
            )}
          </p>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="pt-4">
        {/* =========================================================================
            KONDISI A: BELUM MENGISI PRESENSI HARI INI (FORM LAPOR KEHADIRAN HARIAN)
           ========================================================================= */}
        {!todayAttendance && (
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>Pilih Status Kehadiran Hari Ini</span>
                  <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  {selectedStatus === 'present' 
                    ? (isPastTolerance ? `Status otomatis: Terlambat (> ${toleranceTime} WIB)` : `Status: Hadir Tepat Waktu (≤ ${toleranceTime} WIB)`)
                    : 'Bebas dari kewajiban Clock In & Out'}
                </span>
              </div>

              {/* 1. Opsi Pilihan Status: Radio Buttons Bergaya Card Pastel */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Opsi 1: 🟢 Hadir */}
                <label
                  onClick={() => {
                    setSelectedStatus('present');
                    setFormError(null);
                  }}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 select-none ${
                    selectedStatus === 'present'
                      ? 'bg-emerald-50/70 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="attendance_status"
                    value="present"
                    checked={selectedStatus === 'present'}
                    onChange={() => setSelectedStatus('present')}
                    className="sr-only"
                  />
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    selectedStatus === 'present' 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold">🟢 Hadir</span>
                      {selectedStatus === 'present' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      {isPastTolerance ? `Terlambat (> ${toleranceTime} WIB)` : `Hadir tepat waktu di kantor (≤ ${toleranceTime} WIB)`}
                    </p>
                  </div>
                </label>

                {/* Opsi 2: 🟡 Izin */}
                <label
                  onClick={() => {
                    setSelectedStatus('permit');
                    setFormError(null);
                  }}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 select-none ${
                    selectedStatus === 'permit'
                      ? 'bg-amber-50/70 border-amber-500 text-amber-900 ring-2 ring-amber-500/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="attendance_status"
                    value="permit"
                    checked={selectedStatus === 'permit'}
                    onChange={() => setSelectedStatus('permit')}
                    className="sr-only"
                  />
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    selectedStatus === 'permit' 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    <FileQuestion className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold">🟡 Izin</span>
                      {selectedStatus === 'permit' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Urusan kampus / keperluan keluarga
                    </p>
                  </div>
                </label>

                {/* Opsi 3: 🔴 Sakit */}
                <label
                  onClick={() => {
                    setSelectedStatus('sick');
                    setFormError(null);
                  }}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 select-none ${
                    selectedStatus === 'sick'
                      ? 'bg-rose-50/70 border-rose-500 text-rose-900 ring-2 ring-rose-500/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="attendance_status"
                    value="sick"
                    checked={selectedStatus === 'sick'}
                    onChange={() => setSelectedStatus('sick')}
                    className="sr-only"
                  />
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    selectedStatus === 'sick' 
                      ? 'bg-rose-500 text-white' 
                      : 'bg-rose-100 text-rose-700'
                  }`}>
                    <HeartPulse className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold">🔴 Sakit</span>
                      {selectedStatus === 'sick' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Kondisi medis / istirahat pemulihan
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* 2. Textarea Keterangan / Catatan dengan Validasi Dinamis */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <span>Keterangan / Catatan</span>
                  {selectedStatus === 'present' ? (
                    isPastTolerance ? (
                      <span className="text-rose-500 font-bold text-[11px]">* Wajib Diisi (Terlambat &gt; {toleranceTime} WIB)</span>
                    ) : (
                      <span className="text-slate-400 font-normal text-[11px]">(Opsional)</span>
                    )
                  ) : (
                    <span className="text-rose-500 font-bold text-[11px]">* Wajib Diisi</span>
                  )}
                </label>
                {selectedStatus === 'present' && isPastTolerance && (
                  <span className="text-[11px] text-amber-600 font-medium">
                    Jelaskan alasan keterlambatan kepada mentor
                  </span>
                )}
              </div>

              <textarea
                rows={2}
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  if (formError) setFormError(null);
                }}
                placeholder={
                  selectedStatus === 'present'
                    ? (isPastTolerance 
                        ? 'Contoh: Maaf terlambat, terkendala kemacetan di jalan arteri / kendaraan mogok...' 
                        : 'Catatan kegiatan atau shift hari ini (opsional)...')
                    : selectedStatus === 'permit'
                    ? 'Contoh: Izin menghadiri bimbingan proposal skripsi di kampus Politeknik...'
                    : 'Contoh: Mengalami demam dan flu, sedang istirahat dengan surat dokter...'
                }
                className={`w-full px-3.5 py-2.5 text-xs bg-slate-50/50 border rounded-xl focus:bg-white focus:outline-none transition-all ${
                  formError 
                    ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20' 
                    : 'border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500'
                }`}
              />

              {formError && (
                <div className="flex items-center gap-1.5 text-rose-600 text-xs mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
            </div>

            {/* 3. Tombol Aksi: Dinamis sesuai pilihan status */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="text-xs text-slate-500">
                {selectedStatus === 'present' ? (
                  <span>
                    Menekan tombol Clock In akan mencatat jam masuk kerja Anda saat ini secara real-time.
                  </span>
                ) : (
                  <span>
                    Status presensi akan terkunci sebagai <strong>{selectedStatus === 'sick' ? 'Sakit' : 'Izin'}</strong> untuk tanggal hari ini.
                  </span>
                )}
              </div>

              <div className="w-full sm:w-auto flex justify-end">
                {selectedStatus === 'present' ? (
                  /* Tombol Clock In (Warna Teal) */
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
                  >
                    <LogIn className="w-4 h-4 stroke-[2.5]" />
                    <span>{isSubmitting ? 'Memproses...' : 'Clock In'}</span>
                  </button>
                ) : (
                  /* Tombol Kirim Laporan (Warna Amber untuk Izin, Rose untuk Sakit) */
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full sm:w-auto px-6 py-2.5 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 ${
                      selectedStatus === 'sick' 
                        ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800' 
                        : 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800'
                    }`}
                  >
                    <Send className="w-4 h-4 stroke-[2.2]" />
                    <span>{isSubmitting ? 'Menyimpan...' : 'Kirim Laporan'}</span>
                  </button>
                )}
              </div>
            </div>
          </form>
        )}

        {/* =========================================================================
            KONDISI B: SUDAH CLOCK IN, BELUM CLOCK OUT (SEDANG BEKERJA)
           ========================================================================= */}
        {todayAttendance && todayAttendance.clock_in && !todayAttendance.clock_out && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-500 font-medium">Jam Masuk (Clock In):</span>
                <strong className="text-sm font-mono font-bold text-slate-800">
                  {todayAttendance.clock_in}
                </strong>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  todayAttendance.status === 'present' 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {todayAttendance.status === 'present' ? 'Hadir Tepat Waktu' : 'Terlambat'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-teal-700 font-semibold pt-0.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-ping" />
                <span>Sesi Kerja Sedang Berlangsung • {getWorkingDuration()}</span>
              </div>

              {todayAttendance.notes && (
                <p className="text-[11px] text-slate-500 italic pt-0.5">
                  Catatan: &ldquo;{todayAttendance.notes}&rdquo;
                </p>
              )}
            </div>

            {/* Tombol Clock Out (Warna Rose/Merah Bata) */}
            <button
              type="button"
              onClick={handleClockOut}
              disabled={isSubmitting}
              className="px-6 py-3 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer transform hover:-translate-y-0.5"
            >
              <LogOut className="w-4 h-4 stroke-[2.5]" />
              <span>Clock Out Pulang</span>
            </button>
          </div>
        )}

        {/* =========================================================================
            KONDISI C: SUDAH SELESAI (CLOCK IN & CLOCK OUT TERCATAT)
           ========================================================================= */}
        {todayAttendance && todayAttendance.clock_in && todayAttendance.clock_out && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-emerald-50/80 border border-emerald-200 px-5 py-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-emerald-950">Kehadiran hari ini telah selesai direkam.</h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    todayAttendance.status === 'present' 
                      ? 'bg-emerald-200 text-emerald-900' 
                      : 'bg-amber-200 text-amber-900'
                  }`}>
                    {todayAttendance.status === 'present' ? 'Hadir Tepat Waktu' : 'Terlambat'}
                  </span>
                </div>
                <p className="text-xs text-emerald-800">
                  Jam Masuk: <strong className="font-mono">{todayAttendance.clock_in}</strong> • Jam Pulang: <strong className="font-mono">{todayAttendance.clock_out}</strong> ({getWorkingDuration()})
                </p>
                {todayAttendance.notes && (
                  <p className="text-[11px] text-emerald-700 italic">
                    Keterangan: {todayAttendance.notes}
                  </p>
                )}
              </div>
            </div>

            <span className="text-[11px] font-semibold text-emerald-700 bg-white/90 px-2.5 py-1 rounded-lg border border-emerald-200 self-end sm:self-center shadow-2xs">
              Selesai &amp; Terkunci
            </span>
          </div>
        )}

        {/* =========================================================================
            KONDISI D: STATUS IZIN (PERMIT) - TANPA TOMBOL CLOCK IN/OUT
           ========================================================================= */}
        {todayAttendance && todayAttendance.status === 'permit' && (
          <div className="flex items-start sm:items-center gap-3 bg-amber-50/80 border border-amber-200 px-5 py-4 rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <FileQuestion className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-amber-950">Anda telah melaporkan status Izin untuk hari ini.</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-200 text-amber-900">
                  Terkunci
                </span>
              </div>
              <p className="text-xs text-amber-800">
                Alasan / Keterangan: <strong>&ldquo;{todayAttendance.notes || 'Izin telah disetujui'}&rdquo;</strong>
              </p>
              <p className="text-[11px] text-amber-600">
                Form absensi dinonaktifkan. Anda dibebaskan dari kewajiban Clock In dan Clock Out pada hari ini.
              </p>
            </div>
          </div>
        )}

        {/* =========================================================================
            KONDISI E: STATUS SAKIT (SICK) - TANPA TOMBOL CLOCK IN/OUT
           ========================================================================= */}
        {todayAttendance && todayAttendance.status === 'sick' && (
          <div className="flex items-start sm:items-center gap-3 bg-rose-50/80 border border-rose-200 px-5 py-4 rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 shrink-0">
              <HeartPulse className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-rose-950">Anda telah melaporkan status Sakit untuk hari ini.</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-200 text-rose-900">
                  Terkunci
                </span>
              </div>
              <p className="text-xs text-rose-800">
                Alasan / Kondisi: <strong>&ldquo;{todayAttendance.notes || 'Sakit dalam masa pemulihan'}&rdquo;</strong>
              </p>
              <p className="text-[11px] text-rose-600">
                Form absensi dinonaktifkan. Laporan sakit telah tercatat resmi dalam sistem. Semoga lekas sembuh.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
