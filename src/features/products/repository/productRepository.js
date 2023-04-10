const {
    ProductNotFoundException,
    ProductAlreadyExistsException,
    InvalidProductBodyException
} = require('../exceptions');
const Product = require('../model/product');
const {BadRequestException} = require("../../../common/exceptions");

class ProductRepository {
    async createProduct(product) {
        try {
            return await Product.create(product);
        } catch (err) {
            if (err.code === 11000) {
                throw new ProductAlreadyExistsException(product.name);
            }
            throw new InvalidProductBodyException(err.message);
        }
    }

    async getProductById(productId) {
        const product = await Product.findById(productId).select('-searchCount');
        if (!product) {
            throw new ProductNotFoundException(productId);
        }
        return product;
    }

    async updateProduct(productId, updatedProduct) {
        const product = await Product.findByIdAndUpdate(productId, updatedProduct, {new: true}).select('-searchCount');
        if (!product) {
            throw new ProductNotFoundException(productId);
        }
        return product;
    }

    async deleteProduct(productId) {
        const deletedProduct = await Product.findByIdAndDelete(productId).select('-searchCount');
        if (!deletedProduct) {
            throw new ProductNotFoundException(productId);
        }
        return deletedProduct;
    }

    async searchProducts(query, cursor, limit) {
        if (cursor) {
            query['_id'] = {'$gt': cursor}
        }
        const products = await Product.find({...query})
            .limit(limit + 1);
        products.map(async (product) => {
            product.searchCount++;
            return await product.save();
        });
        await Promise.all(products);
        return products.map(product => {
            const {searchCount, __v, ...rest} = product.toObject();
            return rest;
        });
    }

    async mostSearchedProducts(limit) {
        try {
            return await Product.find().sort({searchCount: -1}).select('-searchCount').limit(limit);
        } catch (error) {
            throw new BadRequestException('Failed to fetch most searched products')
        }
    }

    async getNewArrivals(limit) {
        try {
            return await Product.find().sort({createdAt: -1}).select('-searchCount').limit(limit);

        } catch (error) {
            throw new BadRequestException('Failed to fetch new arrivals')
        }
    };
}

module.exports = new ProductRepository();
