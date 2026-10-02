<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Str;

class AttendanceController extends Controller
{
    /**
     * Get attendance record for today for currently logged in intern.
     */
    public function getTodayAttendance()
    {
        $user = Auth::user();
        $today = Carbon::today()->toDateString();

        $attendance = Attendance::where('user_id', $user->id)
            ->where('date', $today)
            ->first();

        return response()->json([
            'success' => true,
            'attendance' => $attendance,
        ]);
    }

    /**
     * Clock In Action (Intern only).
     * Rule: Only once per day.
     * Rule: If past 09:00 AM, automatically marked 'late', otherwise 'present'.
     */
    public function clockIn(Request $request)
    {
        $user = Auth::user();
        if ($user->role !== 'intern') {
            return response()->json(['success' => false, 'message' => 'Hanya peserta magang yang dapat melakukan absensi.'], 403);
        }

        $now = Carbon::now();
        $today = $now->toDateString();
        $timeString = $now->format('H:i:s');

        // Check if attendance record already exists for today
        $existing = Attendance::where('user_id', $user->id)->where('date', $today)->first();
        if ($existing && $existing->clock_in) {
            return response()->json([
                'success' => false,
                'message' => 'Anda sudah melakukan Clock In hari ini pada pukul ' . $existing->clock_in,
            ], 422);
        }

        // Automatic Status Logic: dynamic cutoff threshold from CompanySetting (default: '09:00:00')
        $companySetting = \App\Models\CompanySetting::first();
        $lateToleranceStr = $companySetting->late_tolerance_time ?? '09:00:00';
        $cutoffTime = Carbon::createFromTimeString($lateToleranceStr);
        $isLate = $now->greaterThan($cutoffTime);
        $status = $isLate ? 'late' : 'present';

        if ($isLate && (!$request->filled('notes') || trim($request->input('notes')) === '')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda terlambat (melewati batas toleransi jam ' . substr($lateToleranceStr, 0, 5) . ' WIB). Kolom Keterangan/Alasan wajib diisi.',
            ], 422);
        }

        $notes = $request->input('notes', $isLate ? 'Terlambat masuk kerja' : 'Hadir tepat waktu');

        if ($existing) {
            $existing->update([
                'clock_in' => $timeString,
                'status' => $status,
                'notes' => $notes,
            ]);
            $attendance = $existing;
        } else {
            $attendance = Attendance::create([
                'user_id' => $user->id,
                'date' => $today,
                'clock_in' => $timeString,
                'clock_out' => null,
                'status' => $status,
                'notes' => $notes,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => $isLate 
                ? 'Clock In berhasil dicatat pada ' . $timeString . ' (Status: Terlambat)' 
                : 'Clock In berhasil dicatat pada ' . $timeString . ' (Status: Tepat Waktu)',
            'attendance' => $attendance,
        ]);
    }

    /**
     * Clock Out Action (Intern only).
     * Rule: Must have clocked in, cannot clock out more than once.
     */
    public function clockOut(Request $request)
    {
        $user = Auth::user();
        if ($user->role !== 'intern') {
            return response()->json(['success' => false, 'message' => 'Hanya peserta magang yang dapat melakukan absensi pulang.'], 403);
        }

        $now = Carbon::now();
        $today = $now->toDateString();
        $timeString = $now->format('H:i:s');

        $attendance = Attendance::where('user_id', $user->id)->where('date', $today)->first();

        if (!$attendance || !$attendance->clock_in) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal: Anda belum melakukan Clock In masuk pada hari ini.',
            ], 422);
        }

        if ($attendance->clock_out) {
            return response()->json([
                'success' => false,
                'message' => 'Anda sudah melakukan Clock Out pulang hari ini pada pukul ' . $attendance->clock_out,
            ], 422);
        }

        $attendance->update([
            'clock_out' => $timeString,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Clock Out berhasil dicatat pada pukul ' . $timeString . '. Selamat beristirahat!',
            'attendance' => $attendance,
        ]);
    }

    /**
     * Submit Permit / Sakit (Intern only).
     */
    public function submitPermit(Request $request)
    {
        $user = Auth::user();
        $request->validate([
            'status' => 'nullable|in:permit,sick',
            'notes' => 'required|string|min:3|max:255',
        ]);

        $status = $request->input('status', 'permit');
        $today = Carbon::today()->toDateString();
        $existing = Attendance::where('user_id', $user->id)->where('date', $today)->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Data absensi hari ini sudah ada dalam sistem.',
            ], 422);
        }

        $attendance = Attendance::create([
            'user_id' => $user->id,
            'date' => $today,
            'clock_in' => null,
            'clock_out' => null,
            'status' => $status,
            'notes' => $request->input('notes'),
        ]);

        $label = $status === 'sick' ? 'Sakit' : 'Izin';

        return response()->json([
            'success' => true,
            'message' => "Laporan kehadiran ($label) hari ini berhasil dicatat.",
            'attendance' => $attendance,
        ]);
    }

    /**
     * Intern Personal Attendance History.
     */
    public function myHistory(Request $request)
    {
        $user = Auth::user();
        $history = Attendance::where('user_id', $user->id)
            ->orderBy('date', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'attendances' => $history,
        ]);
    }

    /**
     * Mentor Monitoring: Only supervised interns.
     */
    public function mentorMonitoring(Request $request)
    {
        $mentor = Auth::user();
        $supervisedInternIds = User::where('mentor_id', $mentor->id)->pluck('id');

        $query = Attendance::with('user')
            ->whereIn('user_id', $supervisedInternIds);

        if ($request->filled('intern_id') && $request->intern_id !== 'All') {
            $query->where('user_id', (int)$request->intern_id);
        }
        if ($request->filled('start_date')) {
            $query->whereDate('date', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('date', '<=', $request->end_date);
        }
        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('status', $request->status);
        }

        $attendances = $query->orderBy('date', 'desc')->get();

        return response()->json([
            'success' => true,
            'attendances' => $attendances,
        ]);
    }

    /**
     * Director Monitoring: Full organization-wide access with date & intern filters.
     */
    public function directorMonitoring(Request $request)
    {
        $query = Attendance::with(['user', 'user.mentor']);

        if ($request->filled('intern_id') && $request->intern_id !== 'All') {
            $query->where('user_id', (int)$request->intern_id);
        }
        if ($request->filled('mentor_id') && $request->mentor_id !== 'All') {
            $mentorId = (int)$request->mentor_id;
            $query->whereHas('user', function ($q) use ($mentorId) {
                $q->where('mentor_id', $mentorId);
            });
        }
        if ($request->filled('start_date')) {
            $query->whereDate('date', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('date', '<=', $request->end_date);
        }
        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('status', $request->status);
        }

        $attendances = $query->orderBy('date', 'desc')->get();

        return response()->json([
            'success' => true,
            'attendances' => $attendances,
        ]);
    }

    /**
     * Export Monthly Attendance PDF (White-label with intern & mentor signature blocks)
     */
    public function exportMonthlyPdf(Request $request)
    {
        $user = Auth::user();
        $targetUserId = ($user->role === 'intern') ? $user->id : $request->input('user_id', $user->id);
        $intern = User::findOrFail($targetUserId);
        $mentor = $intern->mentor_id ? User::find($intern->mentor_id) : null;

        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->toDateString());

        $attendances = Attendance::where('user_id', $intern->id)
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date', 'asc')
            ->get();

        $presentCount = $attendances->where('status', 'present')->count();
        $lateCount = $attendances->where('status', 'late')->count();
        $permitCount = $attendances->where('status', 'permit')->count();
        $sickCount = $attendances->where('status', 'sick')->count();
        $totalRecords = $attendances->count();
        $attendanceRate = $totalRecords > 0 ? round((($presentCount + $lateCount) / $totalRecords) * 100) : 100;

        // White-label company settings
        $companySetting = \App\Models\CompanySetting::first();
        $companyName = $companySetting->company_name ?? 'PT. Teknologi Nusantara Solusi';
        $companyAddress = $companySetting->company_address ?? 'Jl. Pemuda No. 120, Semarang, Jawa Tengah 50132';
        $companyLogoPath = $companySetting->company_logo_path ?? null;
        $lateToleranceTime = $companySetting->late_tolerance_time ?? '09:00';

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('attendance.monthly_pdf', [
            'intern' => $intern,
            'mentor' => $mentor,
            'attendances' => $attendances,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'presentCount' => $presentCount,
            'lateCount' => $lateCount,
            'permitCount' => $permitCount,
            'sickCount' => $sickCount,
            'attendanceRate' => $attendanceRate,
            'companyName' => $companyName,
            'companyAddress' => $companyAddress,
            'companyLogoPath' => $companyLogoPath,
            'lateToleranceTime' => $lateToleranceTime,
        ])->setPaper('a4', 'portrait');

        $filename = 'Rekapitulasi_Kehadiran_' . Str::slug($intern->name) . '_' . Carbon::now()->format('Y_m_d') . '.pdf';
        return $pdf->download($filename);
    }
}
