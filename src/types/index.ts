export type UserRole = 'intern' | 'mentor' | 'director';

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  profile_photo_path?: string | null;
  institution?: string;
  study_program?: string;
  division?: string;
  internship_start?: string;
  internship_end?: string;
  mentor_id?: number | null;
  avatar?: string;
  phone?: string;
}

export type TaskCategory = 
  | 'Development'
  | 'Testing'
  | 'Documentation'
  | 'Meeting'
  | 'Research'
  | 'Design'
  | 'Other';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type TaskStatus = 
  | 'Draft'
  | 'In Progress'
  | 'Submitted'
  | 'Review'
  | 'Revision'
  | 'Approved'
  | 'Completed'
  | 'Rejected';

export interface Attachment {
  id: number;
  task_id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size?: string;
  created_at: string;
}

export interface Feedback {
  id: number;
  task_id: number;
  mentor_id: number;
  mentor_name?: string;
  message: string;
  action: 'approved' | 'revision' | 'rejected';
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'submission' | 'approval' | 'revision' | 'rejection' | 'feedback' | 'deadline' | 'system';
  is_read: boolean;
  task_id?: number;
  created_at: string;
}

export interface TaskActivityLog {
  id: number;
  task_id: number;
  user_id: number;
  user_name?: string;
  action: string;
  description: string;
  created_at: string;
}

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string;
  task_date: string;
  deadline: string;
  category: TaskCategory;
  priority: TaskPriority;
  estimated_duration: number; // in hours
  progress: number; // 0 - 100
  status: TaskStatus;
  result?: string;
  obstacles?: string;
  repository_link?: string;
  deployment_link?: string;
  figma_link?: string;
  assigned_by?: number | null;
  assigner_name?: string;
  is_assigned?: boolean;
  mentor_attachment_path?: string | null;
  mentor_reference_url?: string | null;
  created_at: string;
  updated_at: string;
  
  // Relations / Computed
  user?: User;
  mentor?: User;
  attachments?: Attachment[];
  feedback?: Feedback[];
  activity_logs?: TaskActivityLog[];
  scoreBreakdown?: {
    priorityScore: number;
    deadlineScore: number;
    statusScore: number;
    totalScore: number;
    reasons: string[];
  };
}

export interface PriorityScoreExplanation {
  task: Task;
  priorityScore: number;
  deadlineScore: number;
  statusScore: number;
  totalScore: number;
  reasons: string[];
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  
  // Relations (optional/computed)
  sender?: User;
  receiver?: User;
}

export interface ChatContact {
  user: User;
  lastMessage?: Message;
  unreadCount: number;
  isOnline: boolean;
}

export interface CompanySetting {
  id: number;
  company_name: string;
  company_address: string;
  company_logo_path?: string | null;
  late_tolerance_time?: string; // Format: HH:mm (e.g. '09:00')
  created_at?: string;
  updated_at?: string;
}

export type AttendanceStatus = 'present' | 'late' | 'permit' | 'sick' | 'absent';

export interface Attendance {
  id: number;
  user_id: number;
  date: string; // Format: YYYY-MM-DD
  clock_in: string | null; // Format: HH:mm:ss
  clock_out: string | null; // Format: HH:mm:ss
  status: AttendanceStatus;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;

  // Relations (optional/computed)
  user?: User;
}

