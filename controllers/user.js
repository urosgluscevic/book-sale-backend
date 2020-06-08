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

function findUserLogin(username, password){ //authentification
    return new Promise((resolve, reject) => {
        try{
            resolve(User.findOne({"username": username, "password": password})); //searches for the username with the password
        } catch(err) {
            return new Error(err);
        }
    })
}

function updateProfile(username, data){
    return new Promise((resolve, reject) => {
        try{
            resolve(User.findOneAndUpdate({"username": username}, data));
        } catch(err) {
            return new Error(err);
        }
    })
}

module.exports = {
    findByUsername,
    createUser,
    findUserLogin,
    updateProfile
}