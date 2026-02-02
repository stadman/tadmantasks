'use client';

import { Task, getCategoryColor, getCategoryLabel } from '@/lib/types';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  return (
    <div className="bg-slate-700/50 rounded-lg border border-slate-600 p-3 hover:border-slate-500 transition-colors cursor-grab active:cursor-grabbing group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-medium text-white text-sm group-hover:text-blue-300 transition-colors flex-1">
          {task.title}
        </h3>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="text-slate-400 hover:text-blue-400 p-1"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Delete "${task.title}"?`)) {
                onDelete(task.id);
              }
            }}
            className="text-slate-400 hover:text-red-400 p-1"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
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
