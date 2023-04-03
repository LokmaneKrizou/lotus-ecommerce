const mongoose = require('mongoose');
const Category = require('../enums/category');
const ColorSchema = require('../../../common/model/color');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        maxlength: 3000
    },
    category: {
        type: String,
        enum: Object.values(Category),
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    colors: {
        type: [ColorSchema],
        validate: [colorsLimit, '{PATH} exceeds the limit of 5']
    },
    images: {
        type: [String],
        required: true
    },
    colorImages: [{
        color: {
            type: ColorSchema
        },
        image: {
            type: String
        },
        _id: false
    }
    ],
    sizes: {
        type: [String]
    },
    quantities: {
        type: [{
            size: {
                type: String,
                enum: this.sizes,
                required: true
            },
            quantity: {
                type: Number,
                min: 0,
                required: true
            }
        }],
        _id: false,
        unique: true, // set a unique index on the `size` field
    },
    totalQuantity: {
        type: Number,
        min: 1
    }
},{versionKey: false,});

function colorsLimit(val) {
    return val.length <= 5;
}

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
