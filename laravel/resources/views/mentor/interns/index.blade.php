@extends('layouts.app')

@section('title', 'Daftar Peserta Magang')
@section('page_title', 'Peserta Magang Binaan')
@section('page_subtitle', 'Kelola dan pantau biodata peserta magang di bawah bimbingan Anda')

@section('content')
<div class="space-y-6">
    <div class="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                        <th class="p-3.5 pl-5">Nama Peserta</th>
                        <th class="p-3.5">Kontak &amp; Email</th>
                        <th class="p-3.5">Institusi &amp; Jurusan</th>
                        <th class="p-3.5">Periode Magang</th>
                        <th class="p-3.5 text-center">Total Tugas</th>
                        <th class="p-3.5 pr-5 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    @forelse($interns as $intern)
                    <tr class="hover:bg-slate-50/80 transition-colors">
                        <td class="p-3.5 pl-5">
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-xs border border-teal-200">
                                    {{ substr($intern->name, 0, 2) }}
                                </div>
                                <div>
                                    <p class="font-bold text-slate-900">{{ $intern->name }}</p>
                                    <p class="text-[11px] text-slate-400">ID: INT-{{ str_pad($intern->id, 4, '0', STR_PAD_LEFT) }}</p>
                                </div>
                            </div>
                        </td>
                        <td class="p-3.5 font-mono text-slate-600">
                            <p>{{ $intern->email }}</p>
                            <p class="text-[11px] text-slate-400">{{ $intern->phone ?? '+62 812-3456-7890' }}</p>
                        </td>
                        <td class="p-3.5">
                            <p class="font-semibold text-slate-800">{{ $intern->institution ?? 'Politeknik Negeri Malang' }}</p>
                            <p class="text-[11px] text-slate-500">{{ $intern->study_program ?? 'D4 Teknik Informatika' }}</p>
                        </td>
                        <td class="p-3.5 font-mono text-slate-600 whitespace-nowrap">
                            {{ $intern->internship_start ?? '2026-07-01' }} s/d {{ $intern->internship_end ?? '2026-12-31' }}
                        </td>
                        <td class="p-3.5 text-center font-bold text-slate-800">
                            {{ $intern->tasks ? $intern->tasks->count() : 0 }}
                        </td>
                        <td class="p-3.5 pr-5 text-right">
                            <a href="{{ route('mentor.monitoring') }}"
                                class="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold transition-colors">
                                Lihat Kinerja
                            </a>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="6" class="p-8 text-center text-slate-400">
                            Belum ada peserta magang bimbingan yang terdaftar.
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection
