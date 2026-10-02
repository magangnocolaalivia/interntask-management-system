@extends('layouts.app')

@section('title', 'Laporan & Ekspor')
@section('page_title', 'Laporan & Rekapitulasi Tugas Magang')
@section('page_subtitle', 'Filter dinamis data tugas magang dan ekspor resmi format PDF serta Excel/CSV')

@section('content')
<div class="space-y-6">
    <!-- Filter & Export Controls Card -->
    <div class="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <form method="GET" action="{{ route('reports.index') }}" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            <div class="space-y-1">
                <label class="block font-semibold text-slate-700">Tanggal Mulai</label>
                <input type="date" name="start_date" value="{{ request('start_date', date('Y-m-01')) }}"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none">
            </div>

            <div class="space-y-1">
                <label class="block font-semibold text-slate-700">Tanggal Selesai</label>
                <input type="date" name="end_date" value="{{ request('end_date', date('Y-m-d')) }}"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none">
            </div>

            <div class="space-y-1">
                <label class="block font-semibold text-slate-700">Status Tugas</label>
                <select name="status" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none">
                    <option value="All">Semua Status</option>
                    <option value="Approved" {{ request('status') === 'Approved' ? 'selected' : '' }}>Approved / Selesai</option>
                    <option value="In Progress" {{ request('status') === 'In Progress' ? 'selected' : '' }}>In Progress</option>
                    <option value="Submitted" {{ request('status') === 'Submitted' ? 'selected' : '' }}>Submitted (Review)</option>
                    <option value="Revision" {{ request('status') === 'Revision' ? 'selected' : '' }}>Revision</option>
                </select>
            </div>

            <div class="space-y-1">
                <label class="block font-semibold text-slate-700">Kategori</label>
                <select name="category" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none">
                    <option value="All">Semua Kategori</option>
                    <option value="Development" {{ request('category') === 'Development' ? 'selected' : '' }}>Development</option>
                    <option value="Testing" {{ request('category') === 'Testing' ? 'selected' : '' }}>Testing</option>
                    <option value="Documentation" {{ request('category') === 'Documentation' ? 'selected' : '' }}>Documentation</option>
                    <option value="Meeting" {{ request('category') === 'Meeting' ? 'selected' : '' }}>Meeting</option>
                    <option value="Research" {{ request('category') === 'Research' ? 'selected' : '' }}>Research</option>
                    <option value="Design" {{ request('category') === 'Design' ? 'selected' : '' }}>Design</option>
                </select>
            </div>

            <div class="flex items-end gap-2">
                <button type="submit"
                    class="w-full py-2.5 bg-slate-800 hover:bg-slate-900 font-semibold text-white rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                    <i data-lucide="filter" class="w-4 h-4"></i>
                    <span>Terapkan</span>
                </button>
            </div>
        </form>

        <!-- Export Buttons -->
        <div class="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <div class="text-xs text-slate-500">
                Menampilkan <strong class="text-slate-800">{{ count($tasks) }}</strong> data tugas terfilter
            </div>

            <div class="flex items-center gap-2 text-xs">
                <a href="{{ route('reports.excel', request()->all()) }}"
                    class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5">
                    <i data-lucide="file-spreadsheet" class="w-4 h-4"></i>
                    <span>Ekspor Excel / CSV</span>
                </a>
                <a href="{{ route('reports.pdf', request()->all()) }}" target="_blank"
                    class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5">
                    <i data-lucide="file-text" class="w-4 h-4"></i>
                    <span>Cetak PDF Resmi</span>
                </a>
            </div>
        </div>
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                        <th class="p-3.5 pl-5">No</th>
                        <th class="p-3.5">Tanggal</th>
                        <th class="p-3.5">Peserta Magang</th>
                        <th class="p-3.5">Judul Tugas</th>
                        <th class="p-3.5">Kategori</th>
                        <th class="p-3.5 text-center">Durasi</th>
                        <th class="p-3.5 text-center">Progres</th>
                        <th class="p-3.5 pr-5 text-center">Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    @forelse($tasks as $idx => $t)
                    <tr class="hover:bg-slate-50/80 transition-colors">
                        <td class="p-3.5 pl-5 text-slate-400 font-mono">{{ $idx + 1 }}</td>
                        <td class="p-3.5 font-mono text-slate-600 whitespace-nowrap">{{ $t->task_date }}</td>
                        <td class="p-3.5">
                            <p class="font-bold text-slate-900">{{ $t->user->name ?? '-' }}</p>
                            <p class="text-[11px] text-slate-400">{{ $t->user->institution ?? '-' }}</p>
                        </td>
                        <td class="p-3.5 font-semibold text-slate-900">{{ $t->title }}</td>
                        <td class="p-3.5 text-slate-600">{{ $t->category }}</td>
                        <td class="p-3.5 text-center font-mono text-slate-700">{{ $t->estimated_duration }} Jam</td>
                        <td class="p-3.5 text-center font-bold text-teal-700">{{ $t->progress }}%</td>
                        <td class="p-3.5 pr-5 text-center">
                            @if(in_array($t->status, ['Completed', 'Approved']))
                                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Approved</span>
                            @elseif($t->status === 'In Progress')
                                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">In Progress</span>
                            @elseif($t->status === 'Revision')
                                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Revision</span>
                            @else
                                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">{{ $t->status }}</span>
                            @endif
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="8" class="p-10 text-center text-slate-400">
                            Tidak ada data tugas yang sesuai dengan kriteria filter yang dipilih.
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection
