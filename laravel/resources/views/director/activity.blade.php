@extends('layouts.app')

@section('title', 'Log Aktivitas Organisasi')
@section('page_title', 'Log Aktivitas Magang Organisasi')
@section('page_subtitle', 'Audit trail dan riwayat aktivitas seluruh peserta magang secara kronologis')

@section('content')
<div class="space-y-6">
    <div class="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div class="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                <i data-lucide="activity" class="w-4 h-4 text-slate-700"></i>
                Audit Trail Aktivitas Terbaru
            </h3>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                        <th class="p-3.5 pl-5">Waktu</th>
                        <th class="p-3.5">Peserta Magang</th>
                        <th class="p-3.5">Judul Tugas &amp; Kategori</th>
                        <th class="p-3.5">Progres</th>
                        <th class="p-3.5 pr-5 text-center">Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    @forelse($tasks as $task)
                    <tr class="hover:bg-slate-50/80 transition-colors">
                        <td class="p-3.5 pl-5 font-mono text-slate-500 whitespace-nowrap">
                            {{ $task->updated_at ? $task->updated_at->format('d/m/Y H:i') : $task->task_date }}
                        </td>
                        <td class="p-3.5">
                            <p class="font-bold text-slate-900">{{ $task->user->name ?? '-' }}</p>
                            <p class="text-[11px] text-slate-400">{{ $task->user->institution ?? '-' }}</p>
                        </td>
                        <td class="p-3.5">
                            <p class="font-bold text-slate-900">{{ $task->title }}</p>
                            <p class="text-[11px] text-teal-700 font-medium">[{{ $task->category }}] Prioritas: {{ $task->priority }}</p>
                        </td>
                        <td class="p-3.5">
                            <span class="font-bold text-slate-700">{{ $task->progress }}%</span>
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
                        <td colspan="5" class="p-8 text-center text-slate-400">
                            Belum ada log aktivitas yang tercatat.
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        @if(method_exists($tasks, 'hasPages') && $tasks->hasPages())
        <div class="p-4 border-t border-slate-100">
            {{ $tasks->links() }}
        </div>
        @endif
    </div>
</div>
@endsection
