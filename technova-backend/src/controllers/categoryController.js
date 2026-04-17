const pool = require('../config/database');

// Obtener todas las categorías con conteo de productos
const getAll = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT c.*, COUNT(p.id) FILTER (WHERE p.active = true) as product_count
       FROM categories c
       LEFT JOIN products p ON c.id = p.category_id
       GROUP BY c.id
       ORDER BY c.name`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// Crear una categoría
const create = async (req, res, next) => {
  try {
    const { name, slug, description } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: 'Nombre y slug son requeridos' });
    }

    const result = await pool.query(
      'INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3) RETURNING *',
      [name, slug, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, create };
