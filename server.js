const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const db = new sqlite3.Database('./todos.db');

app.use(
  cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  }),
);

app.use(express.json());

db.run(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

app.get('/api/todos', (req, res) => {
  db.all('SELECT * FROM todos ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/todos', (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Text is required' });
  }

  db.run('INSERT INTO todos (text, completed) VALUES (?, 0)', [text.trim()], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({
      id: this.lastID,
      text: text.trim(),
      completed: 0,
      created_at: new Date().toISOString(),
    });
  });
});

app.patch('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const { text, completed } = req.body;

  const updates = [];
  const values = [];

  if (text !== undefined) {
    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text is required' });
    }

    updates.push('text = ?');
    values.push(text.trim());
  }

  if (completed !== undefined) {
    const normalizedCompleted = Number(Boolean(completed));

    updates.push('completed = ?');
    values.push(normalizedCompleted);
  }

  if (!updates.length) {
    return res.status(400).json({ error: 'No valid field to update' });
  }

  db.run(`UPDATE todos SET ${updates.join(', ')} WHERE id = ?`, [...values, id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update todo' });
    }

    db.get('SELECT * FROM todos WHERE id = ?', [id], (getErr, row) => {
      if (getErr) {
        return res.status(500).json({ error: 'Failed to fetch updated todo' });
      }

      res.json(row);
    });
  });
});

app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM todos WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete todo' });
    }

    res.json({ success: true });
  });
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
