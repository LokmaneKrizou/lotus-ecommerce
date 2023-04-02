const { CartNotFoundException, InvalidCartBodyException } = require("../exceptions");
const Cart = require("../model/cart");

class CartRepository {
    async createOrUpdateCart(userId, cartData) {
        try {
            const existingCart = await Cart.findOne({ user: userId });

            if (existingCart) {
                existingCart.items = cartData.items;
                existingCart.total = cartData.total;

                return await existingCart.save();
            } else {
                const cart = new Cart({
                    user: userId,
                    items: cartData.items,
                    total: cartData.total,
                });

                return await cart.save();
            }
        } catch (err) {
            throw new InvalidCartBodyException(err.message);
        }
    }

    async getCartByUserId(userId) {
        const cart = await Cart.findOne({ user: userId }).populate({
            path: "items.product",
            model: "Product",
        });

        if (!cart) {
            throw new CartNotFoundException(userId);
        }

        return cart;
    }

    async deleteCart(userId) {
        const deletedCart = await Cart.findOneAndDelete({ user: userId });

        if (!deletedCart) {
            throw new CartNotFoundException(userId);
        }

        return deletedCart;
    }
}

module.exports = new CartRepository();
