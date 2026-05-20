import express from 'express';
import cors from 'cors';
import { getBoard, addTask, updateTask, deleteTask } from './boardService.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// GET /api/board — full board state
app.get('/api/board', (_req, res) => {
  try {
    const board = getBoard();
    res.json(board);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read board', details: String(err) });
  }
});

// POST /api/tasks — add new task to backlog
app.post('/api/tasks', (req, res) => {
  try {
    const { title, priority, project, notes } = req.body;
    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }
    const task = addTask({ title: title.trim(), priority, project, notes });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add task', details: String(err) });
  }
});

// PATCH /api/tasks/:id — update/move task
app.patch('/api/tasks/:id', (req, res) => {
  try {
    const task = updateTask(req.params.id, req.body);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task', details: String(err) });
  }
});

// DELETE /api/tasks/:id — delete task
app.delete('/api/tasks/:id', (req, res) => {
  try {
    const deleted = deleteTask(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task', details: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Kanban API server running at http://0.0.0.0:${PORT}`);
  console.log(`   Board file: ~/.hermes/projects/kanban/board.md`);
});
