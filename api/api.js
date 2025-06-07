const express = require('express');
const router = express.Router();
const db = require('../database/db');  // uprav podle své struktury

// --- SUBJECTS CRUD ---

router.get('/subjects', (req, res) => {
  db.all('SELECT * FROM subjects', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/subjects', (req, res) => {
  const { name, code } = req.body;
  db.run('INSERT INTO subjects (name, code) VALUES (?, ?)', [name, code], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ id: this.lastID, name, code });
  });
});

// ... další CRUD podle tvého api.js, viz co jsi poslal ...

// --- PLACES ---

router.get('/places', (req, res) => {
  db.all('SELECT * FROM places', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// --- SEATING PLANS CRUD ---

router.get('/seating_plans', (req, res) => {
  const sql = `
    SELECT sp.id, sp.firstname, sp.lastname, sp.subject_id, s.name AS subject_name, s.code AS subject_code,
           sp.place_id, p.name AS place_name, p.row, p.column
    FROM seating_plans sp
    JOIN subjects s ON sp.subject_id = s.id
    JOIN places p ON sp.place_id = p.id
  `;
  db.all(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ... další CRUD seating_plans ...

module.exports = router;
