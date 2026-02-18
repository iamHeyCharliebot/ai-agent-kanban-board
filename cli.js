#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data', 'board.json');

function ensureDataDir() {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function loadBoard() {
  ensureDataDir();
  
  if (!fs.existsSync(DATA_FILE)) {
    const initialBoard = {
      tasks: [],
      lastUpdated: new Date().toISOString()
    };
    saveBoard(initialBoard);
    return initialBoard;
  }
  
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(data);
}

function saveBoard(board) {
  ensureDataDir();
  board.lastUpdated = new Date().toISOString();
  fs.writeFileSync(DATA_FILE, JSON.stringify(board, null, 2));
}

function listTasks(statusFilter = null) {
  const board = loadBoard();
  let tasks = board.tasks;
  
  if (statusFilter) {
    tasks = tasks.filter(t => t.status === statusFilter);
  }
  
  console.log(`\n📋 Total Tasks: ${tasks.length}\n`);
  
  const statuses = ['Backlog', 'Planned', 'In Progress', 'Blocked', 'Review', 'Done'];
  
  statuses.forEach(status => {
    const statusTasks = tasks.filter(t => t.status === status);
    if (statusTasks.length > 0) {
      console.log(`\n${status} (${statusTasks.length}):`);
      statusTasks.forEach(task => {
        const priority = task.priority === 'High' ? '🔴' : task.priority === 'Med' ? '🟡' : '🟢';
        const agent = task.agent ? `[${task.agent}]` : '';
        const google = task.googleTaskId ? '📋' : '';
        console.log(`  ${priority}${google} ${task.id.substring(0, 12)} | ${task.title} ${agent}`);
      });
    }
  });
  
  console.log('');
}

function createTask(title, description, priority, status, tags = '', agent = '') {
  if (!title || !description || !priority || !status) {
    console.error('❌ Missing required fields: title, description, priority, status');
    process.exit(1);
  }
  
  const board = loadBoard();
  
  const task = {
    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title,
    description,
    priority,
    status,
    tags: tags ? tags.split(',').map(t => t.trim()) : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    agent: agent || undefined
  };
  
  board.tasks.push(task);
  saveBoard(board);
  
  console.log(`✅ Task created: ${task.id}`);
  console.log(JSON.stringify(task, null, 2));
}

function updateTask(id, field, value) {
  const board = loadBoard();
  const task = board.tasks.find(t => t.id.startsWith(id));
  
  if (!task) {
    console.error(`❌ Task not found: ${id}`);
    process.exit(1);
  }
  
  if (field === 'tags') {
    task.tags = value.split(',').map(t => t.trim());
  } else {
    task[field] = value;
  }
  
  task.updatedAt = new Date().toISOString();
  saveBoard(board);
  
  console.log(`✅ Task updated: ${task.id}`);
  console.log(JSON.stringify(task, null, 2));
}

function moveTask(id, newStatus) {
  updateTask(id, 'status', newStatus);
}

function showTask(id) {
  const board = loadBoard();
  const task = board.tasks.find(t => t.id.startsWith(id));
  
  if (!task) {
    console.error(`❌ Task not found: ${id}`);
    process.exit(1);
  }
  
  console.log('\n📋 Task Details:\n');
  console.log(JSON.stringify(task, null, 2));
  console.log('');
}

const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'list':
    listTasks(args[1]);
    break;
  
  case 'create':
    createTask(args[1], args[2], args[3], args[4], args[5], args[6]);
    break;
  
  case 'update':
    updateTask(args[1], args[2], args[3]);
    break;
  
  case 'move':
    moveTask(args[1], args[2]);
    break;
  
  case 'show':
    showTask(args[1]);
    break;
  
  default:
    console.log(`
Kanban Board CLI

Usage:
  node cli.js list [status]
  node cli.js create <title> <desc> <priority> <status> [tags] [agent]
  node cli.js update <id> <field> <value>
  node cli.js move <id> <status>
  node cli.js show <id>

Statuses: Backlog | Planned | In Progress | Blocked | Review | Done
Priorities: Low | Med | High

Examples:
  node cli.js list
  node cli.js create "Fix bug" "Description" Med "In Progress" "bug,urgent" "Charlie"
  node cli.js move task-1234 Done
`);
    break;
}
