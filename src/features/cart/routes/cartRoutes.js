const express = require('express');
const router = express.Router();
const authMiddleware = require('../../../middleware/authMiddleware');
const cartController = require('../controller/cartController')

router.use(authMiddleware)
router.post('/', cartController.createCart);
router.put('/:cartId', cartController.updateCart);
router.get('/me', cartController.getCartByUserId);
router.delete('/:cartId', cartController.deleteCart);
router.get('/', cartController.searchCarts);

module.exports = router;