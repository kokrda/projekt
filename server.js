const express = require('express');
const path = require('path');
const apiRouter = require('./api/api');  // Ujisti se, že tento soubor existuje

const app = express();

app.use(express.json());

// Připojíme API router pod /api
app.use('/api', apiRouter);

// Statické soubory z public/ - tam dej svůj index.html a další frontend
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server běží na http://localhost:${PORT}`);
});
