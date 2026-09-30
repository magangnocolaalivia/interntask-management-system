# InternTask — Sistem Manajemen, Monitoring, dan Pelaporan Tugas Harian Peserta Magang

Aplikasi web industrial-grade untuk mencatat aktivitas harian peserta magang, memantau progress pengerjaan tugas, memfasilitasi workflow validasi & review oleh mentor pembimbing, serta menyediakan dashboard monitoring eksekutif tingkat korporat bagi direktur perusahaan.

---

## 1. Struktur Project Laravel 11 MVC

```
laravel/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AuthController.php
│   │   │   ├── Intern/
│   │   │   │   └── TaskController.php
│   │   │   ├── Mentor/
│   │   │   │   ├── ReviewController.php
│   │   │   │   └── MonitoringController.php
│   │   │   ├── Director/
│   │   │   │   └── DirectorDashboardController.php
│   │   │   └── ReportController.php
│   │   ├── Middleware/
│   │   │   └── EnsureUserHasRole.php
│   │   └── Requests/
│   │       ├── TaskStoreRequest.php
│   │       ├── TaskUpdateRequest.php
│   │       └── ReviewRequest.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── Task.php
│   │   ├── Attachment.php
│   │   ├── Feedback.php
│   │   ├── Notification.php
│   │   └── TaskActivityLog.php
│   ├── Policies/
│   │   └── TaskPolicy.php
│   └── Services/
│       ├── TaskRecommendationService.php (Rule-Based Scoring Non-AI)
│       ├── ReportService.php
│       └── ActivityLoggerService.php
├── database/
│   ├── migrations/
│   │   └── 2026_09_25_000001_create_intern_task_tables.php
│   └── seeders/
│       └── DatabaseSeeder.php
├── resources/
│   ├── views/
│   │   ├── layouts/
│   │   │   ├── app.blade.php
│   │   │   └── partials/
│   │   │       ├── navbar.blade.php
│   │   │       └── sidebar.blade.php
│   │   ├── auth/
│   │   │   └── login.blade.php
│   │   ├── intern/
│   │   │   ├── dashboard.blade.php
│   │   │   ├── tasks/
│   │   │   │   ├── index.blade.php
│   │   │   │   ├── create.blade.php
│   │   │   │   ├── edit.blade.php
│   │   │   │   └── show.blade.php
│   │   │   └── progress.blade.php
│   │   ├── mentor/
│   │   │   ├── dashboard.blade.php
│   │   │   ├── review/
│   │   │   │   └── index.blade.php
│   │   │   └── monitoring/
│   │   │       └── index.blade.php
│   │   ├── director/
│   │   │   ├── dashboard.blade.php
│   │   │   └── monitoring/
│   │   │       └── index.blade.php
│   │   └── reports/
│   │       ├── index.blade.php
│   │       └── pdf-template.blade.php
├── routes/
│   ├── web.php
│   └── api.php
├── .env.example
├── composer.json
└── README.md
```

---

## 2. Teknologi yang Digunakan

* **Backend**: PHP 8.2+ & Laravel 11 MVC
* **Templating Engine**: Laravel Blade Components
* **Database**: MySQL 8.0+ / MariaDB
* **Frontend Styling**: Tailwind CSS
* **Chart Engine**: Chart.js 4+
* **Icons**: Lucide Icons
* **Exporting**: `barryvdh/laravel-dompdf` (PDF) & `maatwebsite/excel` (Excel/CSV)
* **Testing**: PHPUnit / Pest PHP

---

## 3. Database Schema

### Tabel `users`
* `id` (BIGINT, PK, Auto Increment)
* `name` (VARCHAR 255)
* `email` (VARCHAR 255, Unique)
* `password` (VARCHAR 255, Hash Bcrypt)
* `role` (ENUM: `intern`, `mentor`, `director`)
* `institution` (VARCHAR 255, Nullable)
* `study_program` (VARCHAR 255, Nullable)
* `internship_start` (DATE, Nullable)
* `internship_end` (DATE, Nullable)
* `mentor_id` (BIGINT, FK -> users.id, Nullable)
* `created_at`, `updated_at` (TIMESTAMP)

### Tabel `tasks`
* `id` (BIGINT, PK, Auto Increment)
* `user_id` (BIGINT, FK -> users.id, Cascade Delete)
* `title` (VARCHAR 255)
* `description` (TEXT)
* `task_date` (DATE)
* `deadline` (DATE)
* `category` (ENUM: `Development`, `Testing`, `Documentation`, `Meeting`, `Research`, `Design`, `Other`)
* `priority` (ENUM: `Low`, `Medium`, `High`, `Urgent`)
* `estimated_duration` (INT UNSIGNED, default 4 jam)
* `progress` (TINYINT UNSIGNED, 0-100)
* `status` (ENUM: `Draft`, `In Progress`, `Submitted`, `Review`, `Revision`, `Approved`, `Completed`, `Rejected`)
* `result` (TEXT, Nullable)
* `obstacles` (TEXT, Nullable)
* `repository_link` (VARCHAR 255, Nullable)
* `deployment_link` (VARCHAR 255, Nullable)
* `figma_link` (VARCHAR 255, Nullable)
* `created_at`, `updated_at` (TIMESTAMP)

### Tabel `attachments`
* `id` (BIGINT, PK)
* `task_id` (BIGINT, FK -> tasks.id)
* `file_name` (VARCHAR 255)
* `file_path` (VARCHAR 255)
* `file_type` (VARCHAR 50)
* `created_at`, `updated_at` (TIMESTAMP)

### Tabel `feedback`
* `id` (BIGINT, PK)
* `task_id` (BIGINT, FK -> tasks.id)
* `mentor_id` (BIGINT, FK -> users.id)
* `message` (TEXT)
* `action` (ENUM: `approved`, `revision`, `rejected`)
* `created_at`, `updated_at` (TIMESTAMP)

### Tabel `notifications`
* `id` (BIGINT, PK)
* `user_id` (BIGINT, FK -> users.id)
* `title` (VARCHAR 255)
* `message` (TEXT)
* `type` (VARCHAR 50)
* `is_read` (BOOLEAN, default false)
* `created_at`, `updated_at` (TIMESTAMP)

### Tabel `task_activity_logs`
* `id` (BIGINT, PK)
* `task_id` (BIGINT, FK -> tasks.id)
* `user_id` (BIGINT, FK -> users.id)
* `action` (VARCHAR 50)
* `description` (TEXT)
* `created_at`, `updated_at` (TIMESTAMP)

---

## 4. Role & Hak Akses

| Hak Akses / Fitur | Intern | Mentor | Direktur |
|---|:---:|:---:|:---:|
| Login & Ganti Profil | ✓ | ✓ | ✓ |
| Buat Daily Task | ✓ | ✗ | ✗ |
| Edit & Hapus Task Draft Milik Sendiri | ✓ | ✗ | ✗ |
| Submit Task Untuk Review | ✓ | ✗ | ✗ |
| Perbaiki Revisi Task | ✓ | ✗ | ✗ |
| Review Task (Approve, Revision, Reject) | ✗ | ✓ (Hanya intern bimbingannya) | ✗ |
| Tulis Catatan Feedback Mentor | ✗ | ✓ | ✗ |
| Monitoring Seluruh Peserta Korporat | ✗ | ✗ | ✓ (Read-Only) |
| Export Laporan Perusahaan | Milik Sendiri | Intern Bimbingannya | Seluruh Perusahaan |

---

## 5. Workflow Task State Machine

```
[Draft]
   ↓
[In Progress]
   ↓
[Submitted] (Waiting Review)
   ↓
[Review Mentor]
   ├── [APPROVE] ────────────→ [Completed] (100%)
   ├── [REQUEST REVISION] ───→ [Revision] ──→ Intern Perbaiki ──→ [Submitted]
   └── [REJECT] ─────────────→ [Rejected]
```

Setiap transisi status mencatat entri otomatis ke dalam `task_activity_logs`.

---

## 6. Cara Menjalankan Project

### Prasyarat
* PHP >= 8.2 dengan ekstensi `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `gd`
* Composer 2.x
* MySQL Server >= 8.0
* Node.js & NPM (untuk Vite asset bundling)

### Langkah Instalasi
1. Clone repositori & masuk ke folder:
   ```bash
   cd laravel
   ```
2. Salin environment configuration:
   ```bash
   cp .env.example .env
   ```
3. Install dependensi PHP:
   ```bash
   composer install
   ```
4. Generate encryption key:
   ```bash
   php artisan key:generate
   ```
5. Sesuaikan konfigurasi database di file `.env`:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=interntask_db
   DB_USERNAME=root
   DB_PASSWORD=your_password
   ```
6. Jalankan migrasi dan seeding database demo:
   ```bash
   php artisan migrate --seed
   ```
7. Buat symbolic link untuk file uploads:
   ```bash
   php artisan storage:link
   ```
8. Install dependensi frontend dan build assets:
   ```bash
   npm install
   npm run build
   ```
9. Jalankan web server development:
   ```bash
   php artisan serve
   ```
10. Buka browser pada `http://localhost:8000`.

---

## 7. Akun Demo Bawaan Seeder

| Role | Nama Pengguna | Email | Password |
|---|---|---|---|
| **Direktur** | Budi Santoso, M.Kom | `director@example.com` | `password` |
| **Mentor 1** | Hendra Wijaya, S.Kom | `mentor1@example.com` | `password` |
| **Mentor 2** | Siti Rahmawati, M.T | `mentor2@example.com` | `password` |
| **Intern 1** | Rizky Pratama | `intern1@example.com` | `password` |
| **Intern 2** | Alivia Putri | `intern2@example.com` | `password` |

---

## 8. Package yang Digunakan

* `laravel/framework` (^11.0): Core MVC Framework
* `barryvdh/laravel-dompdf` (^3.0): Generate dokumen PDF laporan tugas
* `maatwebsite/excel` (^3.1): Export & Import laporan Excel (.xlsx, .csv)
* `chart.js` (^4.4): Visualisasi data analitik di frontend Blade

---

## 9. Fitur yang Sudah Functional

1. **Authentication & Multi-Role Authorization**: Login dengan role intern, mentor, dan director via backend middleware.
2. **Daily Task CRUD**: Formulir lengkap dengan input judul, deskripsi, tanggal, deadline, kategori, prioritas, durasi, progres, hasil pengerjaan, kendala, upload berkas bukti, tautan repository, deployment, dan figma.
3. **Task Status Workflow**: State machine Draft -> In Progress -> Submitted -> Revision -> Completed -> Rejected.
4. **Mentor Review System**: Modal validasi persetujuan (Approve), permintaan revisi (Revision) dengan feedback wajib, dan penolakan (Reject) dengan alasan wajib.
5. **Timeline Log Aktivitas**: Riwayat kronologis otomatis dari `task_activity_logs`.
6. **Task Priority Recommendation**: Algoritma rule-based scoring (non-AI) transparan: Urgent=40, High=30, Med=20, Low=10 + Skor Deadline (<=1h=40, <=3h=25, <=7h=10) + Skor Status (Revisi=+20, InProgress=+10).
7. **Intern Dashboard**: Progress bar durasi magang, kartu metrik tugas hari ini, dan rekomendasi prioritas.
8. **Mentor Dashboard**: Rekapitulasi intern, 3 visualisasi Chart.js (Aktivitas mingguan, Sebaran status, Sebaran kategori), serta tabel review cepat.
9. **Director Dashboard**: Executive company overview, 4 grafik aktivitas, tabel monitoring seluruh peserta magang secara **STRICTLY READ-ONLY**.
10. **Reports & Exporting**: Filter dinamis berdasarkan periode, peserta, mentor, kategori, status; export ke format CSV/Excel dan preview cetak PDF.
11. **Notification System**: Notifikasi event-driven tersimpan di database dengan counter unread badge.

---

## 10. Fitur yang Ditandai Sebagai TODO

* **TODO: Real-time WebSockets via Laravel Reverb / Pusher**: Notifikasi saat ini menggunakan polling database. Dapat diupgrade ke real-time broadcasting event menggunakan package Laravel Reverb.
* **TODO: Automated Antivirus Scanning on Attachment Upload**: Pemeriksaan berkas lampiran dengan ClamAV daemon pada production environment.
* **TODO: Email Digest Queues**: Pengiriman email rekapitulasi harian via Laravel Queues (Redis/Database worker).
