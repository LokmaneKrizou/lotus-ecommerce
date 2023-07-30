const productRepository = require('../repository/productRepository');
const {stringToBase64, base64ToString} = require('../../../common/utils/base64')
const {InvalidProductBodyException} = require("../exceptions");
const Category = require("../enums/category");
const redisClient = require("../../../cache");
const Product = require("../model/product");

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

    async getMostSearchedProducts({query: {limit}}, res, next) {
        try {
            const products = await productRepository.mostSearchedProducts(limit)
            res.status(200).json(products);
        } catch (error) {
            next(error)
        }
    }

    async searchProducts(req, res, next) {
        try {
            const {query, cursor, limit} = req.query;

            const regexPattern = new RegExp(`\\b(${query})\\b`, 'i');

            const queryObject = query ? {
                $or: [
                    {title: {$regex: regexPattern}},
                    {description: {$regex: regexPattern}},
                    {'variants.name': {$regex: regexPattern}},
                    {'variants.options.value': {$regex: regexPattern}}
                ]
            } : {};

            // Cache Key
            const cacheKey = cursor ? `search:${query}:${cursor}:${limit}` : `search:${query}:${limit}`;

            // Try getting data from Redis cache
            const cacheData = await redisClient.get(cacheKey);
            if (cacheData) {
                return res.status(200).json(JSON.parse(cacheData));
            }

            // If no cache, proceed with search
            const decodedCursor = cursor ? base64ToString(cursor) : null;
            const products = await productRepository.searchProducts(queryObject, decodedCursor, parseInt(limit));
            const hasNextPage = products.length > limit;
            if (hasNextPage) {
                products.pop();
            }
            const endCursor = hasNextPage ? stringToBase64(products[products.length - 1]._id) : null;

            // Prepare response
            const response = {
                products,
                pageInfo: {
                    endCursor: endCursor,
                    hasNextPage,
                },
            };

            // Cache the data in Redis with an expiry time (for example, 10 minutes = 600 seconds)
            await redisClient.set(cacheKey, JSON.stringify(response), 'EX', 600);

            return res.status(200).json(response);
        } catch (err) {
            next(err);
        }
    }

    async getSuggestions(req, res, next) {
        try {
            const {query} = req.query;

            // Convert to regex and create a pattern that will search for any match in the title
            const regex = new RegExp(`^${query}`, 'i');
            const queryObject = {title: regex};

            // Cache Key
            const cacheKey = `suggestions:${query}`;

            // Try getting data from Redis cache
            const cacheData = await redisClient.get(cacheKey);
            if (cacheData) {
                return res.status(200).json(JSON.parse(cacheData));
            }

            // If no cache, proceed with search
            const products = await productRepository.searchProducts(queryObject, null, 5);
            const suggestions = products.map(product => product.title);

            // Cache the data in Redis with an expiry time (for example, 10 minutes = 600 seconds)
            await redisClient.set(cacheKey, JSON.stringify(suggestions), 'EX', 600);

            return res.status(200).json(suggestions);
        } catch (err) {
            next(err);
        }
    }

    async getAllProducts(req, res, next) {
        try {
            const {cursor, limit} = req.query;
            const decodedCursor = cursor ? base64ToString(cursor) : null
            const products = await productRepository.searchProducts({}, decodedCursor, parseInt(limit));
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

    async getCategories(req, res, next) {
        try {
            const categoryList = Object.values(Category);
            res.status(200).json({
                categories: categoryList
            })
        } catch (err) {
            next(err)
        }
    }

    async getNewArrivals({query: {limit}}, res, next) {
        try {
            const products = await productRepository.getNewArrivals(limit);
            res.status(200).json({products})
        } catch (err) {
            next(err)
        }
    }
}

module.exports = new ProductController();
