'use client';

import { useEffect, useState } from 'react';
import { Task, TaskColumn, TaskCategory } from '@/lib/types';
import TaskCard from '@/components/TaskCard';
import CategoryFilter from '@/components/CategoryFilter';
import TaskForm from '@/components/TaskForm';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableTaskCard({
  task,
  onEdit,
  onDelete,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}

function DroppableColumn({
  column,
  onEdit,
  onDelete,
}: {
  column: TaskColumn;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.status,
  });

  return (
    <div
      ref={setNodeRef}
      className={`bg-slate-800/50 backdrop-blur rounded-lg border ${
        isOver ? 'border-purple-500 bg-slate-800/70' : 'border-slate-700'
      } p-4 min-h-96 transition-colors`}
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{column.title}</h2>
        <p className="text-sm text-slate-400">
          {column.tasks.length} task{column.tasks.length !== 1 ? 's' : ''}
        </p>
      </div>

      <SortableContext items={column.tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {column.tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
          ))}

          {column.tasks.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-slate-500">No tasks</p>
              <p className="text-xs text-slate-600 mt-1">Drop tasks here</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function Home() {
  const [columns, setColumns] = useState<TaskColumn[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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

  useEffect(() => {
    fetchTasks();
  }, [selectedCategory]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the task being dragged
    const task = columns.flatMap((col) => col.tasks).find((t) => t.id === activeId);
    if (!task) return;

    // Find which column the task was dropped on
    // overId can be either a column status or another task's id
    let targetStatus: string | undefined;

    // Check if dropped directly on a column
    const targetColumn = columns.find((col) => col.status === overId);
    if (targetColumn) {
      targetStatus = targetColumn.status;
    } else {
      // Dropped on another task - find which column that task is in
      for (const col of columns) {
        if (col.tasks.some((t) => t.id === overId)) {
          targetStatus = col.status;
          break;
        }
      }
    }

    if (!targetStatus || targetStatus === task.status) return;

    // Update task status
    try {
      await fetch(`/api/tasks/${activeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus }),
      });

      // Refresh tasks
      await fetchTasks();
    } catch (error) {
      console.error('Failed to move task:', error);
    }
  };

  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });

      setShowForm(false);
      await fetchTasks();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleUpdateTask = async (taskData: Partial<Task>) => {
    if (!editingTask) return;

    try {
      await fetch(`/api/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });

      setEditingTask(null);
      setShowForm(false);
      await fetchTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      await fetchTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const activeTask = activeId
    ? columns.flatMap((col) => col.tasks).find((t) => t.id === activeId)
    : null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">TadmanTasks</h1>
            <p className="text-slate-400">Project task management</p>
          </div>
          <button
            onClick={() => {
              setEditingTask(null);
              setShowForm(true);
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Task
          </button>
        </div>

        {/* Filter */}
        <div className="mb-8">
          <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />
        </div>

        {/* Kanban Board */}
        {loading ? (
          <div className="text-center text-slate-400">Loading tasks...</div>
        ) : (
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {columns.map((column) => (
                <DroppableColumn
                  key={column.status}
                  column={column}
                  onEdit={handleEdit}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>

            <DragOverlay>
              {activeTask ? (
                <div className="cursor-grabbing">
                  <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Task Form Modal */}
      {showForm && (
        <TaskForm
          task={editingTask || undefined}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onCancel={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
        />
      )}
    </main>
  );
}
