const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { db, initPromise } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// Utility function to retry database operations
const dbRetry = (operation, maxRetries = 2) => {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const attempt = () => {
      attempts++;
      operation((err, result) => {
        if (err && attempts < maxRetries) {
          console.warn(`Database operation failed (attempt ${attempts}/${maxRetries}), retrying...`);
          setTimeout(attempt, 100);
        } else {
          if (err) reject(err);
          else resolve(result);
        }
      });
    };
    
    attempt();
  });
};

// Middleware - Order matters!
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

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
  
  // Validate input
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  
  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Check if email already exists
  db.get('SELECT email FROM users WHERE email = ?', [email], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    
    if (row) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // Insert new user
    db.run(
      'INSERT INTO users (name, email, message) VALUES (?, ?, ?)',
      [name, email, message || ''],
      function(err) {
        if (err) {
          // Handle unique constraint violation
          if (err.message.includes('UNIQUE')) {
            return res.status(409).json({ error: 'Email already registered' });
          }
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
console.log('⏳ Waiting for database to initialize...');

let retryCount = 0;
const maxRetries = 3;

const startServer = () => {
  initPromise
    .then(() => {
      console.log('✅ Database initialized successfully');
      const server = app.listen(PORT, () => {
        console.log(`\n🚀 Server running on http://localhost:${PORT}`);
        console.log('\n📡 Available endpoints:');
        console.log('   GET /api/health - Health check');
        console.log('   GET /api/users - Get all users');
        console.log('   POST /api/users - Create new user');
        console.log('   GET /api/projects - Get all projects');
        console.log('   POST /api/projects - Create new project');
        console.log('\n✨ Backend ready to receive requests!\n');
        
        retryCount = 0; // Reset retry count on success
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.error(`\n❌ Port ${PORT} is already in use!`);
          console.error(`\nTo fix this:`);
          console.error(`  1. Kill the existing process using port ${PORT}:`);
          console.error(`     netstat -a -n -o | findstr :${PORT}`);
          console.error(`     taskkill /PID <pid> /F`);
          console.error(`  2. Or use a different port:`);
          console.error(`     set PORT=3000 && npm start\n`);
          process.exit(1);
        } else {
          console.error('❌ Server error:', err);
          process.exit(1);
        }
      });

      process.on('SIGTERM', () => {
        console.log('\n⚠️  SIGTERM received, shutting down gracefully...');
        server.close(() => {
          console.log('✅ Server closed');
          db.close((err) => {
            if (err) console.error('❌ Error closing database:', err);
            process.exit(0);
          });
        });
      });
    })
    .catch((err) => {
      retryCount++;
      console.error('\n❌ Failed to initialize database!');
      console.error('Error:', err.message);
      console.error(`Attempt ${retryCount} of ${maxRetries}`);
      
      if (retryCount < maxRetries) {
        console.error('\n🔄 Retrying in 3 seconds...\n');
        setTimeout(() => {
          startServer();
        }, 3000);
      } else {
        console.error('\n❌ FATAL: Failed to initialize database after retries!');
        console.error('\nPossible causes:');
        console.error('  • Database file is locked or corrupted');
        console.error('  • No write permissions in the backend folder');
        console.error('  • SQLite3 module not properly installed\n');
        console.error('Try running: npm install sqlite3');
        process.exit(1);
      }
    });
};

startServer();
