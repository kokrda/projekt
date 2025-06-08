const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'school.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('❌ Chyba při připojování k databázi:', err.message);
  } else {
    console.log('✅ Úspěšně připojeno k databázi:', dbPath);
    // Vytvoření tabulek
    db.exec(`
      CREATE TABLE IF NOT EXISTS subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT NOT NULL UNIQUE
      );
      
      CREATE TABLE IF NOT EXISTS places (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        row INTEGER NOT NULL,
        column INTEGER NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS seating_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject_id INTEGER NOT NULL,
        place_id INTEGER NOT NULL,
        firstname TEXT NOT NULL,
        lastname TEXT NOT NULL,
        FOREIGN KEY (subject_id) REFERENCES subjects(id),
        FOREIGN KEY (place_id) REFERENCES places(id)
      );
    `);
  }
});

module.exports = db;