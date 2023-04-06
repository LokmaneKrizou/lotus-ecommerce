const {CartNotFoundException, CartAlreadyExistsForUserException, InvalidCartBodyException} = require("../exceptions");
const Cart = require("../model/cart");

class CartRepository {

    async createCart(userId, cartData) {
        try {
            return await Cart.create({
                user: userId,
                items: cartData.items,
                total: cartData.total,
            });
        } catch (err) {
            if (err.code === 11000) {
                throw new CartAlreadyExistsForUserException();
            }
            throw new InvalidCartBodyException(err.message);
        }
    }

    async updateCart(cartId, cartData) {
        try {
            const updatedCart = await Cart.findByIdAndUpdate(cartId, cartData, {new: true});
            if (!updatedCart) {
                throw new CartNotFoundException(userId);
            }
            return updatedCart;
        } catch (err) {
            throw new InvalidCartBodyException(err.message);
        }
    }

    async getCartByUserId(userId) {
        try {
            const cart = await Cart.findOne({user: userId}).populate({
                path: "items.product",
                model: "Product",
            });
            if (!cart) {
                throw new CartNotFoundException(userId);
            }
            return cart;
        } catch (err) {
            throw err
        }
    }

    async deleteCart(cartId) {
        const deletedCart = await Cart.findByIdAndDelete(cartId);
        if (!deletedCart) {
            throw new CartNotFoundException(cartId);
        }
        return deletedCart;
    }

    async searchCarts(query, cursor, limit) {
        if (cursor) {
            query['_id'] = {'$gt': cursor}
        }
        return Cart.find({...query}).populate('user')
            .populate({
                path: "items.product",
                model: "Product",
            })
            .limit(limit + 1);
    }
}

module.exports = new CartRepository();
