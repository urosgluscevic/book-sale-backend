const Transaction = require("../modules/transaction.js");

function createTransaction(product,buyer){
    const data = {
        "productId":product,
        "buyer":buyer
    };
    return new Promise((resolve, reject) => {
        try{
            resolve(Transaction.create(data));
        } catch (err){
            reject(new Error(err));
        }
    })
}


module.exports = {
    createTransaction
}