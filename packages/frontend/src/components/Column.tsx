import { type Column, type ColumnId } from '@kanban/shared';
import Card from './Card';

interface Props {
  column: Column;
  isDropTarget: boolean;
  onDragStart: (taskId: string, sourceCol: string) => void;
  onDrop: (targetCol: ColumnId) => void;
  onDragOver: (colId: ColumnId) => void;
  onDragLeave: () => void;
  onMove: (taskId: string, targetCol: string) => void;
}

export default function Column({
  column,
  isDropTarget,
  onDragStart,
  onDrop,
  onDragOver,
  onDragLeave,
  onMove,
}: Props) {
  const count = column.tasks.length;

  return (
    <div
      className={`flex-1 min-w-[220px] max-w-[320px] bg-raised border border-border rounded-xl flex flex-col transition-all ${
        isDropTarget ? 'border-accent shadow-[0_0_12px_rgba(88,166,255,0.15)]' : 'border-border'
      }`}
      onDragOver={(e) => { e.preventDefault(); onDragOver(column.id); }}
      onDragLeave={onDragLeave}
      onDrop={(e) => { e.preventDefault(); onDrop(column.id); }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="font-semibold text-sm">
          {column.icon} {column.title}
        </span>
        <span className="bg-border text-muted text-[11px] px-2 py-0.5 rounded-full font-medium">
          {count}
        </span>
      </div>

      <div className="p-2 flex flex-col gap-2 min-h-[120px] flex-1">
        {count === 0 ? (
          <div className="text-dim text-center py-8 text-sm">✨ Empty</div>
        ) : (
          column.tasks.map((task) => (
            <Card
              key={task.id}
              task={task}
              columnId={column.id}
              onDragStart={onDragStart}
              onMove={onMove}
            />
          ))
        )}
      </div>
    </div>
  );
}
