<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
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
