const mongoose = require('mongoose');

const ColorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 50
    },
    hexCode: {
        type: String,
        required: false
    }
}, {
    versionKey: false,
    _id: false
});
module.exports = ColorSchema;