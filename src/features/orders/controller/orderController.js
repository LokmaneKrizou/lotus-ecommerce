const orderRepository = require("../repository/orderRepository");
const {InvalidOrderBodyException} = require("../exceptions");

class OrderController {
    async createOrder(req, res, next) {
        try {
            const userId = req.userId
            const {products} = req.body;
            if (!userId || !Array.isArray(products) || products.length === 0) {
                throw new InvalidOrderBodyException(
                    "Invalid order body. Order must contain a valid userId and at least one product"
                );
            }
            const newOrder = {user: userId, ...req.body}
            const order = await orderRepository.createOrder(newOrder);
            res.status(201).json({
                success: true,
                message: "Order created successfully",
                data: order,
            });
        } catch (err) {
            next(err);
        }
    }

    async getOrderById(req, res, next) {
        try {
            const orderId = req.params.orderId;
            if (!orderId) {
                throw new InvalidOrderBodyException(
                    "Order ID param is not passed correctly."
                );
            }
            const order = await orderRepository.getOrderById(orderId);
            res.status(200).json({success: true, data: order});
        } catch (err) {
            next(err);
        }
    }

    async updateOrder(req, res, next) {
        try {
            const orderId = req.params.orderId;
            if (!orderId) {
                throw new InvalidOrderBodyException(
                    "Order ID param is not passed correctly."
                );
            }
            const updatedOrder = req.body;
            const order = await orderRepository.updateOrder(orderId, updatedOrder);
            res.status(200).json({
                success: true,
                message: "Order updated successfully",
                data: order,
            });
        } catch (err) {
            next(err);
        }
    }

    async deleteOrder(req, res, next) {
        try {
            const orderId = req.params.orderId;
            if (!orderId) {
                throw new InvalidOrderBodyException(
                    "Order ID param is not passed correctly."
                );
            }
            const deletedOrder = await orderRepository.deleteOrder(orderId);
            res.status(200).json({
                success: true,
                message: "Order deleted successfully",
                data: deletedOrder,
            });
        } catch (err) {
            next(err);
        }
    }

    async getOrdersByUserId(req, res, next) {
        try {
            const userId = req.params.userId;
            if (!userId) {
                throw new InvalidOrderBodyException(
                    "User ID param is not passed correctly."
                );
            }
            const orders = await orderRepository.getOrdersByUserId(userId);
            res.status(200).json({success: true, data: orders});
        } catch (err) {
            next(err);
        }
    }

    async getAllOrders(req, res, next) {
        try {
            const {cursor, limit, status} = req.query;
            const orders = await orderRepository.searchOrders({}, cursor, limit, status);
            res.status(200).json({success: true, data: orders});
        } catch (err) {
            next(err);
        }
    }

    async searchOrders(req, res, next) {
        try {
            const {query, cursor, limit} = req.query;
            const orders = await orderRepository.searchOrders(query ? query : {}, cursor, limit);
            res.status(200).json({success: true, data: orders});
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new OrderController();
