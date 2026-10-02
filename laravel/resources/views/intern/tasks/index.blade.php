@extends('layouts.app')

@section('title', 'Daftar Tugas Harian')
@section('page_title', 'Daily Tasks')
@section('page_subtitle', 'Pencatatan dan pemantauan aktivitas tugas harian')

@section('content')
<div class="space-y-6">
    <!-- Header Controls & New Task Button -->
    <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <form method="GET" action="{{ route('intern.tasks.index') }}" class="flex flex-wrap items-center gap-3 flex-1 text-xs">
            <div class="relative min-w-[200px] flex-1">
                <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
                <input type="text" name="search" value="{{ request('search') }}" placeholder="Cari tugas atau deskripsi..."
                    class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none">
            </div>

            <select name="status" onchange="this.form.submit()" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none text-slate-700">
                <option value="All">Semua Status</option>
                <option value="In Progress" {{ request('status') === 'In Progress' ? 'selected' : '' }}>In Progress</option>
                <option value="Submitted" {{ request('status') === 'Submitted' ? 'selected' : '' }}>Submitted</option>
                <option value="Approved" {{ request('status') === 'Approved' ? 'selected' : '' }}>Approved</option>
                <option value="Revision" {{ request('status') === 'Revision' ? 'selected' : '' }}>Revision</option>
            </select>

            <select name="priority" onchange="this.form.submit()" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none text-slate-700">
                <option value="All">Semua Prioritas</option>
                <option value="Urgent" {{ request('priority') === 'Urgent' ? 'selected' : '' }}>Urgent</option>
                <option value="High" {{ request('priority') === 'High' ? 'selected' : '' }}>High</option>
                <option value="Medium" {{ request('priority') === 'Medium' ? 'selected' : '' }}>Medium</option>
                <option value="Low" {{ request('priority') === 'Low' ? 'selected' : '' }}>Low</option>
            </select>

            <button type="submit" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 font-semibold rounded-xl text-slate-700 transition-colors">
                Filter
            </button>
        </form>

        <button onclick="document.getElementById('createTaskModal').classList.remove('hidden')"
            class="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>Buat Tugas Baru</span>
        </button>
    </div>

    <!-- Task List Table -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                        <th class="p-3.5 pl-5">Tanggal</th>
                        <th class="p-3.5">Judul &amp; Kategori</th>
                        <th class="p-3.5">Deadline</th>
                        <th class="p-3.5">Prioritas</th>
                        <th class="p-3.5">Durasi</th>
                        <th class="p-3.5">Progres</th>
                        <th class="p-3.5 text-center">Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    @forelse($tasks as $task)
                    <tr class="hover:bg-slate-50/80 transition-colors">
                        <td class="p-3.5 pl-5 font-mono text-slate-600 font-medium whitespace-nowrap">{{ $task->task_date }}</td>
                        <td class="p-3.5">
                            <p class="font-bold text-slate-900 text-xs">{{ $task->title }}</p>
                            <p class="text-[11px] text-teal-700 font-medium">[{{ $task->category }}]</p>
                        </td>
                        <td class="p-3.5 font-mono text-slate-600 whitespace-nowrap">{{ $task->deadline }}</td>
                        <td class="p-3.5">
                            @if($task->priority === 'Urgent')
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">Urgent</span>
                            @elseif($task->priority === 'High')
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">High</span>
                            @else
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">{{ $task->priority }}</span>
                            @endif
                        </td>
                        <td class="p-3.5 font-mono text-slate-700">{{ $task->estimated_duration }} Jam</td>
                        <td class="p-3.5">
                            <div class="flex items-center gap-2">
                                <div class="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                    <div class="bg-teal-600 h-1.5 rounded-full" style="width: {{ $task->progress }}%"></div>
                                </div>
                                <span class="text-[11px] font-medium text-slate-600">{{ $task->progress }}%</span>
                            </div>
                        </td>
                        <td class="p-3.5 text-center">
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
                        <td colspan="7" class="p-8 text-center text-slate-400">
                            Tidak ada data tugas yang sesuai dengan pencarian atau filter.
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        @if($tasks->hasPages())
        <div class="p-4 border-t border-slate-100">
            {{ $tasks->links() }}
        </div>
        @endif
    </div>
</div>

<!-- Modal: Create New Task -->
<div id="createTaskModal" class="hidden fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
                <i data-lucide="plus-circle" class="w-4 h-4 text-teal-600"></i>
                Catat Tugas Harian Baru
            </h3>
            <button onclick="document.getElementById('createTaskModal').classList.add('hidden')" class="text-slate-400 hover:text-slate-600 cursor-pointer">
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
        </div>

        <form method="POST" action="{{ route('intern.tasks.store') }}" class="space-y-4 text-xs">
            @csrf
            <div class="space-y-1">
                <label class="block font-semibold text-slate-700">Judul Tugas <span class="text-rose-500">*</span></label>
                <input type="text" name="title" required placeholder="Contoh: Implementasi modul reporting export CSV"
                    class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none">
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                    <label class="block font-semibold text-slate-700">Tanggal Pelaksanaan <span class="text-rose-500">*</span></label>
                    <input type="date" name="task_date" required value="{{ date('Y-m-d') }}"
                        class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none">
                </div>
                <div class="space-y-1">
                    <label class="block font-semibold text-slate-700">Deadline <span class="text-rose-500">*</span></label>
                    <input type="date" name="deadline" required value="{{ date('Y-m-d') }}"
                        class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none">
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                    <label class="block font-semibold text-slate-700">Kategori <span class="text-rose-500">*</span></label>
                    <select name="category" required class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none">
                        <option value="Development">Development</option>
                        <option value="Testing">Testing</option>
                        <option value="Documentation">Documentation</option>
                        <option value="Meeting">Meeting</option>
                        <option value="Research">Research</option>
                        <option value="Design">Design</option>
                    </select>
                </div>
                <div class="space-y-1">
                    <label class="block font-semibold text-slate-700">Tingkat Prioritas <span class="text-rose-500">*</span></label>
                    <select name="priority" required class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none">
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                    </select>
                </div>
            </div>

            <div class="space-y-1">
                <label class="block font-semibold text-slate-700">Deskripsi Aktivitas <span class="text-rose-500">*</span></label>
                <textarea name="description" rows="3" required placeholder="Jelaskan secara spesifik apa yang dikerjakan..."
                    class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none"></textarea>
            </div>

            <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button type="button" onclick="document.getElementById('createTaskModal').classList.add('hidden')"
                    class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 cursor-pointer">
                    Batal
                </button>
                <button type="submit"
                    class="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 font-semibold text-white shadow-xs cursor-pointer flex items-center gap-1.5">
                    <i data-lucide="check" class="w-4 h-4"></i>
                    <span>Simpan Tugas</span>
                </button>
            </div>
        </form>
    </div>
</div>
@endsection
