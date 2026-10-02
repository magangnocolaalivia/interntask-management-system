@extends('layouts.app')

@section('title', 'Manajemen Pengguna')
@section('page_title', 'Manajemen Pengguna & Akun')
@section('page_subtitle', 'Pengelolaan data akun pengguna Direktur, Mentor, dan Peserta Magang')

@section('content')
<div class="space-y-6">
    <!-- Header Controls & Add User Button -->
    <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <form method="GET" action="{{ route('director.users.index') }}" class="flex flex-wrap items-center gap-3 flex-1 text-xs">
            <div class="relative min-w-[220px] flex-1">
                <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
                <input type="text" name="search" value="{{ request('search') }}" placeholder="Cari nama, email, institusi..."
                    class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none">
            </div>

            <select name="role" onchange="this.form.submit()" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none text-slate-700">
                <option value="">Semua Role</option>
                <option value="intern" {{ request('role') === 'intern' ? 'selected' : '' }}>Peserta Magang</option>
                <option value="mentor" {{ request('role') === 'mentor' ? 'selected' : '' }}>Mentor</option>
                <option value="director" {{ request('role') === 'director' ? 'selected' : '' }}>Direktur</option>
            </select>

            <button type="submit" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 font-semibold rounded-xl text-slate-700 transition-colors">
                Filter
            </button>
        </form>

        <button onclick="document.getElementById('createUserModal').classList.remove('hidden')"
            class="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0">
            <i data-lucide="user-plus" class="w-4 h-4"></i>
            <span>Tambah Pengguna</span>
        </button>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                        <th class="p-3.5 pl-5">Nama Pengguna</th>
                        <th class="p-3.5">Email / Kontak</th>
                        <th class="p-3.5">Role</th>
                        <th class="p-3.5">Institusi &amp; Info</th>
                        <th class="p-3.5 pr-5 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    @forelse($users as $u)
                    <tr class="hover:bg-slate-50/80 transition-colors">
                        <td class="p-3.5 pl-5">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs border border-slate-200">
                                    {{ substr($u->name, 0, 2) }}
                                </div>
                                <div>
                                    <p class="font-bold text-slate-900">{{ $u->name }}</p>
                                    <p class="text-[11px] text-slate-400">ID: USR-{{ str_pad($u->id, 4, '0', STR_PAD_LEFT) }}</p>
                                </div>
                            </div>
                        </td>
                        <td class="p-3.5 font-mono text-slate-600">
                            <p>{{ $u->email }}</p>
                            <p class="text-[11px] text-slate-400">{{ $u->phone ?? '-' }}</p>
                        </td>
                        <td class="p-3.5">
                            @if($u->role === 'director')
                                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300">Direktur</span>
                            @elseif($u->role === 'mentor')
                                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Mentor</span>
                            @else
                                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">Intern</span>
                            @endif
                        </td>
                        <td class="p-3.5">
                            <p class="font-semibold text-slate-800">{{ $u->institution ?? 'PT InternTask Indonesia' }}</p>
                            <p class="text-[11px] text-slate-500">{{ $u->study_program ?? '-' }}</p>
                        </td>
                        <td class="p-3.5 pr-5 text-right">
                            <div class="flex items-center justify-end gap-2">
                                @if($u->id !== Auth::id())
                                <form method="POST" action="{{ route('director.users.destroy', $u->id) }}" onsubmit="return confirm('Apakah Anda yakin ingin menghapus pengguna {{ addslashes($u->name) }}?');" class="inline">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer" title="Hapus Pengguna">
                                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                                    </button>
                                </form>
                                @endif
                            </div>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="5" class="p-8 text-center text-slate-400">
                            Tidak ada data pengguna yang ditemukan.
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        @if(method_exists($users, 'hasPages') && $users->hasPages())
        <div class="p-4 border-t border-slate-100">
            {{ $users->links() }}
        </div>
        @endif
    </div>
</div>

<!-- Modal: Create New User -->
<div id="createUserModal" class="hidden fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
                <i data-lucide="user-plus" class="w-4 h-4 text-teal-600"></i>
                Tambah Pengguna Baru
            </h3>
            <button onclick="document.getElementById('createUserModal').classList.add('hidden')" class="text-slate-400 hover:text-slate-600 cursor-pointer">
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
        </div>

        <form method="POST" action="{{ route('director.users.store') }}" class="space-y-4 text-xs">
            @csrf
            <div class="space-y-1">
                <label class="block font-semibold text-slate-700">Nama Lengkap <span class="text-rose-500">*</span></label>
                <input type="text" name="name" required placeholder="Nama lengkap peserta atau mentor"
                    class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none">
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                    <label class="block font-semibold text-slate-700">Alamat Email <span class="text-rose-500">*</span></label>
                    <input type="email" name="email" required placeholder="user@company.com"
                        class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none">
                </div>
                <div class="space-y-1">
                    <label class="block font-semibold text-slate-700">Kata Sandi <span class="text-rose-500">*</span></label>
                    <input type="password" name="password" required placeholder="Minimal 6 karakter"
                        class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-mono">
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                    <label class="block font-semibold text-slate-700">Role Pengguna <span class="text-rose-500">*</span></label>
                    <select name="role" required class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none">
                        <option value="intern">Peserta Magang (Intern)</option>
                        <option value="mentor">Mentor / Pembimbing</option>
                        <option value="director">Direktur</option>
                    </select>
                </div>
                <div class="space-y-1">
                    <label class="block font-semibold text-slate-700">Nomor Telepon / WhatsApp</label>
                    <input type="text" name="phone" placeholder="+62 812-xxxx-xxxx"
                        class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none">
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                    <label class="block font-semibold text-slate-700">Institusi / Universitas</label>
                    <input type="text" name="institution" placeholder="Contoh: Politeknik Negeri Malang"
                        class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none">
                </div>
                <div class="space-y-1">
                    <label class="block font-semibold text-slate-700">Program Studi / Divisi</label>
                    <input type="text" name="study_program" placeholder="Contoh: D4 Teknik Informatika"
                        class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none">
                </div>
            </div>

            <div class="space-y-1">
                <label class="block font-semibold text-slate-700">Pilih Mentor Pembimbing (Khusus Intern)</label>
                <select name="mentor_id" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none">
                    <option value="">-- Tanpa Mentor / Tidak Berlaku --</option>
                    @foreach($mentors as $mentor)
                        <option value="{{ $mentor->id }}">{{ $mentor->name }} ({{ $mentor->email }})</option>
                    @endforeach
                </select>
            </div>

            <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button type="button" onclick="document.getElementById('createUserModal').classList.add('hidden')"
                    class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 cursor-pointer">
                    Batal
                </button>
                <button type="submit"
                    class="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 font-semibold text-white shadow-xs cursor-pointer flex items-center gap-1.5">
                    <i data-lucide="check" class="w-4 h-4"></i>
                    <span>Simpan Pengguna</span>
                </button>
            </div>
        </form>
    </div>
</div>
@endsection
