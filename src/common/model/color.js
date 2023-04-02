import mongoose from "mongoose";

const ColorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 50
    },
    hexCode: {
        type: String,
        required: true
    }
});
module.exports = ColorSchema;