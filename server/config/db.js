const Database = require("better-sqlite3");
const path = require("path");

let db = null;

const initDB = () => {
  if (db) return db;

  const dbPath = path.join(__dirname, "..", "data.db");

  try {
    db = new Database(dbPath);
    console.log(`✅ SQLite database connected: ${dbPath}`);

    // Create tables if they don't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        name TEXT DEFAULT '',
        avatar TEXT DEFAULT '',
        googleId TEXT UNIQUE,
        authProvider TEXT DEFAULT 'local',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sessions (
        sid TEXT PRIMARY KEY,
        sess TEXT NOT NULL,
        expired INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_sessions_expired ON sessions(expired);

      CREATE TABLE IF NOT EXISTS preferences (
        userId INTEGER PRIMARY KEY,
        homeCountry TEXT DEFAULT '',
        theme TEXT DEFAULT 'system',
        units TEXT DEFAULT 'metric',
        FOREIGN KEY (userId) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS saved_views (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        name TEXT NOT NULL,
        countries TEXT NOT NULL,
        metric TEXT DEFAULT 'co2',
        dateRange TEXT DEFAULT '',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS streaks (
        userId INTEGER PRIMARY KEY,
        currentStreak INTEGER DEFAULT 0,
        longestStreak INTEGER DEFAULT 0,
        lastActive TEXT DEFAULT '',
        totalDaysActive INTEGER DEFAULT 0,
        FOREIGN KEY (userId) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS explored_countries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        countryCode TEXT NOT NULL,
        exploredAt TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(userId, countryCode),
        FOREIGN KEY (userId) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS quiz_stats (
        userId INTEGER PRIMARY KEY,
        completed INTEGER DEFAULT 0,
        totalCorrect INTEGER DEFAULT 0,
        totalQuestions INTEGER DEFAULT 0,
        streak INTEGER DEFAULT 0,
        bestStreak INTEGER DEFAULT 0,
        FOREIGN KEY (userId) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS badges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        badgeId TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        earnedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(userId, badgeId),
        FOREIGN KEY (userId) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        target INTEGER DEFAULT 0,
        current INTEGER DEFAULT 0,
        deadline TEXT DEFAULT '',
        type TEXT DEFAULT 'custom',
        completed INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        co2 REAL,
        temp REAL,
        dateStored TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Migration: Add new columns to existing users table if they don't exist
    // SQLite doesn't support IF NOT EXISTS for columns, so we check manually
    const tableInfo = db.prepare("PRAGMA table_info(users)").all();
    const columnNames = tableInfo.map((col) => col.name);

    if (!columnNames.includes("name")) {
      db.exec("ALTER TABLE users ADD COLUMN name TEXT DEFAULT ''");
      console.log("  ↳ Added 'name' column to users table");
    }
    if (!columnNames.includes("avatar")) {
      db.exec("ALTER TABLE users ADD COLUMN avatar TEXT DEFAULT ''");
      console.log("  ↳ Added 'avatar' column to users table");
    }
    if (!columnNames.includes("googleId")) {
      db.exec("ALTER TABLE users ADD COLUMN googleId TEXT");
      // Create a unique index separately (SQLite doesn't allow UNIQUE in ALTER TABLE)
      db.exec(
        "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_googleId ON users(googleId) WHERE googleId IS NOT NULL"
      );
      console.log("  ↳ Added 'googleId' column to users table");
    }
    if (!columnNames.includes("authProvider")) {
      db.exec("ALTER TABLE users ADD COLUMN authProvider TEXT DEFAULT 'local'");
      console.log("  ↳ Added 'authProvider' column to users table");
    }

    // Make password nullable for OAuth users (SQLite doesn't support ALTER COLUMN,
    // but the column was originally NOT NULL, existing data is fine)

    console.log("✅ Database tables initialized");
    return db;
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
};

const getDB = () => {
  if (!db) {
    return initDB();
  }
  return db;
};

module.exports = { initDB, getDB };
