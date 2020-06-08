const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true, //will be used as an index
        minlength: 3,
        maxlength: 40
    },
    password: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    //phone and email are contact info, at least one of them has to be required
    //maybe both?
    phoneNumber: {
        type: Number,
    },
    email: { //we could send emails to customers when someone is interrested in their product
        type: String,
        maxlength: 50,
        // required: true
    },
    bookCoinBalance: { //we're calling them bookCoins unill we get something better
        type: Number,
        // required: true
    },
    //the profile picture and location should not be required, in order to protect the users privacy
    profilePictureUrl: String,
    location: String,
    reputation: Number, //users can rate other users, we will use a 5 star system
    admin: { //an user is either an admin or a regular user. Guests are not put into the database
        type: Boolean,
        // required: true
    }
}, {timestamps: true});

module.exports = mongoose.model("user", userSchema);