<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Task;
use App\Models\User;
use App\Models\CompanySetting;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\TasksExport;

/**
 * Class ReportController
 * 
 * Handles multi-role report generation with strict Row-Level Security (RLS)
 * and unified global White-Label Corporate Letterhead across all roles.
 */
class ReportController extends Controller
{
    /**
     * Retrieve the unified global company profile from the database.
     * Ensures identical Kop Surat identity for Intern, Mentor, and Director alike.
     */
    protected function getGlobalCompanySetting()
    {
        $setting = DB::table('settings')->first();

        if (!$setting) {
            $setting = DB::table('company_profiles')->first();
        }

        if (!$setting) {
            return (object) [
                'company_name' => 'PT INTERNTASK INDONESIA',
                'company_address' => 'Gedung Graha InternTask Lt. 4, Kawasan Industri Candisari, Semarang, Jawa Tengah 50257 | Telp: (024) 845-6789 | Email: ops@interntask.id | Website: www.interntask.id',
                'company_logo_path' => null,
            ];
        }

        return $setting;
    }

    /**
     * Apply strict Row-Level Security (RLS) to Task Query according to authenticated user's role.
     */
    protected function scopeTasksByRole(Request $request)
    {
        $user = Auth::user();
        $query = Task::with(['user', 'user.mentor']);

        // 1. Strict Row-Level Security (RLS)
        if ($user->role === 'intern') {
            // Intern: Strictly query tasks belonging to Auth::id()
            $query->where('user_id', $user->id);
        } elseif ($user->role === 'mentor') {
            // Mentor: Strictly query tasks belonging to interns under their supervision
            $query->whereHas('user', function ($q) use ($user) {
                $q->where('mentor_id', $user->id);
            });

            // Optional sub-filter within supervised interns only
            if ($request->filled('intern_id') && $request->intern_id !== 'All') {
                $supervisedIds = User::where('mentor_id', $user->id)->pluck('id')->toArray();
                if (in_array((int)$request->intern_id, $supervisedIds)) {
                    $query->where('user_id', (int)$request->intern_id);
                }
            }
        } elseif ($user->role === 'director') {
            // Director: Full access across the entire organization
            if ($request->filled('intern_id') && $request->intern_id !== 'All') {
                $query->where('user_id', (int)$request->intern_id);
            }
            if ($request->filled('mentor_id') && $request->mentor_id !== 'All') {
                $query->whereHas('user', function ($q) use ($request) {
                    $q->where('mentor_id', (int)$request->mentor_id);
                });
            }
        } else {
            abort(403, 'Akses Ditolak: Role tidak diotorisasi.');
        }

        // 2. Common filters (Date, Status, Category, Search)
        if ($request->filled('start_date')) {
            $query->whereDate('task_date', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('task_date', '<=', $request->end_date);
        }
        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('status', $request->status);
        }
        if ($request->filled('category') && $request->category !== 'All') {
            $query->where('category', $request->category);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('task_date', 'desc')->get();
    }

    /**
     * Display Report Index View.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $tasks = $this->scopeTasksByRole($request);
        $company = $this->getGlobalCompanySetting();

        return view('reports.index', compact('tasks', 'company', 'user'));
    }

    /**
     * Export Report to Official Corporate PDF.
     * Uses unified global Kop Surat with role-scoped row-level data.
     */
    public function exportPdf(Request $request)
    {
        $user = Auth::user();
        $tasks = $this->scopeTasksByRole($request);
        $company = $this->getGlobalCompanySetting();

        $startDate = $request->get('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->get('end_date', now()->endOfMonth()->toDateString());

        // Target and Mentor labels
        $filterTarget = 'Seluruh Peserta Magang';
        $mentorSignName = 'Hendra Wijaya, S.Kom., M.T.';
        $directorSignName = 'Budi Santoso, M.M.';

        if ($user->role === 'intern') {
            $filterTarget = "{$user->name} (" . ($user->institution ?? 'Peserta Magang') . ')';
            $mentor = $user->mentor;
            if ($mentor) {
                $mentorSignName = $mentor->name;
            }
        } elseif ($user->role === 'mentor') {
            $filterTarget = "Peserta Binaan ({$user->name})";
            $mentorSignName = $user->name;
        }

        $pdf = Pdf::loadView('reports.pdf', [
            'tasks' => $tasks,
            'companyName' => $company->company_name,
            'companyAddress' => $company->company_address,
            'companyLogoPath' => $company->company_logo_path,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'filterTarget' => $filterTarget,
            'mentorSignName' => $mentorSignName,
            'directorSignName' => $directorSignName,
            'currentUser' => $user,
        ]);

        $safeCompanyName = preg_replace('/[^a-zA-Z0-9]/', '_', $company->company_name);
        $filename = "{$safeCompanyName}_Laporan_" . now()->format('Ymd_His') . ".pdf";

        return $pdf->download($filename);
    }

    /**
     * Export Report to Excel Spreadsheet.
     */
    public function exportExcel(Request $request)
    {
        $user = Auth::user();
        $tasks = $this->scopeTasksByRole($request);
        $company = $this->getGlobalCompanySetting();

        $safeCompanyName = preg_replace('/[^a-zA-Z0-9]/', '_', $company->company_name);
        $filename = "{$safeCompanyName}_Laporan_" . now()->format('Ymd_His') . ".xlsx";

        return Excel::download(new TasksExport($tasks, $company, $user), $filename);
    }
}
