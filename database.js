const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create or open database
const dbPath = path.join(__dirname, 'portfolio.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Initialize database and create tables
// Returns a promise that resolves once all tables are ready
const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(
        `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
        (err) => {
          if (err) {
            console.error('Error creating users table:', err.message);
            return reject(err);
          }
          console.log('Users table ready');

          // once users table is ready, create projects table
          db.run(
            `
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        technologies TEXT,
        link TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
            (err2) => {
              if (err2) {
                console.error('Error creating projects table:', err2.message);
                return reject(err2);
              }
              console.log('Projects table ready');
              resolve();
            }
          );
        }
      );
    });
  });
};

// Start initialization immediately and export the promise + db
const initPromise = initializeDatabase();

module.exports = { db, initPromise };
