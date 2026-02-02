export type TaskStatus = 'in-progress' | 'queued' | 'done' | 'backlog';
export type TaskCategory = 'konsensys' | 'tadmanhome' | 'admin' | 'mcfly';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  category: TaskCategory;
  blocker?: string;
  started?: string;
  project?: string;
}

export interface TaskColumn {
  status: TaskStatus;
  title: string;
  tasks: Task[];
}

export function getCategoryColor(category: TaskCategory): string {
  const colors: Record<TaskCategory, string> = {
    konsensys: 'bg-blue-100 text-blue-800',
    tadmanhome: 'bg-purple-100 text-purple-800',
    admin: 'bg-gray-100 text-gray-800',
    mcfly: 'bg-green-100 text-green-800',
  };
  return colors[category];
}

export function getCategoryLabel(category: TaskCategory): string {
  const labels: Record<TaskCategory, string> = {
    konsensys: 'Konsensys',
    tadmanhome: 'TadmanHome',
    admin: 'Admin',
    mcfly: 'McFly',
  };
  return labels[category];
}
