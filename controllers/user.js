const User = require("../modules/user");

function findByUsername(username){ //searches for an user with the passed username in the base
    return new Promise((resolve, reject) => {
       try{
            resolve(User.findOne({"username": username}));
       } catch(err){
           reject(new Error(err));
       }
    })
}

function createUser(data){ //created a new user (/register)
    return new Promise((resolve, reject) => {
        try{
            resolve(User.create(data));
        } catch (err){
            reject(new Error(err));
        }
    })
}

function findUserLogin(username){ //authentification
    return new Promise((resolve, reject) => {
        try{
            resolve(User.findOne({"username": username})); 
        } catch(err) {
            reject(new Error(err));
        }
    })
}

function updateProfile(username, data){ //editing profile data
    return new Promise((resolve, reject) => {
        try{
            resolve(User.findOneAndUpdate({"username": username}, data));
        } catch(err) {
            reject(new Error(err));
        }
    })
}

function deleteUser(username){ //deleting a profile/account
    return new Promise((resolve, reject) => {
        try{
            resolve(User.findOneAndDelete({"username": username}))
        } catch(err){
            reject(new Error(err));
        }
    })
}

module.exports = {
    findByUsername,
    createUser,
    findUserLogin,
    updateProfile,
    deleteUser
}