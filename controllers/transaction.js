const Transaction = require("../modules/transaction.js");

function createTransaction(product,buyer,seller){
    const data = {
        "productId":product,
        "buyer":buyer,
        "seller":seller
    };
    return new Promise((resolve, reject) => {
        try{
            resolve(Transaction.create(data));
        } catch (err){
            reject(new Error(err));
        }
    })
}


function findBuyerTransactions(userId){
    return new Promise((resolve, reject) => {
        try{
            resolve(Transaction.find({"buyer":userId}));
        } catch (err){
            reject(new Error(err));
        }
    })
}

function findSellerTransactions(userId){
    return new Promise((resolve, reject) => {
        try{
            resolve(Transaction.find({"seller":userId}));
        } catch (err){
            reject(new Error(err));
        }
    })
}


module.exports = {
    createTransaction,
    findBuyerTransactions,
    findSellerTransactions
}