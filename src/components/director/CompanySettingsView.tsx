import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, Upload, Trash2, CheckCircle2, AlertCircle, 
  RotateCcw, FileText, Image as ImageIcon, Eye, ShieldCheck,
  Save, Sparkles, Clock
} from 'lucide-react';

export const CompanySettingsView: React.FC = () => {
  const { currentUser, companySetting, updateCompanySetting, showToast } = useApp();

  const [companyName, setCompanyName] = useState(companySetting.company_name);
  const [companyAddress, setCompanyAddress] = useState(companySetting.company_address);
  const [lateToleranceTime, setLateToleranceTime] = useState(companySetting.late_tolerance_time || '09:00');
  const [logoPreview, setLogoPreview] = useState<string | null>(companySetting.company_logo_path || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // File upload handler for Company Logo (Validating JPG/PNG & converting to Data URL)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Format file tidak didukung. Harap unggah logo berformat JPG atau PNG.');
      showToast('Gagal: Format logo harus berupa JPG atau PNG.', 'error');
      return;
    }

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Ukuran file terlalu besar. Maksimal ukuran logo adalah 2 MB.');
      showToast('Gagal: Ukuran logo maksimal 2 MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setLogoPreview(result);
      showToast('Logo berhasil dimuat. Klik "Simpan Perubahan" untuk menerapkan.', 'info');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    showToast('Logo dihapus dari pratinjau. Kop surat akan menggunakan format teks tanpa logo.', 'info');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setErrorMsg('Nama perusahaan/institusi tidak boleh kosong.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const success = updateCompanySetting({
      company_name: companyName.trim(),
      company_address: companyAddress.trim(),
      company_logo_path: logoPreview,
      late_tolerance_time: lateToleranceTime.trim() || '09:00',
    });

    setIsSubmitting(false);
    if (!success) {
      setErrorMsg('Gagal memperbarui pengaturan perusahaan.');
    }
  };

  const handleResetToGeneric = () => {
    setCompanyName('PT InternTask Indonesia');
    setCompanyAddress('Gedung Graha InternTask Lt. 4, Kawasan Industri Candisari, Semarang, Jawa Tengah 50257 | Telp: (024) 845-6789 | Email: ops@interntask.id | Website: www.interntask.id');
    setLateToleranceTime('09:00');
    setLogoPreview(null);
    setErrorMsg(null);
    showToast('Form diatur ulang ke konfigurasi generik default.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-800">Pengaturan Perusahaan (White-Label)</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                KHUSUS DIREKTUR
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Sesuaikan identitas institusi, alamat kantor, dan logo instansi yang tercetak otomatis pada Kop Surat Laporan PDF.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToGeneric}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Default</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 2. Form Settings (Left Column) */}
        <div className="lg:col-span-6 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-600" />
                <span>Form Identitas Instansi / Perusahaan</span>
              </h2>
              <span className="text-[11px] text-slate-400">Database: settings</span>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Nama Perusahaan */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Perusahaan / Institusi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Contoh: PT InternTask Indonesia atau Universitas ..."
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Nama ini akan dicetak tebal dengan huruf kapital di bagian atas Kop Surat PDF.
              </p>
            </div>

            {/* Alamat Lengkap & Kontak */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Alamat Lengkap &amp; Informasi Kontak Resmi <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                placeholder="Gedung Graha Lt. 4, Jl. ..., Telp: ..., Email: ..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Tercetak di bawah nama perusahaan sebagai baris informasi alamat, nomor telepon, dan email.
              </p>
            </div>

            {/* Unggah Logo Perusahaan */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Logo Resmi Perusahaan (JPG / PNG)
              </label>
              <div className="mt-1 flex flex-col sm:flex-row items-center gap-4 p-4 border border-dashed border-slate-300 rounded-xl bg-slate-50/60">
                {/* Logo Preview Avatar */}
                <div className="w-20 h-20 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-2 shrink-0 overflow-hidden shadow-2xs">
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Logo Perusahaan" 
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-slate-400">
                      <ImageIcon className="w-7 h-7 mx-auto opacity-50" />
                      <span className="text-[9px] block mt-0.5">Tanpa Logo</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-center sm:text-left">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <label className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg font-medium text-xs cursor-pointer shadow-2xs transition-colors inline-flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-teal-600" />
                      <span>{logoPreview ? 'Ganti Logo' : 'Pilih File Logo'}</span>
                      <input
                        type="file"
                        accept="image/jpeg, image/png, image/jpg, image/webp"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>

                    {logoPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-medium text-xs cursor-pointer transition-colors inline-flex items-center gap-1 border border-rose-200"
                        title="Hapus logo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Disarankan rasio kotak atau horizontal (Maks. 2MB, JPG atau PNG transparan).
                  </p>
                </div>
              </div>
            </div>

            {/* Batas Waktu Absensi (Toleransi Keterlambatan) */}
            <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2">
              <label className="block font-bold text-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span>Batas Waktu Absensi (Toleransi Keterlambatan)</span>
                  <span className="text-rose-500">*</span>
                </span>
                <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Format 24 Jam
                </span>
              </label>

              <div className="flex items-center gap-2.5">
                <input
                  type="time"
                  value={lateToleranceTime}
                  onChange={(e) => setLateToleranceTime(e.target.value)}
                  required
                  className="w-36 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none shadow-2xs"
                />
                <span className="text-xs text-slate-500 font-semibold">WIB</span>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Peserta magang yang melakukan Clock In melebihi jam ini akan otomatis berstatus <strong>Terlambat</strong>.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* 3. Real-Time Live Preview of Kop Surat (Right Column) */}
        <div className="lg:col-span-6 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Eye className="w-4 h-4 text-teal-600" />
                <span>Pratinjau Kop Surat PDF (Live Preview)</span>
              </h2>
              <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                White-Label Mode
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Berikut tampilan kop surat resmi dokumen laporan saat dicetak ke format PDF sesuai data form di sebelah kiri:
            </p>

            {/* The Document Sheet Mockup */}
            <div className="border border-slate-300 rounded-xl p-5 bg-white shadow-md relative overflow-hidden font-sans">
              {/* Kop Surat Mockup */}
              <div className="border-b-4 border-double border-slate-900 pb-3.5 mb-4">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      {logoPreview ? (
                        <td className="w-16 align-middle pr-3">
                          <img
                            src={logoPreview}
                            alt="Logo Header"
                            className="w-14 max-h-14 object-contain mx-auto"
                          />
                        </td>
                      ) : null}
                      <td className={`align-middle ${logoPreview ? 'text-center' : 'text-center'}`}>
                        <h3 className="text-base font-extrabold uppercase tracking-wide text-slate-900 leading-tight">
                          {companyName || 'PT INTERNTASK INDONESIA'}
                        </h3>
                        <p className="text-[11px] font-semibold text-teal-700 mt-0.5">
                          Divisi Teknologi Informasi &amp; Manajemen Program Magang
                        </p>
                        <p className="text-[9.5px] text-slate-600 mt-1 leading-relaxed">
                          {companyAddress || 'Alamat lengkap kantor resmi, nomor kontak telepon, dan website institusi.'}
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Sample Document Title & Content Preview */}
              <div className="text-center my-3">
                <p className="text-xs font-bold uppercase underline text-slate-900">
                  Rekapitulasi Aktivitas Harian Peserta Magang
                </p>
                <p className="text-[9px] text-slate-500 mt-0.5">
                  Periode: 01 September 2026 s/d 30 September 2026 | No: IT-RPT-20260928-892
                </p>
              </div>

              {/* Sample Mini Table */}
              <div className="mt-3 border border-slate-200 rounded text-[9px]">
                <div className="bg-slate-100 font-bold p-1.5 border-b border-slate-200 grid grid-cols-12 text-slate-700">
                  <span className="col-span-1 text-center">No</span>
                  <span className="col-span-3">Tanggal</span>
                  <span className="col-span-5">Nama Intern &amp; Tugas</span>
                  <span className="col-span-3 text-center">Status</span>
                </div>
                <div className="p-1.5 grid grid-cols-12 border-b border-slate-100 text-slate-600">
                  <span className="col-span-1 text-center">1</span>
                  <span className="col-span-3">2026-09-28</span>
                  <span className="col-span-5 font-medium text-slate-800 truncate">Implementasi White-Label PDF</span>
                  <span className="col-span-3 text-center text-emerald-700 font-semibold">Completed</span>
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-200 flex justify-between items-center text-[8.5px] text-slate-400">
                <span>Dokumen Resmi Sistem InternTask - Terverifikasi Digital</span>
                <span>Halaman 1 dari 1</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-teal-50/70 border border-teal-200 rounded-xl text-teal-800 text-[11px] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              Perubahan logo dan nama perusahaan akan langsung diterapkan pada semua berkas cetak PDF dan spreadsheet Excel di seluruh sistem.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
