import { NextRequest, NextResponse } from 'next/server';
import { getTask, updateTask } from '@/lib/storage';
import { createGoogleTask, completeGoogleTask, deleteGoogleTask } from '@/lib/google-tasks';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = getTask(id);
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    
    return NextResponse.json(task);
  } catch (error) {
    console.error('Error getting task:', error);
    return NextResponse.json({ error: 'Failed to get task' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const currentTask = getTask(id);
    
    if (!currentTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    
    // Handle Google Tasks integration
    const oldStatus = currentTask.status;
    const newStatus = body.status;
    
    // Moving TO Review → Create Google Task
    if (newStatus === 'Review' && oldStatus !== 'Review' && !currentTask.googleTaskId) {
      const googleTaskId = await createGoogleTask(
        `Review: ${currentTask.title}`,
        `${currentTask.description}\n\nKanban Board Task ID: ${id}`
      );
      
      if (googleTaskId) {
        body.googleTaskId = googleTaskId;
      }
    }
    
    // Moving FROM Review → Complete or delete Google Task
    if (oldStatus === 'Review' && newStatus !== 'Review' && currentTask.googleTaskId) {
      if (newStatus === 'Done') {
        await completeGoogleTask(currentTask.googleTaskId);
      } else {
        await deleteGoogleTask(currentTask.googleTaskId);
      }
      body.googleTaskId = undefined;
    }
    
    const updatedTask = updateTask(id, body);
    
    if (!updatedTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}
