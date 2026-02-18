import { Board, Task } from '@/types/task';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'board.json');

function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

export function loadBoard(): Board {
  ensureDataDir();
  
  if (!fs.existsSync(DATA_FILE)) {
    const initialBoard: Board = {
      tasks: [],
      lastUpdated: new Date().toISOString()
    };
    saveBoard(initialBoard);
    return initialBoard;
  }
  
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(data);
}

export function saveBoard(board: Board) {
  ensureDataDir();
  board.lastUpdated = new Date().toISOString();
  fs.writeFileSync(DATA_FILE, JSON.stringify(board, null, 2));
}

export function getTasks(): Task[] {
  const board = loadBoard();
  return board.tasks;
}

export function getTask(id: string): Task | undefined {
  const board = loadBoard();
  return board.tasks.find(t => t.id === id);
}

export function createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
  const board = loadBoard();
  
  const newTask: Task = {
    ...task,
    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  board.tasks.push(newTask);
  saveBoard(board);
  
  return newTask;
}

export function updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Task | null {
  const board = loadBoard();
  const taskIndex = board.tasks.findIndex(t => t.id === id);
  
  if (taskIndex === -1) {
    return null;
  }
  
  board.tasks[taskIndex] = {
    ...board.tasks[taskIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  saveBoard(board);
  return board.tasks[taskIndex];
}

export function getTasksByStatus(status: Task['status']): Task[] {
  const board = loadBoard();
  return board.tasks.filter(t => t.status === status);
}
