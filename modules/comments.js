const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    title: {
        type: String,
        minlength: 1,
        maxlength: 150,
        required: true
    },
    body: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 1000
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }
}, {timestamps: true})

module.exports = mongoose.model("comment", commentSchema)