import { Task, Attendance, User } from '../types';

export interface DayMetric {
  dateStr: string; // 'YYYY-MM-DD'
  dayLabel: string; // 'Sen (22/09)'
  fullDateLabel: string; // '22 Sep 2026'
  completedTasks: number;
  createdTasks: number;
  actualWorkHours: number; // in hours, rounded to 1 decimal
}

export interface DashboardMetricsResult {
  hasData: boolean;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  waitingReviewTasks: number;
  revisionTasks: number;
  overdueTasks: number;
  completionRate: number;
  statusChartData: {
    labels: string[];
    datasets: {
      data: number[];
      backgroundColor: string[];
      borderColor: string;
      borderWidth: number;
      hoverOffset: number;
    }[];
  };
  sevenDayMetrics: DayMetric[];
  trendChartData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      tension?: number;
      fill?: boolean;
      borderWidth?: number;
      borderDash?: number[];
      pointBackgroundColor?: string;
      pointRadius?: number;
      pointHoverRadius?: number;
      yAxisID?: string;
    }[];
  };
  categoryChartData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderRadius: number;
    }[];
  };
}

/**
 * Generates an array of the last 7 days (including today), anchored around current date or reference date.
 */
export function getLast7Days(referenceDate: Date = new Date()): { dateStr: string; dayLabel: string; fullDateLabel: string }[] {
  const days: { dateStr: string; dayLabel: string; fullDateLabel: string }[] = [];
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - i);
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const dayName = dayNames[d.getDay()];
    const monthName = monthNames[d.getMonth()];
    const dayLabel = `${dayName}, ${day}/${month}`;
    const fullDateLabel = `${day} ${monthName} ${year}`;

    days.push({ dateStr, dayLabel, fullDateLabel });
  }

  return days;
}

/**
 * Calculates work hours between clock_in and clock_out (e.g. '08:30:00' to '17:00:00' -> 8.5 hours).
 */
export function calculateAttendanceHours(clockIn?: string | null, clockOut?: string | null): number {
  if (!clockIn || !clockOut) return 0;
  try {
    const [inH, inM, inS] = clockIn.split(':').map(Number);
    const [outH, outM, outS] = clockOut.split(':').map(Number);
    const inDate = new Date(2000, 0, 1, inH, inM, inS || 0);
    const outDate = new Date(2000, 0, 1, outH, outM, outS || 0);
    const diffMs = Math.max(0, outDate.getTime() - inDate.getTime());
    return Number((diffMs / (1000 * 60 * 60)).toFixed(1));
  } catch {
    return 0;
  }
}

/**
 * Calculates all dashboard metrics dynamically based on tasks and attendances.
 */
export function calculateDashboardMetrics(
  scopedTasks: Task[],
  scopedAttendances: Attendance[],
  referenceDate: Date = new Date()
): DashboardMetricsResult {
  const now = new Date();
  const totalTasks = scopedTasks.length;

  // 1. Status Calculations
  const completedTasks = scopedTasks.filter(t => t.status === 'Completed' || t.status === 'Approved').length;
  const inProgressTasks = scopedTasks.filter(t => t.status === 'In Progress').length;
  const waitingReviewTasks = scopedTasks.filter(t => t.status === 'Submitted' || t.status === 'Review').length;
  const revisionTasks = scopedTasks.filter(t => t.status === 'Revision').length;
  
  const overdueTasks = scopedTasks.filter(t => {
    if (['Completed', 'Approved'].includes(t.status)) return false;
    return new Date(t.deadline) < now;
  }).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 2. Status Doughnut Chart Data
  const statusChartData = {
    labels: ['Completed', 'In Progress', 'Waiting Review', 'Revision', 'Overdue'],
    datasets: [
      {
        data: [completedTasks, inProgressTasks, waitingReviewTasks, revisionTasks, overdueTasks],
        backgroundColor: [
          '#10b981', // Emerald (Completed)
          '#0d9488', // Teal (In Progress)
          '#6366f1', // Indigo (Waiting Review)
          '#f59e0b', // Amber (Revision)
          '#f43f5e', // Rose (Overdue)
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  // 3. 7-Day Trend Metrics
  const last7Days = getLast7Days(referenceDate);
  const sevenDayMetrics: DayMetric[] = last7Days.map(({ dateStr, dayLabel, fullDateLabel }) => {
    // Tasks completed on this date
    const completedOnDate = scopedTasks.filter(t => {
      const isCompleted = t.status === 'Completed' || t.status === 'Approved';
      return isCompleted && (t.task_date === dateStr || (t.updated_at && t.updated_at.startsWith(dateStr)));
    }).length;

    // Tasks created or active on this date
    const createdOnDate = scopedTasks.filter(t => {
      return t.task_date === dateStr || (t.created_at && t.created_at.startsWith(dateStr));
    }).length;

    // Actual work hours logged from attendances on this date
    const attendancesOnDate = scopedAttendances.filter(a => {
      return a.date === dateStr && (a.status === 'present' || a.status === 'late') && a.clock_in && a.clock_out;
    });

    const workHoursOnDate = attendancesOnDate.reduce((acc, att) => {
      return acc + calculateAttendanceHours(att.clock_in, att.clock_out);
    }, 0);

    return {
      dateStr,
      dayLabel,
      fullDateLabel,
      completedTasks: completedOnDate,
      createdTasks: createdOnDate,
      actualWorkHours: Number(workHoursOnDate.toFixed(1)),
    };
  });

  // 4. Trend Chart Data (Dual metric: Tasks Completed + Actual Work Hours)
  const trendChartData = {
    labels: sevenDayMetrics.map(m => m.dayLabel),
    datasets: [
      {
        label: 'Tugas Selesai',
        data: sevenDayMetrics.map(m => m.completedTasks),
        borderColor: '#0d9488', // Teal
        backgroundColor: 'rgba(13, 148, 136, 0.12)',
        tension: 0.4,
        fill: true,
        borderWidth: 2.5,
        pointBackgroundColor: '#0d9488',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Jam Kerja Aktual (Jam)',
        data: sevenDayMetrics.map(m => m.actualWorkHours),
        borderColor: '#6366f1', // Indigo
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointBackgroundColor: '#6366f1',
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  // 5. Category Bar Chart Data
  const categories = ['Development', 'Testing', 'Documentation', 'Meeting', 'Research', 'Design'];
  const categoryCounts = categories.map(c => scopedTasks.filter(t => t.category === c).length);

  const categoryChartData = {
    labels: categories,
    datasets: [
      {
        label: 'Total Tugas',
        data: categoryCounts,
        backgroundColor: '#0d9488',
        borderRadius: 4,
      },
    ],
  };

  const hasData = totalTasks > 0 || scopedAttendances.length > 0;

  return {
    hasData,
    totalTasks,
    completedTasks,
    inProgressTasks,
    waitingReviewTasks,
    revisionTasks,
    overdueTasks,
    completionRate,
    statusChartData,
    sevenDayMetrics,
    trendChartData,
    categoryChartData,
  };
}
