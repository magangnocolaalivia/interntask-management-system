<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display all users (Director only)
     */
    public function index(Request $request)
    {
        $query = User::with('mentor');

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('institution', 'like', "%{$search}%")
                  ->orWhere('study_program', 'like', "%{$search}%");
            });
        }

        $users = $query->latest()->paginate(10);
        $mentors = User::where('role', 'mentor')->get();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'users' => $users,
                'mentors' => $mentors,
            ]);
        }

        return view('director.users.index', compact('users', 'mentors'));
    }

    /**
     * Mentor's supervised interns view
     */
    public function mentorInterns(Request $request)
    {
        $mentor = Auth::user();
        $interns = User::where('mentor_id', $mentor->id)
            ->with(['tasks' => function ($q) {
                $q->latest()->limit(5);
            }, 'attendances' => function ($q) {
                $q->latest()->limit(7);
            }])
            ->get();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'interns' => $interns,
            ]);
        }

        return view('mentor.interns.index', compact('interns'));
    }

    /**
     * Store a newly created user (Director only)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'role' => ['required', Rule::in(['director', 'mentor', 'intern'])],
            'phone' => ['nullable', 'string', 'max:50'],
            'institution' => ['nullable', 'string', 'max:255'],
            'study_program' => ['nullable', 'string', 'max:255'],
            'division' => ['nullable', 'string', 'max:255'],
            'internship_start' => ['nullable', 'date'],
            'internship_end' => ['nullable', 'date', 'after_or_equal:internship_start'],
            'mentor_id' => ['nullable', 'exists:users,id'],
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Pengguna baru berhasil ditambahkan.',
                'user' => $user,
            ], 201);
        }

        return redirect()->route('director.users.index')->with('success', 'Pengguna baru berhasil ditambahkan.');
    }

    /**
     * Update user details
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:6'],
            'role' => ['required', Rule::in(['director', 'mentor', 'intern'])],
            'phone' => ['nullable', 'string', 'max:50'],
            'institution' => ['nullable', 'string', 'max:255'],
            'study_program' => ['nullable', 'string', 'max:255'],
            'division' => ['nullable', 'string', 'max:255'],
            'internship_start' => ['nullable', 'date'],
            'internship_end' => ['nullable', 'date', 'after_or_equal:internship_start'],
            'mentor_id' => ['nullable', 'exists:users,id'],
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Data pengguna berhasil diperbarui.',
                'user' => $user,
            ]);
        }

        return redirect()->route('director.users.index')->with('success', 'Data pengguna berhasil diperbarui.');
    }

    /**
     * Remove user
     */
    public function destroy(Request $request, User $user)
    {
        if ($user->id === Auth::id()) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak dapat menghapus akun Anda sendiri.',
                ], 422);
            }
            return back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        $user->delete();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Pengguna berhasil dihapus.',
            ]);
        }

        return redirect()->route('director.users.index')->with('success', 'Pengguna berhasil dihapus.');
    }
}
