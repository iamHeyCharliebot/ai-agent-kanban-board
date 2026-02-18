# AI Agent Kanban Board

Single source of truth for all work done by Charlie and AI agents.

## Features

✅ **Trello-style Interface** - Clean, minimal design
✅ **6 Columns** - Backlog → Planned → In Progress → Blocked → Review → Done
✅ **Drag & Drop** - Move tasks between columns
✅ **Google Tasks Integration** - Auto-sync with Dean's task list
✅ **Never Delete** - Completed tasks stay in Done forever
✅ **Real-time Sync** - Board updates every 10 seconds

## Google Tasks Integration

**Automatic sync when:**
- Task moves TO Review → Creates Google Task for Dean
- Task moves FROM Review → Completes/deletes Google Task
- Google Task completed → Moves Kanban task to Done

**Sync runs every 30 seconds automatically.**

## Running Locally

```bash
cd kanban-board
npm run dev
```

Open http://localhost:3000

## CLI (For AI Agents)

```bash
# List all tasks
node cli.js list

# Create a task
node cli.js create "Task Title" "Description" Med "In Progress" "tag1,tag2" "Charlie"

# Move a task
node cli.js move task-1234 Done

# Update a task
node cli.js update task-1234 priority High

# Show task details
node cli.js show task-1234
```

## Deploy to Vercel

```bash
vercel
```

## Rules

1. ✅ Create a task for everything you and agents work on
2. ✅ Move tasks as status changes
3. ✅ Use Review when waiting on Dean
4. ✅ Never delete completed tasks
5. ✅ Board must always match reality

## Task Fields

- **Title** - Short description
- **Description** - Full details
- **Priority** - Low / Med / High
- **Status** - Backlog / Planned / In Progress / Blocked / Review / Done
- **Tags** - Categorization
- **Agent** - Who's working on it
- **Created/Updated** - Timestamps

## Architecture

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **@hello-pangea/dnd** - Drag and drop
- **Google Tasks API** - Task sync
- **Local JSON** - Data storage (data/board.json)

## Google Tasks Setup

The board uses your existing Google Tasks OAuth token at:
`../skills/gmail/token.json`

Tasks sync to Dean's "My Tasks" list automatically.

---

**Single Source of Truth** - If it's not on the board, it doesn't exist.
