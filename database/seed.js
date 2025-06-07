const db = require('./db');
const fs = require('fs');
const path = require('path');

const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
const seedSQL = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');

db.exec(schemaSQL, (err) => {
  if (err) {
    console.error('Chyba při vytváření tabulek:', err.message);
    process.exit(1);
  }
  db.exec(seedSQL, (err2) => {
    if (err2) {
      console.error('Chyba při seedování databáze:', err2.message);
      process.exit(1);
    }
    console.log('Databáze byla seedována.');
    process.exit(0);
  });
});
