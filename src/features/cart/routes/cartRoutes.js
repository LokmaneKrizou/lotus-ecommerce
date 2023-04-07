const express = require('express');
const router = express.Router();
const authMiddleware = require('../../../middleware/authMiddleware');
const cartController = require('../controller/cartController')

router.use(authMiddleware)
router.post('/create', cartController.createCart);
router.get('/me', cartController.getMyCart);
router.get('/user/:userId', cartController.getCartByUserId);
router.put('/:cartId', cartController.updateCart);
router.delete('/:cartId', cartController.deleteCart);
router.get('/:cartId', cartController.getCartById);
router.get('/', cartController.searchCarts);

module.exports = router;