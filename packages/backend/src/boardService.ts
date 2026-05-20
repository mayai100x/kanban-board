import { readFileSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import type { Board, Column, ColumnId, Task, CreateTaskPayload, UpdateTaskPayload } from '@kanban/shared';

const BOARD_PATH = path.resolve(os.homedir(), '.hermes/projects/kanban/board.md');

const COLUMN_MAP: Record<ColumnId, { title: string; icon: string }> = {
  backlog: { title: 'Backlog', icon: '📥' },
  ready: { title: 'Ready', icon: '🎯' },
  active: { title: 'Active', icon: '⚡' },
  review: { title: 'Review', icon: '👀' },
  done: { title: 'Done', icon: '✅' },
  blocked: { title: 'Blocked', icon: '🚧' },
};

function parseBoard(): Board {
  try {
    const md = readFileSync(BOARD_PATH, 'utf-8');
    return parseMarkdown(md);
  } catch {
    return createEmptyBoard();
  }
}

function createEmptyBoard(): Board {
  const now = new Date().toISOString().slice(0, 10);
  return {
    lastUpdated: now,
    totalTasks: 0,
    columns: Object.entries(COLUMN_MAP).map(([id, info]) => ({
      id: id as ColumnId,
      title: info.title,
      icon: info.icon,
      tasks: [],
    })),
  };
}

const COLUMN_HEADERS: Record<string, ColumnId> = {
  '📥 Backlog': 'backlog',
  '🎯 Ready': 'ready',
  '⚡ Active': 'active',
  '👀 Review': 'review',
  '✅ Done': 'done',
  '🚧 Blocked': 'blocked',
};

function parseMarkdown(md: string): Board {
  const lines = md.split('\n');
  const columns: Column[] = Object.entries(COLUMN_MAP).map(([id, info]) => ({
    id: id as ColumnId,
    title: info.title,
    icon: info.icon,
    tasks: [],
  }));

  const colLookup: Record<string, Column> = {};
  for (const col of columns) {
    const header = `${col.icon} ${col.title}`;
    colLookup[header] = col;
  }

  let lastUpdated = 'Unknown';
  let totalTasks = 0;
  let currentColumn: Column | null = null;
  let inTable = false;
  let isHeaderRow = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Metadata
    const updatedMatch = trimmed.match(/Last updated:\s*(.+)/i);
    if (updatedMatch) lastUpdated = updatedMatch[1].trim();
    const totalMatch = trimmed.match(/Total tasks:\s*(\d+)/i);
    if (totalMatch) totalTasks = parseInt(totalMatch[1], 10);

    // Column header — strip leading ## or * for matching
    const trimmedLine = trimmed.replace(/^##\s*\*{0,2}/, '');
    const colHeader = Object.keys(colLookup).find(h => trimmedLine.startsWith(h));
    if (colHeader) {
      currentColumn = colLookup[colHeader];
      inTable = false;
      continue;
    }

    // Table rows
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      // Skip separator rows
      if (trimmed.includes('---')) {
        isHeaderRow = true;
        inTable = true;
        continue;
      }

      if (!inTable) continue;

      // Skip header row (has ID, Task etc.)
      if (isHeaderRow && trimmed.includes('ID')) {
        isHeaderRow = false;
        continue;
      }

      // Skip empty placeholder
      if (trimmed.includes('*Empty*')) continue;

      const cells = trimmed
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map(c => c.trim());

      if (!cells[0] || cells[0] === 'ID' || cells[0].startsWith('*')) continue;

      if (currentColumn) {
        const task = parseTaskRow(cells, currentColumn.id);
        if (task) currentColumn.tasks.push(task);
      }
    } else {
      isHeaderRow = false;
      inTable = false;
    }
  }

  return { lastUpdated, totalTasks, columns };
}

function parseTaskRow(cells: string[], columnId: ColumnId): Task | null {
  if (cells.length < 2) return null;

  const task: Task = {
    id: cells[0],
    title: cells[1],
    priority: 'P2',
    project: '',
    added: '',
  };

  if (columnId === 'backlog' || columnId === 'ready') {
    task.priority = (cells[2] || 'P2') as Task['priority'];
    task.project = cells[3] || '';
    task.added = cells[4] || '';
  } else if (columnId === 'active') {
    task.priority = (cells[2] || 'P2') as Task['priority'];
    task.project = cells[3] || '';
    task.started = cells[4] || '';
    task.notes = cells[5] || '';
  } else if (columnId === 'review') {
    task.priority = (cells[2] || 'P2') as Task['priority'];
    task.project = cells[3] || '';
    task.readySince = cells[4] || '';
  } else if (columnId === 'done') {
    task.completed = cells[2] || '';
  } else if (columnId === 'blocked') {
    task.blocker = cells[2] || '';
    task.priority = (cells[3] || 'P2') as Task['priority'];
  }

  return task;
}

function serializeBoard(board: Board): string {
  const cols = board.columns;
  const today = new Date().toISOString().slice(0, 10);
  const total = cols.reduce((sum, c) => sum + c.tasks.length, 0);

  const priorityKey = `### Priority Key
- **P0** — Critical, drop everything
- **P1** — High, important
- **P2** — Medium, normal
- **P3** — Low, nice-to-have`;

  const section = (col: Column) => {
    const header = `${col.icon} ${col.title}`;
    const desc = getColumnDesc(col.id);
    const headers = getColumnHeaders(col.id);
    const separator = '|' + headers.map(() => '---').join('|') + '|';
    const headerRow = '| ' + headers.join(' | ') + ' |';

    let rows: string[];
    if (col.tasks.length === 0) {
      rows = ['| ' + headers.map((_, i) => i === 0 ? '*Empty*' : '').join(' | ') + ' |'];
    } else {
      rows = col.tasks.map(t => serializeTaskRow(t, col.id));
    }

    return `## ${header}
${desc}

${headerRow}
${separator}
${rows.join('\n')}`;
  };

  return `# 🎯 Kanban Board

> Last updated: ${today}
> Total tasks: ${total}

---

${cols.map(section).join('\n\n---\n\n')}

---

${priorityKey}
`;
}

function getColumnDesc(id: ColumnId): string {
  const descs: Record<ColumnId, string> = {
    backlog: '*Unprocessed items — needs clarification and prioritization*',
    ready: '*Prioritized next actions — pick from here*',
    active: '*Currently being worked on*',
    review: '*Done but needs your eyes before final*',
    done: '*Completed tasks*',
    blocked: '*Stuck — waiting on something external*',
  };
  return descs[id];
}

function getColumnHeaders(id: ColumnId): string[] {
  const headers: Record<ColumnId, string[]> = {
    backlog: ['ID', 'Task', 'Priority', 'Project', 'Added'],
    ready: ['ID', 'Task', 'Priority', 'Project', 'Added'],
    active: ['ID', 'Task', 'Priority', 'Project', 'Started', 'Notes'],
    review: ['ID', 'Task', 'Priority', 'Project', 'Ready Since'],
    done: ['ID', 'Task', 'Completed'],
    blocked: ['ID', 'Task', 'Blocker', 'Priority'],
  };
  return headers[id];
}

function serializeTaskRow(task: Task, columnId: ColumnId): string {
  const esc = (s: string | undefined) => (s || '').replace(/\|/g, '\\|');
  if (columnId === 'backlog' || columnId === 'ready') {
    return `| ${esc(task.id)} | ${esc(task.title)} | ${task.priority} | ${esc(task.project)} | ${esc(task.added)} |`;
  }
  if (columnId === 'active') {
    return `| ${esc(task.id)} | ${esc(task.title)} | ${task.priority} | ${esc(task.project)} | ${esc(task.started || '')} | ${esc(task.notes || '')} |`;
  }
  if (columnId === 'review') {
    return `| ${esc(task.id)} | ${esc(task.title)} | ${task.priority} | ${esc(task.project)} | ${esc(task.readySince || '')} |`;
  }
  if (columnId === 'done') {
    return `| ${esc(task.id)} | ${esc(task.title)} | ${esc(task.completed || '')} |`;
  }
  if (columnId === 'blocked') {
    return `| ${esc(task.id)} | ${esc(task.title)} | ${esc(task.blocker || '')} | ${task.priority} |`;
  }
  return '';
}

function saveBoard(board: Board): void {
  const md = serializeBoard(board);
  writeFileSync(BOARD_PATH, md, 'utf-8');
}

function nextId(board: Board): string {
  const allTasks = board.columns.flatMap(c => c.tasks);
  const maxNum = allTasks.reduce((max, t) => {
    const num = parseInt(t.id.replace('T-', ''), 10);
    return isNaN(num) ? max : Math.max(max, num);
  }, 0);
  return `T-${String(maxNum + 1).padStart(3, '0')}`;
}

export function getBoard(): Board {
  return parseBoard();
}

export function addTask(payload: CreateTaskPayload): Task {
  const board = parseBoard();
  const task: Task = {
    id: nextId(board),
    title: payload.title,
    priority: payload.priority || 'P2',
    project: payload.project || '',
    added: new Date().toISOString().slice(0, 10),
    notes: payload.notes,
  };

  const backlog = board.columns.find(c => c.id === 'backlog');
  if (backlog) backlog.tasks.push(task);

  board.totalTasks = board.columns.reduce((s, c) => s + c.tasks.length, 0);
  board.lastUpdated = new Date().toISOString().slice(0, 10);
  saveBoard(board);
  return task;
}

export function updateTask(id: string, payload: UpdateTaskPayload): Task | null {
  const board = parseBoard();

  // Find the task across all columns
  let foundTask: Task | null = null;
  let sourceCol: Column | null = null;

  for (const col of board.columns) {
    const idx = col.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      foundTask = col.tasks[idx];
      sourceCol = col;

      // Remove from source
      if (payload.column && payload.column !== col.id) {
        col.tasks.splice(idx, 1);
      }
      break;
    }
  }

  if (!foundTask) return null;

  // Update fields
  if (payload.title !== undefined) foundTask.title = payload.title;
  if (payload.priority !== undefined) foundTask.priority = payload.priority;
  if (payload.project !== undefined) foundTask.project = payload.project;
  if (payload.notes !== undefined) foundTask.notes = payload.notes;
  if (payload.blocker !== undefined) foundTask.blocker = payload.blocker;
  if (payload.started !== undefined) foundTask.started = payload.started;
  if (payload.completed !== undefined) foundTask.completed = payload.completed;
  if (payload.readySince !== undefined) foundTask.readySince = payload.readySince;

  // Move to new column if specified
  if (payload.column && payload.column !== sourceCol?.id) {
    const destCol = board.columns.find(c => c.id === payload.column);
    if (destCol) {
      destCol.tasks.push(foundTask);
    }
  }

  board.totalTasks = board.columns.reduce((s, c) => s + c.tasks.length, 0);
  board.lastUpdated = new Date().toISOString().slice(0, 10);
  saveBoard(board);
  return foundTask;
}

export function deleteTask(id: string): boolean {
  const board = parseBoard();
  let found = false;

  for (const col of board.columns) {
    const idx = col.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      col.tasks.splice(idx, 1);
      found = true;
      break;
    }
  }

  if (!found) return false;

  board.totalTasks = board.columns.reduce((s, c) => s + c.tasks.length, 0);
  board.lastUpdated = new Date().toISOString().slice(0, 10);
  saveBoard(board);
  return true;
}


