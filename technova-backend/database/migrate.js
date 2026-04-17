require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const pool = require('../src/config/database');

const migrate = async () => {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

  try {
    await pool.query(sql);
    console.log('✅ Migración completada — tablas creadas correctamente');
  } catch (err) {
    console.error('❌ Error en la migración:', err.message);
    throw err;
  } finally {
    await pool.end();
  }
};

migrate().catch(process.exit.bind(process, 1));
