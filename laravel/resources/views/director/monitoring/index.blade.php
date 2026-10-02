@extends('layouts.app')

@section('title', 'Pantau Kinerja Organisasi')
@section('page_title', 'Pantau Kinerja Magang (Direktur)')
@section('page_subtitle', 'Pemantauan read-only seluruh performa peserta magang perusahaan')

@section('content')
<div class="space-y-6">
    <div class="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                        <th class="p-3.5 pl-5">Nama Intern</th>
                        <th class="p-3.5">Institusi &amp; Prodi</th>
                        <th class="p-3.5">Mentor Pembimbing</th>
                        <th class="p-3.5 text-center">Total Tugas</th>
                        <th class="p-3.5 text-center">Kelulusan Tugas</th>
                        <th class="p-3.5 pr-5 text-center">Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    @forelse($interns as $intern)
                    @php
                        $tTasks = $intern->tasks ?? collect([]);
                        $cTasks = $tTasks->whereIn('status', ['Completed', 'Approved'])->count();
                        $rTasks = $tTasks->count() > 0 ? round(($cTasks / $tTasks->count()) * 100) : 0;
                    @endphp
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
                        <td class="p-3.5">
                            <p class="font-semibold text-slate-800">{{ $intern->mentor->name ?? 'Hendra Wijaya, S.Kom' }}</p>
                            <p class="text-[11px] text-amber-700 font-medium">Mentor Pembimbing</p>
                        </td>
                        <td class="p-3.5 text-center font-bold text-slate-800">
                            {{ $tTasks->count() }}
                        </td>
                        <td class="p-3.5 text-center">
                            <div class="flex items-center justify-center gap-2">
                                <span class="font-bold text-emerald-700">{{ $rTasks }}%</span>
                                <span class="text-[11px] text-slate-400">({{ $cTasks }} selesai)</span>
                            </div>
                        </td>
                        <td class="p-3.5 pr-5 text-center">
                            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                                Aktif Magang
                            </span>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="6" class="p-8 text-center text-slate-400">
                            Belum ada data peserta magang yang tercatat.
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection
