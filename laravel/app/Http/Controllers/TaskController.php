<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class TaskController extends Controller
{
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

        return response()->json([
            'success' => true,
            'message' => "Tugas '{$task->title}' berhasil ditugaskan ke {$intern->name}.",
            'task' => $task->load('user', 'assigner'),
        ], 201);
    }
}
