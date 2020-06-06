const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 150
    },
    description: {
        type: String,
        maxlength: 500
    },
    price: { //ranges from 1 to 5 bookcoins
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    sold: { //is initially set to "false". Will be used to track when to delete it
        type: Boolean,
        required: true,
        default: false
    },
    user: { //reference to the user who sold it
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    imageUrl: String,
    condition: {
        type: String,
        required: true
    },
    age: Number,
    category: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        default: 1,
        min: 1,
        max: 50
    }
}, {timestamps: true});

module.exports = mongoose.model("product", productSchema);