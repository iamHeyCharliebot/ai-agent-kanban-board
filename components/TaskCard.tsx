'use client';

import { Task } from '@/types/task';
import { useState } from 'react';

interface TaskCardProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
}

const priorityColors = {
  Low: 'border-l-4 border-l-green-500',
  Med: 'border-l-4 border-l-yellow-500',
  High: 'border-l-4 border-l-red-500'
};

const statusOptions: Task['status'][] = [
  'Backlog',
  'Planned',
  'In Progress',
  'Blocked',
  'Review',
  'Done'
];

export default function TaskCard({ task, onUpdate }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);

  const handleSave = () => {
    onUpdate(task.id, editedTask);
    setIsEditing(false);
  };

  const handleStatusChange = (newStatus: Task['status']) => {
    onUpdate(task.id, { status: newStatus });
  };

  if (isEditing) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
        <input
          type="text"
          value={editedTask.title}
          onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
          className="w-full font-medium text-gray-900 mb-2 border border-gray-300 rounded px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
          placeholder="Task title"
        />
        <textarea
          value={editedTask.description}
          onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
          className="w-full text-xs text-gray-600 mb-2 border border-gray-300 rounded px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          rows={3}
          placeholder="Description"
        />
        <select
          value={editedTask.priority}
          onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as Task['priority'] })}
          className="w-full text-xs mb-2 border border-gray-300 rounded px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          <option value="Low">Low Priority</option>
          <option value="Med">Medium Priority</option>
          <option value="High">High Priority</option>
        </select>
        <input
          type="text"
          value={editedTask.tags.join(', ')}
          onChange={(e) => setEditedTask({ ...editedTask, tags: e.target.value.split(',').map(t => t.trim()) })}
          placeholder="Tags (comma-separated)"
          className="w-full text-xs mb-2 border border-gray-300 rounded px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
        {editedTask.status === 'Blocked' && (
          <textarea
            value={editedTask.blockReason || ''}
            onChange={(e) => setEditedTask({ ...editedTask, blockReason: e.target.value })}
            placeholder="Block reason..."
            className="w-full text-xs mb-2 border border-gray-300 rounded px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            rows={2}
          />
        )}
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleSave}
            className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-all"
          >
            Save
          </button>
          <button
            onClick={() => {
              setEditedTask(task);
              setIsEditing(false);
            }}
            className="flex-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-medium transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer ${priorityColors[task.priority]}`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <h3 className="font-medium text-gray-900 text-sm leading-snug mb-1.5">
        {task.title}
      </h3>
      
      <p className="text-xs text-gray-500 mb-2 line-clamp-2 leading-relaxed">
        {task.description}
      </p>
      
      <div className="flex items-center gap-1.5 flex-wrap">
        {task.agent && (
          <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
            {task.agent}
          </span>
        )}
        
        {task.tags.slice(0, 2).map((tag, i) => (
          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
            {tag}
          </span>
        ))}
        
        {task.tags.length > 2 && (
          <span className="text-xs text-gray-400">
            +{task.tags.length - 2}
          </span>
        )}
        
        {task.googleTaskId && (
          <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-medium">
            📋 Google Tasks
          </span>
        )}
      </div>

      {task.status === 'Blocked' && task.blockReason && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded mt-2 border border-red-100">
          <span className="font-semibold">Blocked:</span> {task.blockReason}
        </div>
      )}

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
          <div className="text-xs text-gray-500 mb-2 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">Priority:</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                task.priority === 'High' ? 'bg-red-100 text-red-700' :
                task.priority === 'Med' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {task.priority}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">Created:</span>
              <span>{new Date(task.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">Updated:</span>
              <span>{new Date(task.updatedAt).toLocaleString()}</span>
            </div>
          </div>
          
          <div className="mb-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Move to:</label>
            <select
              value={task.status}
              onChange={(e) => {
                e.stopPropagation();
                handleStatusChange(e.target.value as Task['status']);
              }}
              className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              onClick={(e) => e.stopPropagation()}
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="w-full px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded text-xs font-medium transition-all border border-gray-200"
          >
            Edit Task
          </button>
        </div>
      )}
    </div>
  );
}
