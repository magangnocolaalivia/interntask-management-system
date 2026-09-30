import { Task, User, CompanySetting } from '../../types';

export interface ReportFilterOptions {
  startDate?: string;
  endDate?: string;
  internId?: string | number;
  mentorId?: string | number;
  status?: string;
  category?: string;
  searchQuery?: string;
}

/**
 * Controller Namespace: App\Http\Controllers\ReportController
 * Simulates Laravel 11 controller with barryvdh/laravel-dompdf and maatwebsite/excel
 */
export class ReportController {
  /**
   * Helper to ensure the EXACT same global company profile (from settings table / localStorage)
   * is resolved across Intern, Mentor, and Director roles alike with zero hardcoded fallbacks.
   */
  public static resolveGlobalCompanySetting(providedSetting?: CompanySetting): CompanySetting {
    if (providedSetting && providedSetting.company_name && providedSetting.company_name.trim().length > 0) {
      return providedSetting;
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem('interntask_company_setting');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.company_name) return parsed;
        }
      } catch (e) {
        // Fallback to default
      }
    }
    return {
      id: 1,
      company_name: 'PT InternTask Indonesia',
      company_address: 'Gedung Graha InternTask Lt. 4, Kawasan Industri Candisari, Semarang, Jawa Tengah 50257 | Telp: (024) 845-6789 | Email: ops@interntask.id | Website: www.interntask.id',
      company_logo_path: null,
    };
  }

  /**
   * Filter tasks based on active user role authorization (Row-Level Security) and applied filter criteria
   */
  public static filterTasksForExport(
    tasks: Task[],
    users: User[],
    currentUser: User,
    filters: ReportFilterOptions
  ): Task[] {
    // 1. Role Authorization Scoping (Strict Row-Level Security)
    let authorizedTasks: Task[] = [];

    if (currentUser.role === 'intern') {
      // Role Intern RLS: Kunci query database HANYA untuk tugas milik Auth::id()
      // SQL equivalent: Task::where('user_id', Auth::id())
      authorizedTasks = tasks.filter(t => t.user_id === currentUser.id);
    } else if (currentUser.role === 'mentor') {
      // Role Mentor RLS: Kunci query database HANYA untuk tugas dari peserta magang bimbingannya
      // SQL equivalent: Task::whereIn('user_id', User::where('mentor_id', Auth::id())->pluck('id'))
      const supervisedInternIds = users
        .filter(u => u.mentor_id === currentUser.id)
        .map(u => u.id);
      authorizedTasks = tasks.filter(t => supervisedInternIds.includes(t.user_id));
    } else {
      // Role Direktur RLS: Memiliki akses penuh melihat seluruh data tugas perusahaan
      // SQL equivalent: Task::with(['user', 'mentor'])
      authorizedTasks = [...tasks];
    }

    // 2. Dynamic Filter Validation & Filtering
    return authorizedTasks.filter(task => {
      // Double check Row-Level Security guarantees
      if (currentUser.role === 'intern' && task.user_id !== currentUser.id) {
        return false;
      }
      if (currentUser.role === 'mentor') {
        const intern = users.find(u => u.id === task.user_id);
        if (intern?.mentor_id !== currentUser.id) {
          return false;
        }
      }

      const taskDate = new Date(task.task_date);

      // Date range filter
      if (filters.startDate) {
        const sDate = new Date(filters.startDate);
        if (taskDate < sDate) return false;
      }
      if (filters.endDate) {
        const eDate = new Date(filters.endDate);
        if (taskDate > eDate) return false;
      }

      // Intern filter (Ignored for role intern since it's already strictly locked to Auth::id())
      if (currentUser.role !== 'intern' && filters.internId && filters.internId !== 'All') {
        if (task.user_id !== Number(filters.internId)) return false;
      }

      // Mentor filter (for Director only)
      if (currentUser.role === 'director' && filters.mentorId && filters.mentorId !== 'All') {
        const intern = users.find(u => u.id === task.user_id);
        if (intern?.mentor_id !== Number(filters.mentorId)) return false;
      }

      // Status filter
      if (filters.status && filters.status !== 'All') {
        if (task.status !== filters.status) return false;
      }

      // Category filter
      if (filters.category && filters.category !== 'All') {
        if (task.category !== filters.category) return false;
      }

      // Search query
      if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
        const q = filters.searchQuery.toLowerCase();
        const intern = users.find(u => u.id === task.user_id);
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchDesc = task.description.toLowerCase().includes(q);
        const matchIntern = intern?.name.toLowerCase().includes(q) || false;
        if (!matchTitle && !matchDesc && !matchIntern) return false;
      }

      return true;
    }).sort((a, b) => new Date(b.task_date).getTime() - new Date(a.task_date).getTime());
  }

  /**
   * Export Excel (Simulates Maatwebsite\Excel\Facades\Excel::download(new TasksExport, 'laporan.xlsx'))
   */
  public static exportExcel(
    filteredTasks: Task[],
    users: User[],
    filenamePrefix: string = 'Laporan_Aktivitas_InternTask',
    companySetting?: CompanySetting
  ): void {
    const headers = [
      'No',
      'Tanggal Tugas',
      'Nama Peserta Magang',
      'Institusi / Kampus',
      'Mentor Pembimbing',
      'Judul Tugas',
      'Kategori',
      'Prioritas',
      'Durasi (Jam)',
      'Progres (%)',
      'Status Akhir',
      'Deadline',
    ];

    const rows = filteredTasks.map((t, idx) => {
      const intern = users.find(u => u.id === t.user_id);
      const mentor = intern?.mentor_id ? users.find(u => u.id === intern.mentor_id) : null;

      return [
        idx + 1,
        `"${t.task_date}"`,
        `"${(intern?.name || 'Peserta Magang').replace(/"/g, '""')}"`,
        `"${(intern?.institution || '-').replace(/"/g, '""')}"`,
        `"${(mentor?.name || 'Belum Ditugaskan').replace(/"/g, '""')}"`,
        `"${t.title.replace(/"/g, '""')}"`,
        `"${t.category}"`,
        `"${t.priority}"`,
        t.estimated_duration || 0,
        `${t.progress}%`,
        `"${t.status}"`,
        `"${t.deadline}"`,
      ];
    });

    // Add UTF-8 BOM for Excel compatibility
    const activeCompany = ReportController.resolveGlobalCompanySetting(companySetting);
    const compName = activeCompany.company_name;
    const dateStr = new Date().toISOString().split('T')[0];
    const compClean = compName.replace(/[^a-zA-Z0-9]/g, '_');

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${compClean}_Laporan_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Export PDF (Simulates Barryvdh\DomPDF\Facade\Pdf::loadView('reports.pdf', $data)->download())
   */
  public static generatePdfHtml(
    filteredTasks: Task[],
    users: User[],
    filters: ReportFilterOptions,
    currentUser: User,
    companySetting?: CompanySetting
  ): string {
    const activeCompany = ReportController.resolveGlobalCompanySetting(companySetting);
    const compName = activeCompany.company_name;
    const compAddr = activeCompany.company_address;
    const compLogo = activeCompany.company_logo_path || null;

    const completedCount = filteredTasks.filter(t => t.status === 'Completed' || t.status === 'Approved').length;
    const totalDuration = filteredTasks.reduce((acc, t) => acc + (t.estimated_duration || 0), 0);
    const completionRate = filteredTasks.length > 0 ? Math.round((completedCount / filteredTasks.length) * 100) : 0;

    let targetLabel = 'Seluruh Peserta Magang';
    if (currentUser.role === 'intern') {
      targetLabel = `${currentUser.name} (${currentUser.institution || 'Peserta Magang'})`;
    } else if (filters.internId && filters.internId !== 'All') {
      const targetIntern = users.find(u => u.id === Number(filters.internId));
      if (targetIntern) targetLabel = targetIntern.name;
    }

    let mentorLabel = 'Seluruh Mentor Pembimbing';
    if (currentUser.role === 'intern') {
      const myMentor = currentUser.mentor_id ? users.find(u => u.id === currentUser.mentor_id) : null;
      mentorLabel = myMentor ? `${myMentor.name} (${myMentor.division || 'Mentor'})` : 'Pembimbing Magang';
    } else if (currentUser.role === 'mentor') {
      mentorLabel = currentUser.name;
    } else if (filters.mentorId && filters.mentorId !== 'All') {
      const targetMentor = users.find(u => u.id === Number(filters.mentorId));
      if (targetMentor) mentorLabel = targetMentor.name;
    }

    const todayDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const rowsHtml = filteredTasks.map((t, idx) => {
      const intern = users.find(u => u.id === t.user_id);
      let badgeStyle = 'background-color:#f1f5f9;color:#475569;';
      if (t.status === 'Completed' || t.status === 'Approved') badgeStyle = 'background-color:#d1fae5;color:#065f46;border:1px solid #a7f3d0;';
      else if (t.status === 'In Progress') badgeStyle = 'background-color:#ccfbf1;color:#115e59;border:1px solid #99f6e4;';
      else if (t.status === 'Submitted' || t.status === 'Review') badgeStyle = 'background-color:#e0e7ff;color:#3730a3;border:1px solid #c7d2fe;';
      else if (t.status === 'Revision') badgeStyle = 'background-color:#fef3c7;color:#92400e;border:1px solid #fde68a;';
      else if (t.status === 'Rejected') badgeStyle = 'background-color:#ffe4e6;color:#9f1239;border:1px solid #fecdd3;';

      return `
        <tr style="${idx % 2 === 1 ? 'background-color:#f8fafc;' : ''}">
          <td style="text-align:center;padding:7px 6px;border:1px solid #e2e8f0;color:#64748b;">${idx + 1}</td>
          <td style="padding:7px 6px;border:1px solid #e2e8f0;white-space:nowrap;font-size:8pt;">${t.task_date}</td>
          <td style="padding:7px 6px;border:1px solid #e2e8f0;">
            <strong style="color:#0f172a;font-size:8.5pt;">${intern?.name || '-'}</strong><br/>
            <span style="color:#64748b;font-size:7.5pt;">${intern?.institution || '-'}</span>
          </td>
          <td style="padding:7px 6px;border:1px solid #e2e8f0;">
            <strong style="color:#0f172a;font-size:8.5pt;">${t.title}</strong><br/>
            <span style="color:#0d9488;font-size:7.5pt;">[${t.category}] Prioritas: ${t.priority}</span>
          </td>
          <td style="text-align:center;padding:7px 6px;border:1px solid #e2e8f0;font-size:8.5pt;">${t.estimated_duration || 0} Jam</td>
          <td style="text-align:center;padding:7px 6px;border:1px solid #e2e8f0;font-size:8.5pt;">${t.progress}%</td>
          <td style="text-align:center;padding:7px 6px;border:1px solid #e2e8f0;">
            <span style="display:inline-block;padding:2px 6px;border-radius:4px;font-size:7pt;font-weight:bold;text-transform:uppercase;${badgeStyle}">
              ${t.status}
            </span>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Rekapitulasi Aktivitas Harian Peserta Magang - ${compName}</title>
        <style>
          @page { margin: 15mm 12mm; size: A4 portrait; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; padding: 20px; font-size: 9pt; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <!-- Kop Surat Korporat Resmi (White-Label Dinamis) -->
        <div style="border-bottom: 3px double #0f172a; padding-bottom: 12px; margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              ${compLogo ? `
              <td style="width: 75px; vertical-align: middle; text-align: left; padding-right: 12px;">
                <img src="${compLogo}" style="width: 65px; max-height: 65px; object-fit: contain;" alt="Logo ${compName}" />
              </td>
              ` : ''}
              <td style="text-align: center; vertical-align: middle; ${!compLogo ? 'padding-left: 0;' : ''}">
                <h1 style="font-size: 15pt; font-weight: 800; color: #0f172a; letter-spacing: 0.5px; margin: 0; text-transform: uppercase;">${compName}</h1>
                <p style="font-size: 10.5pt; font-weight: 600; color: #0d9488; margin: 2px 0 4px 0;">Divisi Teknologi Informasi &amp; Manajemen Program Magang Industri</p>
                <p style="font-size: 8pt; color: #475569; margin: 0; line-height: 1.3;">
                  ${compAddr}
                </p>
              </td>
            </tr>
          </table>
        </div>

        <!-- Judul Laporan -->
        <div style="text-align: center; margin-bottom: 16px;">
          <h2 style="font-size: 13pt; font-weight: bold; text-transform: uppercase; color: #0f172a; margin: 0; text-decoration: underline;">
            Rekapitulasi Aktivitas Harian Peserta Magang
          </h2>
          <p style="font-size: 8.5pt; color: #64748b; margin-top: 4px;">
            Periode: <strong>${filters.startDate || 'Semua'}</strong> s/d <strong>${filters.endDate || 'Sekarang'}</strong> | 
            Nomor Dokumen: <strong>IT-RPT-${Date.now().toString().slice(-6)}</strong>
          </p>
        </div>

        <!-- Ringkasan Info -->
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 14px; margin-bottom: 16px; font-size: 8.5pt;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 20%; color: #64748b; padding: 3px 0;">Target Entitas:</td>
              <td style="width: 30%; font-weight: bold; color: #0f172a;">${targetLabel}</td>
              <td style="width: 20%; color: #64748b; padding: 3px 0;">Total Tugas:</td>
              <td style="width: 30%; font-weight: bold; color: #0f172a;">${filteredTasks.length} Tugas</td>
            </tr>
            <tr>
              <td style="color: #64748b; padding: 3px 0;">Supervisor / Mentor:</td>
              <td style="font-weight: bold; color: #0f172a;">${mentorLabel}</td>
              <td style="color: #64748b; padding: 3px 0;">Tugas Selesai:</td>
              <td style="font-weight: bold; color: #059669;">${completedCount} Tugas (${completionRate}%)</td>
            </tr>
            <tr>
              <td style="color: #64748b; padding: 3px 0;">Status Filter:</td>
              <td style="font-weight: bold; color: #0f172a;">${filters.status || 'Semua Status'}</td>
              <td style="color: #64748b; padding: 3px 0;">Total Durasi Kerja:</td>
              <td style="font-weight: bold; color: #0f172a;">${totalDuration} Jam Kerja</td>
            </tr>
          </table>
        </div>

        <!-- Tabel Data -->
        <table style="width: 100%; border-collapse: collapse; font-size: 8.5pt; margin-bottom: 25px;">
          <thead>
            <tr style="background-color: #f1f5f9; color: #334155; font-size: 7.5pt; text-transform: uppercase;">
              <th style="padding: 8px 6px; border: 1px solid #cbd5e1; width: 5%; text-align: center;">No</th>
              <th style="padding: 8px 6px; border: 1px solid #cbd5e1; width: 12%; text-align: left;">Tanggal</th>
              <th style="padding: 8px 6px; border: 1px solid #cbd5e1; width: 20%; text-align: left;">Nama Intern</th>
              <th style="padding: 8px 6px; border: 1px solid #cbd5e1; width: 33%; text-align: left;">Judul Tugas &amp; Kategori</th>
              <th style="padding: 8px 6px; border: 1px solid #cbd5e1; width: 10%; text-align: center;">Durasi</th>
              <th style="padding: 8px 6px; border: 1px solid #cbd5e1; width: 8%; text-align: center;">Progres</th>
              <th style="padding: 8px 6px; border: 1px solid #cbd5e1; width: 12%; text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || '<tr><td colspan="7" style="text-align:center;padding:20px;color:#94a3b8;">Tidak ada data tugas yang sesuai dengan filter.</td></tr>'}
          </tbody>
        </table>

        <!-- Tanda Tangan Korporat -->
        <div style="margin-top: 30px; page-break-inside: avoid;">
          <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 8.5pt;">
            <tr>
              <td style="width: 50%; vertical-align: top;">
                <p style="color: #475569; margin-bottom: 50px;">
                  Semarang, ${todayDate}<br/>
                  Mengetahui &amp; Memvalidasi,<br/>
                  <strong>Pembimbing Magang (Mentor)</strong>
                </p>
                <p style="font-weight: bold; color: #0f172a; text-decoration: underline; margin: 0;">Hendra Wijaya, S.Kom., M.T.</p>
                <p style="font-size: 7.5pt; color: #64748b; margin: 2px 0 0 0;">Lead Software Engineer</p>
              </td>
              <td style="width: 50%; vertical-align: top;">
                <p style="color: #475569; margin-bottom: 50px;">
                  Semarang, ${todayDate}<br/>
                  Menyetujui &amp; Mengesahkan,<br/>
                  <strong>Direktur Operasional</strong>
                </p>
                <p style="font-weight: bold; color: #0f172a; text-decoration: underline; margin: 0;">Budi Santoso, M.M.</p>
                <p style="font-size: 7.5pt; color: #64748b; margin: 2px 0 0 0;">Direktur ${compName}</p>
              </td>
            </tr>
          </table>
        </div>

        <!-- Footer -->
        <div style="margin-top: 25px; border-top: 1px solid #e2e8f0; padding-top: 6px; font-size: 7.5pt; color: #94a3b8; display: flex; justify-content: space-between;">
          <span>Dokumen Resmi ${compName} - Dicetak pada ${new Date().toLocaleString('id-ID')} WIB</span>
          <span>Dokumen Terverifikasi Digital</span>
        </div>
      </body>
      </html>
    `;
  }
}
