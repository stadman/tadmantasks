'use client';

import { useEffect, useState } from 'react';
import { Task, TaskColumn, TaskCategory, getCategoryColor, getCategoryLabel } from '@/lib/tasks';
import TaskCard from '@/components/TaskCard';
import CategoryFilter from '@/components/CategoryFilter';

export default function Home() {
  const [columns, setColumns] = useState<TaskColumn[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch tasks from API
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks');
        const data = await response.json();
        
        // Group by status
        const grouped: Record<string, Task[]> = {
          'in-progress': [],
          'queued': [],
          'done': [],
          'backlog': [],
        };

        for (const task of data) {
          if (selectedCategory && task.category !== selectedCategory) {
            continue;
          }
          grouped[task.status]?.push(task);
        }

        const cols: TaskColumn[] = [
          { status: 'in-progress', title: 'In Progress', tasks: grouped['in-progress'] },
          { status: 'queued', title: 'Queued', tasks: grouped['queued'] },
          { status: 'done', title: 'Done', tasks: grouped['done'] },
          { status: 'backlog', title: 'Backlog', tasks: grouped['backlog'] },
        ];

        setColumns(cols);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [selectedCategory]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">TadmanTasks</h1>
          <p className="text-slate-400">Project task management</p>
        </div>

        {/* Filter */}
        <div className="mb-8">
          <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />
        </div>

        {/* Kanban Board */}
        {loading ? (
          <div className="text-center text-slate-400">Loading tasks...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {columns.map((column) => (
              <div
                key={column.status}
                className="bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700 p-4 min-h-96"
              >
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-white">
                    {column.title}
                  </h2>
                  <p className="text-sm text-slate-400">
                    {column.tasks.length} task{column.tasks.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="space-y-3">
                  {column.tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                  
                  {column.tasks.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-sm text-slate-500">No tasks</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
