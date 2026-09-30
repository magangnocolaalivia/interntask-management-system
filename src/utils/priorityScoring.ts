import { Task, PriorityScoreExplanation } from '../types';

/**
 * Rule-based task priority scoring algorithm
 * 
 * Rules:
 * Priority:
 * - Urgent: 40
 * - High: 30
 * - Medium: 20
 * - Low: 10
 * 
 * Deadline:
 * - Overdue (<= 0 days): 50
 * - <= 1 day: 40
 * - <= 3 days: 25
 * - <= 7 days: 10
 * - > 7 days: 5
 * 
 * Status:
 * - Revision: +20
 * - In Progress: +10
 * - Draft: +5
 * - Other (Approved/Completed): 0
 */
export function calculateTaskPriorityScore(task: Task, referenceDate: Date = new Date()): PriorityScoreExplanation {
  let priorityScore = 0;
  let deadlineScore = 0;
  let statusScore = 0;
  const reasons: string[] = [];

  // 1. Priority scoring
  switch (task.priority) {
    case 'Urgent':
      priorityScore = 40;
      reasons.push('Prioritas Urgent (+40)');
      break;
    case 'High':
      priorityScore = 30;
      reasons.push('Prioritas High (+30)');
      break;
    case 'Medium':
      priorityScore = 20;
      reasons.push('Prioritas Medium (+20)');
      break;
    case 'Low':
      priorityScore = 10;
      reasons.push('Prioritas Low (+10)');
      break;
  }

  // 2. Deadline scoring
  const deadlineDate = new Date(task.deadline);
  const diffTime = deadlineDate.getTime() - referenceDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    deadlineScore = 50;
    reasons.push(`Deadline terlewati (${Math.abs(diffDays)} hari lalu) (+50)`);
  } else if (diffDays <= 1) {
    deadlineScore = 40;
    reasons.push('Deadline sangat dekat (≤ 1 hari) (+40)');
  } else if (diffDays <= 3) {
    deadlineScore = 25;
    reasons.push('Deadline mendekat (≤ 3 hari) (+25)');
  } else if (diffDays <= 7) {
    deadlineScore = 10;
    reasons.push('Deadline minggu ini (≤ 7 hari) (+10)');
  } else {
    deadlineScore = 5;
    reasons.push('Deadline > 7 hari (+5)');
  }

  // 3. Status scoring
  switch (task.status) {
    case 'Revision':
      statusScore = 20;
      reasons.push('Status Perlu Revisi dari Mentor (+20)');
      break;
    case 'In Progress':
      statusScore = 10;
      reasons.push('Status Sedang Dikerjakan (+10)');
      break;
    case 'Draft':
      statusScore = 5;
      reasons.push('Status Masih Draft (+5)');
      break;
    default:
      statusScore = 0;
      break;
  }

  // Completed or approved tasks should have lower priority score
  if (task.status === 'Completed' || task.status === 'Approved') {
    priorityScore = 0;
    deadlineScore = 0;
    statusScore = 0;
    reasons.length = 0;
    reasons.push('Task sudah selesai / disetujui (Skor: 0)');
  }

  const totalScore = priorityScore + deadlineScore + statusScore;

  return {
    task,
    priorityScore,
    deadlineScore,
    statusScore,
    totalScore,
    reasons,
  };
}

export function getRecommendedTasks(tasks: Task[], limit: number = 5): PriorityScoreExplanation[] {
  // Only evaluate active tasks (not yet completed or approved or rejected)
  const activeTasks = tasks.filter(t => !['Completed', 'Approved', 'Rejected'].includes(t.status));
  
  const scored = activeTasks.map(t => calculateTaskPriorityScore(t));
  
  // Sort descending by total score
  scored.sort((a, b) => b.totalScore - a.totalScore);
  
  return scored.slice(0, limit);
}
