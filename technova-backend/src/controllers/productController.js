const pool = require('../config/database');

// Obtener todos los productos con filtros opcionales
const getAll = async (req, res, next) => {
  try {
    const { category, featured, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Construir query dinámicamente según los filtros
    let conditions = ['p.active = true'];
    const params = [];
    let i = 1;

    if (category) {
      conditions.push(`c.slug = $${i++}`);
      params.push(category);
    }

    if (featured === 'true') {
      conditions.push(`p.featured = true`);
    }

    if (search) {
      conditions.push(`(p.name ILIKE $${i} OR p.description ILIKE $${i})`);
      params.push(`%${search}%`);
      i++;
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // Contar total de resultados
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${whereClause}`,
      params
    );

    // Obtener productos paginados
    const result = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${whereClause}
       ORDER BY p.featured DESC, p.created_at DESC
       LIMIT $${i} OFFSET $${i + 1}`,
      [...params, parseInt(limit), offset]
    );

    const total = parseInt(countResult.rows[0].count);

    res.json({
      products: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    next(err);
  }
};

// Obtener un producto por ID
const getOne = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1 AND p.active = true`,
      [id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Crear un producto nuevo
const create = async (req, res, next) => {
  try {
    const { name, description, price, stock, category_id, image_url, featured } = req.body;

    if (!name || !price || !category_id) {
      return res.status(400).json({ error: 'Nombre, precio y categoría son requeridos' });
    }

    const result = await pool.query(
      `INSERT INTO products (name, description, price, stock, category_id, image_url, featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, description, parseFloat(price), parseInt(stock) || 0, category_id, image_url, featured || false]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Actualizar un producto
const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category_id, image_url, featured, active } = req.body;

    const result = await pool.query(
      `UPDATE products SET
        name        = COALESCE($1, name),
        description = COALESCE($2, description),
        price       = COALESCE($3, price),
        stock       = COALESCE($4, stock),
        category_id = COALESCE($5, category_id),
        image_url   = COALESCE($6, image_url),
        featured    = COALESCE($7, featured),
        active      = COALESCE($8, active),
        updated_at  = NOW()
       WHERE id = $9
       RETURNING *`,
      [name, description, price, stock, category_id, image_url, featured, active, id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Eliminar un producto (soft delete)
const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE products SET active = false, updated_at = NOW() WHERE id = $1 RETURNING id',
      [id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ message: 'Producto eliminado correctamente' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getOne, create, update, remove };
