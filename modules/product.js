const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    price: { //ranges from 1 to 5 bookcoins
        type: Number,
        required: true
    },
    sold: { //is initially set to "false". Will be used to track when to delete it
        type: Boolean,
        required: true
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
    }
}, {timestamps: true});

module.exports = mongoose.model("product", productSchema);