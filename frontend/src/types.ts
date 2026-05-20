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

export const COLUMN_ORDER: { id: ColumnId; title: string; icon: string }[] = [
  { id: 'backlog', title: 'Backlog', icon: '📥' },
  { id: 'ready', title: 'Ready', icon: '🎯' },
  { id: 'active', title: 'Active', icon: '⚡' },
  { id: 'review', title: 'Review', icon: '👀' },
  { id: 'done', title: 'Done', icon: '✅' },
  { id: 'blocked', title: 'Blocked', icon: '🚧' },
];

export const PRIORITY_COLORS: Record<string, string> = {
  P0: 'bg-p0 text-white',
  P1: 'bg-p1 text-white',
  P2: 'bg-p2 text-white',
  P3: 'bg-p3 text-muted',
};
