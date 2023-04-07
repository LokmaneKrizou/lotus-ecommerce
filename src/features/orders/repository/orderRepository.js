const {
    OrderNotFoundException,
    InvalidOrderBodyException,
} = require("../exceptions");
const Order = require("../model/order");
const populateUserWithoutPassword = require("../../../common/utils/populateUserWithoutPassword");

class OrderRepository {
    async createOrder(order) {
        try {
            return await Order.create(order);
        } catch (err) {
            throw new InvalidOrderBodyException(err.message);
        }
    }

    async getOrderById(orderId) {
        const order = await Order.findById(orderId)
            .populate(populateUserWithoutPassword)
            .populate({
                path: "items.product",
                model: "Product",
            });
        if (!order) {
            throw new OrderNotFoundException(orderId);
        }
        return order;
    }

    async updateOrder(orderId, updatedOrder) {
        try {
            const order = await Order.findByIdAndUpdate(
                orderId,
                updatedOrder,
                {new: true}
            );
            if (!order) {
                throw new InvalidOrderBodyException("Order failed to update");
            }
            return order;
        } catch (err) {
            throw err;
        }
    }

    async deleteOrder(orderId) {
        const deletedOrder = await Order.findByIdAndDelete(orderId);
        if (!deletedOrder) {
            throw new OrderNotFoundException(orderId);
        }
        return deletedOrder;
    }

    async getOrdersByUserId(userId) {
        return Order.find({user: userId})
            .populate(populateUserWithoutPassword)
            .populate({
                path: 'items.product',
                model: 'Product'
            }).sort({createdAt: -1});
    }

    async searchOrders(query, cursor, limit) {
        if (cursor) {
            query['_id'] = {'$gt': cursor}
        }
        return Order.find({...query})
            .populate(populateUserWithoutPassword)
            .populate({
                path: 'items.product',
                model: 'Product'
            })
            .limit(limit + 1);
    }
}

module.exports = new OrderRepository();
