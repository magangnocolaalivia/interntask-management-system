@extends('layouts.app')

@section('title', 'Dashboard Peserta Magang')
@section('page_title', 'Dashboard Peserta Magang')
@section('page_subtitle', 'Ringkasan progres aktivitas harian dan metrik evaluasi')

@section('content')
<div class="space-y-6">
    <!-- 1. Profile Banner Card -->
    <div class="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200">
            <div class="flex items-start sm:items-center gap-4">
                <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-teal-50 text-teal-700 font-bold text-2xl flex items-center justify-center border border-teal-200 shadow-2xs shrink-0">
                    {{ substr($user->name, 0, 2) }}
                </div>
                <div class="space-y-1.5">
                    <div class="flex flex-wrap items-center gap-2">
                        <h2 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-800">
                            {{ $user->name }}
                        </h2>
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                            <i data-lucide="user-check" class="w-3.5 h-3.5 text-teal-600"></i>
                            PESERTA MAGANG
                        </span>
                    </div>

                    <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                        <span class="flex items-center gap-1.5">
                            <i data-lucide="building-2" class="w-3.5 h-3.5 text-slate-400"></i>
                            {{ $user->institution ?? 'Politeknik Negeri Malang' }}
                        </span>
                        <span class="flex items-center gap-1.5">
                            <i data-lucide="book-open" class="w-3.5 h-3.5 text-slate-400"></i>
                            {{ $user->study_program ?? 'D4 Teknik Informatika' }}
                        </span>
                        <span class="flex items-center gap-1.5">
                            <i data-lucide="user" class="w-3.5 h-3.5 text-teal-600"></i>
                            Mentor: <strong class="text-slate-700 font-semibold">{{ $user->mentor->name ?? 'Hendra Wijaya, S.Kom' }}</strong>
                        </span>
                    </div>
                </div>
            </div>

            <!-- Quick Action Button -->
            <div class="flex items-center gap-3">
                <a href="{{ route('intern.tasks.index') }}"
                    class="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer">
                    <i data-lucide="plus" class="w-4 h-4"></i>
                    <span>Tugas Harian</span>
                </a>
            </div>
        </div>

        <!-- Period & Progress Bar -->
        <div class="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div class="flex items-center gap-2 text-slate-600">
                <i data-lucide="calendar" class="w-4 h-4 text-slate-400"></i>
                <span>Periode Magang: <strong class="text-slate-800">{{ $user->internship_start ?? '2026-07-01' }}</strong> s/d <strong class="text-slate-800">{{ $user->internship_end ?? '2026-12-31' }}</strong></span>
            </div>
            <div class="w-full sm:w-64 space-y-1">
                <div class="flex justify-between text-[11px] font-medium text-slate-600">
                    <span>Progress Magang</span>
                    <span class="font-bold text-teal-700">65%</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div class="bg-teal-600 h-2 rounded-full" style="width: 65%"></div>
                </div>
            </div>
        </div>
    </div>

    @php
        $total = $tasks->count();
        $completed = $tasks->whereIn('status', ['Completed', 'Approved'])->count();
        $inProgress = $tasks->where('status', 'In Progress')->count();
        $waitingReview = $tasks->whereIn('status', ['Submitted', 'Review'])->count();
        $revision = $tasks->where('status', 'Revision')->count();
        $completionRate = $total > 0 ? round(($completed / $total) * 100) : 0;
    @endphp

    <!-- 2. Metric Stat Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tugas</p>
                    <p class="text-2xl font-extrabold text-slate-900 mt-1">{{ $total }}</p>
                </div>
                <div class="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                    <i data-lucide="check-square" class="w-5 h-5"></i>
                </div>
            </div>
            <p class="text-[11px] text-slate-400 mt-2">Seluruh aktivitas yang tercatat</p>
        </div>

        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Tugas Selesai</p>
                    <p class="text-2xl font-extrabold text-emerald-600 mt-1">{{ $completed }}</p>
                </div>
                <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <i data-lucide="check-circle-2" class="w-5 h-5"></i>
                </div>
            </div>
            <p class="text-[11px] text-emerald-600 mt-2 font-medium">{{ $completionRate }}% dari total tugas</p>
        </div>

        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs font-semibold text-teal-600 uppercase tracking-wider">Dalam Proses</p>
                    <p class="text-2xl font-extrabold text-teal-700 mt-1">{{ $inProgress }}</p>
                </div>
                <div class="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <i data-lucide="play-circle" class="w-5 h-5"></i>
                </div>
            </div>
            <p class="text-[11px] text-slate-400 mt-2">Sedang aktif dikerjakan</p>
        </div>

        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Menunggu Review</p>
                    <p class="text-2xl font-extrabold text-indigo-600 mt-1">{{ $waitingReview }}</p>
                </div>
                <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <i data-lucide="clock" class="w-5 h-5"></i>
                </div>
            </div>
            <p class="text-[11px] text-slate-400 mt-2">Disubmit ke mentor</p>
        </div>
    </div>

    <!-- 3. Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Status Doughnut Chart -->
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div class="flex items-center justify-between">
                <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <i data-lucide="pie-chart" class="w-4 h-4 text-teal-600"></i>
                    Sebaran Status Tugas
                </h3>
            </div>
            <div class="h-56 relative flex items-center justify-center">
                <canvas id="internStatusChart"></canvas>
            </div>
        </div>

        <!-- Trend Line Chart -->
        <div class="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div class="flex items-center justify-between">
                <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <i data-lucide="trending-up" class="w-4 h-4 text-teal-600"></i>
                    Tren Aktivitas &amp; Jam Kerja (7 Hari Terakhir)
                </h3>
            </div>
            <div class="h-56 relative">
                <canvas id="internTrendChart"></canvas>
            </div>
        </div>
    </div>

    <!-- 4. Tasks Table & Quick View -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div class="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                <i data-lucide="check-square" class="w-4 h-4 text-teal-600"></i>
                Aktivitas Tugas Terbaru
            </h3>
            <a href="{{ route('intern.tasks.index') }}" class="text-xs font-semibold text-teal-600 hover:text-teal-800 flex items-center gap-1">
                <span>Lihat Semua</span>
                <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
            </a>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                        <th class="p-3.5 pl-5">Tanggal</th>
                        <th class="p-3.5">Judul Tugas</th>
                        <th class="p-3.5">Kategori</th>
                        <th class="p-3.5">Prioritas</th>
                        <th class="p-3.5">Progres</th>
                        <th class="p-3.5 pr-5 text-center">Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    @forelse($tasks->take(6) as $task)
                    <tr class="hover:bg-slate-50/80 transition-colors">
                        <td class="p-3.5 pl-5 font-mono text-slate-600 font-medium">{{ $task->task_date }}</td>
                        <td class="p-3.5 font-bold text-slate-900">{{ $task->title }}</td>
                        <td class="p-3.5 text-slate-600">{{ $task->category }}</td>
                        <td class="p-3.5">
                            @if($task->priority === 'Urgent')
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">Urgent</span>
                            @elseif($task->priority === 'High')
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">High</span>
                            @else
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">{{ $task->priority }}</span>
                            @endif
                        </td>
                        <td class="p-3.5">
                            <div class="flex items-center gap-2">
                                <div class="w-16 bg-slate-100 rounded-full h-1.5">
                                    <div class="bg-teal-600 h-1.5 rounded-full" style="width: {{ $task->progress }}%"></div>
                                </div>
                                <span class="text-[11px] font-medium text-slate-500">{{ $task->progress }}%</span>
                            </div>
                        </td>
                        <td class="p-3.5 pr-5 text-center">
                            @if(in_array($task->status, ['Completed', 'Approved']))
                                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Approved</span>
                            @elseif($task->status === 'In Progress')
                                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">In Progress</span>
                            @elseif($task->status === 'Revision')
                                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Revision</span>
                            @else
                                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">{{ $task->status }}</span>
                            @endif
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="6" class="p-8 text-center text-slate-400">
                            Belum ada aktivitas tugas yang tercatat. Silakan buat tugas harian baru.
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function () {
    // 1. Status Chart
    const statusCtx = document.getElementById('internStatusChart');
    if (statusCtx) {
        new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: ['Approved', 'In Progress', 'Waiting Review', 'Revision'],
                datasets: [{
                    data: [{{ $completed }}, {{ $inProgress }}, {{ $waitingReview }}, {{ $revision }}],
                    backgroundColor: ['#10b981', '#0d9488', '#6366f1', '#f59e0b'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { boxWidth: 10, font: { size: 10 } }
                    }
                },
                cutout: '70%'
            }
        });
    }

    // 2. Trend Chart
    const trendCtx = document.getElementById('internTrendChart');
    if (trendCtx) {
        new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
                datasets: [{
                    label: 'Tugas Selesai',
                    data: [1, 2, 1, 3, 2, 0, 1],
                    borderColor: '#0d9488',
                    backgroundColor: 'rgba(13, 148, 136, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } }
                }
            }
        });
    }
});
</script>
@endpush
