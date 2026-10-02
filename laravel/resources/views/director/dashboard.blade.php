@extends('layouts.app')

@section('title', 'Dashboard Direktur')
@section('page_title', 'Executive Director Dashboard')
@section('page_subtitle', 'Ringkasan performa dan pemantauan program magang tingkat korporat')

@section('content')
<div class="space-y-6">
    <!-- 1. Executive Banner -->
    <div class="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div class="flex items-start sm:items-center gap-4">
                <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-100 text-slate-800 font-bold text-2xl flex items-center justify-center border border-slate-300 shadow-2xs shrink-0">
                    {{ substr($user->name, 0, 2) }}
                </div>
                <div class="space-y-1.5">
                    <div class="flex flex-wrap items-center gap-2">
                        <h2 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-800">
                            {{ $user->name }}
                        </h2>
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300">
                            <i data-lucide="shield" class="w-3.5 h-3.5 text-slate-600"></i>
                            DIREKTUR EKSEKUTIF (READ-ONLY)
                        </span>
                    </div>

                    <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                        <span class="flex items-center gap-1.5">
                            <i data-lucide="building-2" class="w-3.5 h-3.5 text-slate-400"></i>
                            {{ $user->institution ?? 'PT InternTask Indonesia' }}
                        </span>
                        <span class="flex items-center gap-1.5">
                            <i data-lucide="activity" class="w-3.5 h-3.5 text-teal-600"></i>
                            Status Operasional: <strong class="text-emerald-700 font-semibold">Aktif &amp; Normal</strong>
                        </span>
                    </div>
                </div>
            </div>

            <!-- Quick Export Reports -->
            <div class="flex items-center gap-3">
                <a href="{{ route('reports.index') }}"
                    class="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer">
                    <i data-lucide="file-text" class="w-4 h-4"></i>
                    <span>Laporan Korporat</span>
                </a>
            </div>
        </div>
    </div>

    <!-- 2. Corporate Metrics Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Peserta Magang</p>
                    <p class="text-2xl font-extrabold text-slate-900 mt-1">{{ $totalInterns }}</p>
                </div>
                <div class="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <i data-lucide="users" class="w-5 h-5"></i>
                </div>
            </div>
            <p class="text-[11px] text-teal-600 mt-2 font-medium">Dari 5 Perguruan Tinggi</p>
        </div>

        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mentor Pembimbing</p>
                    <p class="text-2xl font-extrabold text-slate-900 mt-1">{{ $totalMentors }}</p>
                </div>
                <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <i data-lucide="award" class="w-5 h-5"></i>
                </div>
            </div>
            <p class="text-[11px] text-slate-400 mt-2">Lead Engineer &amp; Supervisor</p>
        </div>

        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Akumulasi Tugas</p>
                    <p class="text-2xl font-extrabold text-slate-900 mt-1">{{ $totalTasks }}</p>
                </div>
                <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <i data-lucide="check-square" class="w-5 h-5"></i>
                </div>
            </div>
            <p class="text-[11px] text-indigo-600 mt-2 font-medium">88% Tingkat Penyelesaian</p>
        </div>

        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Presensi Organisasi</p>
                    <p class="text-2xl font-extrabold text-emerald-600 mt-1">98.4%</p>
                </div>
                <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <i data-lucide="clock" class="w-5 h-5"></i>
                </div>
            </div>
            <p class="text-[11px] text-emerald-600 mt-2 font-medium">Tingkat kehadiran kantor</p>
        </div>
    </div>

    <!-- 3. Corporate Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                <i data-lucide="pie-chart" class="w-4 h-4 text-slate-700"></i>
                Sebaran Kategori Tugas Perusahaan
            </h3>
            <div class="h-60 relative">
                <canvas id="directorCategoryChart"></canvas>
            </div>
        </div>

        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                <i data-lucide="trending-up" class="w-4 h-4 text-teal-600"></i>
                Tren Output Penyelesaian Tugas Organisasi
            </h3>
            <div class="h-60 relative">
                <canvas id="directorTrendChart"></canvas>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function () {
    const catCtx = document.getElementById('directorCategoryChart');
    if (catCtx) {
        new Chart(catCtx, {
            type: 'bar',
            data: {
                labels: ['Development', 'Testing', 'Documentation', 'Meeting', 'Research', 'Design'],
                datasets: [{
                    label: 'Total Tugas',
                    data: [12, 6, 4, 3, 5, 2],
                    backgroundColor: '#0d9488',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });
    }

    const trendCtx = document.getElementById('directorTrendChart');
    if (trendCtx) {
        new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
                datasets: [{
                    label: 'Tugas Disetujui',
                    data: [4, 7, 5, 8, 6, 2, 3],
                    borderColor: '#0f172a',
                    backgroundColor: 'rgba(15, 23, 42, 0.08)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });
    }
});
</script>
@endpush
