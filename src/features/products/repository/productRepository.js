const {
    ProductNotFoundException,
    ProductAlreadyExistsException,
    InvalidProductBodyException
} = require('../exceptions');
const Product = require('../model/product');

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
        const product = await Product.findById(productId);
        if (!product) {
            throw new ProductNotFoundException(productId);
        }
        return product;
    }

    async updateProduct(productId, updatedProduct) {
        const product = await Product.findByIdAndUpdate(productId, updatedProduct, {new: true});
        if (!product) {
            throw new ProductNotFoundException(productId);
        }
        return product;
    }

    async deleteProduct(productId) {
        const deletedProduct = await Product.findByIdAndDelete(productId);
        if (!deletedProduct) {
            throw new ProductNotFoundException(productId);
        }
        return deletedProduct;
    }

    async searchProducts(query, cursor, limit) {
        if (cursor) {
            query['_id'] = {'$gt': cursor}
        }
        return Product.find({...query})
            .limit(limit + 1);
    }
}

module.exports = new ProductRepository();
