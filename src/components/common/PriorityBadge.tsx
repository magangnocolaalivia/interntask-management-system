import React from 'react';
import { TaskPriority } from '../../types';
import { Flame, ArrowUp, ArrowRight, ArrowDown } from 'lucide-react';

interface PriorityBadgeProps {
  priority: TaskPriority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const getConfig = () => {
    switch (priority) {
      case 'Urgent':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: Flame,
          label: 'Urgent',
        };
      case 'High':
        return {
          bg: 'bg-orange-50 text-orange-700 border-orange-200',
          icon: ArrowUp,
          label: 'High',
        };
      case 'Medium':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: ArrowRight,
          label: 'Medium',
        };
      case 'Low':
        return {
          bg: 'bg-slate-100 text-slate-600 border-slate-200',
          icon: ArrowDown,
          label: 'Low',
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;
  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1 font-medium';

  return (
    <span className={`inline-flex items-center gap-1 rounded-md border ${config.bg} ${sizeClass}`}>
      <Icon className="w-3 h-3 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
};
