const { Pool } = require('pg');

// Esta instancia de PostgreSQL en Render REQUIERE SSL.
// rejectUnauthorized: false acepta el certificado auto-firmado de Render.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Verificar la conexión al iniciar
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error conectando a PostgreSQL:', err.message);
    return;
  }
  release();
  console.log('✅ Conectado a PostgreSQL correctamente');
});

module.exports = pool;
