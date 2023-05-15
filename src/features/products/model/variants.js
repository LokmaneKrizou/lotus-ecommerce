const {Schema} = require("mongoose");

const VariantOptionSchema = new Schema({
    value: String,
    additionalInfo: {
        type: Schema.Types.Mixed,
        required: false
    }
}, {_id: false});

const VariantSchema = new Schema({
    name: String,
    options: [VariantOptionSchema]
}, {_id: false});

const ProductVariantOptionSchema = new Schema({
    name: String,
    value: String
}, {_id: false})
const ProductVariantSchema = new Schema({
    options: [ProductVariantOptionSchema],
    quantity: Number
}, {_id: false});

module.exports = {
    ProductVariantSchema, VariantSchema, VariantOptionSchema, ProductVariantOptionSchema
}