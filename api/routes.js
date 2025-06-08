const express = require('express');
const db = require('../database/db');
const router = express.Router();

// Předměty
router.get('/subjects', (req, res) => {
  db.all("SELECT * FROM subjects", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/subjects', (req, res) => {
  const { name, code } = req.body;
  db.run("INSERT INTO subjects (name, code) VALUES (?, ?)", [name, code], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

router.put('/subjects/:id', (req, res) => {
  const { id } = req.params;
  const { name, code } = req.body;
  db.run(
    "UPDATE subjects SET name = ?, code = ? WHERE id = ?",
    [name, code, id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Předmět nebyl nalezen' });
      }
      res.json({ message: 'Předmět byl aktualizován' });
    }
  );
});

router.delete('/subjects/:id', (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM subjects WHERE id = ?", [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Předmět nebyl nalezen' });
    }
    res.json({ message: 'Předmět byl smazán' });
  });
});

// Místa
router.get('/places/available', (req, res) => {
  const { subject_id } = req.query;
  db.all(`
    SELECT p.* FROM places p
    WHERE NOT EXISTS (
      SELECT 1 FROM seating_plans sp
      WHERE sp.place_id = p.id AND sp.subject_id = ?
    )
  `, [subject_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Zasedací pořádek
router.get('/seating', (req, res) => {
  const { subject_id } = req.query;
  db.all(`
    SELECT sp.id, sp.firstname, sp.lastname, p.row, p.column 
    FROM seating_plans sp
    JOIN places p ON sp.place_id = p.id
    WHERE sp.subject_id = ?
    ORDER BY p.row, p.column
  `, [subject_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/seating', (req, res) => {
  const { subject_id, place_id, firstname, lastname } = req.body;
  db.run(`
    INSERT INTO seating_plans (subject_id, place_id, firstname, lastname)
    VALUES (?, ?, ?, ?)
  `, [subject_id, place_id, firstname, lastname], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

router.delete('/seating/:id', (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM seating_plans WHERE id = ?", [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Žák nebyl nalezen' });
    }
    res.json({ message: 'Žák byl odebrán' });
  });
});

module.exports = router;