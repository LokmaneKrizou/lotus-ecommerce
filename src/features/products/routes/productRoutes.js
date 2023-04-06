const express = require('express');
const router = express.Router();
const productController = require('../controller/productController');
const authMiddleware = require('../../../middleware/authMiddleware');


router.get('/search', productController.searchProducts);
router.get('/categories', productController.getCategories);
router.get('/', productController.getAllProducts);
router.post('/create',authMiddleware, productController.createProduct);
router.get('/:productId', productController.getProductById);
router.put('/:productId',authMiddleware, authMiddleware, productController.updateProduct);
router.delete('/:productId',authMiddleware, authMiddleware, productController.deleteProduct);

module.exports = router;