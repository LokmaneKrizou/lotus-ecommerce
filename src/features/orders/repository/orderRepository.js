const {
    OrderNotFoundException,
    InvalidOrderBodyException,
} = require("../exceptions");
const Order = require("../model/order");

class OrderRepository {
    async createOrder(order) {
        try {
            return await Order.create(order);
        } catch (err) {
            throw new InvalidOrderBodyException(err.message);
        }
    }

    async getOrderById(orderId) {
        const order = await Order.findById(orderId);
        if (!order) {
            throw new OrderNotFoundException(orderId);
        }
        return order;
    }

    async updateOrder(orderId, updatedOrder) {
        const order = await Order.findByIdAndUpdate(
            orderId,
            updatedOrder,
            {new: true}
        );
        if (!order) {
            throw new OrderNotFoundException(orderId);
        }
        return order;
    }

    async deleteOrder(orderId) {
        const deletedOrder = await Order.findByIdAndDelete(orderId);
        if (!deletedOrder) {
            throw new OrderNotFoundException(orderId);
        }
        return deletedOrder;
    }

    async getOrdersByUserId(userId) {
        return Order.find({userId}).sort({createdAt: -1});
    }

    async getOrdersByStatus(status, cursor, limit) {
        const queryObject = status ? {status} : {};
        const orders = await Order.find({...queryObject, _id: {$lt: cursor}})
            .sort({_id: -1})
            .limit(limit + 1);
        const hasNextPage = orders.length > limit;
        if (hasNextPage) {
            orders.pop();
        }
        const endCursor = hasNextPage ? orders[orders.length - 1]._id : null;
        return {
            orders,
            pageInfo: {
                endCursor: endCursor?.toString(),
                hasNextPage,
            },
        };
    }
}

module.exports = new OrderRepository();
