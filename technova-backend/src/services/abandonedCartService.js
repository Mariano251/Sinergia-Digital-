const pool = require('../config/database');
const axios = require('axios');

// Buscar y procesar carritos abandonados (inactivos +2 min, no notificados)
const processAbandonedCarts = async () => {
  try {
    // Detectar usuarios que tienen ALGÚN item sin notificar e inactivo +2 min.
    // Solo se consideran items con webhook_sent = false para evitar acumular
    // sesiones anteriores que ya fueron notificadas.
    const result = await pool.query(`
      SELECT DISTINCT u.id, u.name, u.email, u.telegram_chat_id
      FROM cart_items ci
      JOIN users u ON ci.user_id = u.id
      WHERE ci.webhook_sent = false
        AND ci.updated_at < NOW() - INTERVAL '2 minutes'
    `);

    if (result.rows.length === 0) return;

    console.log(`🛒 Encontrados ${result.rows.length} carrito(s) abandonado(s)`);

    for (const user of result.rows) {
      try {
        // Traer SOLO los items de la sesión actual: webhook_sent = false.
        // Esto excluye ítems de sesiones anteriores ya notificadas.
        const cartResult = await pool.query(
          `SELECT p.name, ci.quantity, p.price
           FROM cart_items ci
           JOIN products p ON ci.product_id = p.id
           WHERE ci.user_id = $1
             AND ci.webhook_sent = false
             AND ci.updated_at < NOW() - INTERVAL '2 minutes'
             AND p.active = true`,
          [user.id]
        );

        if (cartResult.rows.length === 0) continue;

        const cartValue   = cartResult.rows.reduce(
          (sum, item) => sum + (parseFloat(item.price) * item.quantity), 0
        );
        const cartId      = `cart_${user.id}_${Date.now()}`;
        const checkoutUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout`;

        const payload = {
          customer_id:      user.id,
          name:             user.name,
          email:            user.email,
          telegram_chat_id: user.telegram_chat_id,
          cart_value:       cartValue,
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

        // Enviar a n8n
        await axios.post(process.env.N8N_WEBHOOK_URL, payload, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000
        });

        // Marcar SOLO los items de esta sesión como notificados.
        // Items nuevos que el usuario agregue después tendrán webhook_sent = false
        // y serán detectados como un nuevo carrito abandonado en el próximo ciclo.
        await pool.query(
          'UPDATE cart_items SET webhook_sent = true WHERE user_id = $1 AND webhook_sent = false',
          [user.id]
        );

        console.log(`📨 Webhook enviado para ${user.email} — ${cartResult.rows.length} item(s), $${cartValue.toFixed(2)}`);
      } catch (userErr) {
        console.error(`❌ Error procesando carrito de ${user.email}:`, userErr.message);
      }
    }
  } catch (err) {
    console.error('❌ Error en el job de carritos abandonados:', err.message);
  }
};

// Inicializar el job que corre cada 5 minutos
const setupAbandonedCartJob = () => {
  const INTERVAL_MS = 5 * 60 * 1000; // 5 minutos

  console.log('⏰ Job de carritos abandonados iniciado (intervalo: 5 min)');

  // Primera ejecución a los 30 segundos de iniciar el servidor
  setTimeout(processAbandonedCarts, 30 * 1000);

  // Luego cada 5 minutos
  setInterval(processAbandonedCarts, INTERVAL_MS);
};

module.exports = { setupAbandonedCartJob, processAbandonedCarts };
