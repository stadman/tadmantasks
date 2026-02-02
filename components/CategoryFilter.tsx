'use client';

import { TaskCategory, getCategoryColor, getCategoryLabel } from '@/lib/tasks';

interface CategoryFilterProps {
  selected: TaskCategory | null;
  onChange: (category: TaskCategory | null) => void;
}

const categories: TaskCategory[] = ['konsensys', 'tadmanhome', 'admin', 'mcfly'];

export default function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-slate-400">Filter by:</span>
      
      <button
        onClick={() => onChange(null)}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
          selected === null
            ? 'bg-blue-600 text-white'
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
        }`}
      >
        All
      </button>

      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onChange(selected === category ? null : category)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            selected === category
              ? getCategoryColor(category) + ' border-2'
              : `bg-slate-700 text-slate-300 hover:bg-slate-600`
          }`}
        >
          {getCategoryLabel(category)}
        </button>
      ))}
    </div>
  );
}
