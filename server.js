const express = require('express');
const path = require('path');
const cors = require('cors'); // Přidáno pro CORS
const apiRouter = require('./api/routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Povolení CORS pro všechny routy
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', apiRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Nastala chyba na serveru' });
});

// Fallback route pro SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start serveru
app.listen(PORT, () => {
  console.log(`Server běží na http://localhost:${PORT}`);
});