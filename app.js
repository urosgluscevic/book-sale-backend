const express = require("express");
const {json} = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const {connect, verifyToken} = require("./helpers");
const {DB_URL, PORT} = require("./config");

const User = require("./controllers/user");
const Product = require("./controllers/product");

const app = express();

app.use(json());

app.post("/register", async(req, res) => { //registering an user (signup)
    const newUser = req.body; // user data passed through the body of the request
    const hashedPassword = await bcrypt.hash(newUser.password,10);
    newUser.password =  hashedPassword;
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

//login route
app.post("/login", async(req, res) => {
    const userLogin = req.body; //username and password of the user
    const loggedUser = await User.findUserLogin(userLogin.username);
    if(loggedUser){ //must check if the user exists first
        if(bcrypt.compareSync(userLogin.password,loggedUser.password)){ //if username and password match, proceed 
            jwt.sign({loggedUser}, "secretkey", {expiresIn: "1h"}, (err, token) => {
                if(err){
                    return new Error(err);
                }
                res.json({token});
            })
        } else {
            res.status(403).json({"message": "invalid password"});
        }
    } else { //if no users are found
        res.status(403).json({"message": "invalid username"});
    }
})

app.post("/updateProfile", verifyToken, (req, res) => { //lets the user change data about himself
    jwt.verify(req.token, "secretkey", async (err, authData) => {
        if(err) {
            res.sendStatus(403);
        } else {
            const data = req.body; //new data for the user
            //we must prevent the user from editing these using postman or something similar
            delete data.admin;
            delete data.username;
            delete data.password;
            delete data.bookCoinBalance;
            delete data.reputation;
            const username = authData.loggedUser.username; //authdata contains everything about the user who logged in
            await User.updateProfile(username, data);
            res.sendStatus(201);
        }
    })
})

app.post("/createPost", verifyToken, async (req,res) => {
    jwt.verify(req.token, "secretkey",async(err, authData)=>{
        if(err){
            res.sendStatus(403);
        } else{
            data = req.body;
            data.user = authData.loggedUser._id.toString();
            await Product.createPost(data);
            res.sendStatus(201)
        }
    })
})

app.delete("/deleteUser", verifyToken, (req, res) => { //allows an admin to delete someone's account
    jwt.verify(req.token, "secretkey", async (err, authData) => {
        if(err || authData.loggedUser.admin !== true){ //checks if the user is an admin or not
            res.sendStatus(403);
        } else {
            const username = req.body.username; //username of the account to be deleted
            await User.deleteUser(username);
            res.sendStatus(200);
        }
    })
})

connect(DB_URL)
    .then(()=>{
        app.listen(PORT, ()=>{
            console.log("Server is active on port " + PORT)
        })
    })