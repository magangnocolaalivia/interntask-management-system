<?php

use Illuminate\Support\Facades\Route;
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
|
| Here is where you can register web routes for your application.
| Role Intern, Mentor, and Director are all authorized to access Reports and Attendance.
|
*/

Route::middleware(['auth'])->group(function () {
    // Shared Reports: Authorized for intern, mentor, and director
    Route::middleware(['checkRole:intern,mentor,director'])->group(function () {
        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
        Route::get('/reports/pdf', [ReportController::class, 'exportPdf'])->name('reports.pdf');
        Route::get('/reports/excel', [ReportController::class, 'exportExcel'])->name('reports.excel');

        // Explicit prefix alias for intern
        Route::get('/intern/reports', [ReportController::class, 'index'])->name('intern.reports');
    });

    // Role-specific prefixes
    Route::middleware(['checkRole:intern'])->prefix('intern')->name('intern.')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'internDashboard'])->name('dashboard');
        Route::get('/tasks', [TaskController::class, 'index'])->name('tasks.index');
        Route::get('/progress', [TaskController::class, 'progress'])->name('progress');

        // Attendance (Kehadiran Harian Intern)
        Route::get('/attendance/today', [AttendanceController::class, 'getTodayAttendance'])->name('attendance.today');
        Route::post('/attendance/clock-in', [AttendanceController::class, 'clockIn'])->name('attendance.clock_in');
        Route::post('/attendance/clock-out', [AttendanceController::class, 'clockOut'])->name('attendance.clock_out');
        Route::post('/attendance/permit', [AttendanceController::class, 'submitPermit'])->name('attendance.permit');
        Route::get('/attendance/history', [AttendanceController::class, 'myHistory'])->name('attendance.history');
        Route::get('/attendance/pdf', [AttendanceController::class, 'exportMonthlyPdf'])->name('attendance.pdf');
    });

    Route::middleware(['checkRole:mentor'])->prefix('mentor')->name('mentor.')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'mentorDashboard'])->name('dashboard');
        Route::get('/interns', [UserController::class, 'mentorInterns'])->name('interns');
        Route::get('/reviews', [TaskController::class, 'reviewList'])->name('reviews');
        Route::get('/monitoring', [TaskController::class, 'mentorMonitoring'])->name('monitoring');

        // Mentor Attendance Monitoring
        Route::get('/attendance', [AttendanceController::class, 'mentorMonitoring'])->name('attendance.monitoring');
    });

    Route::middleware(['checkRole:director'])->prefix('director')->name('director.')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'directorDashboard'])->name('dashboard');
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::get('/monitoring', [DashboardController::class, 'directorMonitoring'])->name('monitoring');
        Route::get('/settings', [CompanySettingController::class, 'index'])->name('settings.index');

        // Director Organization Attendance Monitoring
        Route::get('/attendance', [AttendanceController::class, 'directorMonitoring'])->name('attendance.monitoring');
    });
});
