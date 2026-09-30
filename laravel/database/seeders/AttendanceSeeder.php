<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class AttendanceSeeder extends Seeder
{
    /**
     * Run the attendance seeds.
     */
    public function run(): void
    {
        $interns = User::where('role', 'intern')->get();
        if ($interns->isEmpty()) {
            return;
        }

        $intern1 = $interns->firstWhere('email', 'intern1@example.com') ?? $interns->first();
        $intern2 = $interns->firstWhere('email', 'intern2@example.com') ?? $interns->skip(1)->first();
        $intern3 = $interns->firstWhere('email', 'intern3@example.com') ?? $interns->skip(2)->first();
        $intern4 = $interns->firstWhere('email', 'intern4@example.com') ?? $interns->skip(3)->first();

        // 1. Data Absensi Historis (2026-09-22 s/d 2026-09-25)
        $historicalRecords = [
            // 2026-09-22
            [
                'user_id' => $intern1->id,
                'date' => '2026-09-22',
                'clock_in' => '08:42:15',
                'clock_out' => '17:05:00',
                'status' => 'present',
                'notes' => 'Hadir tepat waktu - Sesi Onboarding Sprint 4',
            ],
            [
                'user_id' => $intern2 ? $intern2->id : $intern1->id,
                'date' => '2026-09-22',
                'clock_in' => '08:50:30',
                'clock_out' => '17:15:20',
                'status' => 'present',
                'notes' => 'Hadir tepat waktu',
            ],
            // 2026-09-23
            [
                'user_id' => $intern1->id,
                'date' => '2026-09-23',
                'clock_in' => '09:14:05',
                'clock_out' => '17:30:00',
                'status' => 'late',
                'notes' => 'Terlambat 14 menit karena kemacetan jalan arteri',
            ],
            [
                'user_id' => $intern3 ? $intern3->id : $intern1->id,
                'date' => '2026-09-23',
                'clock_in' => '08:35:00',
                'clock_out' => '17:00:10',
                'status' => 'present',
                'notes' => 'Hadir tepat waktu',
            ],
            // 2026-09-24
            [
                'user_id' => $intern1->id,
                'date' => '2026-09-24',
                'clock_in' => '08:40:00',
                'clock_out' => '17:08:40',
                'status' => 'present',
                'notes' => 'Hadir tepat waktu',
            ],
            [
                'user_id' => $intern4 ? $intern4->id : $intern1->id,
                'date' => '2026-09-24',
                'clock_in' => null,
                'clock_out' => null,
                'status' => 'permit',
                'notes' => 'Izin keperluan administrasi KRS dan akademik kampus',
            ],
            // 2026-09-25
            [
                'user_id' => $intern1->id,
                'date' => '2026-09-25',
                'clock_in' => '08:38:00',
                'clock_out' => '17:02:10',
                'status' => 'present',
                'notes' => 'Hadir tepat waktu',
            ],
            [
                'user_id' => $intern2 ? $intern2->id : $intern1->id,
                'date' => '2026-09-25',
                'clock_in' => '09:25:00',
                'clock_out' => '17:40:00',
                'status' => 'late',
                'notes' => 'Terlambat karena kendala transportasi umum KRL tertahan',
            ],
        ];

        foreach ($historicalRecords as $record) {
            Attendance::updateOrCreate(
                ['user_id' => $record['user_id'], 'date' => $record['date']],
                $record
            );
        }

        // 2. Data Absensi Hari Ini (Today)
        $today = Carbon::today()->toDateString();
        if ($intern2) {
            // Intern 2: Sudah Clock In, belum Clock Out (sedang bekerja)
            Attendance::updateOrCreate(
                ['user_id' => $intern2->id, 'date' => $today],
                [
                    'clock_in' => '08:45:10',
                    'clock_out' => null,
                    'status' => 'present',
                    'notes' => 'Hadir tepat waktu - sesi pagi',
                ]
            );
        }

        if ($intern3) {
            // Intern 3: Sudah Clock In dan Clock Out (status late)
            Attendance::updateOrCreate(
                ['user_id' => $intern3->id, 'date' => $today],
                [
                    'clock_in' => '09:12:30',
                    'clock_out' => '17:05:00',
                    'status' => 'late',
                    'notes' => 'Terlambat 12 menit - shift pagi',
                ]
            );
        }

        if ($intern4) {
            // Intern 4: Status Permit
            Attendance::updateOrCreate(
                ['user_id' => $intern4->id, 'date' => $today],
                [
                    'clock_in' => null,
                    'clock_out' => null,
                    'status' => 'permit',
                    'notes' => 'Izin seminar nasional kampus online',
                ]
            );
        }

        // Catatan: Intern 1 (Rizky Pratama) sengaja tidak memiliki absensi hari ini ($today),
        // agar tombol 'Clock In' warna Teal dapat diuji dan diklik langsung oleh user demo.
    }
}
