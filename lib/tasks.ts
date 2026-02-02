import * as fs from 'fs';
import * as path from 'path';
import { Task } from './types';

// Parse TASKS.md from workspace - SERVER SIDE ONLY
export async function parseTasks(): Promise<Task[]> {
  try {
    const tasksPath = path.join(
      process.env.HOME || '/Users/stevemini',
      '.openclaw/workspace/TASKS.md'
    );

    if (!fs.existsSync(tasksPath)) {
      return getDefaultTasks();
    }

    const content = fs.readFileSync(tasksPath, 'utf-8');
    const tasks: Task[] = [];

    // Parse markdown sections
    const sections = content.split('## 🔴 In Progress')[1]?.split('## 🟡 Queued')[0] || '';
    const queuedSections = content.split('## 🟡 Queued')[1]?.split('## ✅ Done')[0] || '';
    const doneSections = content.split('## ✅ Done')[1]?.split('## 📋 Backlog')[0] || '';
    const backlogSections = content.split('## 📋 Backlog')[1] || '';

    tasks.push(...parseSection(sections, 'in-progress'));
    tasks.push(...parseSection(queuedSections, 'queued'));
    tasks.push(...parseSection(doneSections, 'done'));
    tasks.push(...parseSection(backlogSections, 'backlog'));

    return tasks;
  } catch (error) {
    console.error('Error parsing TASKS.md:', error);
    return getDefaultTasks();
  }
}

function parseSection(text: string, status: 'in-progress' | 'queued' | 'done' | 'backlog'): Task[] {
  const tasks: Task[] = [];
  const taskMatches = text.matchAll(/###\s+([^\n]+)\n([\s\S]*?)(?=###|$)/g);

  for (const match of taskMatches) {
    const title = match[1].trim();
    const content = match[2];
    
    // Categorize based on content
    let category: 'konsensys' | 'tadmanhome' | 'admin' | 'mcfly' = 'admin';
    if (content.toLowerCase().includes('sonos') || content.toLowerCase().includes('tadmanhome')) {
      category = 'tadmanhome';
    } else if (content.toLowerCase().includes('konsensys')) {
      category = 'konsensys';
    } else if (content.toLowerCase().includes('mcfly') || content.toLowerCase().includes('heartbeat') || content.toLowerCase().includes('compaction')) {
      category = 'mcfly';
    }

    const blocker = content.match(/Blocker:\s*([^\n]+)/)?.[1]?.trim();

    tasks.push({
      id: title.toLowerCase().replace(/\s+/g, '-'),
      title,
      description: content.split('\n').slice(0, 3).join('\n').trim(),
      status,
      category,
      blocker,
      project: content.match(/Project:\s*([^\n]+)/)?.[1]?.trim(),
    });
  }

  return tasks;
}

function getDefaultTasks(): Task[] {
  return [
    {
      id: 'bbc-proxy',
      title: 'BBC Sounds Proxy for Sonos',
      description: 'Blocked on NordVPN setup. Need proxy server.',
      status: 'in-progress',
      category: 'tadmanhome',
      blocker: 'NordVPN not configured',
      project: 'TadmanHome',
    },
    {
      id: 'nest-integration',
      title: 'Nest Integration',
      description: 'Connect Nest thermostat to TadmanHome',
      status: 'queued',
      category: 'tadmanhome',
    },
    {
      id: 'mcfly-improvements',
      title: 'McFly Improvements',
      description: 'Phase 3: Behavioral & Tooling updates',
      status: 'done',
      category: 'mcfly',
    },
  ];
}
