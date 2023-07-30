const mongoose = require('mongoose');
const Status = require('../enums/status');
const {ProductVariantOptionSchema} = require("../../products/model/variants");
const ReceiverSchema = require("./receiver");

const orderSchema = new mongoose.Schema({
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        receiver: {
            type: ReceiverSchema
        },
        items: [{
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            variantSelections: {
                type: [ProductVariantOptionSchema],
                required: false
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
    },
    {
        timestamps: true
    });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
