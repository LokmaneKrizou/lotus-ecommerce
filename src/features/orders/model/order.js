const mongoose = require('mongoose');
const Status = require('../enums/status');
const ColorSchema=require('../../../common/model/color')

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        color: {
            type: ColorSchema,
            required: false
        },
        size: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    }],
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: Object.values(Status),
        default: Status.PENDING
    }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
