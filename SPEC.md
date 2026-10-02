# SPESIFIKASI ACUAN LENGKAP & DETAIL SISTEM INTERNTASK (REACT SPA -> LARAVEL 11 BLADE)

> Dokumen spesifikasi teknis dan fungsional ini disusun secara detail dan komprehensif berdasarkan kode sumber React (`/src`) untuk dijadikan acuan presisi dalam perancangan, validasi, dan implementasi antarmuka Blade pada backend Laravel 11.

---

## 📑 DAFTAR ISI
1. [Arsitektur Sistem & Prinsip Desain](#1-arsitektur-sistem--prinsip-desain)
2. [Sistem Desain Global (Design System Tokens)](#2-sistem-desain-global-design-system-tokens)
3. [Komponen Global & Layout Induk](#3-komponen-global--layout-induk)
4. [Modul Autentikasi (Guest View)](#4-modul-autentikasi-guest-view)
5. [Modul Peserta Magang (Role: Intern)](#5-modul-peserta-magang-role-intern)
6. [Modul Mentor / Pembimbing (Role: Mentor)](#6-modul-mentor--pembimbing-role-mentor)
7. [Modul Direktur Eksekutif (Role: Director)](#7-modul-direktur-eksekutif-role-director)
8. [Modul Pelaporan & Ekspor (Multi-Role)](#8-modul-pelaporan--ekspor-multi-role)
9. [Modul Komunikasi & Pendukung (Chat, Notifikasi, Profil)](#9-modul-komunikasi--pendukung-chat-notifikasi-profil)
10. [Logika Bisnis & Algoritma Khusus](#10-logika-bisnis--algoritma-khusus)
11. [Lampiran Data Demo & Pemetaan Menu](#11-lampiran-data-demo--pemetaan-menu)

---

## 1. ARSITEKTUR SISTEM & PRINSIP DESAIN

### 1.1 Struktur Role & Hak Akses (RBAC)
Sistem memiliki 3 tingkat hak akses pengguna:
1. **`intern` (Peserta Magang):**
   - Melakukan pencatatan tugas harian (*Daily Tasks*).
   - Melakukan presensi harian (*Clock In*, *Clock Out*, Pengajuan Izin/Sakit).
   - Melihat grafik kemajuan pribadi (*My Progress*), menerima evaluasi & revisi mentor.
   - Mengakses fitur komunikasi langsung dengan mentor (*Chat Mentor*).
   - Mengekspor laporan PDF dan Excel/CSV dengan *Row-Level Security* terbatas pada tugas miliknya sendiri.
2. **`mentor` (Pembimbing Lapangan):**
   - Mengelola dan memantau peserta magang yang dibimbing (*Supervised Interns*).
   - Memvalidasi dan mengevaluasi antrean tugas (*Task Review*): *Approve*, *Revision Required*, atau *Reject*.
   - Menugaskan instruksi tugas baru secara langsung kepada peserta magang (*Assign Task*).
   - Memantau presensi dan rekap absensi bulanan peserta binaan.
   - Mengekspor laporan PDF dan Excel/CSV terbatas pada peserta magang binaannya.
3. **`director` (Direktur Eksekutif - Read-Only & Corporate Governance):**
   - Memantau seluruh metrik performa magang tingkat organisasi (*Executive Dashboard*).
   - Mengelola akun pengguna (CRUD Pengguna untuk Intern, Mentor, dan Direktur).
   - Memantau rekap absensi seluruh instansi dan log aktivitas audit trail.
   - Mengonfigurasi identitas *white-label* perusahaan, kop surat korporat, toleransi jam keterlambatan, dan pejabat penandatangan.
   - Mengekspor seluruh data laporan organisasi tanpa batasan.

---

## 2. SISTEM DESAIN GLOBAL (DESIGN SYSTEM TOKENS)

### 2.1 Palet Warna (Color Palette)
- **Primary / Brand Accent:**
  - `teal-600` (`#0D9488`): Tombol aksi utama, tab aktif, header tabel ekspor, progress bar.
  - `teal-700` (`#0F766E`): Hover state tombol utama, teks penekanan.
  - `teal-50` (`#F0FDFA`): Background container badge, alert sukses, avatar intern.
  - `teal-100` (`#CCFBF1`): Border badge intern, highlight bar.
- **Secondary / Mentor Accent:**
  - `amber-600` (`#D97706`): Tombol aksi review mentor, badge revisi.
  - `amber-50` (`#FFFBEB`): Background badge mentor, kartu peringatan toleransi waktu.
  - `amber-100` (`#FEF3C7`): Badge status Revision.
- **Neutral / Background:**
  - `slate-50` (`#F8FAFC`): Background halaman utama.
  - `slate-100` (`#F1F5F9`): Header tabel, baris ganjil (*zebra-striping*), divider.
  - `slate-200` (`#E2E8F0`): Border kartu, garis batas input.
  - `slate-600` (`#475569`): Teks sekunder, label formulir, icon muted.
  - `slate-800` (`#1E293B`): Judul utama, teks primer.
  - `slate-900` (`#0F172A`): Teks heading besar, kop surat.
- **Status Semantik:**
  - **Completed / Approved / Hadir Tepat Waktu:** Emerald (`#10B981`, bg: `emerald-50`, text: `emerald-800`, border: `emerald-200`).
  - **In Progress / Sedang Dikerjakan:** Teal (`#0D9488`, bg: `teal-50`, text: `teal-800`).
  - **Submitted / Review / Menunggu Validasi:** Indigo / Blue (`#6366F1`, bg: `indigo-50`, text: `indigo-800`).
  - **Revision / Terlambat / Izin:** Amber / Yellow (`#F59E0B`, bg: `amber-50`, text: `amber-800`).
  - **Rejected / Urgent / Alpa:** Rose / Red (`#F43F5E`, bg: `rose-50`, text: `rose-800`).

### 2.2 Tipografi & Spacing
- **Font Family:** `Inter`, sans-serif (Monospace untuk ID, tanggal, jam, IP address: `JetBrains Mono` / `Courier`).
- **Skala Ukuran Teks:**
  - Page Title: `text-xl` sampai `text-2xl` font-bold tracking-tight.
  - Section Header: `text-sm` sampai `text-base` font-bold text-slate-800.
  - Body Text / Table Content: `text-xs` (12px) font-normal / font-medium.
  - Caption / Metadata: `text-[11px]` atau `text-[10px]` text-slate-400 font-medium.
  - Badges: `text-[10px]` atau `text-[11px]` font-bold uppercase tracking-wider.
- **Radius & Shadows:**
  - Kartu & Kontainer: `rounded-xl` (12px) atau `rounded-2xl` (16px).
  - Tombol: `rounded-xl` (12px), `shadow-xs`.
  - Border: `border border-slate-200`.

---

## 3. KOMPONEN GLOBAL & LAYOUT INDUK

### 3.1 `Navbar.tsx` (Top Navigation Bar)
- **Tampilan & Struktur Layout:**
  - Posisi: `sticky top-0 z-30 bg-white border-b border-slate-200 h-16`.
  - **Sisi Kiri:**
    - Tombol Hamburger (Mobile only `< md`): icon `Menu` (20x20) pembuka drawer sidebar.
    - Logo Brand: Icon `IT` kotak hijau teal + Teks `Intern` (Slate 800) `Task` (Teal 600) + Badge kecil `Sistem Magang`.
    - Subjudul (Desktop only `md:`): `Manajemen, Monitoring & Evaluasi Tugas Harian`.
  - **Sisi Tengah:**
    - Badge Role Pengguna:
      - Direktur: Icon `Shield`, teks `DIREKTUR (READ-ONLY)`, style `bg-slate-100 text-slate-700 border-slate-200`.
      - Mentor: Icon `Award`, teks `MENTOR / PEMBIMBING`, style `bg-amber-50 text-amber-700 border-amber-200`.
      - Intern: Icon `UserCheck`, teks `PESERTA MAGANG`, style `bg-teal-50 text-teal-700 border-teal-200`.
  - **Sisi Kanan:**
    - Bell Notifikasi dengan counter badge merah (`unreadNotificationCount`). Klik membuka popover dropdown daftar 10 notifikasi terbaru + tombol "Tandai Semua Telah Dibaca".
    - Icon Chat Langsung (`MessageSquare`) dengan counter pesan belum dibaca.
    - Profil Dropdown: Avatar inisial, nama, email, link menuju halaman profil, dan tombol Logout.

### 3.2 `Sidebar.tsx` (Left Navigation Panel)
- **Tampilan & Struktur Layout:**
  - Posisi: `w-64 bg-white border-r border-slate-200 h-screen flex flex-col shrink-0`.
  - Header Sidebar: Brand Logo `IT` + `InternTask Corporate Portal`.
  - Kartu Mini Profil:
    - Avatar inisial lingkaran 40x40.
    - Nama lengkap & alamat email pengguna yang sedang login.
    - Badge role mini (`DIREKTUR`, `MENTOR`, `INTERN`).
  - Daftar Menu Navigasi:
    - Item aktif: `bg-teal-600 text-white shadow-xs font-semibold rounded-xl`.
    - Item non-aktif: `text-slate-600 hover:bg-slate-100 font-medium rounded-xl`.
    - Counter Badge (contoh: tugas perlu review pada mentor, pesan chat baru, notifikasi).
  - Footer Sidebar: Tombol "Keluar (Logout)" warna merah `text-rose-600 hover:bg-rose-50`.

### 3.3 `ForbiddenView.tsx` (403 Role-Access Guard)
- **Tampilan:**
  - Hero Card terpusat dengan icon `ShieldAlert` merah/amber besar.
  - Judul: `Akses Halaman Ditolak (403 Forbidden)`.
  - Deskripsi: Penjelasan bahwa role saat ini tidak memiliki hak izin akses ke URL tersebut.
  - Tombol Aksi: "Kembali ke Dashboard Utama".

### 3.4 `ToastContainer.tsx` (Real-Time Flash Alerts)
- **Tampilan:**
  - Posisi: Pojok kanan atas (`fixed top-4 right-4 z-50 space-y-2`).
  - Varian Toast:
    - **Success:** Icon `CheckCircle2` hijau, border `emerald-200`, background `emerald-50`.
    - **Error:** Icon `AlertCircle` merah, border `rose-200`, background `rose-50`.
    - **Warning:** Icon `AlertTriangle` kuning, border `amber-200`, background `amber-50`.
    - **Info:** Icon `Info` biru/teal, border `teal-200`, background `teal-50`.
  - Otomatis menghilang dalam 4 detik (*auto-dismiss*) atau saat tombol `X` diklik.

---

## 4. MODUL AUTENTIKASI (GUEST VIEW)

### 4.1 `LoginView.tsx`
- **Tampilan:**
  - Layout Card terpusat pada background `slate-50`.
  - Logo `IT` + Teks "Selamat Datang Kembali" + Keterangan portal evaluasi magang.
  - Formulir Login:
    - Input Email (`name="email"`), placeholder `name@company.com`.
    - Input Password (`name="password"`), placeholder `••••••••`.
    - Checkbox "Ingat saya" (`name="remember"`).
    - Tombol Submit: "Masuk ke Portal" (`bg-teal-600 text-white`).
  - Helper Akun Demo (Quick Preset Buttons):
    - Tombol **Intern 1** -> Mengisi `intern1@example.com` / `password`.
    - Tombol **Mentor 1** -> Mengisi `mentor1@example.com` / `password`.
    - Tombol **Direktur** -> Mengisi `director@example.com` / `password`.
- **Alur & Validasi:**
  - Memeriksa kredensial email & password.
  - Jika berhasil, direct pengguna secara otomatis sesuai role:
    - `intern` -> `/intern/dashboard`
    - `mentor` -> `/mentor/dashboard`
    - `director` -> `/director/dashboard`

---

## 5. MODUL PESERTA MAGANG (ROLE: INTERN)

### 5.1 `InternDashboard.tsx`
- **Fitur & Perilaku:**
  - Menampilkan ringkasan profil magang (Institusi, Prodi, Mentor pembimbing, Periode Magang, dan Progress Bar durasi magang).
  - Kartu Metrik Cepat 4 Kolom: Total Tugas, Tugas Selesai (Approved), Dalam Proses, Menunggu Review.
  - Grafik Visualisasi Chart.js:
    - **Doughnut Chart:** Sebaran Status Tugas (Approved hijau, In Progress teal, Waiting Review indigo, Revision amber).
    - **Line Chart (7 Hari):** Tren Tugas Selesai & Jam Kerja Harian.
  - Rekomendasi Tugas Prioritas Tinggi (*Rule-based Priority Scoring*): Kartu tugas mendesak berdasarkan bobot prioritas dan sisa waktu deadline.
  - Tabel Aktivitas Tugas Terbaru dengan tombol navigasi "Lihat Semua".

### 5.2 `AttendanceWidget.tsx` (Widget Presensi Harian)
- **Fitur & Perilaku:**
  - Jam digital realtime (*live clock*) dengan detik aktif format `HH:mm:ss WIB` dan tanggal bahasa Indonesia.
  - **Status 1: Belum Presensi Hari Ini**
    - Pilihan Radio Tab: `Hadir Kerja (Present)`, `Izin Keperluan (Permit)`, `Sakit / Medis (Sick)`.
    - Indikator Toleransi Keterlambatan: Jika jam melebihi `late_tolerance_time` (contoh: 09:00 WIB), sistem menampilkan banner peringatan kuning `TERLAMBAT` dan mewajibkan pengisian alasan di kolom keterangan.
    - Tombol "Clock In Masuk Kerja" (`bg-teal-600`).
  - **Status 2: Sedang Bekerja (Sudah Clock In, Belum Clock Out)**
    - Menampilkan jam masuk, status kehadiran (Tepat Waktu / Terlambat), dan durasi kerja berjalan realtime.
    - Input catatan hasil kerja harian opsional.
    - Tombol "Clock Out Selesai Kerja" (`bg-rose-600`).
  - **Status 3: Selesai Presensi Hari Ini (Sudah Clock In & Clock Out)**
    - Menampilkan badge hijau `Presensi Hari Ini Lengkap`, jam masuk, jam pulang, dan total durasi kerja.

### 5.3 `DailyTaskList.tsx` (Manajemen Tugas Harian)
- **Fitur & Perilaku:**
  - Bar pencarian judul dan deskripsi tugas secara realtime.
  - Dropdown Filter Kategori: `All`, `Development`, `Testing`, `Documentation`, `Meeting`, `Research`, `Design`, `Other`.
  - Dropdown Filter Status: `All`, `Draft`, `In Progress`, `Submitted`, `Revision`, `Approved`.
  - Dropdown Filter Prioritas: `All`, `Low`, `Medium`, `High`, `Urgent`.
  - Tombol "+ Buat Tugas Baru" membuka `TaskFormModal`.
  - Tabel Tugas Harian:
    - Kolom: Tanggal, Judul & Kategori, Deadline, Prioritas, Durasi, Progres (Progress Bar), Status Badge, Aksi (Detail / Edit / Submit / Hapus).
  - Aksi "Kirim Tugas (Submit for Review)": Mengubah status tugas dari `In Progress`/`Revision` menjadi `Submitted`, mencatat log aktivitas `SUBMITTED`, dan mengirim notifikasi otomatis ke mentor.

### 5.4 `TaskFormModal.tsx` & `TaskDetailModal.tsx`
- **Formulir Input Tugas:**
  - Judul Tugas (Wajib).
  - Tanggal Pelaksanaan & Deadline (Wajib).
  - Kategori & Prioritas (Dropdown).
  - Estimasi Durasi (Jam).
  - Progres Pengerjaan Slider / Input (0 - 100%).
  - Deskripsi Tugas, Hasil Pengerjaan, dan Kendala (*Obstacles*).
  - Tautan Eksternal: GitHub/GitLab Repository, URL Deployment Staging, URL Desain Figma.
  - Upload Lampiran Berkas (*Attachments*): PDF, PNG, JPG, ZIP (max 10MB).
- **Detail Tugas:**
  - Menampilkan seluruh metadata tugas, tautan live yang dapat diklik, riwayat log aktivitas (*Task Activity Logs*), dan riwayat catatan umpan balik mentor (*Feedback History*).

### 5.5 `InternProgress.tsx`
- **Fitur & Perilaku:**
  - Banner Evaluasi Pencapaian Kompetensi dan persentase tingkat kelulusan tugas.
  - Daftar Kronologis Catatan & Umpan Balik Mentor (*Mentor Feedback Logs*) dengan badge status keputusan (`Approved`, `Revision Required`, `Rejected`).
  - Rincian Progres per Tugas dengan bar persentase visual.

### 5.6 `InternAttendanceHistory.tsx`
- **Fitur & Perilaku:**
  - Filter rentang tanggal awal dan akhir presensi.
  - Kartu Ringkasan Bulanan: Total Hari Kerja, Hadir Tepat Waktu, Terlambat, Izin/Sakit, Persentase Kehadiran.
  - Tabel Riwayat Presensi: No, Tanggal, Hari, Clock In, Clock Out, Durasi Jam Kerja, Status, Catatan Keterangan.
  - Tombol Cetak PDF Presensi Bulanan Resmi dengan format kop surat dan kolom tanda tangan ganda (Peserta & Mentor).

---

## 6. MODUL MENTOR / PEMBIMBING (ROLE: MENTOR)

### 6.1 `MentorDashboard.tsx`
- **Fitur & Perilaku:**
  - Header Profil Pembimbing dan jumlah peserta magang di bawah bimbingan.
  - Kartu Metrik: Total Peserta Binaan, Tugas Perlu Direview (`Submitted`), Tugas Disetujui, Rata-rata Kehadiran.
  - Tombol Cepat: "Review Tugas Masuk".
  - Tabel Daftar Peserta Binaan Aktif dengan shortcut menuju pantau kinerja.

### 6.2 `TaskReviewList.tsx` & `ReviewModal.tsx`
- **Fitur & Perilaku:**
  - Menampilkan antrean seluruh tugas peserta bimbingan yang berstatus `Submitted`.
  - Informasi kartu/tabel: Nama Intern, Institusi, Judul Tugas, Kategori, Durasi, Deskripsi, Hasil, dan Tautan Repo.
  - Tombol "Evaluasi (Review)" membuka `ReviewModal`:
    - Radio Keputusan Validasi:
      1. **Setujui (Approve):** Mengubah status tugas menjadi `Approved` / `Completed`, progres otomatis diset 100%.
      2. **Minta Revisi (Revision):** Mengubah status tugas menjadi `Revision`, mewajibkan catatan poin perbaikan.
      3. **Tolak (Reject):** Mengubah status tugas menjadi `Rejected`.
    - Textarea "Catatan & Masukan Mentor" (Wajib diisi).
    - Eksekusi form akan mencatat data ke tabel `feedback`, membuat log `REVIEWED`, dan mengirim notifikasi langsung ke akun intern terkait.

### 6.3 `InternMonitoring.tsx`
- **Fitur & Perilaku:**
  - Tampilan kartu komparasi seluruh peserta binaan.
  - Menampilkan persentase kelulusan tugas, progress bar per peserta, total tugas, tugas approved, dan tugas dalam antrean review.

### 6.4 `MentorAttendanceView.tsx`
- **Fitur & Perilaku:**
  - Memantau presensi harian dan riwayat absensi bulanan khusus peserta magang di bawah bimbingan mentor terkait.
  - Dilengkapi filter tanggal dan ekspor PDF absensi bulanan resmi.

### 6.5 `AssignTaskModal.tsx`
- **Fitur & Perilaku:**
  - Mentor dapat memberikan tugas terarah langsung kepada intern tertentu.
  - Form: Pilih Intern Target, Judul Instruksi, Kategori, Prioritas, Deadline, Deskripsi Instruksi, Tautan Dokumen Referensi, dan Upload Lampiran TOR/Brief.
  - Tugas yang dibuat otomatis berstatus `In Progress` pada akun intern bersangkutan dengan penanda `is_assigned = true`.

---

## 7. MODUL DIREKTUR EKSEKUTIF (ROLE: DIRECTOR)

### 7.1 `DirectorDashboard.tsx`
- **Fitur & Perilaku:**
  - Executive Overview tingkat organisasi: Total Intern, Total Mentor, Akumulasi Tugas Organisasi, Persentase Presensi Keseluruhan.
  - Grafik Batang Kategori Tugas Perusahaan dan Grafik Garis Tren Output Bulanan.
  - Shortcut menuju Laporan Korporat.

### 7.2 `DirectorMonitoring.tsx` & `DirectorAttendanceView.tsx`
- **Fitur & Perilaku:**
  - Tampilan monitoring kinerja seluruh peserta magang lintas mentor dan lintas universitas secara *read-only*.
  - Monitoring matriks presensi harian seluruh peserta magang perusahaan.

### 7.3 `DirectorActivity.tsx` (Audit Trail)
- **Fitur & Perilaku:**
  - Riwayat kronologis (*timeline stream*) seluruh aktivitas perubahan data di sistem: pembuatan tugas, submit review, approval mentor, perubahan status, dan pembaruan pengaturan.

### 7.4 `UserManagementView.tsx` (CRUD Pengguna)
- **Fitur & Perilaku:**
  - Tabel seluruh akun pengguna sistem dengan filter role (Semua, Intern, Mentor, Direktur) dan kolom pencarian.
  - Tombol "+ Tambah Pengguna Baru" membuka modal formulir:
    - Nama Lengkap, Email, Password, Role (`intern`/`mentor`/`director`), No HP, Institusi, Program Studi, dan Pemilihan Mentor Pembimbing (khusus role intern).
  - Tombol Aksi: Edit Data Pengguna dan Hapus Akun (dengan konfirmasi keamanan).

### 7.5 `CompanySettingsView.tsx` (Pengaturan White-Label)
- **Fitur & Perilaku:**
  - Formulir kustomisasi identitas perusahaan:
    - Nama Resmi Perusahaan (`company_name`).
    - Tagline / Slogan Perusahaan.
    - Alamat Kantor Lengkap (Tercetak di kop surat PDF).
    - Email Resmi, Nomor Telepon, dan URL Situs Web.
    - Jam Batas Toleransi Presensi (`late_tolerance_time`, format `HH:mm`, default `09:00` WIB).
    - Pejabat Penandatangan Laporan: Nama Lengkap Direktur & Gelar, serta Jabatan Resmi.
    - Upload Logo Perusahaan (Format PNG transparan / JPEG).

---

## 8. MODUL PELAPORAN & EKSPOR (MULTI-ROLE)

### 8.1 `ReportView.tsx`
- **Fitur & Perilaku:**
  - Dapat diakses oleh **Intern**, **Mentor**, dan **Direktur** dengan aturan *Row-Level Security* otomatis:
    - *Intern:* Hanya melihat dan mencetak tugas miliknya sendiri.
    - *Mentor:* Melihat dan mencetak tugas seluruh peserta binaannya.
    - *Director:* Melihat dan mencetak seluruh tugas organisasi.
  - Panel Filter Multi-Kriteria:
    - Tanggal Mulai (`start_date`) & Tanggal Selesai (`end_date`).
    - Filter Status Tugas (`All`, `Approved`, `In Progress`, `Submitted`, `Revision`).
    - Filter Kategori Tugas.
    - Filter Peserta Tertentu (Khusus Mentor & Direktur).
  - Tabel Data Hasil Filter: No, Tanggal, Nama Peserta, Institusi, Judul Tugas, Kategori, Durasi, Progres, Status Akhir.
- **Ekspor Dokumen Resmi:**
  1. **Tombol "Cetak PDF Resmi":** Menghasilkan dokumen A4 portrait berstandar korporat dilengkapi:
     - Kop surat resmi (*White-Label Letterhead*) dinamis dari `company_settings`.
     - Judul dokumen & nomor registrasi arsip.
     - Ringkasan statistik eksekutif (*Summary Box*).
     - Tabel rincian tugas dengan styling *zebra-striping* dan badge warna status.
     - Blok tanda tangan ganda pengesahan: Kiri (Mentor Pembimbing) dan Kanan (Direktur Utama).
  2. **Tombol "Ekspor Excel / CSV":** Menghasilkan spreadsheet `.xlsx` terstruktur dengan header styling berwarna Teal (`#0D9488`), kolom terformat rapi, dan auto-size.

---

## 9. MODUL KOMUNIKASI & PENDUKUNG

### 9.1 `DirectChatView.tsx` (Pesan Langsung)
- **Fitur & Perilaku:**
  - Antarmuka chat interaktif antara Peserta Magang dan Mentor Pembimbingnya.
  - Panel Kiri: Daftar kontak relasi pembimbing/peserta binaan dengan avatar, status online hijau, cuplikan pesan terakhir, waktu, dan counter unread badge.
  - Panel Kanan: Jendela percakapan dengan bubble chat (pesan terkirim di kanan warna Teal, pesan masuk di kiri warna Slate putih), timestamp waktu, dan indikator status baca (*double checkmark*).
  - Kotak Input Pesan: Input teks multiline dengan tombol kirim icon `Send`.

### 9.2 `NotificationList.tsx`
- **Fitur & Perilaku:**
  - Daftar seluruh notifikasi sistem: pengiriman tugas, persetujuan review, permintaan revisi, penugasan tugas baru, dan pengingat deadline.
  - Badge jenis notifikasi berwarna, indikator titik unread, tombol "Tandai Telah Dibaca", dan tombol hapus notifikasi.

### 9.3 `ProfileView.tsx`
- **Fitur & Perilaku:**
  - Tampilan kartu identitas pengguna lengkap, informasi institusi, kontak, dan mentor penanggung jawab.
  - Formulir pembaruan nama profil, nomor telepon, dan penggantian kata sandi baru.

---

## 10. LOGIKA BISNIS & ALGORITMA KHUSUS

### 10.1 Siklus Status Tugas (Task Lifecycle State Machine)
```
[Dibuat oleh Intern] ---> 'Draft' / 'In Progress'
                               |
                   (Klik 'Submit for Review')
                               |
                               v
                          'Submitted'
                               |
                 (Mentor Membuka Task Review)
                               |
        +----------------------+----------------------+
        |                      |                      |
        v                      v                      v
   'Approved'             'Revision'             'Rejected'
  (Progress: 100%)    (Intern Memperbaiki)    (Ditolak Mentor)
                               |
                               v
                     (Submit Ulang Tugas)
                               |
                               v
                          'Submitted'
```

### 10.2 Algoritma Penilaian Prioritas Tugas (`priorityScoring.ts`)
Sistem menghitung skor urgensi setiap tugas aktif menggunakan formula terbobot:
$$\text{Total Score} = \text{Priority Score} + \text{Deadline Score} + \text{Status Score}$$

- **1. Bobot Prioritas (`task.priority`):**
  - `Urgent`: $+40$ poin
  - `High`: $+30$ poin
  - `Medium`: $+20$ poin
  - `Low`: $+10$ poin
- **2. Bobot Kedekatan Batas Waktu (`task.deadline` vs Tanggal Acuan):**
  - Melewati Batas Waktu / Overdue ($\le 0$ hari): $+50$ poin
  - Sangat Dekat ($\le 1$ hari): $+40$ poin
  - Mendekat ($\le 3$ hari): $+25$ poin
  - Minggu Ini ($\le 7$ hari): $+10$ poin
  - Lebih dari 7 hari ($> 7$ hari): $+5$ poin
- **3. Bobot Status Tugas (`task.status`):**
  - `Revision` (Perlu Revisi Segera): $+20$ poin
  - `In Progress` (Sedang Dikerjakan): $+10$ poin
  - `Draft` (Masih Konsep): $+5$ poin
  - `Approved` / `Completed`: Skor otomatis direset menjadi $0$.

### 10.3 Aturan Presensi & Toleransi Keterlambatan
- **Jam Masuk Standar:** 08:00 WIB.
- **Batas Toleransi Keterlambatan:** Diambil secara dinamis dari `company_settings.late_tolerance_time` (Default: `09:00` WIB).
- **Logika Status Kehadiran:**
  - Jika Clock In $\le$ Waktu Toleransi $\rightarrow$ Status: `present` (Hadir Tepat Waktu).
  - Jika Clock In $>$ Waktu Toleransi $\rightarrow$ Status: `late` (Terlambat), formulir mewajibkan pengisian alasan keterlambatan.
  - Pengajuan Izin Tidak Masuk $\rightarrow$ Status: `permit` (Izin).
  - Pengajuan Keterangan Medis $\rightarrow$ Status: `sick` (Sakit).
  - Tidak melakukan presensi sampai akhir hari $\rightarrow$ Status: `absent` (Alpa).

---

## 11. LAMPIRAN DATA DEMO & PEMETAAN MENU

### 11.1 Daftar Menu Navigasi Sidebar per Role (Urutan & Label Persis)

#### A. Role: `intern` (Peserta Magang)
1. **Dashboard** (`icon: LayoutDashboard`, URL: `/intern/dashboard`)
2. **Daily Tasks** (`icon: CheckSquare`, URL: `/intern/tasks`)
3. **Absensi & Kehadiran** (`icon: Clock`, URL: `/intern/attendance`)
4. **My Progress** (`icon: TrendingUp`, URL: `/intern/progress`)
5. **Chat Mentor** (`icon: MessageSquare`, URL: `/chat`, *Badge: Unread Message Count*)
6. **Notifications** (`icon: Bell`, URL: `/notifications`, *Badge: Unread Notification Count*)
7. **Reports** (`icon: FileText`, URL: `/intern/reports`)
8. **Profile** (`icon: User`, URL: `/profile`)

#### B. Role: `mentor` (Pembimbing Lapangan)
1. **Dashboard** (`icon: LayoutDashboard`, URL: `/mentor/dashboard`)
2. **Intern** (`icon: Users`, URL: `/mentor/interns`)
3. **Kehadiran Intern** (`icon: CalendarCheck`, URL: `/mentor/attendance`)
4. **Chat Intern** (`icon: MessageSquare`, URL: `/chat`, *Badge: Unread Message Count*)
5. **Task Review** (`icon: ClipboardCheck`, URL: `/mentor/reviews`, *Badge: Pending Reviews Count*)
6. **Reports** (`icon: FileText`, URL: `/reports`)
7. **Notifications** (`icon: Bell`, URL: `/notifications`, *Badge: Unread Notification Count*)
8. **Profile** (`icon: User`, URL: `/profile`)

#### C. Role: `director` (Direktur Eksekutif)
1. **Dashboard** (`icon: LayoutDashboard`, URL: `/director/dashboard`)
2. **Manajemen Pengguna** (`icon: Users`, URL: `/director/users`)
3. **Pantau Kinerja** (`icon: TrendingUp`, URL: `/director/monitoring`)
4. **Monitoring Kehadiran** (`icon: CalendarCheck`, URL: `/director/attendance`)
5. **Reports** (`icon: BarChart3`, URL: `/reports`)
6. **Pengaturan Perusahaan** (`icon: Settings`, URL: `/director/settings`)
7. **Notifications** (`icon: Bell`, URL: `/notifications`, *Badge: Unread Notification Count*)
8. **Profile** (`icon: User`, URL: `/profile`)

---

### 11.2 Daftar Akun Pengguna Demo (`INITIAL_USERS`)

| ID | Nama Pengguna | Alamat Email | Kata Sandi | Role | Institusi / Unit | Mentor ID |
|---|---|---|---|---|---|---|
| **1** | Budi Santoso, M.Kom | `director@example.com` | `password` | `director` | PT. Teknologi Nusantara Solusi (Executive) | — |
| **2** | Hendra Wijaya, S.Kom | `mentor1@example.com` | `password` | `mentor` | PT. Teknologi Nusantara Solusi (Backend Lead) | — |
| **3** | Siti Rahmawati, M.T | `mentor2@example.com` | `password` | `mentor` | PT. Teknologi Nusantara Solusi (Mobile Lead) | — |
| **4** | Rizky Pratama | `intern1@example.com` | `password` | `intern` | Politeknik Negeri Malang (D4 TI) | `2` |
| **5** | Alivia Putri | `intern2@example.com` | `password` | `intern` | Institut Teknologi Sepuluh Nopember (S1 SI) | `2` |
| **6** | Dimas Aditya | `intern3@example.com` | `password` | `intern` | Universitas Brawijaya (S1 Tekkom) | `3` |
| **7** | Fadhil Rahman | `intern4@example.com` | `password` | `intern` | Universitas Indonesia (S1 Ilkom) | `3` |
| **8** | Nabila Ayu | `intern5@example.com` | `password` | `intern` | Institut Teknologi Bandung (S1 IF) | `3` |

---

### 11.3 Contoh Data Tugas Awal (`INITIAL_TASKS`)
1. **ID: 1 (Rizky Pratama - INT-0004):**
   - Judul: `Audit Fitur Reporting Asset`
   - Kategori: `Development` | Prioritas: `High` | Deadline: `2026-09-25` | Durasi: `6 Jam` | Progres: `85%` | Status: `Submitted`
   - Hasil: *Menemukan 3 bottleneck N+1 query pada pemanggilan relasi asset_categories.*
2. **ID: 2 (Rizky Pratama - INT-0004):**
   - Judul: `Slicing Dashboard Responsive Web`
   - Kategori: `Design` | Prioritas: `Medium` | Deadline: `2026-09-24` | Durasi: `4 Jam` | Progres: `100%` | Status: `Approved`
3. **ID: 5 (Alivia Putri - INT-0005):**
   - Judul: `Integrasi Payment Gateway Xendit Sandbox`
   - Kategori: `Development` | Prioritas: `Urgent` | Deadline: `2026-09-26` | Durasi: `8 Jam` | Progres: `60%` | Status: `Revision`
   - Catatan Mentor: *Header pada viewport iPhone SE masih overflow 12px saat scrolling.*
