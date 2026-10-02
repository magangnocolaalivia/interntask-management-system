@extends('layouts.app')

@section('title', 'Task Review')
@section('page_title', 'Task Review & Validation')
@section('page_subtitle', 'Validasi pengerjaan tugas harian peserta magang bimbingan')

@section('content')
<div class="space-y-6">
    <!-- Header Banner -->
    <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <i data-lucide="clipboard-check" class="w-5 h-5"></i>
            </div>
            <div>
                <h3 class="text-sm font-bold text-slate-900">Antrean Review Tugas Masuk</h3>
                <p class="text-xs text-slate-500">Tugas yang telah disubmit oleh peserta magang dan menunggu umpan balik mentor.</p>
            </div>
        </div>
        <span class="px-3 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-full border border-amber-200">
            {{ $tasks->total() ?? $tasks->count() }} Tugas Menunggu
        </span>
    </div>

    <!-- Review Tasks Table -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                        <th class="p-3.5 pl-5">Tanggal</th>
                        <th class="p-3.5">Peserta Magang</th>
                        <th class="p-3.5">Judul &amp; Kategori</th>
                        <th class="p-3.5">Prioritas</th>
                        <th class="p-3.5">Hasil / Tautan</th>
                        <th class="p-3.5 pr-5 text-right">Aksi Evaluasi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    @forelse($tasks as $task)
                    <tr class="hover:bg-slate-50/80 transition-colors">
                        <td class="p-3.5 pl-5 font-mono text-slate-600 whitespace-nowrap">{{ $task->task_date }}</td>
                        <td class="p-3.5">
                            <p class="font-bold text-slate-900">{{ $task->user->name ?? '-' }}</p>
                            <p class="text-[11px] text-slate-500">{{ $task->user->institution ?? '-' }}</p>
                        </td>
                        <td class="p-3.5">
                            <p class="font-bold text-slate-900">{{ $task->title }}</p>
                            <p class="text-[11px] text-teal-700">[{{ $task->category }}] Durasi: {{ $task->estimated_duration }} Jam</p>
                        </td>
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
                            <p class="text-slate-600 line-clamp-1">{{ $task->result ?? $task->description }}</p>
                            @if($task->repository_link)
                                <a href="{{ $task->repository_link }}" target="_blank" class="text-teal-600 hover:underline inline-flex items-center gap-1 text-[11px]">
                                    <i data-lucide="github" class="w-3 h-3"></i> Repository
                                </a>
                            @endif
                        </td>
                        <td class="p-3.5 pr-5 text-right">
                            <button onclick="openReviewModal({{ $task->id }}, '{{ addslashes($task->title) }}', '{{ addslashes($task->user->name ?? '') }}')"
                                class="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 font-semibold text-white transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 ml-auto">
                                <i data-lucide="check-square" class="w-3.5 h-3.5"></i>
                                <span>Evaluasi</span>
                            </button>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="6" class="p-10 text-center text-slate-400">
                            Tidak ada tugas yang menunggu review saat ini. Semua tugas sudah selesai divalidasi.
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

<!-- Modal Review Dialog -->
<div id="reviewModal" class="hidden fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
                <i data-lucide="clipboard-check" class="w-4 h-4 text-amber-600"></i>
                Validasi &amp; Umpan Balik Mentor
            </h3>
            <button onclick="document.getElementById('reviewModal').classList.add('hidden')" class="text-slate-400 hover:text-slate-600 cursor-pointer">
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
        </div>

        <div>
            <p class="text-xs text-slate-500">Tugas: <strong id="modalTaskTitle" class="text-slate-800"></strong></p>
            <p class="text-xs text-slate-500">Peserta: <strong id="modalInternName" class="text-slate-800"></strong></p>
        </div>

        <form id="reviewForm" method="POST" action="" class="space-y-4 text-xs">
            @csrf
            <div class="space-y-1">
                <label class="block font-semibold text-slate-700">Keputusan Validasi <span class="text-rose-500">*</span></label>
                <div class="grid grid-cols-3 gap-2">
                    <label class="p-2.5 rounded-xl border border-slate-200 flex flex-col items-center gap-1 cursor-pointer hover:bg-slate-50 text-center has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50/50 has-[:checked]:text-emerald-800">
                        <input type="radio" name="action" value="approved" checked class="hidden">
                        <i data-lucide="check-circle" class="w-4 h-4 text-emerald-600"></i>
                        <span class="font-bold text-[11px]">Setujui</span>
                    </label>
                    <label class="p-2.5 rounded-xl border border-slate-200 flex flex-col items-center gap-1 cursor-pointer hover:bg-slate-50 text-center has-[:checked]:border-amber-500 has-[:checked]:bg-amber-50/50 has-[:checked]:text-amber-800">
                        <input type="radio" name="action" value="revision" class="hidden">
                        <i data-lucide="alert-triangle" class="w-4 h-4 text-amber-600"></i>
                        <span class="font-bold text-[11px]">Minta Revisi</span>
                    </label>
                    <label class="p-2.5 rounded-xl border border-slate-200 flex flex-col items-center gap-1 cursor-pointer hover:bg-slate-50 text-center has-[:checked]:border-rose-500 has-[:checked]:bg-rose-50/50 has-[:checked]:text-rose-800">
                        <input type="radio" name="action" value="rejected" class="hidden">
                        <i data-lucide="x-circle" class="w-4 h-4 text-rose-600"></i>
                        <span class="font-bold text-[11px]">Tolak</span>
                    </label>
                </div>
            </div>

            <div class="space-y-1">
                <label class="block font-semibold text-slate-700">Catatan &amp; Masukan Mentor <span class="text-rose-500">*</span></label>
                <textarea name="message" rows="4" required placeholder="Tuliskan catatan apresiasi, masukan kualitas kode, atau poin yang harus diperbaiki..."
                    class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none"></textarea>
            </div>

            <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button type="button" onclick="document.getElementById('reviewModal').classList.add('hidden')"
                    class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 cursor-pointer">
                    Batal
                </button>
                <button type="submit"
                    class="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 font-semibold text-white shadow-xs cursor-pointer flex items-center gap-1.5">
                    <i data-lucide="send" class="w-4 h-4"></i>
                    <span>Kirim Evaluasi</span>
                </button>
            </div>
        </form>
    </div>
</div>
@endsection

@push('scripts')
<script>
function openReviewModal(taskId, title, internName) {
    document.getElementById('modalTaskTitle').textContent = title;
    document.getElementById('modalInternName').textContent = internName;
    document.getElementById('reviewForm').action = '/mentor/tasks/' + taskId + '/review';
    document.getElementById('reviewModal').classList.remove('hidden');
}
</script>
@endpush
