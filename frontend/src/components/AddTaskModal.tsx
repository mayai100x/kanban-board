import { useState } from 'react';
import type { CreateTaskPayload } from '../api';

interface Props {
  onClose: () => void;
  onSubmit: (payload: CreateTaskPayload) => void;
}

export default function AddTaskModal({ onClose, onSubmit }: Props) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'P0' | 'P1' | 'P2' | 'P3'>('P2');
  const [project, setProject] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), priority, project: project.trim(), notes: notes.trim() || undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-raised border border-border rounded-xl w-full max-w-md mx-4 p-6 shadow-2xl">
        <h2 className="text-lg font-semibold mb-4">📥 Add Task</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-muted mb-1">Title *</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent transition-colors placeholder:text-dim"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs text-muted mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as typeof priority)}
                className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
              >
                <option value="P0">P0 — Critical</option>
                <option value="P1">P1 — High</option>
                <option value="P2">P2 — Medium</option>
                <option value="P3">P3 — Low</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-xs text-muted mb-1">Project</label>
              <input
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="e.g. Infra, UI, API"
                className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent transition-colors placeholder:text-dim"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-muted mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional details..."
              rows={3}
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent transition-colors placeholder:text-dim resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-card transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-2 text-sm rounded-lg bg-accent text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
