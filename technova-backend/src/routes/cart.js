const router = require('express').Router();
const { getCart, addItem, updateItem, removeItem, clearCart } = require('../controllers/cartController');
const auth = require('../middleware/auth');

// Todas las rutas del carrito requieren autenticación
router.use(auth);

router.get('/',          getCart);
router.post('/',         addItem);
router.put('/:id',       updateItem);
router.delete('/clear',  clearCart);   // Antes de /:id para no capturar "clear"
router.delete('/:id',    removeItem);

module.exports = router;
