@php
    $user = Auth::user();
@endphp

<header class="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-2xs z-10">
    <!-- Left info / Page Title -->
    <div class="flex items-center gap-3">
        <div>
            <h1 class="text-sm font-bold text-slate-800 tracking-tight">
                @yield('page_title', 'Dashboard')
            </h1>
            <p class="text-[11px] text-slate-500 hidden sm:block">
                @yield('page_subtitle', 'Sistem Manajemen & Monitoring Tugas Harian Magang')
            </p>
        </div>
    </div>

    <!-- Right Controls: Role Badge & User Profile -->
    <div class="flex items-center gap-3">
        <!-- Role Badge -->
        @if($user->role === 'director')
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                <i data-lucide="shield" class="w-3.5 h-3.5 text-slate-600"></i>
                DIREKTUR (READ-ONLY)
            </span>
        @elseif($user->role === 'mentor')
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <i data-lucide="award" class="w-3.5 h-3.5 text-amber-600"></i>
                MENTOR / PEMBIMBING
            </span>
        @else
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                <i data-lucide="user-check" class="w-3.5 h-3.5 text-teal-600"></i>
                PESERTA MAGANG
            </span>
        @endif

        <!-- Direct Logout Action -->
        <form method="POST" action="{{ route('logout') }}" class="inline">
            @csrf
            <button type="submit" title="Keluar"
                class="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer">
                <i data-lucide="log-out" class="w-4 h-4"></i>
            </button>
        </form>
    </div>
</header>
