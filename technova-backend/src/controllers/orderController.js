const pool = require('../config/database');

// Obtener todas las órdenes del usuario
const getOrders = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT o.*,
              json_agg(
                json_build_object(
                  'id', oi.id,
                  'product_id', oi.product_id,
                  'name', p.name,
                  'quantity', oi.quantity,
                  'price', oi.price,
                  'image_url', p.image_url
                )
              ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// Obtener una orden específica
const getOne = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT o.*,
              json_agg(
                json_build_object(
                  'id', oi.id,
                  'product_id', oi.product_id,
                  'name', p.name,
                  'quantity', oi.quantity,
                  'price', oi.price,
                  'image_url', p.image_url
                )
              ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.id = $1 AND o.user_id = $2
       GROUP BY o.id`,
      [id, req.user.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Crear una nueva orden desde el carrito actual
const create = async (req, res, next) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { shipping_address, payment_method } = req.body;

    if (!shipping_address || !payment_method) {
      return res.status(400).json({ error: 'Dirección de envío y método de pago son requeridos' });
    }

    // Obtener los items del carrito con precios actuales
    const cartResult = await client.query(
      `SELECT ci.product_id, ci.quantity, p.price, p.name, p.stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1 AND p.active = true`,
      [req.user.id]
    );

    if (cartResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'El carrito está vacío' });
    }

    // Verificar stock para todos los items
    for (const item of cartResult.rows) {
      if (item.stock < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          error: `Stock insuficiente para "${item.name}". Disponible: ${item.stock}`
        });
      }
    }

    // Calcular total
    const total = cartResult.rows.reduce(
      (sum, item) => sum + (parseFloat(item.price) * item.quantity),
      0
    );

    // Crear la orden
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total_amount, shipping_address, payment_method, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
      [req.user.id, total, JSON.stringify(shipping_address), payment_method]
    );

    const order = orderResult.rows[0];

    // Crear los items de la orden y descontar stock
    for (const item of cartResult.rows) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [order.id, item.product_id, item.quantity, item.price]
      );

      await client.query(
        'UPDATE products SET stock = stock - $1, updated_at = NOW() WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    // Vaciar el carrito
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);

    await client.query('COMMIT');

    res.status(201).json({
      ...order,
      items: cartResult.rows
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

module.exports = { getOrders, getOne, create };
