@extends('layouts.app')

@section('title', 'Pengaturan Perusahaan')
@section('page_title', 'Pengaturan Perusahaan (White-Label)')
@section('page_subtitle', 'Kustomisasi identitas perusahaan, kop surat resmi, dan pejabat penandatangan dokumen')

@section('content')
<div class="space-y-6 max-w-4xl">
    <div class="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <form method="POST" action="{{ route('director.settings.update') }}" enctype="multipart/form-data" class="space-y-6 text-xs">
            @csrf
            @method('PUT')

            <div class="border-b border-slate-100 pb-4">
                <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <i data-lucide="building-2" class="w-4 h-4 text-teal-600"></i>
                    Identitas Resmi Instansi / Perusahaan
                </h3>
                <p class="text-slate-500 text-[11px] mt-1">Informasi ini akan tercetak otomatis pada kop surat laporan PDF resmi.</p>
            </div>

            <div class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="block font-semibold text-slate-700">Nama Perusahaan <span class="text-rose-500">*</span></label>
                        <input type="text" name="company_name" required value="{{ old('company_name', $setting->company_name ?? 'PT InternTask Indonesia') }}"
                            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none">
                    </div>
                    <div class="space-y-1">
                        <label class="block font-semibold text-slate-700">Tagline / Slogan Perusahaan</label>
                        <input type="text" name="company_tagline" value="{{ old('company_tagline', $setting->company_tagline ?? 'Enterprise Internship & Performance Management') }}"
                            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none">
                    </div>
                </div>

                <div class="space-y-1">
                    <label class="block font-semibold text-slate-700">Alamat Kantor Lengkap</label>
                    <textarea name="address" rows="3" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none">{{ old('address', $setting->address ?? 'Gedung Cyber 2 Lantai 18, Jl. HR Rasuna Said Blok X-5 No. 13, Jakarta Selatan') }}</textarea>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div class="space-y-1">
                        <label class="block font-semibold text-slate-700">Email Resmi</label>
                        <input type="email" name="email" value="{{ old('email', $setting->email ?? 'contact@interntask.id') }}"
                            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none">
                    </div>
                    <div class="space-y-1">
                        <label class="block font-semibold text-slate-700">Nomor Telepon</label>
                        <input type="text" name="phone" value="{{ old('phone', $setting->phone ?? '+62 21 5290 8888') }}"
                            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none">
                    </div>
                    <div class="space-y-1">
                        <label class="block font-semibold text-slate-700">Situs Web</label>
                        <input type="text" name="website" value="{{ old('website', $setting->website ?? 'https://interntask.id') }}"
                            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none">
                    </div>
                </div>
            </div>

            <div class="border-t border-slate-100 pt-6">
                <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                    <i data-lucide="shield-check" class="w-4 h-4 text-teal-600"></i>
                    Pejabat Penandatangan Laporan (Direksi)
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="block font-semibold text-slate-700">Nama Lengkap &amp; Gelar Direktur</label>
                        <input type="text" name="director_name" value="{{ old('director_name', $setting->director_name ?? 'Budi Santoso, M.Kom') }}"
                            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none">
                    </div>
                    <div class="space-y-1">
                        <label class="block font-semibold text-slate-700">Jabatan Resmi</label>
                        <input type="text" name="director_title" value="{{ old('director_title', $setting->director_title ?? 'Direktur Utama & CEO') }}"
                            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none">
                    </div>
                </div>
            </div>

            <div class="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="submit"
                    class="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 font-semibold text-white text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer">
                    <i data-lucide="save" class="w-4 h-4"></i>
                    <span>Simpan Perubahan</span>
                </button>
            </div>
        </form>
    </div>
</div>
@endsection
