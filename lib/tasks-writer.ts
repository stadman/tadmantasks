import * as fs from 'fs';
import * as path from 'path';
import { Task } from './types';

const TASKS_PATH = path.join(
  process.env.HOME || '/Users/stevemini',
  '.openclaw/workspace/TASKS.md'
);

export async function writeTasks(tasks: Task[]): Promise<void> {
  // Group tasks by status
  const grouped: Record<string, Task[]> = {
    'in-progress': [],
    'queued': [],
    'done': [],
    'backlog': [],
  };

  for (const task of tasks) {
    grouped[task.status]?.push(task);
  }

  // Build markdown content
  let content = `# TASKS.md — Kanban Board

> **Read this every session.** This is the source of truth for active work.

---

## 🔴 In Progress

`;

  // Write in-progress tasks
  for (const task of grouped['in-progress']) {
    content += formatTask(task);
  }

  content += `
---

## 🟡 Queued

`;

  // Write queued tasks
  for (const task of grouped['queued']) {
    content += formatTask(task);
  }

  content += `
---

## ✅ Done (Recent)

`;

  // Write done tasks
  for (const task of grouped['done']) {
    content += formatTask(task);
  }

  content += `
---

## 📋 Backlog (Ideas)

`;

  // Write backlog tasks
  for (const task of grouped['backlog']) {
    content += formatTask(task);
  }

  content += `
---

*Last updated: ${new Date().toLocaleString('en-US', { 
  timeZone: 'America/Phoenix',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  timeZoneName: 'short'
})}*
`;

  // Write to file
  fs.writeFileSync(TASKS_PATH, content, 'utf-8');
}

function formatTask(task: Task): string {
  let output = `### ${task.title}\n`;
  
  if (task.description) {
    output += task.description.split('\n').map(line => `${line}\n`).join('');
  }
  
  if (task.blocker) {
    output += `- **Blocker:** ${task.blocker}\n`;
  }
  
  if (task.project) {
    output += `- **Project:** ${task.project}\n`;
  }
  
  output += '\n';
  
  return output;
}

export async function createTask(task: Omit<Task, 'id'>): Promise<Task> {
  const tasks = await import('./tasks').then(m => m.parseTasks());
  
  // Generate ID from title
  const id = task.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  const newTask: Task = {
    id,
    ...task,
  };
  
  await writeTasks([...tasks, newTask]);
  
  return newTask;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const tasks = await import('./tasks').then(m => m.parseTasks());
  
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) {
    throw new Error(`Task ${id} not found`);
  }
  
  const updatedTask = {
    ...tasks[index],
    ...updates,
  };
  
  tasks[index] = updatedTask;
  
  await writeTasks(tasks);
  
  return updatedTask;
}

export async function deleteTask(id: string): Promise<void> {
  const tasks = await import('./tasks').then(m => m.parseTasks());
  const filtered = tasks.filter(t => t.id !== id);
  await writeTasks(filtered);
}
