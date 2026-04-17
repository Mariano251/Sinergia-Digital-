const router = require('express').Router();
const { getOrders, getOne, create } = require('../controllers/orderController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/',    getOrders);
router.get('/:id', getOne);
router.post('/',   create);

module.exports = router;
