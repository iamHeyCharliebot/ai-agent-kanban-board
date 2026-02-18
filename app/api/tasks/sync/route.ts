import { NextResponse } from 'next/server';
import { getTasks, updateTask } from '@/lib/storage';
import { getGoogleTaskStatus } from '@/lib/google-tasks';

// Sync Google Tasks completion status back to Kanban board
export async function POST() {
  try {
    const tasks = getTasks();
    const reviewTasks = tasks.filter(t => t.status === 'Review' && t.googleTaskId);
    
    const updates = [];
    
    for (const task of reviewTasks) {
      const status = await getGoogleTaskStatus(task.googleTaskId!);
      
      // If Google Task is completed, move Kanban task to Done
      if (status === 'completed') {
        const updated = updateTask(task.id, {
          status: 'Done',
          googleTaskId: undefined // Clear the Google Task ID
        });
        
        if (updated) {
          updates.push({
            taskId: task.id,
            title: task.title,
            status: 'completed'
          });
        }
      }
    }
    
    return NextResponse.json({
      synced: updates.length,
      updates
    });
  } catch (error) {
    console.error('Error syncing tasks:', error);
    return NextResponse.json({ error: 'Failed to sync tasks' }, { status: 500 });
  }
}
