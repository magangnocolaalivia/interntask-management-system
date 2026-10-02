@extends('layouts.app')

@section('title', 'Masuk ke Portal Korporat')

@section('content')
<div class="min-h-screen flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 bg-slate-50">
    <div class="max-w-7xl mx-auto w-full flex items-center justify-between">
        <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                IT
            </div>
            <span class="text-xl font-bold text-slate-800 tracking-tight">
                Intern<span class="text-teal-600">Task</span>
            </span>
            <span class="text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                Corporate Portal
            </span>
        </div>
    </div>

    <div class="w-full max-w-md mx-auto my-auto py-8">
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-7 sm:p-9 space-y-6">
            <div class="text-center space-y-2">
                <div class="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-2 border border-teal-100 shadow-2xs">
                    <i data-lucide="shield-check" class="w-6 h-6"></i>
                </div>
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

            <form method="POST" action="{{ route('login.authenticate') }}" class="space-y-4 text-xs">
                @csrf
                <div class="space-y-1">
                    <label class="block font-semibold text-slate-700">Alamat Email</label>
                    <input type="email" name="email" value="{{ old('email', 'intern1@example.com') }}" required autofocus
                        class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none"
                        placeholder="name@company.com">
                </div>

                <div class="space-y-1">
                    <label class="block font-semibold text-slate-700">Kata Sandi</label>
                    <input type="password" name="password" value="password" required
                        class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none font-mono"
                        placeholder="••••••••">
                </div>

                <div class="flex items-center justify-between text-xs pt-1">
                    <label class="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                        <input type="checkbox" name="remember" class="w-3.5 h-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500">
                        <span>Ingat saya</span>
                    </label>
                </div>

                <button type="submit"
                    class="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2">
                    <i data-lucide="log-in" class="w-4 h-4"></i>
                    <span>Masuk ke Portal</span>
                </button>
            </form>

            <!-- Demo Credentials Helper -->
            <div class="pt-4 border-t border-slate-100 space-y-2">
                <p class="text-[11px] font-bold text-slate-700 text-center">Akun Demo Cepat (Password: <code class="bg-slate-100 px-1 py-0.5 rounded font-mono text-teal-700">password</code>):</p>
                <div class="grid grid-cols-3 gap-2 text-[10px]">
                    <button type="button" onclick="document.querySelector('input[name=email]').value='intern1@example.com';document.querySelector('input[name=password]').value='password';"
                        class="p-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-center font-medium border border-teal-200 cursor-pointer">
                        Intern 1
                    </button>
                    <button type="button" onclick="document.querySelector('input[name=email]').value='mentor1@example.com';document.querySelector('input[name=password]').value='password';"
                        class="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-center font-medium border border-amber-200 cursor-pointer">
                        Mentor 1
                    </button>
                    <button type="button" onclick="document.querySelector('input[name=email]').value='director@example.com';document.querySelector('input[name=password]').value='password';"
                        class="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-center font-medium border border-slate-300 cursor-pointer">
                        Direktur
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div class="max-w-7xl mx-auto w-full text-center text-xs text-slate-400">
        <p>© 2026 InternTask Platform. Dilindungi Hak Cipta Perusahaan.</p>
    </div>
</div>
@endsection
