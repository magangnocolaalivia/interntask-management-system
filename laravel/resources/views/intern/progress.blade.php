@extends('layouts.app')

@section('title', 'My Progress')
@section('page_title', 'My Progress')
@section('page_subtitle', 'Evaluasi pencapaian kompetensi dan riwayat catatan mentor')

@section('content')
<div class="space-y-6">
    @php
        $total = $tasks->count();
        $completed = $tasks->whereIn('status', ['Completed', 'Approved'])->count();
        $rate = $total > 0 ? round(($completed / $total) * 100) : 0;
    @endphp

    <!-- Top Summary Banner -->
    <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div class="space-y-2">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                    <i data-lucide="award" class="w-3.5 h-3.5 text-teal-600"></i>
                    EVALUASI PERFORMA MAGANG
                </span>
                <h2 class="text-xl font-bold text-slate-800">
                    Progres Keseluruhan Tugas &amp; Evaluasi Mentor
                </h2>
                <p class="text-xs text-slate-500 max-w-xl">
                    Rekapitulasi penyelesaian tugas berkala yang telah divalidasi oleh mentor pembimbing lapangan.
                </p>
            </div>

            <!-- Rate Badge -->
            <div class="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div class="w-14 h-14 rounded-full bg-teal-600 text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
                    {{ $rate }}%
                </div>
                <div>
                    <p class="text-xs font-bold text-slate-800">Tingkat Penyelesaian</p>
                    <p class="text-[11px] text-slate-500">{{ $completed }} dari {{ $total }} tugas disetujui</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Feedbacks Timeline & Recent Tasks -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Mentor Feedback Logs -->
        <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                <i data-lucide="message-square" class="w-4 h-4 text-teal-600"></i>
                Catatan &amp; Umpan Balik Mentor
            </h3>

            <div class="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                @forelse($feedbacks as $fb)
                <div class="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1.5 text-xs">
                    <div class="flex items-center justify-between">
                        <span class="font-bold text-slate-900">{{ $fb->mentor->name ?? 'Mentor' }}</span>
                        <span class="text-[10px] text-slate-400 font-mono">{{ $fb->created_at ? $fb->created_at->format('d/m/Y H:i') : '-' }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        @if($fb->action === 'approved')
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Approved</span>
                        @elseif($fb->action === 'revision')
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Revision Required</span>
                        @else
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">Rejected</span>
                        @endif
                    </div>
                    <p class="text-slate-600 leading-relaxed">{{ $fb->message }}</p>
                </div>
                @empty
                <div class="p-8 text-center text-slate-400 text-xs">
                    Belum ada catatan feedback review dari mentor.
                </div>
                @endforelse
            </div>
        </div>

        <!-- Task Progress Breakdown -->
        <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                <i data-lucide="check-square" class="w-4 h-4 text-teal-600"></i>
                Rincian Progres Tugas
            </h3>

            <div class="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                @forelse($tasks as $t)
                <div class="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 space-y-2 text-xs">
                    <div class="flex items-center justify-between">
                        <h4 class="font-bold text-slate-900 truncate max-w-xs">{{ $t->title }}</h4>
                        <span class="font-mono text-slate-500 font-medium">{{ $t->task_date }}</span>
                    </div>
                    <div class="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div class="bg-teal-600 h-2 rounded-full transition-all" style="width: {{ $t->progress }}%"></div>
                    </div>
                    <div class="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{{ $t->category }}</span>
                        <span class="font-bold text-slate-700">{{ $t->progress }}% Selesai</span>
                    </div>
                </div>
                @empty
                <div class="p-8 text-center text-slate-400 text-xs">
                    Belum ada tugas yang tercatat.
                </div>
                @endforelse
            </div>
        </div>
    </div>
</div>
@endsection
