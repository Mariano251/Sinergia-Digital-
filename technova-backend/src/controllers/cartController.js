const pool = require('../config/database');

// Obtener el carrito del usuario con detalles de productos
const getCart = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT ci.id, ci.quantity, ci.created_at, ci.updated_at,
              p.id as product_id, p.name, p.price, p.image_url, p.stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1 AND p.active = true
       ORDER BY ci.created_at DESC`,
      [req.user.id]
    );

    const items = result.rows;
    const total = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

    res.json({ items, total });
  } catch (err) {
    next(err);
  }
};

// Agregar un producto al carrito
const addItem = async (req, res, next) => {
  try {
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: 'product_id es requerido' });
    }

    // Verificar que el producto existe y tiene stock
    const product = await pool.query(
      'SELECT * FROM products WHERE id = $1 AND active = true',
      [product_id]
    );

    if (!product.rows[0]) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    if (product.rows[0].stock < quantity) {
      return res.status(400).json({ error: 'Stock insuficiente' });
    }

    // Si ya existe en el carrito, sumar cantidad
    const existing = await pool.query(
      'SELECT * FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [req.user.id, product_id]
    );

    let item;
    if (existing.rows[0]) {
      const result = await pool.query(
        `UPDATE cart_items
         SET quantity = quantity + $1, updated_at = NOW(), abandoned_notified = false
         WHERE user_id = $2 AND product_id = $3
         RETURNING *`,
        [quantity, req.user.id, product_id]
      );
      item = result.rows[0];
    } else {
      const result = await pool.query(
        `INSERT INTO cart_items (user_id, product_id, quantity)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [req.user.id, product_id, quantity]
      );
      item = result.rows[0];
    }

    // Resetear flag de abandono porque el usuario está activo
    await pool.query(
      'UPDATE cart_items SET abandoned_notified = false WHERE user_id = $1',
      [req.user.id]
    );

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

// Actualizar cantidad de un item
const updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      await pool.query(
        'DELETE FROM cart_items WHERE id = $1 AND user_id = $2',
        [id, req.user.id]
      );
      return res.json({ message: 'Item eliminado del carrito' });
    }

    const result = await pool.query(
      `UPDATE cart_items
       SET quantity = $1, updated_at = NOW()
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [quantity, id, req.user.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Item no encontrado en el carrito' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Eliminar un item del carrito
const removeItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    await pool.query(
      'DELETE FROM cart_items WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    res.json({ message: 'Item eliminado del carrito' });
  } catch (err) {
    next(err);
  }
};

// Vaciar todo el carrito
const clearCart = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);
    res.json({ message: 'Carrito vaciado' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
