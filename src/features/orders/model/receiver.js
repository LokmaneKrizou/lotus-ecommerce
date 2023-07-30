const AddressSchema = require("../../users/model/address");
const mongoose = require('mongoose');

const ReceiverSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique:false,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 15
    },
    address: {
        type: AddressSchema,
        required: true
    },
    deliveryInstructions: {
        type: String,
        required: false
    }
});

module.exports = ReceiverSchema;
