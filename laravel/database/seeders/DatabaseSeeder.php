<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Task;
use App\Models\Feedback;
use App\Models\Notification;
use App\Models\TaskActivityLog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Akun Demo Direktur
        $director = User::create([
            'name' => 'Budi Santoso, M.Kom',
            'email' => 'director@example.com',
            'password' => Hash::make('password'),
            'role' => 'director',
            'institution' => 'PT. Teknologi Nusantara Solusi',
            'study_program' => 'Executive Management',
        ]);

        // 2. Akun Demo Mentor 1
        $mentor1 = User::create([
            'name' => 'Hendra Wijaya, S.Kom',
            'email' => 'mentor1@example.com',
            'password' => Hash::make('password'),
            'role' => 'mentor',
            'institution' => 'PT. Teknologi Nusantara Solusi',
            'study_program' => 'Backend & Infrastructure Lead',
        ]);

        // 3. Akun Demo Mentor 2
        $mentor2 = User::create([
            'name' => 'Siti Rahmawati, M.T',
            'email' => 'mentor2@example.com',
            'password' => Hash::make('password'),
            'role' => 'mentor',
            'institution' => 'PT. Teknologi Nusantara Solusi',
            'study_program' => 'Fullstack & Mobile Lead',
        ]);

        // 4. Akun Demo Intern 1
        $intern1 = User::create([
            'name' => 'Rizky Pratama',
            'email' => 'intern1@example.com',
            'password' => Hash::make('password'),
            'role' => 'intern',
            'institution' => 'Politeknik Negeri Malang',
            'study_program' => 'D4 Teknik Informatika',
            'internship_start' => '2026-07-01',
            'internship_end' => '2026-12-31',
            'mentor_id' => $mentor1->id,
        ]);

        // 5. Akun Demo Intern 2
        $intern2 = User::create([
            'name' => 'Alivia Putri',
            'email' => 'intern2@example.com',
            'password' => Hash::make('password'),
            'role' => 'intern',
            'institution' => 'Institut Teknologi Sepuluh Nopember (ITS)',
            'study_program' => 'S1 Sistem Informasi',
            'internship_start' => '2026-07-15',
            'internship_end' => '2026-12-31',
            'mentor_id' => $mentor1->id,
        ]);

        // Intern 3, 4, 5
        $intern3 = User::create([
            'name' => 'Dimas Aditya',
            'email' => 'intern3@example.com',
            'password' => Hash::make('password'),
            'role' => 'intern',
            'institution' => 'Universitas Brawijaya',
            'study_program' => 'S1 Teknik Komputer',
            'internship_start' => '2026-08-01',
            'internship_end' => '2027-01-31',
            'mentor_id' => $mentor2->id,
        ]);

        $intern4 = User::create([
            'name' => 'Fadhil Rahman',
            'email' => 'intern4@example.com',
            'password' => Hash::make('password'),
            'role' => 'intern',
            'institution' => 'Universitas Indonesia',
            'study_program' => 'S1 Ilmu Komputer',
            'internship_start' => '2026-07-01',
            'internship_end' => '2026-12-31',
            'mentor_id' => $mentor2->id,
        ]);

        $intern5 = User::create([
            'name' => 'Nabila Ayu',
            'email' => 'intern5@example.com',
            'password' => Hash::make('password'),
            'role' => 'intern',
            'institution' => 'Institut Teknologi Bandung (ITB)',
            'study_program' => 'S1 Informatika',
            'internship_start' => '2026-08-15',
            'internship_end' => '2027-02-15',
            'mentor_id' => $mentor2->id,
        ]);

        // Seed Core Tasks
        $task1 = Task::create([
            'user_id' => $intern1->id,
            'title' => 'Audit Fitur Reporting Asset',
            'description' => 'Menganalisis performa query SQL dan kelengkapan data export pada modul reporting asset inventaris kantor.',
            'task_date' => '2026-09-22',
            'deadline' => '2026-09-25',
            'category' => 'Development',
            'priority' => 'High',
            'estimated_duration' => 6,
            'progress' => 85,
            'status' => 'Submitted',
            'result' => 'Menemukan 3 bottleneck N+1 query pada pemanggilan relasi asset_categories. Waktu eksekusi turun dari 3.2 detik ke 410ms.',
            'obstacles' => 'Memerlukan koordinasi dengan DBA untuk indeks composite kolom created_at dan status.',
            'repository_link' => 'https://github.com/tech-nusantara/asset-management/pull/42',
            'deployment_link' => 'https://staging-asset.tech-nusantara.id/reports',
        ]);

        TaskActivityLog::create([
            'task_id' => $task1->id,
            'user_id' => $intern1->id,
            'action' => 'CREATED',
            'description' => 'Task dibuat dengan status In Progress',
        ]);

        TaskActivityLog::create([
            'task_id' => $task1->id,
            'user_id' => $intern1->id,
            'action' => 'SUBMITTED',
            'description' => 'Task dikirim ke mentor untuk direview',
        ]);

        Notification::create([
            'user_id' => $mentor1->id,
            'title' => 'Tugas Baru Menunggu Review',
            'message' => "{$intern1->name} telah mengirimkan tugas '{$task1->title}' untuk direview.",
            'type' => 'submission',
        ]);

        // Seed Attendance Data
        $this->call(AttendanceSeeder::class);
    }
}
