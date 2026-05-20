import { useEffect, useState, useCallback } from 'react';
import type { Board, ColumnId, Task, CreateTaskPayload } from '@kanban/shared';
import { COLUMN_ORDER } from '@kanban/shared';
import Column from './Column';
import AddTaskModal from './AddTaskModal';
import EditTaskModal from './EditTaskModal';
import { fetchBoard, createTask, updateTask, deleteTask } from '../api';

const POLL_INTERVAL = 5000;

export default function Board() {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [dragCol, setDragCol] = useState<string | null>(null);
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<ColumnId | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchBoard();
      setBoard(data);
      setError(null);
    } catch (err) {
      setError('Failed to load board');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [load]);

  const handleAdd = async (payload: CreateTaskPayload) => {
    try {
      await createTask(payload);
      setShowAdd(false);
      await load();
    } catch (err) {
      console.error('Failed to add task', err);
    }
  };

  const handleDragStart = (taskId: string, sourceCol: string) => {
    setDragTaskId(taskId);
    setDragCol(sourceCol);
  };

  const handleDrop = async (targetCol: ColumnId) => {
    if (!dragTaskId || !dragCol || dragCol === targetCol) {
      setDropTarget(null);
      setDragTaskId(null);
      setDragCol(null);
      return;
    }

    try {
      const now = new Date().toISOString().slice(0, 10);
      const payload: Record<string, unknown> = { column: targetCol };

      if (targetCol === 'planning') payload.started = now;
      if (targetCol === 'active') payload.started = now;
      if (targetCol === 'done') payload.completed = now;
      if (targetCol === 'review') payload.readySince = now;

      await updateTask(dragTaskId, payload);
      await load();
    } catch (err) {
      console.error('Failed to move task', err);
    } finally {
      setDropTarget(null);
      setDragTaskId(null);
      setDragCol(null);
    }
  };

  const handleMoveViaClick = async (taskId: string, targetCol: string) => {
    try {
      await updateTask(taskId, { column: targetCol as ColumnId });
      await load();
    } catch (err) {
      console.error('Failed to move task', err);
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      await load();
    } catch (err) {
      console.error('Failed to delete task', err);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
  };

  const handleEditSaved = async () => {
    setEditingTask(null);
    await load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted">
        <div className="animate-pulse">Loading board...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-danger text-sm">{error}</div>
        <button onClick={load} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-card transition-colors">
          Retry
        </button>
      </div>
    );
  }

  if (!board) return null;

  return (
    <div className="p-4 sm:p-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            🎯 Kanban Board
          </h1>
          <p className="text-xs text-muted mt-1">
            Updated: <span className="text-accent">{board.lastUpdated}</span>
            {' · '}
            Total: <span className="text-accent">{board.totalTasks}</span> tasks
            {' · '}
            <span className="text-dim">Auto-refresh {POLL_INTERVAL / 1000}s</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            className="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-card transition-colors"
            title="Refresh now"
          >
            ↻ Refresh
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-1.5 text-sm rounded-lg bg-accent text-white font-medium hover:opacity-90 transition-opacity"
          >
            + Add Task
          </button>
        </div>
      </div>

      {/* Board columns */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMN_ORDER.map((colDef) => {
          const col = board.columns.find((c) => c.id === colDef.id);
          if (!col) return null;
          return (
            <Column
              key={col.id}
              column={col}
              isDropTarget={dropTarget === col.id}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
              onDragOver={(colId) => setDropTarget(colId)}
              onDragLeave={() => setDropTarget(null)}
              onMove={handleMoveViaClick}
              onEdit={handleEdit}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex gap-6 flex-wrap text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-p0 inline-block"></span> P0 Critical
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-p1 inline-block"></span> P1 High
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-p2 inline-block"></span> P2 Medium
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-p3 inline-block"></span> P3 Low
          </span>
          <span className="text-dim">| Drag cards to move between columns</span>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAdd && (
        <AddTaskModal
          onClose={() => setShowAdd(false)}
          onSubmit={handleAdd}
        />
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSaved={handleEditSaved}
        />
      )}
    </div>
  );
}
