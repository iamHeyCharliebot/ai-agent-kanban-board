export type Priority = 'Low' | 'Med' | 'High';
export type Status = 'Backlog' | 'Planned' | 'In Progress' | 'Blocked' | 'Review' | 'Done';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  agent?: string;
  blockReason?: string;
  googleTaskId?: string; // Synced to Google Tasks when in Review
}

export interface Board {
  tasks: Task[];
  lastUpdated: string;
}
