const mongoose = require('mongoose');

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
}, {
    versionKey: false,
    _id: false
});
module.exports = ColorSchema;