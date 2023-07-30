const cartRepository = require('../repository/cartRepository');
const {CartAlreadyExistsForUserException, InvalidCartBodyException, CartNotFoundException} = require('../exceptions');
const {base64ToString, stringToBase64} = require("../../../common/utils/base64");
const {BadRequestException, UnauthorizedException} = require("../../../common/exceptions");
const CartOptions = require("../enums/cartOptions");

class CartController {
    async createCart(req, res, next) {
        const userId = req.userId || null;
        const {items} = req.body;
        try {
            if (!items) {
                throw new InvalidCartBodyException("items missing in cart body")
            }
            const cart = await cartRepository.createCart(userId, items);
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
        const userId = req.userId || null;
        const cartId = req.params.cartId;
        const {items} = req.body;
        try {
            if (!items) {
                throw new InvalidCartBodyException("missing cart body")
            }
            const cart = await cartRepository.getCartById(cartId);
            const userCart = cart.user ? cart.user.toString() : null
            if (userCart === userId) {
                const updatedCart = await cartRepository.updateCart(cartId, {items: items, user: userId});
                res.json(updatedCart);
            } else {
                throw new BadRequestException("You don't have permission to modify this cart")
            }
        } catch (err) {
            next(err);
        }
    }

    async handleCartOptions(req, res, next) {
        const userId = req.userId;
        const {option, localCartId} = req.body;
        const userCart = await cartRepository.getCartByUserId(userId);
        const localCart = await cartRepository.getCartById(localCartId);
        try {
            switch (option) {
                case CartOptions.KEEP: {
                    await cartRepository.deleteCart(localCartId);
                    res.json(userCart ? userCart : null);
                    break;
                }
                case CartOptions.USE_NEW: {
                    if (userCart) {
                        await cartRepository.deleteCart(userCart._id);
                    }
                    console.log(JSON.stringify(localCart.items))
                    const newCart = await cartRepository.createCart(userId, localCart.items);
                    await cartRepository.deleteCart(localCartId);
                    res.json(newCart);
                    break;
                }
                case CartOptions.MERGE: {
                    if (localCart && userCart) {
                        const currentItems = userCart.items;
                        const localItems = localCart.items;
                        const itemsMap = new Map();
                        currentItems.forEach(item => {
                            const variantSelections = JSON.stringify(item.variantSelections.sort((a, b) => a.name.localeCompare(b.name) || a.value.localeCompare(b.value)));
                            const key = `${item.product}_${variantSelections}`;
                            itemsMap.set(key, item);
                        });
                        localItems.forEach(item => {
                            const variantSelections = JSON.stringify(item.variantSelections.sort((a, b) => a.name.localeCompare(b.name) || a.value.localeCompare(b.value)));
                            const key = `${item.product}_${variantSelections}`;
                            if (itemsMap.has(key)) {
                                const existingItem = itemsMap.get(key);
                                existingItem.quantity = existingItem.quantity + item.quantity;
                                itemsMap.set(key, existingItem);
                            } else {
                                itemsMap.set(key, item);
                            }
                        });
                        const mergedItems = Array.from(itemsMap.values());
                        const updatedUserCart = await cartRepository.updateCart(userCart._id, {items: mergedItems});
                        await cartRepository.deleteCart(localCartId);
                        res.json(updatedUserCart);
                    } else if (localCart) {
                        const newCart = await cartRepository.createCart(userId, localCart.items);
                        await cartRepository.deleteCart(localCartId);
                        res.json(newCart);
                    } else {
                        next(new CartNotFoundException('Cart is Empty'))
                    }
                    break;
                }

                default:
                    next(new BadRequestException('Invalid cart option provided'));
            }
        } catch (err) {
            next(err);
        }
    }


    async getMyCart({userId}, res, next) {
        try {
            const cart = await cartRepository.getCartByUserIdWithPopulatedInfo(userId);
            res.json(cart);
        } catch (err) {
            next(err);
        }
    }

    async getCartByUserId({params: {userId}}, res, next) {
        try {
            const cart = await cartRepository.getCartByUserId(userId);
            res.json(cart);
        } catch (err) {
            next(err);
        }
    }

    async getCartById({params: {cartId}}, res, next) {
        try {
            if (!cartId) {
                throw new BadRequestException("we need cart id to perform this action")
            }
            const cart = await cartRepository.getCartByIdWithPopulatedInfo(cartId);
            res.json(cart);
        } catch (err) {
            next(err);
        }
    }

    async deleteCart({params: {cartId}}, res, next) {
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

    async searchCarts({query: {query, cursor, limit}}, res, next) {
        try {
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
