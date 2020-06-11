const Product = require("../modules/product");

function createPost(data){
    return new Promise((resolve, reject) => {
        try{
            resolve(Product.create(data));
        } catch (err){
            reject(new Error(err));
        }
    })
}

function findPostByUserId(userId){
    return new Promise((resolve, reject) => {
        try{
            resolve(Product.find({"user": userId}));
        } catch(err){
            reject(new Error(err));
        }
    })
}

function findPostById(ID){
    return new Promise((resolve, reject) => {
        try{
            resolve(Product.findById(ID));
        } catch(err){
            reject(new Error(err));
        }
    })
}

// searching for products - advanced search parameters included
function findProducts(data){
    return new Promise((resolve, reject) => {
        try{
            const name = data.name || ""; //if the name is not passed through the request, it's set to an empty string
            const namePattern = new RegExp(name, "g"); //the value is made into a regular expression. Empty string matches anything

            const condition = data.condition || "";
            const conditionPattern = new RegExp(condition, "g");

            const minPrice = data.minPrice || 1; // price cannot be lower than 1 or higher than 5
            const maxPrice = data.maxPrice || 5;

            const category = data.category || "";
            const categoryPattern = new RegExp(category, "g");

            resolve(Product.find({
                "name": {$regex: namePattern},
                "condition": {$regex: conditionPattern},
                "price": {$gte: minPrice, $lte: maxPrice}, //greater than minimal price and lesser than the maximum price
                "category": {$regex: categoryPattern}
            }));
        } catch(err){
            reject(new Error(err));
        }
    })
}

module.exports = {
    createPost,
    findPostByUserId,
    findPostById,
    findProducts
}