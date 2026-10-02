@php
    $user = Auth::user();
    $currentRoute = request()->route() ? request()->route()->getName() : '';
@endphp

<!-- Sidebar Container -->
<aside class="w-64 bg-white text-slate-600 flex flex-col border-r border-slate-200 h-screen shrink-0 z-20">
    <!-- Brand / Header in Sidebar -->
    <div class="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
        <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                IT
            </div>
            <div>
                <span class="text-xl font-bold text-slate-800 tracking-tight">
                    Intern<span class="text-teal-600">Task</span>
                </span>
                <span class="block text-[10px] text-slate-400 font-medium -mt-1">
                    Corporate Portal
                </span>
            </div>
        </div>
    </div>

    <!-- User Mini Profile Card -->
    <div class="p-4 border-b border-slate-100 bg-slate-50/50">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm border border-teal-200 shrink-0">
                {{ substr($user->name, 0, 2) }}
            </div>
            <div class="overflow-hidden">
                <h4 class="text-xs font-bold text-slate-900 truncate">{{ $user->name }}</h4>
                <p class="text-[11px] text-slate-500 truncate">{{ $user->email }}</p>
                <div class="mt-1">
                    @if($user->role === 'director')
                        <span class="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-200 text-slate-700">
                            DIREKTUR
                        </span>
                    @elseif($user->role === 'mentor')
                        <span class="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                            MENTOR
                        </span>
                    @else
                        <span class="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-teal-100 text-teal-800">
                            INTERN
                        </span>
                    @endif
                </div>
            </div>
        </div>
    </div>

    <!-- Navigation Links -->
    <nav class="flex-1 overflow-y-auto p-3 space-y-1 text-xs">
        @if($user->role === 'intern')
            <!-- Intern Nav Links -->
            <a href="{{ route('intern.dashboard') }}"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all {{ str_contains($currentRoute, 'intern.dashboard') ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100' }}">
                <i data-lucide="layout-dashboard" class="w-4 h-4"></i>
                <span>Dashboard</span>
            </a>
            <a href="{{ route('intern.tasks.index') }}"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all {{ str_contains($currentRoute, 'intern.tasks') ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100' }}">
                <i data-lucide="check-square" class="w-4 h-4"></i>
                <span>Daily Tasks</span>
            </a>
            <a href="{{ route('intern.progress') }}"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all {{ str_contains($currentRoute, 'intern.progress') ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100' }}">
                <i data-lucide="trending-up" class="w-4 h-4"></i>
                <span>My Progress</span>
            </a>
            <a href="{{ route('intern.reports') }}"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all {{ str_contains($currentRoute, 'reports') || str_contains($currentRoute, 'intern.reports') ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100' }}">
                <i data-lucide="file-text" class="w-4 h-4"></i>
                <span>Reports</span>
            </a>

        @elseif($user->role === 'mentor')
            <!-- Mentor Nav Links -->
            <a href="{{ route('mentor.dashboard') }}"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all {{ str_contains($currentRoute, 'mentor.dashboard') ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100' }}">
                <i data-lucide="layout-dashboard" class="w-4 h-4"></i>
                <span>Dashboard</span>
            </a>
            <a href="{{ route('mentor.interns') }}"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all {{ str_contains($currentRoute, 'mentor.interns') ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100' }}">
                <i data-lucide="users" class="w-4 h-4"></i>
                <span>Intern Bimbingan</span>
            </a>
            <a href="{{ route('mentor.reviews') }}"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all {{ str_contains($currentRoute, 'mentor.reviews') ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100' }}">
                <i data-lucide="clipboard-check" class="w-4 h-4"></i>
                <span>Task Review</span>
            </a>
            <a href="{{ route('mentor.monitoring') }}"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all {{ str_contains($currentRoute, 'mentor.monitoring') ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100' }}">
                <i data-lucide="activity" class="w-4 h-4"></i>
                <span>Pantau Kinerja</span>
            </a>
            <a href="{{ route('reports.index') }}"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all {{ str_contains($currentRoute, 'reports') ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100' }}">
                <i data-lucide="file-text" class="w-4 h-4"></i>
                <span>Reports</span>
            </a>

        @elseif($user->role === 'director')
            <!-- Director Nav Links -->
            <a href="{{ route('director.dashboard') }}"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all {{ str_contains($currentRoute, 'director.dashboard') ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100' }}">
                <i data-lucide="layout-dashboard" class="w-4 h-4"></i>
                <span>Dashboard</span>
            </a>
            <a href="{{ route('director.users.index') }}"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all {{ str_contains($currentRoute, 'director.users') ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100' }}">
                <i data-lucide="users" class="w-4 h-4"></i>
                <span>Manajemen Pengguna</span>
            </a>
            <a href="{{ route('director.monitoring') }}"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all {{ str_contains($currentRoute, 'director.monitoring') ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100' }}">
                <i data-lucide="trending-up" class="w-4 h-4"></i>
                <span>Pantau Kinerja</span>
            </a>
            <a href="{{ route('director.activity') }}"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all {{ str_contains($currentRoute, 'director.activity') ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100' }}">
                <i data-lucide="activity" class="w-4 h-4"></i>
                <span>Log Aktivitas</span>
            </a>
            <a href="{{ route('reports.index') }}"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all {{ str_contains($currentRoute, 'reports') ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100' }}">
                <i data-lucide="bar-chart-3" class="w-4 h-4"></i>
                <span>Reports</span>
            </a>
            <a href="{{ route('director.settings.index') }}"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all {{ str_contains($currentRoute, 'director.settings') ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100' }}">
                <i data-lucide="settings" class="w-4 h-4"></i>
                <span>Pengaturan Perusahaan</span>
            </a>
        @endif
    </nav>

    <!-- Logout Button at bottom of sidebar -->
    <div class="p-4 border-t border-slate-200">
        <form method="POST" action="{{ route('logout') }}">
            @csrf
            <button type="submit"
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer">
                <i data-lucide="log-out" class="w-4 h-4"></i>
                <span>Keluar (Logout)</span>
            </button>
        </form>
    </div>
</aside>
