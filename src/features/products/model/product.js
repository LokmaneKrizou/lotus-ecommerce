const mongoose = require('mongoose');
const Category = require('../enums/category');
const {Schema} = require("mongoose");
const {VariantSchema, ProductVariantSchema} = require("./variants");

const ProductSchema = new Schema({
    title: {
        type: String,
        required: true,
        maxlength: 1000
    },
    description: {
        type: String,
        required: true,
        maxlength: 10000
    },
    category: {
        type: String,
        enum: Object.values(Category),
        required: true
    },
    etsy_id: {
        type: Number,
        required: false,
        min: 1
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    images: {
        type: [String],
        required: true
    },
    totalQuantity: {
        type: Number,
        min: 1
    },
    searchCount: {
        type: Number,
        default: 0,
    },
    variants: {
        type: [VariantSchema],
        required: false,
    },
    productVariants: {
        type: [ProductVariantSchema],
        required: false
    }
}, {versionKey: false,});

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
