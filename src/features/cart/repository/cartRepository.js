const {CartNotFoundException, CartAlreadyExistsForUserException, InvalidCartBodyException} = require("../exceptions");
const Cart = require("../model/cart");
const populateUserWithoutPassword = require("../../../common/utils/populateUserWithoutPassword");

class CartRepository {

    async createCart(userId, cartItems) {
        try {
            const cart = await Cart.create({
                user: userId,
                items: cartItems
            });
            return (await cart.populate(populateUserWithoutPassword))
                .populate({
                    path: "items.product",
                    model: "Product",
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
            const updatedCart = await Cart.findByIdAndUpdate(cartId, cartData, {new: true})
                .populate(populateUserWithoutPassword)
                .populate({
                    path: "items.product",
                    model: "Product",
                });
            if (!updatedCart) {
                throw new CartNotFoundException(cartId);
            }
            return updatedCart;
        } catch (err) {
            throw new InvalidCartBodyException(err.message);
        }
    }

    async getCartByUserId(userId) {
        try {
            return await Cart.findOne({user: userId});
        } catch (err) {
            throw err
        }
    }

    async getCartByUserIdWithPopulatedInfo(userId) {
        try {
            const cart = await Cart.findOne({user: userId})
                .populate(populateUserWithoutPassword)
                .populate({
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

    async getCartById(cartId) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) {
                throw new CartNotFoundException(cartId);
            }
            return cart;
        } catch (err) {
            throw err
        }
    }

    async getCartByIdWithPopulatedInfo(cartId) {
        try {
            const cart = await Cart.findById(cartId)
                .populate(populateUserWithoutPassword)
                .populate({
                    path: "items.product",
                    model: "Product",
                });
            if (!cart) {
                throw new CartNotFoundException(cartId);
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
        return Cart.find({...query})
            .populate(populateUserWithoutPassword)
            .populate({
                path: "items.product",
                model: "Product",
            })
            .limit(limit + 1);
    }
}

module.exports = new CartRepository();
