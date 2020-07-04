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

function findTransactionById(transactionId){
    return new Promise((resolve, reject) => {
        try{
            resolve(Transaction.findById(transactionId).exec());
        } catch (err){
            reject(new Error(err));
        }
    })
}

function findTransaction(data){
    return new Promise((resolve, reject) => {
        try{
            resolve(Transaction.find(data).exec());
        } catch (err){
            reject(new Error(err));
        }
    })
}

function removeTransaction(productId){
    return new Promise((resolve, reject) => {
        try{
            resolve(Transaction.remove({productId:productId}).exec());
        } catch (err){
            reject(new Error(err));
        }
    })
}

function findTransactionByIdAccept(transactionId){
    return new Promise((resolve, reject) => {
        try{
            resolve(Transaction.findById(transactionId).populate("seller").populate("buyer").populate("productId").exec());
        } catch (err){
            reject(new Error(err));
        }
    })
}

function findTransactionByIdAndUpdate(transactionId,operation){
    return new Promise((resolve, reject) => {
        try{
            data = {};
            data[operation]=true;
            resolve(Transaction.findByIdAndUpdate(transactionId, data));
        } catch (err){
            reject(new Error(err));
        }
    })
}

function findBuyerTransactions(userId){
    return new Promise((resolve, reject) => {
        try{
            resolve(Transaction.find({"buyer":userId}).populate("seller", ["username", "location", "phoneNumber", "profilePictureUrl"]).populate("productId", ["name", "price", "imageUrl"]));
        } catch (err){
            reject(new Error(err));
        }
    })
}

function findSellerTransactions(userId){
    return new Promise((resolve, reject) => {
        try{
            resolve(Transaction.find({"seller":userId}).populate("buyer", ["username", "location", "phoneNumber", "profilePictureUrl"]).populate("productId", ["name", "price", "imageUrl"]));
        } catch (err){
            reject(new Error(err));
        }
    })
}

function dropAllTransactions(productId){ //deletes all transactions related to a product that has been deleted
    return new Promise((resolve, reject) => {
        try{
            resolve(Transaction.deleteMany({"productId": productId}));
        } catch(err) {
            reject(new Error(err));
        }
    })
}

function dropByUserId(userId){
    return new Promise((resolve, reject) => {
        try{
            resolve(Transaction.deleteMany({$or: [{"seller": userId}, {"buyer": userId}]})); //deletes transactions involving the user
        } catch(err){
            reject(new Error(err));
        }
    })
}

function removeTransactionById(transactionId){
    return new Promise((resolve, reject) => {
        try{
            resolve(Transaction.findByIdAndDelete(transactionId))
        } catch (err){
            reject(new Error(err));
        }
    })
}

module.exports = {
    createTransaction,
    findBuyerTransactions,
    findSellerTransactions,
    findTransactionById,
    findTransactionByIdAndUpdate,
    findTransactionByIdAccept,
    removeTransaction,
    findTransaction,
    dropAllTransactions,
    dropByUserId,
    removeTransactionById
}