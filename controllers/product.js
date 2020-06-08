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

module.exports = {
    createPost
}