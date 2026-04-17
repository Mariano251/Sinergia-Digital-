const pool = require('../config/database');
const axios = require('axios');

// POST /api/webhook/cart-abandoned
// Endpoint para disparar manualmente el webhook de carrito abandonado
// También es llamado por el job automático del backend
const cartAbandoned = async (req, res, next) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id es requerido' });
    }

    // Obtener datos del usuario
    const userResult = await pool.query(
      'SELECT id, name, email, telegram_chat_id FROM users WHERE id = $1',
      [user_id]
    );

    if (!userResult.rows[0]) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = userResult.rows[0];

    // Obtener los items actuales del carrito
    const cartResult = await pool.query(
      `SELECT p.name, ci.quantity, p.price
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1 AND p.active = true`,
      [user_id]
    );

    if (cartResult.rows.length === 0) {
      return res.status(400).json({ error: 'El carrito está vacío' });
    }

    const cartValue = cartResult.rows.reduce(
      (sum, item) => sum + (parseFloat(item.price) * item.quantity),
      0
    );

    const cartId   = `cart_${user_id}_${Date.now()}`;
    const checkoutUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout`;

    // Payload exacto que espera n8n
    const payload = {
      customer_id:     user.id,
      name:            user.name,
      email:           user.email,
      telegram_chat_id: user.telegram_chat_id,
      cart_value:      cartValue,
      cart: {
        cart_id:      cartId,
        checkout_url: checkoutUrl,
        items: cartResult.rows.map(item => ({
          name:     item.name,
          quantity: item.quantity,
          price:    parseFloat(item.price)
        }))
      }
    };

    // Enviar el webhook a n8n
    await axios.post(process.env.N8N_WEBHOOK_URL, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000
    });

    // Marcar el carrito como notificado para no enviar duplicados
    await pool.query(
      'UPDATE cart_items SET abandoned_notified = true WHERE user_id = $1',
      [user_id]
    );

    console.log(`📨 Webhook de carrito abandonado enviado para ${user.email} - Valor: $${cartValue}`);

    res.json({
      message: 'Webhook de carrito abandonado enviado correctamente',
      user_email: user.email,
      cart_value: cartValue,
      items_count: cartResult.rows.length
    });
  } catch (err) {
    // Si el webhook de n8n falla, lo loggeamos pero no rompemos el flujo
    if (err.code === 'ECONNREFUSED' || err.response) {
      console.error('Error al conectar con n8n:', err.message);
      return res.status(502).json({
        error: 'No se pudo conectar con el servicio de notificaciones (n8n)',
        detail: err.message
      });
    }
    next(err);
  }
};

module.exports = { cartAbandoned };
