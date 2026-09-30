import React from 'react';
import { TaskStatus } from '../../types';
import { 
  Clock, PlayCircle, Send, CheckCircle2, 
  AlertTriangle, CheckCheck, XCircle, FileEdit 
} from 'lucide-react';

interface StatusBadgeProps {
  status: TaskStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md',
  showIcon = true 
}) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'Draft':
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: FileEdit,
          label: 'Draft',
        };
      case 'In Progress':
        return {
          bg: 'bg-slate-100 text-slate-800 border-slate-200',
          icon: PlayCircle,
          label: 'In Progress',
        };
      case 'Submitted':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: Send,
          label: 'Waiting Review',
        };
      case 'Review':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: Clock,
          label: 'In Review',
        };
      case 'Revision':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: AlertTriangle,
          label: 'Perlu Revisi',
        };
      case 'Approved':
      case 'Completed':
        return {
          bg: 'bg-teal-50 text-teal-700 border-teal-200',
          icon: CheckCircle2,
          label: status === 'Approved' ? 'Disetujui' : 'Completed',
        };
      case 'Rejected':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: XCircle,
          label: 'Ditolak',
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: Clock,
          label: status,
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1',
    md: 'text-xs px-3 py-1 gap-1.5 font-medium',
    lg: 'text-xs px-3.5 py-1.5 gap-2 font-medium',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span className={`inline-flex items-center rounded-full border ${config.bg} ${sizeClasses[size]}`}>
      {showIcon && <Icon className={`${iconSizes[size]} shrink-0`} />}
      <span>{config.label}</span>
    </span>
  );
};
