<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Rekapitulasi_Kehadiran_{{ Str::slug($intern->name ?? 'Intern') }}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 15mm 15mm 15mm 15mm;
        }
        * {
            box-sizing: border-box;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #0f172a;
            line-height: 1.35;
            font-size: 8.5pt;
            background: #ffffff;
            margin: 0;
            padding: 0;
        }
        .kop-surat {
            border-bottom: 3px double #0f172a;
            padding-bottom: 12px;
            margin-bottom: 18px;
        }
        .summary-card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 8px 12px;
            text-align: center;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
    </style>
</head>
<body>
    <!-- 1. Kop Surat Korporat Resmi (White-Label Dinamis) -->
    <div class="kop-surat">
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                @if(!empty($companyLogoPath))
                <td style="width: 75px; vertical-align: middle; text-align: left; padding-right: 15px;">
                    <img src="{{ public_path($companyLogoPath) }}" alt="Logo" style="max-height: 60px; max-width: 75px; object-fit: contain;" />
                </td>
                @endif
                <td style="vertical-align: middle; text-align: {{ !empty($companyLogoPath) ? 'left' : 'center' }};">
                    <h1 style="font-size: 14pt; font-weight: 800; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">
                        {{ $companyName ?? 'PT. Teknologi Nusantara Solusi' }}
                    </h1>
                    <p style="font-size: 7.5pt; color: #475569; margin: 3px 0 0 0; line-height: 1.35;">
                        {{ $companyAddress ?? 'Gedung Grha Solusi Lt. 4, Jl. Pemuda No. 120, Sekayu, Semarang Tengah, Jawa Tengah 50132 | Telp: (024) 845-1234' }}
                    </p>
                    <p style="font-size: 7pt; color: #0d9488; font-weight: 600; margin: 3px 0 0 0;">
                        DIVISI SUMBER DAYA MANUSIA &amp; PROGRAM MAGANG KERJA INDUSTRI
                    </p>
                </td>
            </tr>
        </table>
    </div>

    <!-- 2. Judul Dokumen -->
    <div style="text-align: center; margin-bottom: 16px;">
        <h2 style="font-size: 11pt; font-weight: 800; margin: 0; color: #0f172a; text-transform: uppercase; letter-spacing: 0.8px;">
            LEMBAR REKAPITULASI KEHADIRAN &amp; ABSENSI BULANAN
        </h2>
        <p style="font-size: 8pt; color: #64748b; margin: 2px 0 0 0;">
            Periode Laporan: <strong>{{ $startDate ?? '-' }}</strong> s/d <strong>{{ $endDate ?? '-' }}</strong>
        </p>
    </div>

    <!-- 3. Biodata Peserta & Mentor Magang -->
    <table style="width: 100%; border: 1px solid #cbd5e1; background: #f8fafc; margin-bottom: 14px; font-size: 8pt; border-collapse: collapse;">
        <tr>
            <td style="padding: 6px 10px; width: 18%; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0;">Nama Peserta</td>
            <td style="padding: 6px 10px; width: 32%; font-weight: 800; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: {{ $intern->name }}</td>
            <td style="padding: 6px 10px; width: 18%; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0;">Mentor Pembimbing</td>
            <td style="padding: 6px 10px; width: 32%; font-weight: 800; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: {{ $mentor->name ?? 'Hendra Wijaya, S.Kom., M.T.' }}</td>
        </tr>
        <tr>
            <td style="padding: 6px 10px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0;">Asal Institusi</td>
            <td style="padding: 6px 10px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: {{ $intern->institution ?? 'Politeknik Negeri Malang' }}</td>
            <td style="padding: 6px 10px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0;">Divisi / Unit</td>
            <td style="padding: 6px 10px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: {{ $mentor->division ?? 'Engineering & Technology' }}</td>
        </tr>
        <tr>
            <td style="padding: 6px 10px; font-weight: 600; color: #475569;">Program Studi</td>
            <td style="padding: 6px 10px; color: #0f172a;">: {{ $intern->study_program ?? 'D4 Teknik Informatika' }}</td>
            <td style="padding: 6px 10px; font-weight: 600; color: #475569;">Jam Kerja Kantor</td>
            <td style="padding: 6px 10px; color: #0f172a;">: 08:00 - 17:00 WIB (Toleransi {{ $lateToleranceTime ?? '09:00' }} WIB)</td>
        </tr>
    </table>

    <!-- 4. Ringkasan Statistik Presensi -->
    <table style="width: 100%; border-collapse: separate; border-spacing: 6px; margin-bottom: 14px;">
        <tr>
            <td style="width: 20%;" class="summary-card">
                <span style="font-size: 7pt; color: #64748b; text-transform: uppercase;">Total Hari</span>
                <div style="font-size: 13pt; font-weight: 800; color: #0f172a; margin-top: 2px;">{{ count($attendances) }}</div>
                <span style="font-size: 6.5pt; color: #94a3b8;">Hari Kerja</span>
            </td>
            <td style="width: 20%;" class="summary-card">
                <span style="font-size: 7pt; color: #065f46; text-transform: uppercase; font-weight: 600;">Hadir Tepat Waktu</span>
                <div style="font-size: 13pt; font-weight: 800; color: #059669; margin-top: 2px;">{{ $presentCount ?? 0 }}</div>
                <span style="font-size: 6.5pt; color: #10b981;">&le; {{ $lateToleranceTime ?? '09:00' }} WIB</span>
            </td>
            <td style="width: 20%;" class="summary-card">
                <span style="font-size: 7pt; color: #92400e; text-transform: uppercase; font-weight: 600;">Terlambat</span>
                <div style="font-size: 13pt; font-weight: 800; color: #d97706; margin-top: 2px;">{{ $lateCount ?? 0 }}</div>
                <span style="font-size: 6.5pt; color: #f59e0b;">&gt; {{ $lateToleranceTime ?? '09:00' }} WIB</span>
            </td>
            <td style="width: 20%;" class="summary-card">
                <span style="font-size: 7pt; color: #d97706; text-transform: uppercase; font-weight: 600;">Izin &amp; Sakit</span>
                <div style="font-size: 13pt; font-weight: 800; color: #b45309; margin-top: 2px;">{{ ($permitCount ?? 0) + ($sickCount ?? 0) }}</div>
                <span style="font-size: 6.5pt; color: #d97706;">{{ $permitCount ?? 0 }} Izin • {{ $sickCount ?? 0 }} Sakit</span>
            </td>
            <td style="width: 20%;" class="summary-card">
                <span style="font-size: 7pt; color: #0f766e; text-transform: uppercase; font-weight: 700;">Tingkat Kehadiran</span>
                <div style="font-size: 13pt; font-weight: 800; color: #0d9488; margin-top: 2px;">{{ $attendanceRate ?? 100 }}%</div>
                <span style="font-size: 6.5pt; color: #14b8a6;">Persentase Presensi</span>
            </td>
        </tr>
    </table>

    <!-- 5. Tabel Rincian Kehadiran Bulanan -->
    <table style="width: 100%; border-collapse: collapse; font-size: 8pt; margin-bottom: 25px;">
        <thead>
            <tr style="background-color: #f1f5f9; color: #334155; font-size: 7.5pt; text-transform: uppercase;">
                <th style="padding: 7px 4px; border: 1px solid #cbd5e1; width: 5%; text-align: center;">No</th>
                <th style="padding: 7px 6px; border: 1px solid #cbd5e1; width: 13%; text-align: center;">Tanggal</th>
                <th style="padding: 7px 6px; border: 1px solid #cbd5e1; width: 10%; text-align: center;">Hari</th>
                <th style="padding: 7px 6px; border: 1px solid #cbd5e1; width: 12%; text-align: center;">Clock In</th>
                <th style="padding: 7px 6px; border: 1px solid #cbd5e1; width: 12%; text-align: center;">Clock Out</th>
                <th style="padding: 7px 6px; border: 1px solid #cbd5e1; width: 14%; text-align: center;">Durasi Kerja</th>
                <th style="padding: 7px 6px; border: 1px solid #cbd5e1; width: 16%; text-align: center;">Status Kehadiran</th>
                <th style="padding: 7px 6px; border: 1px solid #cbd5e1; width: 18%; text-align: left;">Keterangan / Catatan</th>
            </tr>
        </thead>
        <tbody>
            @forelse($attendances as $index => $att)
            <tr style="{{ $index % 2 == 1 ? 'background-color: #f8fafc;' : '' }}">
                <td style="padding: 6px 4px; border: 1px solid #cbd5e1; text-align: center; color: #64748b;">{{ $index + 1 }}</td>
                <td style="padding: 6px 6px; border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold; text-align: center;">{{ $att->date }}</td>
                <td style="padding: 6px 6px; border: 1px solid #cbd5e1; text-align: center; color: #475569;">{{ \Carbon\Carbon::parse($att->date)->locale('id')->isoFormat('dddd') }}</td>
                <td style="padding: 6px 6px; border: 1px solid #cbd5e1; font-family: monospace; text-align: center; color: #0f172a; font-weight: 600;">{{ $att->clock_in ?? '-' }}</td>
                <td style="padding: 6px 6px; border: 1px solid #cbd5e1; font-family: monospace; text-align: center; color: #0f172a; font-weight: 600;">{{ $att->clock_out ?? '-' }}</td>
                <td style="padding: 6px 6px; border: 1px solid #cbd5e1; text-align: center; color: #334155;">{{ $att->duration ?? '-' }}</td>
                <td style="padding: 6px 6px; border: 1px solid #cbd5e1; text-align: center;">
                    @if($att->status === 'present')
                        <span style="background-color:#d1fae5;color:#065f46;border:1px solid #a7f3d0;padding:2px 8px;border-radius:12px;font-weight:bold;font-size:7pt;">HADIR TEPAT WAKTU</span>
                    @elseif($att->status === 'late')
                        <span style="background-color:#fef3c7;color:#92400e;border:1px solid #fde68a;padding:2px 8px;border-radius:12px;font-weight:bold;font-size:7pt;">TERLAMBAT</span>
                    @elseif($att->status === 'permit')
                        <span style="background-color:#fef9c3;color:#854d0e;border:1px solid #fde047;padding:2px 8px;border-radius:12px;font-weight:bold;font-size:7pt;">IZIN KEPERLUAN</span>
                    @elseif($att->status === 'sick')
                        <span style="background-color:#ffe4e6;color:#9f1239;border:1px solid #fecdd3;padding:2px 8px;border-radius:12px;font-weight:bold;font-size:7pt;">SAKIT / MEDIS</span>
                    @else
                        <span style="background-color:#f1f5f9;color:#475569;border:1px solid #cbd5e1;padding:2px 8px;border-radius:12px;font-weight:bold;font-size:7pt;">ALPA</span>
                    @endif
                </td>
                <td style="padding: 6px 6px; border: 1px solid #cbd5e1; color: #475569;">{{ $att->notes ?? '-' }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="8" style="text-align: center; padding: 16px; color: #94a3b8;">Belum ada catatan presensi pada periode tanggal yang dipilih.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <!-- 6. Ruang / Kolom Tanda Tangan Wajib (Kiri: Peserta Magang, Kanan: Mentor Pembimbing) -->
    <div style="margin-top: 25px; page-break-inside: avoid;">
        <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 8.5pt;">
            <tr>
                <!-- Sisi Kiri: Peserta Magang -->
                <td style="width: 50%; vertical-align: top; padding: 0 25px;">
                    <p style="color: #475569; margin: 0 0 4px 0;">
                        Semarang, {{ \Carbon\Carbon::now()->locale('id')->isoFormat('D MMMM Y') }}
                    </p>
                    <p style="color: #334155; font-weight: 600; margin: 0 0 55px 0;">
                        Dibuat &amp; Dinyatakan Oleh,<br/>
                        <span style="font-weight: 700; color: #0f172a;">Peserta Magang (Intern)</span>
                    </p>
                    <p style="font-weight: bold; color: #0f172a; text-decoration: underline; margin: 0; font-size: 9pt;">
                        {{ $intern->name }}
                    </p>
                    <p style="font-size: 7.5pt; color: #64748b; margin: 3px 0 0 0;">
                        NIM/ID: INT-{{ str_pad($intern->id, 4, '0', STR_PAD_LEFT) }} • {{ $intern->institution ?? 'Peserta Magang' }}
                    </p>
                </td>

                <!-- Sisi Kanan: Mentor Pembimbing -->
                <td style="width: 50%; vertical-align: top; padding: 0 25px;">
                    <p style="color: #475569; margin: 0 0 4px 0;">
                        Semarang, {{ \Carbon\Carbon::now()->locale('id')->isoFormat('D MMMM Y') }}
                    </p>
                    <p style="color: #334155; font-weight: 600; margin: 0 0 55px 0;">
                        Mengetahui &amp; Memverifikasi,<br/>
                        <span style="font-weight: 700; color: #0f172a;">Mentor Pembimbing Lapangan</span>
                    </p>
                    <p style="font-weight: bold; color: #0f172a; text-decoration: underline; margin: 0; font-size: 9pt;">
                        {{ $mentor->name ?? 'Hendra Wijaya, S.Kom., M.T.' }}
                    </p>
                    <p style="font-size: 7.5pt; color: #64748b; margin: 3px 0 0 0;">
                        {{ $mentor->division ?? 'Mentor Pembimbing' }} • {{ $companyName ?? 'PT. Teknologi Nusantara Solusi' }}
                    </p>
                </td>
            </tr>
        </table>
    </div>

    <!-- 7. Footer Dokumen Resmi -->
    <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 6px; font-size: 7pt; color: #94a3b8; display: flex; justify-content: space-between;">
        <span>Dokumen Resmi Rekapitulasi Presensi {{ $companyName ?? 'PT. Teknologi Nusantara Solusi' }} • Dicetak pada {{ \Carbon\Carbon::now()->locale('id')->isoFormat('D MMMM Y HH:mm') }} WIB</span>
        <span>Halaman 1 dari 1 • Dokumen Sah Administrasi Magang</span>
    </div>
</body>
</html>
