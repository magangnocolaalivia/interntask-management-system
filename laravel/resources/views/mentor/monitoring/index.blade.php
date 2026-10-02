@extends('layouts.app')

@section('title', 'Pantau Kinerja Intern')
@section('page_title', 'Monitoring Kinerja Peserta')
@section('page_subtitle', 'Analisis komprehensif performa dan progres seluruh peserta magang bimbingan')

@section('content')
<div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @forelse($interns as $intern)
        @php
            $internTasks = $intern->tasks ?? collect([]);
            $totalT = $internTasks->count();
            $completedT = $internTasks->whereIn('status', ['Completed', 'Approved'])->count();
            $rateT = $totalT > 0 ? round(($completedT / $totalT) * 100) : 0;
        @endphp
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 font-bold text-base flex items-center justify-center border border-teal-200 shrink-0">
                        {{ substr($intern->name, 0, 2) }}
                    </div>
                    <div>
                        <h4 class="font-bold text-slate-900 text-sm">{{ $intern->name }}</h4>
                        <p class="text-[11px] text-slate-500">{{ $intern->institution ?? 'Politeknik' }}</p>
                        <p class="text-[10px] text-teal-700 font-medium">{{ $intern->study_program ?? 'Teknik Informatika' }}</p>
                    </div>
                </div>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Aktif
                </span>
            </div>

            <div class="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div class="flex justify-between items-center text-[11px]">
                    <span class="text-slate-500 font-medium">Tingkat Kelulusan Tugas</span>
                    <span class="font-bold text-teal-700">{{ $rateT }}% ({{ $completedT }}/{{ $totalT }})</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div class="bg-teal-600 h-2 rounded-full" style="width: {{ $rateT }}%"></div>
                </div>
            </div>

            <div class="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                <div class="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span class="text-[10px] text-slate-400 block font-semibold">Tugas</span>
                    <span class="font-bold text-slate-800 text-sm">{{ $totalT }}</span>
                </div>
                <div class="p-2 rounded-xl bg-emerald-50 border border-emerald-100">
                    <span class="text-[10px] text-emerald-600 block font-semibold">Approved</span>
                    <span class="font-bold text-emerald-700 text-sm">{{ $completedT }}</span>
                </div>
                <div class="p-2 rounded-xl bg-amber-50 border border-amber-100">
                    <span class="text-[10px] text-amber-600 block font-semibold">Review</span>
                    <span class="font-bold text-amber-700 text-sm">{{ $internTasks->where('status', 'Submitted')->count() }}</span>
                </div>
            </div>
        </div>
        @empty
        <div class="col-span-3 p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            Belum ada data peserta magang yang tercatat.
        </div>
        @endforelse
    </div>
</div>
@endsection
