<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Rekapitulasi Aktivitas Harian Peserta Magang - {{ $companyName ?? 'PT InternTask Indonesia' }}</title>
    <style>
        @page {
            margin: 20mm 15mm 20mm 15mm;
            size: A4 portrait;
        }

        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1e293b;
            font-size: 10pt;
            line-height: 1.4;
            margin: 0;
            padding: 0;
        }

        /* Kop Surat Korporat */
        .kop-surat {
            border-bottom: 3px double #0f172a;
            padding-bottom: 12px;
            margin-bottom: 20px;
            position: relative;
        }

        .kop-table {
            width: 100%;
            border-collapse: collapse;
        }

        .kop-table td {
            vertical-align: middle;
            border: none;
            padding: 0;
        }

        .kop-logo {
            width: 75px;
            height: auto;
        }

        .kop-content {
            text-align: center;
            padding-right: 30px;
        }

        .kop-company {
            font-size: 15pt;
            font-weight: bold;
            color: #0f172a;
            letter-spacing: 0.5px;
            margin: 0;
            text-transform: uppercase;
        }

        .kop-subcompany {
            font-size: 11pt;
            font-weight: 600;
            color: #0d9488;
            margin: 2px 0 4px 0;
        }

        .kop-address {
            font-size: 8.5pt;
            color: #475569;
            margin: 0;
            line-height: 1.3;
        }

        /* Dokumen Title */
        .doc-title-container {
            text-align: center;
            margin-bottom: 18px;
        }

        .doc-title {
            font-size: 13pt;
            font-weight: bold;
            text-transform: uppercase;
            color: #0f172a;
            margin: 0;
            text-decoration: underline;
        }

        .doc-meta {
            font-size: 9pt;
            color: #64748b;
            margin-top: 4px;
        }

        /* Summary Info Box */
        .summary-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 10px 14px;
            margin-bottom: 16px;
            font-size: 8.5pt;
        }

        .summary-table {
            width: 100%;
            border-collapse: collapse;
        }

        .summary-table td {
            padding: 3px 6px;
            border: none;
        }

        .summary-label {
            color: #64748b;
            font-weight: 500;
            width: 22%;
        }

        .summary-value {
            color: #0f172a;
            font-weight: bold;
        }

        /* Data Table */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8.5pt;
            margin-bottom: 25px;
        }

        .data-table th {
            background-color: #f1f5f9;
            color: #334155;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 7.5pt;
            letter-spacing: 0.5px;
            border: 1px solid #cbd5e1;
            padding: 7px 6px;
            text-align: left;
        }

        .data-table td {
            border: 1px solid #e2e8f0;
            padding: 6px 6px;
            vertical-align: middle;
        }

        /* Striped Rows */
        .data-table tbody tr:nth-child(even) {
            background-color: #f8fafc;
        }

        /* Status Badges */
        .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 7pt;
            font-weight: bold;
            text-align: center;
            text-transform: uppercase;
        }

        .badge-completed {
            background-color: #d1fae5;
            color: #065f46;
            border: 1px solid #a7f3d0;
        }

        .badge-inprogress {
            background-color: #ccfbf1;
            color: #115e59;
            border: 1px solid #99f6e4;
        }

        .badge-review {
            background-color: #e0e7ff;
            color: #3730a3;
            border: 1px solid #c7d2fe;
        }

        .badge-revision {
            background-color: #fef3c7;
            color: #92400e;
            border: 1px solid #fde68a;
        }

        .badge-rejected {
            background-color: #ffe4e6;
            color: #9f1239;
            border: 1px solid #fecdd3;
        }

        /* Tanda Tangan */
        .signature-section {
            width: 100%;
            margin-top: 30px;
            page-break-inside: avoid;
        }

        .signature-table {
            width: 100%;
            border-collapse: collapse;
        }

        .signature-table td {
            width: 50%;
            border: none;
            text-align: center;
            vertical-align: top;
            font-size: 9pt;
        }

        .sign-title {
            color: #475569;
            margin-bottom: 60px;
        }

        .sign-name {
            font-weight: bold;
            color: #0f172a;
            text-decoration: underline;
        }

        .sign-role {
            font-size: 8pt;
            color: #64748b;
        }

        /* Footer */
        .doc-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            border-top: 1px solid #e2e8f0;
            padding-top: 6px;
            font-size: 7.5pt;
            color: #94a3b8;
            display: flex;
            justify-content: space-between;
        }
    </style>
</head>
<body>
    <!-- 1. Kop Surat Korporat Resmi (White-Label Dinamis) -->
    <div class="kop-surat">
        <table class="kop-table">
            <tr>
                @if(!empty($companyLogoPath))
                <td style="width: 80px; text-align: left; vertical-align: middle;">
                    <img src="{{ $companyLogoPath }}" class="kop-logo" alt="Logo {{ $companyName ?? 'Perusahaan' }}">
                </td>
                @endif
                <td class="kop-content" style="{{ empty($companyLogoPath) ? 'padding-right: 0;' : '' }}">
                    <h1 class="kop-company">{{ $companyName ?? 'PT INTERNTASK INDONESIA' }}</h1>
                    <p class="kop-subcompany">Divisi Teknologi Informasi &amp; Manajemen Program Magang Industri</p>
                    <p class="kop-address">
                        {{ $companyAddress ?? 'Gedung Graha InternTask Lt. 4, Kawasan Industri Candisari, Semarang, Jawa Tengah 50257 | Telp: (024) 845-6789 | Email: ops@interntask.id | Website: www.interntask.id' }}
                    </p>
                </td>
            </tr>
        </table>
    </div>

    <!-- 2. Judul Dokumen & Periode -->
    <div class="doc-title-container">
        <h2 class="doc-title">Rekapitulasi Aktivitas Harian Peserta Magang</h2>
        <p class="doc-meta">
            Periode: <strong>{{ $startDate }}</strong> s/d <strong>{{ $endDate }}</strong> | 
            Nomor Dokumen: <strong>IT-RPT-{{ date('Ymd') }}-{{ rand(100, 999) }}</strong>
        </p>
    </div>

    <!-- 3. Ringkasan Laporan (Executive Summary) -->
    <div class="summary-box">
        <table class="summary-table">
            <tr>
                <td class="summary-label">Target Ekspor:</td>
                <td class="summary-value">{{ $filterTarget ?? 'Seluruh Peserta Magang' }}</td>
                <td class="summary-label">Total Tugas:</td>
                <td class="summary-value">{{ count($tasks) }} Tugas</td>
            </tr>
            <tr>
                <td class="summary-label">Pembimbing / Supervisor:</td>
                <td class="summary-value">{{ $mentorName ?? 'Seluruh Mentor Pembimbing' }}</td>
                <td class="summary-label">Tugas Selesai (Approved):</td>
                <td class="summary-value">{{ $completedCount }} Tugas ({{ $completionRate }}%)</td>
            </tr>
            <tr>
                <td class="summary-label">Filter Status:</td>
                <td class="summary-value">{{ $statusFilter ?? 'Semua Status' }}</td>
                <td class="summary-label">Total Akumulasi Durasi:</td>
                <td class="summary-value">{{ $totalDuration }} Jam Kerja</td>
            </tr>
        </table>
    </div>

    <!-- 4. Tabel Rincian Data Aktivitas Tugas -->
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 5%; text-align: center;">No</th>
                <th style="width: 12%;">Tanggal</th>
                <th style="width: 18%;">Nama Intern</th>
                <th style="width: 33%;">Judul Tugas & Kategori</th>
                <th style="width: 10%; text-align: center;">Durasi</th>
                <th style="width: 10%; text-align: center;">Progres</th>
                <th style="width: 12%; text-align: center;">Status Akhir</th>
            </tr>
        </thead>
        <tbody>
            @forelse($tasks as $index => $task)
            <tr>
                <td style="text-align: center; color: #64748b;">{{ $index + 1 }}</td>
                <td style="white-space: nowrap;">{{ date('d/m/Y', strtotime($task->task_date)) }}</td>
                <td>
                    <strong>{{ $task->user->name ?? '-' }}</strong><br>
                    <span style="color: #64748b; font-size: 7pt;">{{ $task->user->institution ?? '-' }}</span>
                </td>
                <td>
                    <strong style="color: #0f172a;">{{ $task->title }}</strong><br>
                    <span style="color: #0d9488; font-size: 7.5pt;">[{{ $task->category }}] Prioritas: {{ $task->priority }}</span>
                </td>
                <td style="text-align: center;">{{ $task->estimated_duration }} Jam</td>
                <td style="text-align: center;">{{ $task->progress }}%</td>
                <td style="text-align: center;">
                    @if(in_array($task->status, ['Completed', 'Approved']))
                        <span class="badge badge-completed">Selesai</span>
                    @elseif($task->status == 'In Progress')
                        <span class="badge badge-inprogress">Proses</span>
                    @elseif(in_array($task->status, ['Submitted', 'Review']))
                        <span class="badge badge-review">Review</span>
                    @elseif($task->status == 'Revision')
                        <span class="badge badge-revision">Revisi</span>
                    @else
                        <span class="badge badge-rejected">Draft</span>
                    @endif
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="7" style="text-align: center; padding: 20px; color: #64748b;">
                    Tidak ada data tugas yang memenuhi kriteria filter tanggal dan status.
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <!-- 5. Tanda Tangan Pengesahan Korporat -->
    <div class="signature-section">
        <table class="signature-table">
            <tr>
                <td>
                    <p class="sign-title">
                        Semarang, {{ date('d F Y') }}<br>
                        Mengetahui & Memvalidasi,<br>
                        <strong>Pembimbing Magang (Mentor)</strong>
                    </p>
                    <p class="sign-name">{{ $mentorSignName ?? 'Hendra Wijaya, S.Kom., M.T.' }}</p>
                    <p class="sign-role">Lead Software Engineer / Mentor</p>
                </td>
                <td>
                    <p class="sign-title">
                        Semarang, {{ date('d F Y') }}<br>
                        Menyetujui & Mengesahkan,<br>
                        <strong>Direktur Operasional</strong>
                    </p>
                    <p class="sign-name">{{ $directorSignName ?? 'Budi Santoso, M.M.' }}</p>
                    <p class="sign-role">Direktur {{ $companyName ?? 'PT InternTask Indonesia' }}</p>
                </td>
            </tr>
        </table>
    </div>

    <!-- 6. Footer Resmi -->
    <div class="doc-footer">
        <span>Dokumen Resmi {{ $companyName ?? 'PT InternTask Indonesia' }} - Dicetak pada {{ date('d-m-Y H:i:s') }} WIB</span>
        <span>Halaman 1 dari 1</span>
    </div>
</body>
</html>
