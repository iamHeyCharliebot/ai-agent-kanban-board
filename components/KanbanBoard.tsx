'use client';

import { Task } from '@/types/task';
import { useState, useEffect } from 'react';
import TaskCard from './TaskCard';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const columns: { status: Task['status']; color: string }[] = [
  { status: 'Backlog', color: 'border-gray-400' },
  { status: 'Planned', color: 'border-blue-500' },
  { status: 'In Progress', color: 'border-yellow-500' },
  { status: 'Blocked', color: 'border-red-500' },
  { status: 'Review', color: 'border-purple-500' },
  { status: 'Done', color: 'border-green-500' }
];

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'Med' as Task['priority'],
    status: 'Backlog' as Task['status'],
    tags: '',
    agent: ''
  });

  const loadTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const syncGoogleTasks = async () => {
    try {
      await fetch('/api/tasks/sync', { method: 'POST' });
      await loadTasks(); // Reload after sync
    } catch (error) {
      console.error('Error syncing Google Tasks:', error);
    }
  };

  useEffect(() => {
    loadTasks();
    const interval = setInterval(loadTasks, 10000); // Poll every 10s
    const syncInterval = setInterval(syncGoogleTasks, 30000); // Sync Google Tasks every 30s
    return () => {
      clearInterval(interval);
      clearInterval(syncInterval);
    };
  }, []);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const newStatus = destination.droppableId as Task['status'];
    await handleUpdateTask(draggableId, { status: newStatus });
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        await loadTasks();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.description) {
      alert('Title and description are required');
      return;
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTask,
          tags: newTask.tags.split(',').map(t => t.trim()).filter(Boolean)
        })
      });

      if (response.ok) {
        setNewTask({
          title: '',
          description: '',
          priority: 'Med',
          status: 'Backlog',
          tags: '',
          agent: ''
        });
        setShowNewTask(false);
        await loadTasks();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const getTasksForColumn = (status: Task['status']) => {
    return tasks.filter(t => t.status === status);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-xl text-gray-600 font-medium">Loading board...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1800px] mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
            <p className="text-gray-500 text-sm mt-1">Single source of truth for all work</p>
          </div>
          <button
            onClick={() => setShowNewTask(!showNewTask)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm"
          >
            <span className="text-lg">+</span> New Task
          </button>
        </div>

        {showNewTask && (
          <div className="mb-6 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-bold mb-4 text-gray-900">Create New Task</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
              <textarea
                placeholder="Description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                rows={3}
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                >
                  <option value="Low">Low Priority</option>
                  <option value="Med">Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>
                <select
                  value={newTask.status}
                  onChange={(e) => setNewTask({ ...newTask, status: e.target.value as Task['status'] })}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                >
                  {columns.map(col => (
                    <option key={col.status} value={col.status}>{col.status}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Tags (comma-separated)"
                  value={newTask.tags}
                  onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                />
                <input
                  type="text"
                  placeholder="Agent (optional)"
                  value={newTask.agent}
                  onChange={(e) => setNewTask({ ...newTask, agent: e.target.value })}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCreateTask}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all text-sm"
              >
                Create Task
              </button>
              <button
                onClick={() => setShowNewTask(false)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {columns.map(({ status, color }) => {
              const columnTasks = getTasksForColumn(status);
              return (
                <div key={status} className="flex-shrink-0 w-72">
                  <div className={`bg-white rounded-lg border-t-4 ${color} shadow-sm overflow-hidden`}>
                    <div className="px-3 py-2.5 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-gray-800 text-sm">
                          {status}
                        </h2>
                        <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                          {columnTasks.length}
                        </span>
                      </div>
                    </div>
                    
                    <Droppable droppableId={status}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`p-2.5 min-h-[400px] transition-colors ${
                            snapshot.isDraggingOver ? 'bg-gray-50' : 'bg-white'
                          }`}
                        >
                          {columnTasks.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 text-xs">
                              Drop tasks here
                            </div>
                          ) : (
                            <div className="space-y-2.5">
                              {columnTasks.map((task, index) => (
                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={snapshot.isDragging ? 'opacity-70' : ''}
                                    >
                                      <TaskCard task={task} onUpdate={handleUpdateTask} />
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                            </div>
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
