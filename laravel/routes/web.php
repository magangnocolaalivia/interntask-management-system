<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CompanySettingController;
use App\Http\Controllers\AttendanceController;

/*
|--------------------------------------------------------------------------
| Web Routes - InternTask System (Laravel 11)
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return redirect()->route('login');
});

// Authentication Routes (Handled by AuthController)
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.authenticate');
});

// Authenticated Routes
Route::middleware(['auth'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    /*
    |----------------------------------------------------------------------
    | 1. Shared Reports Route (Authorized for intern, mentor, and director)
    |----------------------------------------------------------------------
    | Controller handles strict data scoping based on Auth::user()->role.
    */
    Route::middleware(['checkRole:intern,mentor,director'])->group(function () {
        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
        Route::get('/reports/pdf', [ReportController::class, 'exportPdf'])->name('reports.pdf');
        Route::get('/reports/excel', [ReportController::class, 'exportExcel'])->name('reports.excel');

        // Specific alias for intern reporting
        Route::get('/intern/reports', [ReportController::class, 'index'])->name('intern.reports');
    });

    /*
    |----------------------------------------------------------------------
    | 2. Intern Routes (Prefix: /intern)
    |----------------------------------------------------------------------
    */
    Route::middleware(['checkRole:intern'])->prefix('intern')->name('intern.')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'internDashboard'])->name('dashboard');
        Route::get('/tasks', [TaskController::class, 'index'])->name('tasks.index');
        Route::post('/tasks', [TaskController::class, 'store'])->name('tasks.store');
        Route::get('/progress', [TaskController::class, 'progress'])->name('progress');

        // Attendance (Kehadiran Harian Intern)
        Route::get('/attendance/today', [AttendanceController::class, 'getTodayAttendance'])->name('attendance.today');
        Route::post('/attendance/clock-in', [AttendanceController::class, 'clockIn'])->name('attendance.clock_in');
        Route::post('/attendance/clock-out', [AttendanceController::class, 'clockOut'])->name('attendance.clock_out');
        Route::post('/attendance/permit', [AttendanceController::class, 'submitPermit'])->name('attendance.permit');
        Route::get('/attendance/history', [AttendanceController::class, 'myHistory'])->name('attendance.history');
        Route::get('/attendance/pdf', [AttendanceController::class, 'exportMonthlyPdf'])->name('attendance.pdf');
    });

    /*
    |----------------------------------------------------------------------
    | 3. Mentor Routes (Prefix: /mentor)
    |----------------------------------------------------------------------
    */
    Route::middleware(['checkRole:mentor'])->prefix('mentor')->name('mentor.')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'mentorDashboard'])->name('dashboard');
        Route::get('/interns', [UserController::class, 'mentorInterns'])->name('interns');
        Route::get('/reviews', [TaskController::class, 'reviewList'])->name('reviews');
        Route::post('/tasks/{task}/review', [TaskController::class, 'submitReview'])->name('tasks.review');
        Route::get('/monitoring', [TaskController::class, 'mentorMonitoring'])->name('monitoring');

        // Mentor Attendance Monitoring
        Route::get('/attendance', [AttendanceController::class, 'mentorMonitoring'])->name('attendance.monitoring');
    });

    /*
    |----------------------------------------------------------------------
    | 4. Director Routes (Prefix: /director)
    |----------------------------------------------------------------------
    */
    Route::middleware(['checkRole:director'])->prefix('director')->name('director.')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'directorDashboard'])->name('dashboard');
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
        Route::get('/monitoring', [DashboardController::class, 'directorMonitoring'])->name('monitoring');
        Route::get('/activity', [DashboardController::class, 'directorActivity'])->name('activity');

        // White-label Company Settings
        Route::get('/settings', [CompanySettingController::class, 'index'])->name('settings.index');
        Route::put('/settings', [CompanySettingController::class, 'update'])->name('settings.update');

        // Director Organization Attendance Monitoring
        Route::get('/attendance', [AttendanceController::class, 'directorMonitoring'])->name('attendance.monitoring');
    });
});
