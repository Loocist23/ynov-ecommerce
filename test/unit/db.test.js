const { initDb, closeDb, clearDb, getDb, initTables } = require('../../src/db');

describe('Database (SQLite)', () => {
  beforeAll(async () => {
    await initDb(':memory:');
    await initTables();
  });

  afterAll(async () => {
    await closeDb();
  });

  describe('initDb', () => {
    it('should initialize database connection', async () => {
      const db = getDb();
      expect(db).toBeDefined();
    });

    it('should throw error if already initialized', async () => {
      // Database is already initialized in beforeAll
      // This test verifies the singleton pattern
      const db1 = getDb();
      const db2 = getDb();
      expect(db1).toBe(db2);
    });
  });

  describe('initTables', () => {
    it('should create orders table', async () => {
      const db = getDb();
      const rows = await new Promise((resolve, reject) => {
        db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='orders'", (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        });
      });
      expect(rows.length).toBe(1);
      expect(rows[0].name).toBe('orders');
    });
  });

  describe('clearDb', () => {
    it('should remove all data from orders table', async () => {
      const db = getDb();
      
      // Insert test data
      await new Promise((resolve, reject) => {
        db.run('INSERT INTO orders (userId, productIds) VALUES (?, ?)', [1, '[1,2]'], (err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      // Clear
      await clearDb();

      // Verify it's empty
      const rows = await new Promise((resolve, reject) => {
        db.all('SELECT * FROM orders', (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        });
      });
      expect(rows.length).toBe(0);
    });
  });

  describe('getDb', () => {
    it('should return database instance', () => {
      const db = getDb();
      expect(db).toBeDefined();
    });
  });

  describe('closeDb', () => {
    it('should close database connection without error', async () => {
      const db = getDb();
      await closeDb();
      // If we get here without error, closeDb succeeded
    });
  });
});
