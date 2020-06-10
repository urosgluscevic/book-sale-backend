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

module.exports = {
    createPost,
    findPostByUserId
}