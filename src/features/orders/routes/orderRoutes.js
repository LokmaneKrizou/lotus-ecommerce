const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');
const authMiddleware = require('../../../middleware/authMiddleware');
const optionalAuthMiddleware = async (req, res, next) => {
    await authMiddleware(req, res, (err) => {
        if (err && err.name !== 'UnauthorizedException') {
            return next(err);
        }
        next();
    });
};
router.post('/create', optionalAuthMiddleware, orderController.createOrder);
router.use(authMiddleware)
router.get('/me', orderController.getMyOrders);
router.get('/cancel/:orderId', orderController.cancelOrder);
router.get('/:orderId', orderController.getOrderById);
router.put('/:orderId', orderController.updateOrder);
router.delete('/:orderId', orderController.deleteOrder);
router.get('/user/:userId', orderController.getOrdersByUserId);
router.get('/', orderController.getAllOrders);
router.get('/search', orderController.searchOrders);

module.exports = router;