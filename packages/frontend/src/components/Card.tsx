import { type Task, PRIORITY_COLORS } from '@kanban/shared';

interface Props {
  task: Task;
  columnId: string;
  onDragStart: (taskId: string, sourceCol: string) => void;
  onMove: (taskId: string, targetCol: string) => void;
  onEdit: (task: Task) => void;
}

export default function Card({ task, columnId, onDragStart, onMove, onEdit }: Props) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(task.id, columnId)}
      className="group relative bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-accent transition-colors"
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-muted font-mono">{task.id}</span>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(task); }}
          className="text-dim hover:text-fg transition-colors p-0.5 rounded opacity-0 group-hover:opacity-100"
          title="Edit task"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
          </svg>
        </button>
      </div>
      <div className="text-sm font-medium mb-1.5 leading-snug">{task.title}</div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${PRIORITY_COLORS[task.priority] || 'bg-gray-600'}`}>
          {task.priority}
        </span>
        {task.project && (
          <span className="text-[11px] bg-gray-800 text-muted px-1.5 py-0.5 rounded">
            {task.project}
          </span>
        )}
        {columnId === 'planning' && task.started && (
          <span className="text-[11px] text-muted">Planned: {task.started}</span>
        )}
        {columnId === 'active' && task.started && (
          <span className="text-[11px] text-muted">Started: {task.started}</span>
        )}
        {columnId === 'done' && task.completed && (
          <span className="text-[11px] text-muted">{task.completed}</span>
        )}
      </div>
      {task.notes && (
        <div className="text-xs text-muted italic mt-1.5">📝 {task.notes}</div>
      )}
      {task.blocker && (
        <div className="text-xs text-danger mt-1">🚧 {task.blocker}</div>
      )}
    </div>
  );
}
