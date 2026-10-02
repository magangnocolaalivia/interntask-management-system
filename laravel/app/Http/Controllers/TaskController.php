<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\User;
use App\Models\Feedback;
use App\Models\TaskActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class TaskController extends Controller
{
    /**
     * Display intern's tasks list
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = Task::where('user_id', $user->id);

        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('status', $request->status);
        }
        if ($request->filled('priority') && $request->priority !== 'All') {
            $query->where('priority', $request->priority);
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

        $tasks = $query->latest('task_date')->paginate(10);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'tasks' => $tasks,
            ]);
        }

        return view('intern.tasks.index', compact('tasks'));
    }

    /**
     * Store task created by intern
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'task_date' => 'required|date',
            'deadline' => 'required|string',
            'category' => 'required|string',
            'priority' => 'required|in:Low,Medium,High,Urgent',
            'estimated_duration' => 'nullable|numeric|min:0.5',
            'progress' => 'nullable|integer|min:0|max:100',
            'repository_link' => 'nullable|url',
            'deployment_link' => 'nullable|url',
            'figma_link' => 'nullable|url',
        ]);

        $task = Task::create([
            'user_id' => $user->id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'task_date' => $validated['task_date'],
            'deadline' => $validated['deadline'],
            'category' => $validated['category'],
            'priority' => $validated['priority'],
            'estimated_duration' => $validated['estimated_duration'] ?? 4,
            'progress' => $validated['progress'] ?? 0,
            'status' => 'In Progress',
            'repository_link' => $validated['repository_link'] ?? null,
            'deployment_link' => $validated['deployment_link'] ?? null,
            'figma_link' => $validated['figma_link'] ?? null,
        ]);

        TaskActivityLog::create([
            'task_id' => $task->id,
            'user_id' => $user->id,
            'action' => 'Created',
            'description' => "Tugas baru '{$task->title}' dibuat oleh peserta magang.",
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Tugas berhasil dibuat.',
                'task' => $task,
            ], 201);
        }

        return redirect()->route('intern.tasks.index')->with('success', 'Tugas berhasil dibuat.');
    }

    /**
     * Intern My Progress View
     */
    public function progress(Request $request)
    {
        $user = Auth::user();
        $tasks = Task::where('user_id', $user->id)->get();
        $feedbacks = Feedback::whereIn('task_id', $tasks->pluck('id'))->with('mentor')->latest()->get();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'tasks' => $tasks,
                'feedbacks' => $feedbacks,
            ]);
        }

        return view('intern.progress', compact('user', 'tasks', 'feedbacks'));
    }

    /**
     * Mentor Review List View
     */
    public function reviewList(Request $request)
    {
        $mentor = Auth::user();
        $internIds = User::where('mentor_id', $mentor->id)->pluck('id');

        $tasks = Task::whereIn('user_id', $internIds)
            ->whereIn('status', ['Submitted', 'Review', 'Revision'])
            ->with(['user', 'attachments'])
            ->latest()
            ->paginate(15);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'tasks' => $tasks,
            ]);
        }

        return view('mentor.review.index', compact('tasks'));
    }

    /**
     * Mentor Submit Review (Approve, Request Revision, Reject)
     */
    public function submitReview(Request $request, Task $task)
    {
        $mentor = Auth::user();

        $validated = $request->validate([
            'action' => 'required|in:approved,revision,rejected',
            'message' => 'required|string|min:5',
        ]);

        $statusMap = [
            'approved' => 'Approved',
            'revision' => 'Revision',
            'rejected' => 'Rejected',
        ];

        $newStatus = $statusMap[$validated['action']];
        $task->update([
            'status' => $newStatus,
            'progress' => ($newStatus === 'Approved') ? 100 : $task->progress,
        ]);

        $feedback = Feedback::create([
            'task_id' => $task->id,
            'mentor_id' => $mentor->id,
            'message' => $validated['message'],
            'action' => $validated['action'],
        ]);

        TaskActivityLog::create([
            'task_id' => $task->id,
            'user_id' => $mentor->id,
            'action' => 'Review - ' . ucfirst($validated['action']),
            'description' => "Mentor {$mentor->name} memberikan evaluasi: {$validated['message']}",
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => "Review tugas berhasil disimpan (Status: {$newStatus}).",
                'task' => $task,
                'feedback' => $feedback,
            ]);
        }

        return redirect()->route('mentor.reviews')->with('success', 'Review tugas berhasil disimpan.');
    }

    /**
     * Mentor Monitoring view
     */
    public function mentorMonitoring(Request $request)
    {
        $mentor = Auth::user();
        $internIds = User::where('mentor_id', $mentor->id)->pluck('id');
        $interns = User::whereIn('id', $internIds)->with(['tasks', 'attendances'])->get();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'interns' => $interns,
            ]);
        }

        return view('mentor.monitoring.index', compact('interns'));
    }

    /**
     * Store task assigned by Mentor or Director
     */
    public function assignTask(Request $request, $targetInternId)
    {
        $mentor = Auth::user();
        if (!$mentor || !in_array($mentor->role, ['mentor', 'director'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: Hanya Mentor atau Direktur yang dapat memberikan tugas.'
            ], 403);
        }

        $intern = User::where('id', $targetInternId)->where('role', 'intern')->first();
        if (!$intern) {
            return response()->json([
                'success' => false,
                'message' => 'Peserta magang tidak ditemukan.'
            ], 404);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'deadline' => 'required|string',
            'priority' => 'required|in:Low,Medium,High,Urgent',
            'category' => 'nullable|string',
            'estimated_duration' => 'nullable|numeric|min:0.5',
            'mentor_reference_url' => 'nullable|url',
            'mentor_attachment' => 'nullable|file|mimes:pdf,zip,rar,jpg,jpeg,png|max:10240',
        ]);

        $attachmentPath = null;
        if ($request->hasFile('mentor_attachment')) {
            $attachmentPath = $request->file('mentor_attachment')->store('mentor_attachments', 'public');
        } elseif ($request->filled('mentor_attachment_path')) {
            $attachmentPath = $request->input('mentor_attachment_path');
        }

        $task = Task::create([
            'user_id' => $intern->id,
            'assigned_by' => $mentor->id,
            'is_assigned' => true,
            'mentor_attachment_path' => $attachmentPath,
            'mentor_reference_url' => $validated['mentor_reference_url'] ?? null,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'task_date' => now()->toDateString(),
            'deadline' => $validated['deadline'],
            'category' => $validated['category'] ?? 'Development',
            'priority' => $validated['priority'],
            'estimated_duration' => $validated['estimated_duration'] ?? 4,
            'progress' => 0,
            'status' => 'In Progress',
        ]);

        TaskActivityLog::create([
            'task_id' => $task->id,
            'user_id' => $mentor->id,
            'action' => 'Assigned',
            'description' => "Tugas '{$task->title}' diberikan oleh {$mentor->name} kepada {$intern->name}.",
        ]);

        return response()->json([
            'success' => true,
            'message' => "Tugas '{$task->title}' berhasil ditugaskan ke {$intern->name}.",
            'task' => $task->load('user', 'assigner'),
        ], 201);
    }
}
