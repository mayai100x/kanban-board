export interface Task {
  id: string;
  title: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  project: string;
  added: string;
  started?: string;
  completed?: string;
  readySince?: string;
  notes?: string;
  blocker?: string;
}

export type ColumnId = 'backlog' | 'ready' | 'active' | 'review' | 'done' | 'blocked';

export interface Column {
  id: ColumnId;
  title: string;
  icon: string;
  tasks: Task[];
}

export interface Board {
  lastUpdated: string;
  totalTasks: number;
  columns: Column[];
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
