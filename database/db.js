const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'database.db'), (err) => {
  if (err) {
    console.error('Nelze se připojit k DB:', err.message);
  } else {
    console.log('Připojeno k SQLite databázi.');
  }
});

module.exports = db;
