<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Show login form (Guest only)
     */
    public function showLoginForm()
    {
        if (Auth::check()) {
            return $this->redirectBasedOnRole(Auth::user());
        }

        return view('auth.login');
    }

    /**
     * Handle an incoming authentication request.
     */
    public function login(Request $request)
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
        $redirectUrl = $this->getDashboardUrlForRole($user->role);

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
     * Destroy an authenticated session.
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
     * Determine redirect path based on user role.
     */
    protected function getDashboardUrlForRole(string $role): string
    {
        switch ($role) {
            case 'intern':
                return '/intern/dashboard';
            case 'mentor':
                return '/mentor/dashboard';
            case 'director':
                return '/director/dashboard';
            default:
                return '/';
        }
    }

    /**
     * Redirect authenticated user directly to their respective dashboard.
     */
    protected function redirectBasedOnRole($user)
    {
        return redirect($this->getDashboardUrlForRole($user->role));
    }
}
