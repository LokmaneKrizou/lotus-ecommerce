const mongoose = require('mongoose');
const ColorSchema = require('../../../common/model/color')

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        color: {
            type: ColorSchema
        },
        size: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    }],
    total: {
        type: Number,
        required: true,
        min: 1
    }
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
