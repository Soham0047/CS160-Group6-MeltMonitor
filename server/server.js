const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

// Create table 
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    co2 REAL,
    temp REAL,
    dateStored TEXT
  )`);
});

// Endpoint to store data
app.post('/api/data', (req, res) => {
  const { co2, temp } = req.body;
  const dateStored = new Date().toISOString();
  
  db.run(
    'INSERT INTO readings (co2, temp, dateStored) VALUES (?, ?, ?)',
    [co2, temp, dateStored],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to store data' });
      }
      res.json({ success: true });
    }
  );
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

