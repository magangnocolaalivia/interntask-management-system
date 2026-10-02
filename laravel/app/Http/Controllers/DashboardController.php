<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Attendance;
use App\Models\User;
use App\Models\Task;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DashboardController extends Controller
{
    /**
     * Show login view
     */
    public function login()
    {
        if (Auth::check()) {
            $user = Auth::user();
            return redirect(match ($user->role) {
                'intern' => '/intern/dashboard',
                'mentor' => '/mentor/dashboard',
                'director' => '/director/dashboard',
                default => '/',
            });
        }

        return view('auth.login');
    }

    /**
     * Handle login authentication
     */
    public function authenticate(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $remember = $request->boolean('remember');

        if (!Auth::attempt($credentials, $remember)) {
            throw ValidationException::withMessages([
                'email' => __('Email atau kata sandi yang Anda masukkan tidak sesuai.'),
            ]);
        }

        $request->session()->regenerate();

        $user = Auth::user();
        $redirectUrl = match ($user->role) {
            'intern' => '/intern/dashboard',
            'mentor' => '/mentor/dashboard',
            'director' => '/director/dashboard',
            default => '/',
        };

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Login berhasil.',
                'user' => $user,
                'redirect' => $redirectUrl,
            ]);
        }

        return redirect()->intended($redirectUrl);
    }

    /**
     * Handle logout
     */
    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Anda telah berhasil logout.',
                'redirect' => '/login',
            ]);
        }

        return redirect('/login');
    }

    /**
     * Intern Dashboard View
     */
    public function internDashboard(Request $request)
    {
        $user = Auth::user();
        $tasks = Task::where('user_id', $user->id)->latest('task_date')->get();
        $todayAttendance = Attendance::where('user_id', $user->id)->where('date', Carbon::today()->toDateString())->first();

        return view('intern.dashboard', compact('user', 'tasks', 'todayAttendance'));
    }

    /**
     * Mentor Dashboard View
     */
    public function mentorDashboard(Request $request)
    {
        $user = Auth::user();
        $interns = User::where('mentor_id', $user->id)->get();
        $pendingReviews = Task::whereIn('user_id', $interns->pluck('id'))->where('status', 'Submitted')->count();

        return view('mentor.dashboard', compact('user', 'interns', 'pendingReviews'));
    }

    /**
     * Director Dashboard View
     */
    public function directorDashboard(Request $request)
    {
        $user = Auth::user();
        $totalUsers = User::count();
        $totalInterns = User::where('role', 'intern')->count();
        $totalMentors = User::where('role', 'mentor')->count();
        $totalTasks = Task::count();

        return view('director.dashboard', compact('user', 'totalUsers', 'totalInterns', 'totalMentors', 'totalTasks'));
    }

    /**
     * Director Monitoring View
     */
    public function directorMonitoring(Request $request)
    {
        $interns = User::where('role', 'intern')->with(['mentor', 'tasks'])->get();
        return view('director.monitoring.index', compact('interns'));
    }

    /**
     * Director Activity View
     */
    public function directorActivity(Request $request)
    {
        $tasks = Task::with('user')->latest()->paginate(20);
        return view('director.activity', compact('tasks'));
    }

    /**
     * Get chart and metric data for Intern Dashboard (Scoped to Auth User).
     */
    public function internDashboardData(Request $request)
    {
        $user = Auth::user();
        $userId = $user->id;

        // 1. Task Status Distribution
        $tasks = DB::table('tasks')->where('user_id', $userId)->get();
        $totalTasks = $tasks->count();
        $completedTasks = $tasks->whereIn('status', ['Completed', 'Approved'])->count();
        $inProgressTasks = $tasks->where('status', 'In Progress')->count();
        $waitingReviewTasks = $tasks->whereIn('status', ['Submitted', 'Review'])->count();
        $revisionTasks = $tasks->where('status', 'Revision')->count();

        $now = Carbon::now();
        $overdueTasks = $tasks->filter(function ($t) use ($now) {
            if (in_array($t->status, ['Completed', 'Approved'])) return false;
            return Carbon::parse($t->deadline)->lt($now);
        })->count();

        $statusChart = [
            'labels' => ['Completed', 'In Progress', 'Waiting Review', 'Revision', 'Overdue'],
            'datasets' => [
                [
                    'data' => [$completedTasks, $inProgressTasks, $waitingReviewTasks, $revisionTasks, $overdueTasks],
                    'backgroundColor' => ['#10b981', '#0d9488', '#6366f1', '#f59e0b', '#f43f5e'],
                    'borderColor' => '#ffffff',
                    'borderWidth' => 2,
                    'hoverOffset' => 4,
                ]
            ]
        ];

        // 2. 7-Day Trend (Completed Tasks & Actual Work Hours)
        $sevenDayLabels = [];
        $completedSeries = [];
        $hoursSeries = [];

        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $dateStr = $date->toDateString();
            $sevenDayLabels[] = $date->locale('id')->isoFormat('ddd, DD/MM');

            // Completed tasks on this date
            $completedCount = $tasks->filter(function ($t) use ($dateStr) {
                $isCompleted = in_array($t->status, ['Completed', 'Approved']);
                return $isCompleted && ($t->task_date === $dateStr || (isset($t->updated_at) && str_starts_with($t->updated_at, $dateStr)));
            })->count();
            $completedSeries[] = $completedCount;

            // Actual work hours logged from attendance
            $attendance = Attendance::where('user_id', $userId)
                ->where('date', $dateStr)
                ->whereIn('status', ['present', 'late'])
                ->first();

            $hours = 0;
            if ($attendance && $attendance->clock_in && $attendance->clock_out) {
                $in = Carbon::parse($attendance->clock_in);
                $out = Carbon::parse($attendance->clock_out);
                $hours = round(max(0, $out->diffInMinutes($in)) / 60, 1);
            }
            $hoursSeries[] = $hours;
        }

        $trendChart = [
            'labels' => $sevenDayLabels,
            'datasets' => [
                [
                    'label' => 'Tugas Selesai',
                    'data' => $completedSeries,
                    'borderColor' => '#0d9488',
                    'backgroundColor' => 'rgba(13, 148, 136, 0.12)',
                    'tension' => 0.4,
                    'fill' => true,
                    'borderWidth' => 2.5,
                ],
                [
                    'label' => 'Jam Kerja Aktual (Jam)',
                    'data' => $hoursSeries,
                    'borderColor' => '#6366f1',
                    'backgroundColor' => 'rgba(99, 102, 241, 0.08)',
                    'tension' => 0.4,
                    'fill' => true,
                    'borderWidth' => 2,
                ]
            ]
        ];

        return response()->json([
            'success' => true,
            'hasData' => $totalTasks > 0,
            'totalTasks' => $totalTasks,
            'completedTasks' => $completedTasks,
            'statusChart' => $statusChart,
            'trendChart' => $trendChart,
        ]);
    }

    /**
     * Get chart and metric data for Mentor Dashboard (Scoped to Mentor's Interns).
     */
    public function mentorDashboardData(Request $request)
    {
        $mentor = Auth::user();
        $internIds = User::where('mentor_id', $mentor->id)->pluck('id')->toArray();

        $tasks = DB::table('tasks')->whereIn('user_id', $internIds)->get();
        $totalTasks = $tasks->count();
        $completedTasks = $tasks->whereIn('status', ['Completed', 'Approved'])->count();
        $inProgressTasks = $tasks->where('status', 'In Progress')->count();
        $waitingReviewTasks = $tasks->whereIn('status', ['Submitted', 'Review'])->count();
        $revisionTasks = $tasks->where('status', 'Revision')->count();

        $now = Carbon::now();
        $overdueTasks = $tasks->filter(function ($t) use ($now) {
            if (in_array($t->status, ['Completed', 'Approved'])) return false;
            return Carbon::parse($t->deadline)->lt($now);
        })->count();

        $statusChart = [
            'labels' => ['Completed', 'In Progress', 'Waiting Review', 'Revision', 'Overdue'],
            'datasets' => [
                [
                    'data' => [$completedTasks, $inProgressTasks, $waitingReviewTasks, $revisionTasks, $overdueTasks],
                    'backgroundColor' => ['#10b981', '#0d9488', '#6366f1', '#f59e0b', '#f43f5e'],
                    'borderColor' => '#ffffff',
                    'borderWidth' => 2,
                ]
            ]
        ];

        // 7-day trend across mentored interns
        $sevenDayLabels = [];
        $completedSeries = [];
        $hoursSeries = [];

        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $dateStr = $date->toDateString();
            $sevenDayLabels[] = $date->locale('id')->isoFormat('ddd, DD/MM');

            $completedCount = $tasks->filter(function ($t) use ($dateStr) {
                $isCompleted = in_array($t->status, ['Completed', 'Approved']);
                return $isCompleted && ($t->task_date === $dateStr || (isset($t->updated_at) && str_starts_with($t->updated_at, $dateStr)));
            })->count();
            $completedSeries[] = $completedCount;

            $attendances = Attendance::whereIn('user_id', $internIds)
                ->where('date', $dateStr)
                ->whereIn('status', ['present', 'late'])
                ->get();

            $totalHoursOnDate = 0;
            foreach ($attendances as $att) {
                if ($att->clock_in && $att->clock_out) {
                    $in = Carbon::parse($att->clock_in);
                    $out = Carbon::parse($att->clock_out);
                    $totalHoursOnDate += max(0, $out->diffInMinutes($in)) / 60;
                }
            }
            $hoursSeries[] = round($totalHoursOnDate, 1);
        }

        $trendChart = [
            'labels' => $sevenDayLabels,
            'datasets' => [
                [
                    'label' => 'Tugas Selesai',
                    'data' => $completedSeries,
                    'borderColor' => '#0d9488',
                    'backgroundColor' => 'rgba(13, 148, 136, 0.12)',
                    'tension' => 0.4,
                    'fill' => true,
                ],
                [
                    'label' => 'Total Jam Kerja (Jam)',
                    'data' => $hoursSeries,
                    'borderColor' => '#6366f1',
                    'backgroundColor' => 'rgba(99, 102, 241, 0.08)',
                    'tension' => 0.4,
                    'fill' => true,
                ]
            ]
        ];

        return response()->json([
            'success' => true,
            'hasData' => $totalTasks > 0,
            'totalInterns' => count($internIds),
            'totalTasks' => $totalTasks,
            'statusChart' => $statusChart,
            'trendChart' => $trendChart,
        ]);
    }

    /**
     * Get chart and metric data for Director Dashboard (Global Company Wide).
     */
    public function directorDashboardData(Request $request)
    {
        $tasks = DB::table('tasks')->get();
        $totalTasks = $tasks->count();
        $completedTasks = $tasks->whereIn('status', ['Completed', 'Approved'])->count();
        $inProgressTasks = $tasks->where('status', 'In Progress')->count();
        $waitingReviewTasks = $tasks->whereIn('status', ['Submitted', 'Review'])->count();
        $revisionTasks = $tasks->where('status', 'Revision')->count();

        $now = Carbon::now();
        $overdueTasks = $tasks->filter(function ($t) use ($now) {
            if (in_array($t->status, ['Completed', 'Approved'])) return false;
            return Carbon::parse($t->deadline)->lt($now);
        })->count();

        $statusChart = [
            'labels' => ['Completed', 'In Progress', 'Waiting Review', 'Revision', 'Overdue'],
            'datasets' => [
                [
                    'data' => [$completedTasks, $inProgressTasks, $waitingReviewTasks, $revisionTasks, $overdueTasks],
                    'backgroundColor' => ['#10b981', '#0d9488', '#6366f1', '#f59e0b', '#f43f5e'],
                    'borderColor' => '#ffffff',
                    'borderWidth' => 2,
                ]
            ]
        ];

        // 7-day trend global
        $sevenDayLabels = [];
        $completedSeries = [];
        $hoursSeries = [];

        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $dateStr = $date->toDateString();
            $sevenDayLabels[] = $date->locale('id')->isoFormat('ddd, DD/MM');

            $completedCount = $tasks->filter(function ($t) use ($dateStr) {
                $isCompleted = in_array($t->status, ['Completed', 'Approved']);
                return $isCompleted && ($t->task_date === $dateStr || (isset($t->updated_at) && str_starts_with($t->updated_at, $dateStr)));
            })->count();
            $completedSeries[] = $completedCount;

            $attendances = Attendance::where('date', $dateStr)
                ->whereIn('status', ['present', 'late'])
                ->get();

            $totalHoursOnDate = 0;
            foreach ($attendances as $att) {
                if ($att->clock_in && $att->clock_out) {
                    $in = Carbon::parse($att->clock_in);
                    $out = Carbon::parse($att->clock_out);
                    $totalHoursOnDate += max(0, $out->diffInMinutes($in)) / 60;
                }
            }
            $hoursSeries[] = round($totalHoursOnDate, 1);
        }

        $trendChart = [
            'labels' => $sevenDayLabels,
            'datasets' => [
                [
                    'label' => 'Tugas Selesai',
                    'data' => $completedSeries,
                    'borderColor' => '#0d9488',
                    'backgroundColor' => 'rgba(13, 148, 136, 0.12)',
                    'tension' => 0.4,
                    'fill' => true,
                ],
                [
                    'label' => 'Total Jam Kerja (Jam)',
                    'data' => $hoursSeries,
                    'borderColor' => '#6366f1',
                    'backgroundColor' => 'rgba(99, 102, 241, 0.08)',
                    'tension' => 0.4,
                    'fill' => true,
                ]
            ]
        ];

        $categories = ['Development', 'Testing', 'Documentation', 'Meeting', 'Research', 'Design'];
        $categoryData = [
            'labels' => $categories,
            'datasets' => [
                [
                    'label' => 'Total Tugas',
                    'data' => array_map(function ($c) use ($tasks) {
                        return $tasks->where('category', $c)->count();
                    }, $categories),
                    'backgroundColor' => '#0d9488',
                    'borderRadius' => 4,
                ]
            ]
        ];

        return response()->json([
            'success' => true,
            'hasData' => $totalTasks > 0,
            'totalTasks' => $totalTasks,
            'statusChart' => $statusChart,
            'trendChart' => $trendChart,
            'categoryChart' => $categoryData,
        ]);
    }
}
