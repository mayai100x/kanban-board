import { type Task, PRIORITY_COLORS } from '@kanban/shared';

interface Props {
  task: Task;
  columnId: string;
  onDragStart: (taskId: string, sourceCol: string) => void;
  onMove: (taskId: string, targetCol: string) => void;
}

export default function Card({ task, columnId, onDragStart, onMove }: Props) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(task.id, columnId)}
      className="bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-accent transition-colors"
    >
      <div className="text-[11px] text-muted font-mono mb-1">{task.id}</div>
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
