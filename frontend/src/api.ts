import type { Board, ColumnId, CreateTaskPayload, UpdateTaskPayload, Task } from './types';

const BASE = '/api';

export async function fetchBoard(): Promise<Board> {
  const res = await fetch(`${BASE}/board`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const res = await fetch(`${BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function updateTask(id: string, payload: UpdateTaskPayload): Promise<Task> {
  const res = await fetch(`${BASE}/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`${BASE}/tasks/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export interface CreateTaskPayload {
  title: string;
  priority?: Task['priority'];
  project?: string;
  notes?: string;
}

export interface UpdateTaskPayload {
  title?: string;
  priority?: Task['priority'];
  project?: string;
  notes?: string;
  blocker?: string;
  column?: ColumnId;
  started?: string;
  completed?: string;
  readySince?: string;
}
