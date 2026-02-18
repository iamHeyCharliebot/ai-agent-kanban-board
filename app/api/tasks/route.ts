import { NextRequest, NextResponse } from 'next/server';
import { getTasks, createTask } from '@/lib/storage';
import { createGoogleTask } from '@/lib/google-tasks';

export async function GET() {
  try {
    const tasks = getTasks();
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error getting tasks:', error);
    return NextResponse.json({ error: 'Failed to get tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.title || !body.description || !body.priority || !body.status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const task = createTask({
      title: body.title,
      description: body.description,
      priority: body.priority,
      status: body.status,
      tags: body.tags || [],
      agent: body.agent,
      blockReason: body.blockReason
    });
    
    // If task is in Review, create Google Task
    if (task.status === 'Review') {
      const googleTaskId = await createGoogleTask(
        `Review: ${task.title}`,
        `${task.description}\n\nKanban Board Task ID: ${task.id}`
      );
      
      if (googleTaskId) {
        // Update task with Google Task ID (need to import updateTask)
        const { updateTask } = await import('@/lib/storage');
        updateTask(task.id, { googleTaskId });
        task.googleTaskId = googleTaskId;
      }
    }
    
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
