const express = require("express");
const {json} = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const fs = require("fs");
const cors = require("cors");
const fileupload = require("express-fileupload");
const {google} = require("googleapis");
const {connect, verifyToken} = require("./helpers");
const {DB_URL, PORT} = require("./config");

const User = require("./controllers/user");
const Product = require("./controllers/product");
const Transaction = require("./controllers/transaction");
const Comment = require("./controllers/comments");

const app = express();


app.use(cors());
app.options('*', cors())
app.use(json());
app.use(fileupload());

app.get("/", (req, res) => {
    res.status(200).json({"Message":"Welcome to bok api"});
})



app.post("/register", async(req, res) => { //registering an user (signup)
    const newUser = req.body; // user data passed through the body of the request
    const hashedPassword = await bcrypt.hash(newUser.password,10);
    newUser.password =  hashedPassword;
    newUser.admin = false; //becoming an admin will be added later
    const alreadyExists = await User.findByUsername(newUser.username); //checks if the username already exists in the base
    if(alreadyExists){
        res.status(403).json({"message": "user already exists"}); //the username is unique, so that is the only thing we need to check
    } else {
        try{
            const createdUser = await User.createUser(newUser); //user is created
            res.status(201).json({"Added user": createdUser, "Message": "User created successfully"}); //201 = created
        } catch(err){
            res.status(500).json({"Error": err, "Message": "User creation failed"});
        } 
    }
})

//login route
app.post("/login", async(req, res) => {
    const userLogin = req.body; //username and password of the user
    const loggedUser = await User.findByUsername(userLogin.username);
    if(loggedUser){ //must check if the user exists first
        if(bcrypt.compareSync(userLogin.password,loggedUser.password)){ //if username and password match, proceed 
            jwt.sign({loggedUser}, "booksaleMiodragUros1134", {expiresIn: "2h"}, (err, token) => {
                if(err){
                    return new Error(err);
                }
                res.status(200).json({token, "Message": "User logged in successfully"});
            })
        } else {
            res.status(403).json({"message": "invalid password"});
        }
    } else { //if no users are found
        res.status(403).json({"message": "invalid username"});
    }
})

app.post("/updateProfile", verifyToken, (req, res) => { //lets the user change data about himself
    jwt.verify(req.token, "booksaleMiodragUros1134", async (err, authData) => {
        if(err) {
            res.sendStatus(401); //unauthorized
        } else {
            const data = req.body; //new data for the user
            //we must prevent the user from editing these using postman or something similar
            delete data.admin;
            delete data.username;
            delete data.password;
            delete data.bookCoinBalance;
            delete data.reputation;
            const username = authData.loggedUser.username; //authdata contains everything about the user who logged in
            const updatedUser = await User.updateProfile(username, data);
            res.status(201).json({updatedUser, "Message": "Profile updated"});
        }
    })
})

app.get("/products/:id/buy", verifyToken, async (req,res) => {
    jwt.verify(req.token, "booksaleMiodragUros1134", async (err, authData) => {
        if(err){
            res.sendStatus(401);
            console.log(err);
        } else{
            const prodID = req.params.id;
            const balance = await User.findByUsername(authData.loggedUser.username)
            const seller = await Product.findPostById(prodID);
            const check = await Transaction.findTransaction({"productId":prodID,"buyer":authData.loggedUser._id});
            if(balance.bookCoinBalance >= seller.price && check[0] == undefined){
                await Transaction.createTransaction(prodID,authData.loggedUser._id.toString(),seller.user);
                res.status(201).json({"Message": "Transaction created"});
            } else{
                if(check[0]){
                    res.status(403).json({"Message": "You already have a transaction related to this product"})
                } else {
                    res.status(403).json({"Message": "You do not have enough bookCoins to buy this product"})
                }
            }
        }
    })
})

app.get("/stats/registrations/:gte/:lt",verifyToken, async(req,res) => {
    jwt.verify(req.token, "booksaleMiodragUros1134", async (err, authData) =>{
        if(err || authData.loggedUser.admin == false){
            res.sendStatus(401);
        } else {
            const data = await User.numberOfRegistrations(req.params.gte.toString(),req.params.lt.toString());
            res.status(200).json({"Number of registrations":data});
        }
    })
})

app.get("/transactions", verifyToken, async(req,res) =>{
    jwt.verify(req.token, "booksaleMiodragUros1134", async (err, authData) => {
        if(err){
            res.sendStatus(401);
        } else{
            const userId = authData.loggedUser._id.toString();
            const buy = await Transaction.findBuyerTransactions(userId);
            const sell = await Transaction.findSellerTransactions(userId);
            res.status(200).json({"buy":[buy],"sell":[sell]});
        }
    })
})

app.get("/transactions/:id", verifyToken, async(req,res) => {
    jwt.verify(req.token, "booksaleMiodragUros1134", async (err, authData) => {
        if(err){
            res.sendStatus(401);
        } else{
            const userId = authData.loggedUser._id.toString();
            const transaction = await Transaction.findTransactionById(req.params.id);
            if(transaction.buyer == userId || transaction.seller == userId){
                res.status(200).json({transaction});
            }
            else{
                res.status(403).json({"Message": "You are not the buyer or the seller"});
            }
        }
    })
})

app.get("/transactions/:id/accept", verifyToken, async(req,res) => {
    jwt.verify(req.token, "booksaleMiodragUros1134", async (err, authData) => {
        if(err){
            res.sendStatus(401);
        } else{
            const userId = authData.loggedUser._id.toString();
            const transaction = await Transaction.findTransactionByIdAccept(req.params.id);
            switch(userId.toString()){
                case transaction.buyer._id.toString():
                    if(authData.loggedUser.bookCoinBalance >= transaction.productId.price){
                        await Transaction.findTransactionByIdAndUpdate(req.params.id,"buyerConsent");
                        transaction.buyerConsent = true;
                        buy();
                        res.sendStatus(201);
                    }
                    else{
                        res.status(403).json({"message":"Not enough book coins"});
                    }

                    break;
                case transaction.seller._id.toString():
                    await Transaction.findTransactionByIdAndUpdate(req.params.id,"sellerConsent");
                    transaction.sellerConsent = true;
                    buy()
                    res.sendStatus(201);
                    break;
                default:
                    console.log(userId==transaction.buyer._id);
                    res.sendStatus(403);
            }
            async function buy(){
                if(transaction.buyerConsent == true && transaction.sellerConsent == true){
                    const price = transaction.productId.price;
                    buyerCoin = transaction.buyer.bookCoinBalance - transaction.productId.price;
                    await User.updateProfilebById(transaction.buyer._id,{"bookCoinBalance": buyerCoin});
                    sellerCoin = transaction.seller.bookCoinBalance + transaction.productId.price;
                    await User.updateProfilebById(transaction.seller._id,{"bookCoinBalance": sellerCoin});
                    await Transaction.removeTransaction(transaction.productId);
                    await Product.deleteProduct(transaction.productId._id);
                }
            }
        }
    })
})

app.post("/createPost", verifyToken, async (req,res) => {
    jwt.verify(req.token, "booksaleMiodragUros1134",async(err, authData)=>{
        if(err){
            res.status(401).json({err});
            console.log({err})
        } else{
            const data = req.body;
            data.user = authData.loggedUser._id.toString();
            const product = await Product.createPost(data);
            res.status(201).json({product, "Message": "Product added"})
        }
    })
})

app.delete("/deleteUser/:username", verifyToken, (req, res) => { //allows an admin to delete someone's account
    jwt.verify(req.token, "booksaleMiodragUros1134", async (err, authData) => {
        if(err){ //checks if the user is an admin or not
            res.sendStatus(401);
        } else if(authData.loggedUser.admin == true || req.params.username == authData.loggedUser.username){
            const username = req.params.username; //username of the account to be deleted
            const user = await User.findByUsername(username); // we need the user's _id so that we can delete his products and comments

            if(user){
                const userId = user._id;
                Promise.all([User.deleteUser(username), Product.deleteProducts(userId), Comment.deleteComments(userId), Transaction.dropByUserId(userId)]) // 4 promises - deleting the user, comments, products and transactions - Promise.all() is faster
                .then(()=>{
                    res.status(200).json({"Message": "Profile deleted"});
                }).catch(err => {
                    res.status(500).json(err);
                })
            } else {
                res.status(400).json({"Message": "User does not exist"});
            } 
        } else {
            res.status(403).json({"Message": "You are not authorized to delete this account"});
        }
    })
})

app.post("/postComment", verifyToken, (req, res) => { //uploading a comment to someones profile
    jwt.verify(req.token, "booksaleMiodragUros1134", async(err, authData) => {
        if(err){
            res.sendStatus(401);
        } else {
            const data = req.body; //content of the comment
            data.postedBy = authData.loggedUser._id.toString(); //id of the user who posted the comment
            const postedTo = await User.findByUsername(data.username); //the user who received the comment

            if(postedTo){
                data.user = postedTo._id.toString(); //id of the receiving user
                const newComment = await Comment.postComment(data);
                res.status(201).json({newComment, "Message": "Comment added"}); // in order to find the comment later (for editing and deleting) the frontend should save the comment _id 
            } else {
                res.status(400).json({"Message": "User whose account you are trying to comment on does not exist"})
            }
        }
    })
})

app.get("/findUser/:username", async(req, res) => {
    const username = req.params.username; //person whose profile we want the data for
    
    const user = await User.findByUsername(username);

    if(user){
        const userId = user._id; // the id is the reference for the comments and products
        user.password = undefined; //can't send password to frontend

        const products = await Product.findPostByUserId(userId);
        const comments = await Comment.findAllComments(userId);

        res.status(200).json({comments, products, user})
    } else {
        res.status(400).json({"message": "User does not exist"});
    }    
})

// deleting a comment
// a regular user can delete only a comment he posted
// an admin can delete any comment
app.delete("/deleteComment", verifyToken, (req, res) => {
    jwt.verify(req.token, "booksaleMiodragUros1134", async(err, authData) => {
        if(err){
            res.sendStatus(401);
        } else{
            const commentId = req.body.commentId; // id of the comment to be deleted
            if(authData.loggedUser.admin){ // checks if the user making the request is an admin
                await Comment.deleteComment(commentId); // deletes the comment
                res.status(200).json({"Message": "Comment deleted"});
            } else { // if the user is not an admin
                const comment = await Comment.findComment(commentId); // first the comment is found
                if(comment){
                    if(comment.postedBy._id == authData.loggedUser._id){ // checks if the user making the request is the one who posted the comment
                        await Comment.deleteComment(commentId); // deletes the comment
                        res.status(200).json({"Message": "Comment deleted"});
                    } else {
                        res.status(403).json({"Message": "You are not authorized to delete this comment"});
                    }
                } else {
                    res.status(400).json({"Message":"Comment does not exist"})
                }
            }
        }
    })
})

app.post("/editComment/:commentId", verifyToken, (req, res) => { //editing a comment
    jwt.verify(req.token, "booksaleMiodragUros1134", async(err, authData) => {
        if(err){
            res.sendStatus(401);
        } else {
            const commentId = req.params.commentId; //id of comment to be edited
            const data = req.body; // new data used to edit the comment

            const comment = await Comment.findComment(commentId); // comment with the commentId
            if(comment){
                if(authData.loggedUser._id == comment.postedBy._id){ // was it posted by the user who is making the request?
                    const editedComment = await Comment.editComment(commentId, data); // edits the comment
                    res.status(200).json({editedComment, "Message": "Comment edited"});
                } else{
                    res.status(403).json({"Message": "You are not authorized to edit this comment"});
                }
            } else{
                res.status(400).json({"Message":"Comment does not exist"})
            }
        }
    })
})

app.post("/findProduct", async(req, res) => { //searches for all the products which match the passed parameters
    try{
        const data = req.body;
        const matchingProducts = await Product.findProducts(data);

        if(matchingProducts){
            res.status(200).json({matchingProducts, "Message": "Products found"});
        } else {
            res.status(200).json({"Message": "No products found"})
        }
    } catch(err){
        res.status(403).json(err);
    }
})

app.get("/addRating/:username/:rating", verifyToken, (req, res) => {
    jwt.verify(req.token, "booksaleMiodragUros1134", async(err, authData) => {
        if(err){
            res.sendStatus(401);
        } else {
            const username = req.params.username;
            const rating = parseInt(req.params.rating);

            if(username && rating){
                const user = await User.findByUsername(username);
                if(user){
                    const updatedUser = await User.addRating(username, rating)
                    res.status(200).json(updatedUser);
                } else {
                    res.status(403).json({"Message": "Invalid username"})
                }
            } else {
                res.status(400).json({"Message": "No username or rating provided"})
            }
        }
    })
})

app.get("/deleteProduct/:id", verifyToken, (req, res) => {
    jwt.verify(req.token, "booksaleMiodragUros1134", async (err, authData) => {
        if(err){
            res.sendStatus(403);
        } else {
            const productId = req.params.id;
            const product = await Product.findPostById(productId) //finds product to be deleted
            if(product){
                if(authData.loggedUser.admin == true || authData.loggedUser._id == product.user){
                    Promise.all([Product.deleteProduct(productId), Transaction.dropAllTransactions(productId)]).then(() => {
                        res.status(200).json({"Message": "Product and related transactions deleted successfully"});
                    }).catch(err => {
                        res.status(500).json({"Message": "Product deletion failed", "Error": err});
                    })
                } else {
                    res.status(403).json({"Message": "You are not authorized to delete this product"})
                }
            } else {
                res.status(400).json({"Message": "Product does not exist"});
            }
        }
    })
})

app.get("/getProducts/:quantity", async (req, res) => {
    const quantity = req.params.quantity; //number of products to get
    const numberQuantity = parseInt(quantity); //turns quantity into number
    const products = await Product.getProducts(numberQuantity); //finds certain number of products
    res.status(200).json({products});
})

app.post("/uploadImage/:uploadTo", verifyToken, (req, res)=>{ //images will be stored on google drive 
    jwt.verify(req.token, "booksaleMiodragUros1134", async(err, authData)=>{
        if (err){
            res.sendStatus(401);
        } else{
            // const file = req.files.upfile;
            const file = req.body.upfile;
            console.log(req.body)
            console.log({file});
            const name = file.name;
            const uploadPath = __dirname + "/" + name;

            let newUrl;

            const uploadTo = req.params.uploadTo; //is it a user profile picture, or a product picture
        
            file.mv(uploadPath, (err)=>{
                if(err){
                    console.log("file upload failed", name, err);
                    res.send("Error occured")
                } else {
                    console.log("uploaded", name)
                }
            })
            
            const TOKEN_PATH = 'token.json';
        
            // Load client secrets from a local file.
            fs.readFile('credentials.json', (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            // Authorize a client with credentials, then call the Google Drive API.
            authorize(JSON.parse(content), uploadFile);
            });
        
            /**
             * Create an OAuth2 client with the given credentials, and then execute the
             * given callback function.
             * @param {Object} credentials The authorization client credentials.
             * @param {function} callback The callback to call with the authorized client.
             */
            function authorize(credentials, callback) {
            const {client_secret, client_id, redirect_uris} = credentials.installed;
            const oAuth2Client = new google.auth.OAuth2(
                client_id, client_secret, redirect_uris[0]);
        
                // Check if we have previously stored a token.
                fs.readFile(TOKEN_PATH, (err, token) => {
                    if (err) return getAccessToken(oAuth2Client, callback);
                    oAuth2Client.setCredentials(JSON.parse(token));
                    callback(oAuth2Client);
                });
            }
        
            function uploadFile(auth) {
                const drive = google.drive({ version: 'v3', auth });
                var fileMetadata = {
                    'name': name
                };
                var media = {
                    mimeType: 'image/jpeg',
                    body: fs.createReadStream(name)
                };
                drive.files.create({
                    resource: fileMetadata,
                    media: media,
                    fields: '*'
                }, function (err, response) {
                    if (err) {
                        console.log(err);
                    } else {
                        newUrl = response.data.thumbnailLink;

                        if(uploadTo === "user"){
                            User.updateProfile(authData.loggedUser.username, {"profilePictureUrl": newUrl}).then(()=>{ //updates the profilePicture field
                                fs.unlink(uploadPath, (err)=>{ //image is deleted from our server
                                    if(err){
                                        console.log("file deletion failed", name, err);
                                    } else {
                                        console.log("deleted", name)
                                    }
                                })
                                res.status(201).json(newUrl)
                            })
                        } else if(uploadTo === "product"){
                            const productId = req.query.productId;

                            Product.findPostById(productId).then((foundProduct) => {
                                if(foundProduct.user == authData.loggedUser._id){
                                    Product.updateProduct(productId, {"imageUrl": newUrl}).then(()=>{
                                        fs.unlink(uploadPath, (err)=>{ //image is deleted from our server
                                            if(err){
                                                console.log("file deletion failed", name, err);
                                            } else {
                                                console.log("deleted", name)
                                            }
                                        })
                                        res.status(201).json(newUrl)
                                    })
                                } else{
                                    res.status(403).json({"Message": "You are not the owner of this product"});
                                }
                            })
                        } else {
                            res.status(400).json({"message": "No uploadTo parameter passed"})
                        }
                    }
                });
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