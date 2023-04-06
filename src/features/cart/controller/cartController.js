const cartRepository = require('../repository/cartRepository');
const {CartAlreadyExistsForUserException, InvalidCartBodyException} = require('../exceptions');
const {base64ToString, stringToBase64} = require("../../../common/utils/base64");
const {BadRequestException} = require("../../../common/exceptions");

class CartController {
    async createCart(req, res, next) {
        const userId = req.params.userId;
        const cartData = req.body;
        try {
            if (!userId || !cartData) {
                throw new InvalidCartBodyException("items or total missing in cart body")
            }
            const cart = await cartRepository.createCart(userId, cartData);
            res.status(201).json(cart);
        } catch (err) {
            if (err instanceof CartAlreadyExistsForUserException) {
                res.status(409).json({message: err.message});
            } else if (err instanceof InvalidCartBodyException) {
                res.status(400).json({message: err.message});
            } else {
                next(err);
            }
        }
    }

    async updateCart(req, res, next) {
        const cartId = req.params.cartId;
        const cartData = req.body;
        try {
            if (!cartId || !cartData) {
                throw new InvalidCartBodyException("items or total missing in cart body")
            }
            const updatedCart = await cartRepository.updateCart(cartId, cartData);
            res.json(updatedCart);
        } catch (err) {
            next(err);
        }
    }

    async getCartByUserId(req, res, next) {
        const userId = req.userId;
        try {
            const cart = await cartRepository.getCartByUserId(userId);
            res.json(cart);
        } catch (err) {
            next(err);
        }
    }

    async deleteCart(req, res, next) {
        const cartId = req.params.cartId;
        try {
            if (!cartId) {
                throw new BadRequestException("we need cart id to perform this action")
            }
            const deletedCart = await cartRepository.deleteCart(cartId);
            res.json(deletedCart);
        } catch (err) {
            next(err);
        }
    }

    async searchCarts(req, res, next) {
        try {
            const {query, cursor, limit} = req.query;
            const decodedCursor = cursor ? base64ToString(cursor) : null
            const carts = await cartRepository.searchCarts(query ? query : {}, decodedCursor, limit);
            const hasNextPage = carts.length > limit;
            if (hasNextPage) {
                carts.pop();
            }
            const endCursor = hasNextPage ? stringToBase64(carts[carts.length - 1]._id) : null;
            res.status(200).json({
                carts,
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

module.exports = new CartController();
