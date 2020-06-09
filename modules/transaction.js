const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    productId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true
    },
    sellerConsent : {
        type : Boolean,
        default: false
    },
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    buyerConsent : {
        type : Boolean,
        default: false
    }
},{timestamps: true})


module.exports = mongoose.model("transaction", transactionSchema);