const express = require("express");
const {json} = require("body-parser");
const jwt = require("jsonwebtoken");

const {connect} = require("./helpers");
const {DB_URL, PORT} = require("./config");

const User = require("./controllers/user");

const app = express();

app.use(json());

app.post("/register", async(req, res) => { //registering an user (signup)
    const newUser = req.body; // user data passed through the body of the request
    const alreadyExists = await User.findByUsername(newUser.username); //checks if the username already exists in the base
    if(alreadyExists){
        res.status(403).json({"message": "user already exists"}); //the username is unique, so that is the only thing we need to check
    } else {
        try{
            await User.createUser(newUser); //user is created
            res.sendStatus(201); //201 = created
        } catch(err){
            res.status(403).json(err)
        }
        
    }
})

connect(DB_URL)
    .then(()=>{
        app.listen(PORT, ()=>{
            console.log("Server is active on port " + PORT)
        })
    })