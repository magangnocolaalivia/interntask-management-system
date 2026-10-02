<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CompanySetting;
use Illuminate\Support\Facades\Storage;

class CompanySettingController extends Controller
{
    /**
     * Display company white-label settings
     */
    public function index(Request $request)
    {
        $setting = CompanySetting::firstOrCreate([], [
            'company_name' => 'PT InternTask Indonesia',
            'company_tagline' => 'Enterprise Internship & Performance Management',
            'primary_color' => '#0d9488',
            'secondary_color' => '#0f172a',
            'address' => 'Gedung Cyber 2 Lantai 18, Jl. HR Rasuna Said Blok X-5 No. 13, Jakarta Selatan',
            'phone' => '+62 21 5290 8888',
            'email' => 'contact@interntask.id',
            'website' => 'https://interntask.id',
            'director_name' => 'Budi Santoso, M.Kom',
            'director_title' => 'Direktur Utama & CEO',
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'setting' => $setting,
            ]);
        }

        return view('director.settings.index', compact('setting'));
    }

    /**
     * Update company settings
     */
    public function update(Request $request)
    {
        $setting = CompanySetting::firstOrCreate([]);

        $validated = $request->validate([
            'company_name' => ['required', 'string', 'max:255'],
            'company_tagline' => ['nullable', 'string', 'max:255'],
            'primary_color' => ['nullable', 'string', 'max:20'],
            'secondary_color' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'string', 'email', 'max:255'],
            'website' => ['nullable', 'string', 'max:255'],
            'director_name' => ['nullable', 'string', 'max:255'],
            'director_title' => ['nullable', 'string', 'max:255'],
            'logo' => ['nullable', 'image', 'max:2048'],
        ]);

        if ($request->hasFile('logo')) {
            if ($setting->logo_path) {
                Storage::disk('public')->delete($setting->logo_path);
            }
            $validated['logo_path'] = $request->file('logo')->store('company', 'public');
        }

        $setting->update($validated);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Pengaturan perusahaan berhasil diperbarui.',
                'setting' => $setting,
            ]);
        }

        return redirect()->route('director.settings.index')->with('success', 'Pengaturan perusahaan berhasil diperbarui.');
    }
}
