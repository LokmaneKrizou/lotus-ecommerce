const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');
const authMiddleware = require('../../../middleware/authMiddleware');
router.use(authMiddleware)
router.post('/create', orderController.createOrder);
router.get('/:orderId', orderController.getOrderById);
router.put('/:orderId', orderController.updateOrder);
router.delete('/:orderId', orderController.deleteOrder);
router.get('/user/:userId', orderController.getOrdersByUserId);
router.get('/', orderController.getAllOrders);
router.get('/search', orderController.searchOrders);

module.exports = router;