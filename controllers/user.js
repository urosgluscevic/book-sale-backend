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

module.exports = {
    findByUsername,
    createUser
}