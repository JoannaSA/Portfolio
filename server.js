const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { db, initPromise } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ============ USER ROUTES ============

// GET all users
app.get('/api/users', (req, res) => {
  db.all('SELECT * FROM users ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// GET user by ID
app.get('/api/users/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(row);
  });
});

// POST new user (contact form submission)
app.post('/api/users', (req, res) => {
  const { name, email, message } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  db.run(
    'INSERT INTO users (name, email, message) VALUES (?, ?, ?)',
    [name, email, message || ''],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        id: this.lastID,
        name,
        email,
        message,
        created_at: new Date().toISOString()
      });
    }
  );
});

// UPDATE user
app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, message } = req.body;

  db.run(
    'UPDATE users SET name = ?, email = ?, message = ? WHERE id = ?',
    [name, email, message, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ message: 'User updated successfully' });
    }
  );
});

// DELETE user
app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  });
});

// ============ PROJECT ROUTES ============

// GET all projects
app.get('/api/projects', (req, res) => {
  db.all('SELECT * FROM projects ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// GET project by ID
app.get('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM projects WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(row);
  });
});

// POST new project
app.post('/api/projects', (req, res) => {
  const { title, description, technologies, link } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  db.run(
    'INSERT INTO projects (title, description, technologies, link) VALUES (?, ?, ?, ?)',
    [title, description || '', technologies || '', link || ''],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        id: this.lastID,
        title,
        description,
        technologies,
        link,
        created_at: new Date().toISOString()
      });
    }
  );
});

// UPDATE project
app.put('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, technologies, link } = req.body;

  db.run(
    'UPDATE projects SET title = ?, description = ?, technologies = ?, link = ? WHERE id = ?',
    [title, description, technologies, link, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json({ message: 'Project updated successfully' });
    }
  );
});

// DELETE project
app.delete('/api/projects/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM projects WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  });
});

// ============ HEALTH CHECK ============
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running' });
});

// catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Start server after database initialization
initPromise
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log('Available endpoints:');
      console.log('  GET /api/health - Health check');
      console.log('  GET /api/users - Get all users');
      console.log('  POST /api/users - Create user');
      console.log('  GET /api/projects - Get all projects');
      console.log('  POST /api/projects - Create project');
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} already in use. Either kill the existing process or set a different PORT environment variable.`);
        process.exit(1);
      } else {
        console.error('Server encountered an error:', err);
      }
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database, exiting.', err);
    process.exit(1);
  });
