const express = require("express");
const {json} = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const {connect, verifyToken} = require("./helpers");
const {DB_URL, PORT} = require("./config");

const User = require("./controllers/user");
const Product = require("./controllers/product");
const Transaction = require("./controllers/transaction");
const Comment = require("./controllers/comments");


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
    const loggedUser = await User.findByUsername(userLogin.username);
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

app.post("/products/:id/buy", verifyToken, async (req,res) => {
    jwt.verify(req.token, "secretkey", async (err, authData) => {
        if(err){
            res.sendStatus(403);
            console.log(err);
        } else{
            const prodID = req.params.id;
            const buyer = await Product.findPostById(prodID);
            await Transaction.createTransaction(prodID,authData.loggedUser._id.toString(),buyer._id);
            res.sendStatus(201);
        }


    })
})

app.get("/myTransactions", verifyToken, async(req,res) =>{
    jwt.verify(req.token, "secretkey", async (err, authData) => {
        if(err){
            res.sendStatus(403);
        } else{
            const userId = authData.loggedUser._id.toString();
            const buy = await Transaction.findBuyerTransactions(userId);
            const sell = await Transaction.findSellerTransactions(userId);
            res.json({"buy":[buy],"sell":[sell]})
            
        }
    })
})






app.post("/createPost", verifyToken, async (req,res) => {
    jwt.verify(req.token, "secretkey",async(err, authData)=>{
        if(err){
            res.sendStatus(403);
        } else{
            const data = req.body;
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

app.post("/postComment", verifyToken, (req, res) => { //uploading a comment to someones profile
    jwt.verify(req.token, "secretkey", async(err, authData) => {
        if(err){
            res.sendStatus(403);
        } else {
            const data = req.body; //content of the comment
            data.postedBy = authData.loggedUser._id.toString(); //id of the user who posted the comment
            const postedTo = await User.findByUsername(data.username); //the user who received the comment
            data.user = postedTo._id.toString(); //id of the receiving user
            const newComment = await Comment.postComment(data);
            res.status(201).json(newComment); // in order to find the comment later (for editing and deleting) the frontend should save the comment _id 
        }
    })
})

app.get("/findUser/:username", async(req, res) => {
    const username = req.params.username; //person whose profile we want the data for
    try{
        const user = await User.findByUsername(username);
        const userId = user._id; // the id is the reference for the comments and products
        user.password = undefined; //can't send password to frontend

        Promise.all([Comment.findAllComments(userId), Product.findPostByUserId(userId)]).then(values => { //getting the comments and products
            res.status(200).json({values, user});
        })
    } catch(err){
        res.status(403).json(err);
    }
})

// deleting a comment
// a regular user can delete only a comment he posted
// an admin can delete any comment
app.delete("/deleteComment", verifyToken, (req, res) => {
    jwt.verify(req.token, "secretkey", async(err, authData) => {
        if(err){
            res.sendStatus(403);
        } else{
            const commentId = req.body.id; // id of the comment to be deleted
            if(authData.loggedUser.admin){ // checks if the user making the request is an admin
                await Comment.deleteComment(commentId); // deletes the comment
                res.sendStatus(200);
            } else { // if the user is not an admin
                const comment = await Comment.findComment(commentId); // first the comment is found
                if(comment.postedBy == authData.loggedUser._id){ // checks if the user making the request is the one who posted the comment
                    await Comment.deleteComment(commentId); // deletes the comment
                    res.sendStatus(200);
                } else {
                    res.sendStatus(403);
                }
            }
        }
    })
})

app.post("/editComment/:commentId", verifyToken, (req, res) => { //editing a comment
    jwt.verify(req.token, "secretkey", async(err, authData) => {
        if(err){
            res.sendStatus(403);
        } else {
            const commentId = req.params.commentId; //id of comment to be edited
            const data = req.body; // new data used to edit the comment

            const comment = await Comment.findComment(commentId); // comment with the commentId
            if(authData.loggedUser._id == comment.postedBy){ // was it posted by the user who is making the request?
                const editedComment = await Comment.editComment(commentId, data); // edits the comment
                res.status(200).json(editedComment);
            } else{
                res.sendStatus(403);
            }
        }
    })
})

connect(DB_URL)
    .then(()=>{
        app.listen(PORT, ()=>{
            console.log("Server is active on port " + PORT);
        })
    })