<!DOCTYPE html>
<html lang="id" class="h-full bg-slate-50">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ config('app.name', 'InternTask') }} - @yield('title', 'Sistem Manajemen & Monitoring Tugas Magang')</title>
    
    <!-- Google Fonts: Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    },
                    colors: {
                        teal: {
                            50: '#f0fdfa',
                            100: '#ccfbf1',
                            200: '#99f6e4',
                            300: '#5eead4',
                            400: '#2dd4bf',
                            500: '#14b8a6',
                            600: '#0d9488',
                            700: '#0f766e',
                            800: '#115e59',
                            900: '#134e4a',
                        }
                    }
                }
            }
        }
    </script>
    
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>
    @stack('styles')
</head>
<body class="h-full bg-slate-50 text-slate-800 antialiased flex flex-col md:flex-row overflow-hidden">

    @auth
        <!-- Sidebar Partial -->
        @include('layouts.partials.sidebar')

        <!-- Main Content Area -->
        <div class="flex-1 flex flex-col h-screen overflow-hidden">
            <!-- Navbar Partial -->
            @include('layouts.partials.navbar')

            <!-- Scrollable Page Content -->
            <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <!-- Flash Messages -->
                @if(session('success'))
                    <div class="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between text-teal-800 text-xs shadow-xs">
                        <div class="flex items-center gap-2">
                            <i data-lucide="check-circle-2" class="w-4 h-4 text-teal-600 shrink-0"></i>
                            <span>{{ session('success') }}</span>
                        </div>
                        <button onclick="this.parentElement.remove()" class="text-teal-600 hover:text-teal-800">
                            <i data-lucide="x" class="w-4 h-4"></i>
                        </button>
                    </div>
                @endif

                @if(session('error'))
                    <div class="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-rose-800 text-xs shadow-xs">
                        <div class="flex items-center gap-2">
                            <i data-lucide="alert-circle" class="w-4 h-4 text-rose-600 shrink-0"></i>
                            <span>{{ session('error') }}</span>
                        </div>
                        <button onclick="this.parentElement.remove()" class="text-rose-600 hover:text-rose-800">
                            <i data-lucide="x" class="w-4 h-4"></i>
                        </button>
                    </div>
                @endif

                @yield('content')
            </main>
        </div>
    @else
        <!-- Guest View (Login / Error) -->
        <div class="flex-1 overflow-y-auto">
            @yield('content')
        </div>
    @endauth

    <!-- Initialize Lucide Icons -->
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        });
    </script>
    @stack('scripts')
</body>
</html>
