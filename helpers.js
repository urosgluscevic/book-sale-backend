const mongoose = require("mongoose");

function connect(url){
    return mongoose.connect(url);
}

function verifyToken(req, res, next){ //auth function for getting the token
    const bearerHeader = req.headers["authorization"];
    if(typeof bearerHeader !== "undefined"){
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next(); //it's a middleware function
    } else {
        res.sendStatus(403);
    }
}

module.exports = {
    connect,
    verifyToken
}