const mongoose = require("mongoose");

function connect(url){
    return mongoose.connect(url);
}

module.exports = {
    connect
}