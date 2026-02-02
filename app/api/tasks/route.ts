import { parseTasks } from '@/lib/tasks';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const tasks = await parseTasks();
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}
