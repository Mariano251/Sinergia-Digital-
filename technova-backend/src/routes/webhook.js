const router = require('express').Router();
const { cartAbandoned } = require('../controllers/webhookController');

// POST /api/webhook/cart-abandoned
// Recibe { user_id } y dispara el webhook de n8n
router.post('/cart-abandoned', cartAbandoned);

module.exports = router;
