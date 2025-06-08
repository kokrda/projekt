const db = require('./db');

// Předdefinovaná data
const initData = async () => {
  try {
    // Předměty
    await db.run("INSERT INTO subjects (name, code) VALUES ('Matematika', 'MAT'), ('Čeština', 'CJL')");
    
    // Místa (6x5 grid)
    const places = [];
    for (let row = 1; row <= 5; row++) {
      for (let col = 1; col <= 6; col++) {
        places.push(`('${String.fromCharCode(64 + row)}${col}', ${row}, ${col})`);
      }
    }
    await db.run(`INSERT INTO places (name, row, column) VALUES ${places.join(',')}`);
    
    console.log('✅ Databáze inicializována');
  } catch (err) {
    console.error('❌ Chyba při inicializaci:', err.message);
  }
};

initData();