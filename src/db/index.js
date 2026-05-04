const sqlite3 = require('sqlite3').verbose();

// Database instance
let db = null;

/**
 * Initialize SQLite database
 * @param {string} path - Database path (use ':memory:' for in-memory DB)
 * @returns {Promise<sqlite3.Database>}
 */
async function initDb(path = ':memory:') {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(path, (err) => {
      if (err) {
        console.error('[DB] Error opening database:', err);
        return reject(err);
      }
      console.log(`[DB] Connected to ${path}`);
      resolve(db);
    });
  });
}

/**
 * Close database connection
 * @returns {Promise<void>}
 */
async function closeDb() {
  return new Promise((resolve, reject) => {
    if (!db) return resolve();
    db.close((err) => {
      if (err) {
        console.error('[DB] Error closing database:', err);
        return reject(err);
      }
      db = null;
      console.log('[DB] Connection closed');
      resolve();
    });
  });
}

/**
 * Get database instance
 * @returns {sqlite3.Database}
 */
function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return db;
}

/**
 * Initialize tables
 * @returns {Promise<void>}
 */
async function initTables() {
  const dbInstance = getDb();
  
  return new Promise((resolve, reject) => {
    dbInstance.serialize(() => {
      dbInstance.run(`
        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER NOT NULL,
          productIds TEXT NOT NULL,  -- JSON array
          total REAL DEFAULT 0,
          status TEXT DEFAULT 'pending',
          createdAt TEXT DEFAULT CURRENT_DATE
        )
      `, (err) => {
        if (err) {
          console.error('[DB] Error creating orders table:', err);
          return reject(err);
        }
        console.log('[DB] Tables initialized');
        resolve();
      });
    });
  });
}

/**
 * Clear all data from tables (for testing)
 * @returns {Promise<void>}
 */
async function clearDb() {
  const dbInstance = getDb();
  
  return new Promise((resolve, reject) => {
    dbInstance.serialize(() => {
      dbInstance.run('DELETE FROM orders', (err) => {
        if (err) {
          console.error('[DB] Error clearing database:', err);
          return reject(err);
        }
        console.log('[DB] Database cleared');
        resolve();
      });
    });
  });
}

module.exports = {
  initDb,
  closeDb,
  getDb,
  initTables,
  clearDb
};
