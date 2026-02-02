'use client';

import { Task, getCategoryColor, getCategoryLabel } from '@/lib/tasks';

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  return (
    <div className="bg-slate-700/50 rounded-lg border border-slate-600 p-3 hover:border-slate-500 transition-colors cursor-pointer group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-medium text-white text-sm group-hover:text-blue-300 transition-colors">
          {task.title}
        </h3>
      </div>

      {task.description && (
        <p className="text-xs text-slate-400 mb-2 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(task.category)}`}>
          {getCategoryLabel(task.category)}
        </span>

        {task.blocker && (
          <span className="text-xs px-2 py-1 rounded-full bg-red-100/20 text-red-400 border border-red-500/30">
            Blocked
          </span>
        )}
      </div>

      {task.blocker && (
        <p className="text-xs text-red-400 mt-2 leading-tight">
          📌 {task.blocker}
        </p>
      )}
    </div>
  );
}
