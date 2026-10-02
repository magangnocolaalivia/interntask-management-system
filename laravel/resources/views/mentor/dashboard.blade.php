@extends('layouts.app')

@section('title', 'Dashboard Mentor Pembimbing')
@section('page_title', 'Dashboard Mentor')
@section('page_subtitle', 'Monitoring performa peserta magang dan validasi review tugas')

@section('content')
<div class="space-y-6">
    <!-- 1. Header Banner -->
    <div class="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div class="flex items-start sm:items-center gap-4">
                <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-amber-50 text-amber-700 font-bold text-2xl flex items-center justify-center border border-amber-200 shadow-2xs shrink-0">
                    {{ substr($user->name, 0, 2) }}
                </div>
                <div class="space-y-1.5">
                    <div class="flex flex-wrap items-center gap-2">
                        <h2 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-800">
                            {{ $user->name }}
                        </h2>
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <i data-lucide="award" class="w-3.5 h-3.5 text-amber-600"></i>
                            MENTOR / PEMBIMBING LAPANGAN
                        </span>
                    </div>

                    <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                        <span class="flex items-center gap-1.5">
                            <i data-lucide="building-2" class="w-3.5 h-3.5 text-slate-400"></i>
                            {{ $user->institution ?? 'PT. Teknologi Nusantara Solusi' }}
                        </span>
                        <span class="flex items-center gap-1.5">
                            <i data-lucide="users" class="w-3.5 h-3.5 text-amber-600"></i>
                            Membina: <strong class="text-slate-800 font-semibold">{{ $interns->count() }} Peserta Magang</strong>
                        </span>
                    </div>
                </div>
            </div>

            <!-- Quick Action Button -->
            <div class="flex items-center gap-3">
                <a href="{{ route('mentor.reviews') }}"
                    class="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer">
                    <i data-lucide="clipboard-check" class="w-4 h-4"></i>
                    <span>Review Tugas ({{ $pendingReviews }})</span>
                </a>
            </div>
        </div>
    </div>

    <!-- 2. Metric Stat Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Intern</p>
                    <p class="text-2xl font-extrabold text-slate-900 mt-1">{{ $interns->count() }}</p>
                </div>
                <div class="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                    <i data-lucide="users" class="w-5 h-5"></i>
                </div>
            </div>
            <p class="text-[11px] text-slate-400 mt-2">Peserta di bawah bimbingan</p>
        </div>

        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs font-semibold text-amber-600 uppercase tracking-wider">Perlu Direview</p>
                    <p class="text-2xl font-extrabold text-amber-600 mt-1">{{ $pendingReviews }}</p>
                </div>
                <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <i data-lucide="clipboard-check" class="w-5 h-5"></i>
                </div>
            </div>
            <p class="text-[11px] text-amber-600 mt-2 font-medium">Tugas status Submitted</p>
        </div>

        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Tugas Selesai</p>
                    <p class="text-2xl font-extrabold text-emerald-600 mt-1">18</p>
                </div>
                <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <i data-lucide="check-circle-2" class="w-5 h-5"></i>
                </div>
            </div>
            <p class="text-[11px] text-slate-400 mt-2">Sudah divalidasi</p>
        </div>

        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs font-semibold text-teal-600 uppercase tracking-wider">Kehadiran Rata-rata</p>
                    <p class="text-2xl font-extrabold text-teal-600 mt-1">96%</p>
                </div>
                <div class="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <i data-lucide="clock" class="w-5 h-5"></i>
                </div>
            </div>
            <p class="text-[11px] text-slate-400 mt-2">Bulan September 2026</p>
        </div>
    </div>

    <!-- 3. Supervised Interns Quick Table -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div class="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                <i data-lucide="users" class="w-4 h-4 text-amber-600"></i>
                Daftar Peserta Magang Binaan
            </h3>
            <a href="{{ route('mentor.interns') }}" class="text-xs font-semibold text-amber-600 hover:text-amber-800 flex items-center gap-1">
                <span>Kelola Intern</span>
                <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
            </a>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                        <th class="p-3.5 pl-5">Nama Peserta</th>
                        <th class="p-3.5">Institusi &amp; Prodi</th>
                        <th class="p-3.5">Periode Magang</th>
                        <th class="p-3.5 text-center">Status</th>
                        <th class="p-3.5 pr-5 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    @forelse($interns as $intern)
                    <tr class="hover:bg-slate-50/80 transition-colors">
                        <td class="p-3.5 pl-5">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-xs">
                                    {{ substr($intern->name, 0, 2) }}
                                </div>
                                <div>
                                    <p class="font-bold text-slate-900">{{ $intern->name }}</p>
                                    <p class="text-[11px] text-slate-400 font-mono">{{ $intern->email }}</p>
                                </div>
                            </div>
                        </td>
                        <td class="p-3.5">
                            <p class="font-semibold text-slate-800">{{ $intern->institution ?? 'Politeknik Negeri Malang' }}</p>
                            <p class="text-[11px] text-slate-500">{{ $intern->study_program ?? 'D4 Teknik Informatika' }}</p>
                        </td>
                        <td class="p-3.5 font-mono text-slate-600 whitespace-nowrap">
                            {{ $intern->internship_start ?? '2026-07-01' }} s/d {{ $intern->internship_end ?? '2026-12-31' }}
                        </td>
                        <td class="p-3.5 text-center">
                            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                                Aktif Magang
                            </span>
                        </td>
                        <td class="p-3.5 pr-5 text-right">
                            <a href="{{ route('mentor.monitoring') }}"
                                class="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold transition-colors">
                                Pantau Kinerja
                            </a>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="5" class="p-8 text-center text-slate-400">
                            Belum ada peserta magang yang ditugaskan di bawah bimbingan Anda.
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection
