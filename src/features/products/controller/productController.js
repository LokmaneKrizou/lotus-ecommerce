const productRepository = require('../repository/productRepository');
const {stringToBase64, base64ToString} = require('../../../common/utils/base64')
const {InvalidProductBodyException} = require("../exceptions");

class ProductController {
    async createProduct(req, res, next) {
        try {
            const {title, description, price, images, category} = req.body
            if (!title || !price || !description || !images || !category) {
                throw new InvalidProductBodyException('Product name, price, images, category and description cannot be empty.');
            }
            const product = await productRepository.createProduct(req.body);
            res.status(201).json({success: true, message: 'Product created successfully', data: product});
        } catch (err) {
            next(err);
        }
    }

    async getProductById(req, res, next) {
        try {
            const productId = req.params.productId
            if (!productId) {
                throw new InvalidProductBodyException('Product ID param is not passed correctly.');
            }
            const product = await productRepository.getProductById(productId);
            res.status(200).json({success: true, data: product});
        } catch (err) {
            next(err);
        }
    }

    async updateProduct(req, res, next) {
        try {

            const productId = req.params.productId
            if (!productId) {
                throw new InvalidProductBodyException('Product ID param is not passed correctly.');
            }
            const product = await productRepository.updateProduct(productId, req.body);
            res.status(200).json({success: true, message: 'Product updated successfully', data: product});
        } catch (err) {
            next(err);
        }
    }

    async deleteProduct(req, res, next) {
        try {
            const productId = req.params.productId
            if (!productId) {
                throw new InvalidProductBodyException('Product ID param is not passed correctly.');
            }
            const deletedProduct = await productRepository.deleteProduct(productId);
            res.status(200).json({success: true, message: 'Product deleted successfully', data: deletedProduct});
        } catch (err) {
            next(err);
        }
    }

    async searchProducts(req, res, next) {
        try {
            const {query, cursor, limit} = req.query;
            const queryObject = query ? {title: {$regex: new RegExp(`\\b${query}\\b`, 'i')}} : {};
            const decodedCursor =cursor? base64ToString(cursor) :null
            const products = await productRepository.searchProducts(queryObject, decodedCursor, parseInt(limit));
            const hasNextPage = products.length > limit;
            if (hasNextPage) {
                products.pop();
            }
            const endCursor = hasNextPage ? stringToBase64(products[products.length - 1]._id) : null;
            res.status(200).json({
                products,
                pageInfo: {
                    endCursor: endCursor,
                    hasNextPage,
                },
            });
        } catch (err) {
            next(err);
        }
    }

    async getAllProducts(req, res, next) {
        try {
            const {cursor, limit} = req.query;
            const decodedCursor =cursor? base64ToString(cursor) :null
            const products = await productRepository.searchProducts({},decodedCursor, parseInt(limit));
            const hasNextPage = products.length > limit;
            if (hasNextPage) {
                products.pop();
            }
            const endCursor = hasNextPage ? stringToBase64(products[products.length - 1]._id) : null;
            res.status(200).json({
                products,
                pageInfo: {
                    endCursor: endCursor,
                    hasNextPage,
                },
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new ProductController();
