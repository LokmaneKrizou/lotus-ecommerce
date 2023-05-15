const express = require('express');
const router = express.Router();
const authMiddleware = require('../../../middleware/authMiddleware');
const cartController = require('../controller/cartController')
const optionalAuthMiddleware = async (req, res, next) => {
    await authMiddleware(req, res, (err) => {
        if (err && err.name !== 'UnauthorizedException') {
            return next(err);
        }
        next();
    });
};
router.post('/handleCartOptions', authMiddleware, cartController.handleCartOptions);
router.post('/create', optionalAuthMiddleware, cartController.createCart);
router.get('/me', authMiddleware, cartController.getMyCart);
router.put('/:cartId', optionalAuthMiddleware, cartController.updateCart);
router.delete('/:cartId', optionalAuthMiddleware, cartController.deleteCart);
router.get('/:cartId', optionalAuthMiddleware, cartController.getCartById);
router.get('/user/:userId', authMiddleware, cartController.getCartByUserId);
router.get('/', authMiddleware, cartController.searchCarts);

module.exports = router;