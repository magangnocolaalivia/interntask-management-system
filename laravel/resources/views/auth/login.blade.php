@extends('layouts.app')

@section('title', 'Masuk ke Portal Korporat')

@section('content')
<div class="min-h-screen flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto w-full flex items-center justify-between">
        <div class="flex items-center gap-2">
            <span class="text-xl font-bold text-slate-800 tracking-tight">
                Intern<span class="text-teal-600">Task</span>
            </span>
            <span class="text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-zinc-200">
                Corporate Portal
            </span>
        </div>
    </div>

    <div class="w-full max-w-md mx-auto my-auto py-8">
        <div class="bg-white rounded-2xl shadow-sm border border-zinc-200 p-7 sm:p-9 space-y-6">
            <div class="text-center space-y-2">
                <h2 class="text-xl font-bold text-slate-900 tracking-tight">
                    Selamat Datang Kembali
                </h2>
                <p class="text-xs text-slate-500 max-w-xs mx-auto">
                    Silakan masuk ke portal manajemen magang & evaluasi kinerja instansi
                </p>
            </div>

            @if ($errors->any())
                <div class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                    <ul class="list-disc list-inside space-y-1">
                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <form method="POST" action="{{ route('login') }}" class="space-y-4 text-xs">
                @csrf
                <div class="space-y-1">
                    <label class="block font-semibold text-slate-700">Alamat Email</label>
                    <input type="email" name="email" value="{{ old('email') }}" required autofocus
                        class="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none"
                        placeholder="name@company.com">
                </div>

                <div class="space-y-1">
                    <label class="block font-semibold text-slate-700">Kata Sandi</label>
                    <input type="password" name="password" required
                        class="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none font-mono"
                        placeholder="••••••••">
                </div>

                <div class="flex items-center justify-between text-xs pt-1">
                    <label class="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                        <input type="checkbox" name="remember" class="w-3.5 h-3.5 rounded border-zinc-300 text-teal-600 focus:ring-teal-500">
                        <span>Ingat saya</span>
                    </label>
                </div>

                <button type="submit"
                    class="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2">
                    <span>Masuk ke Portal</span>
                </button>
            </form>

            <div class="pt-4 border-t border-zinc-100 text-center">
                <p class="text-[11px] text-slate-400">
                    Pendaftaran akun baru dikelola secara terpusat oleh Departemen HRD & Manajemen.
                </p>
            </div>
        </div>
    </div>

    <div class="max-w-7xl mx-auto w-full text-center text-xs text-slate-400">
        <p>© 2026 InternTask Platform. Dilindungi Hak Cipta Perusahaan.</p>
    </div>
</div>
@endsection
