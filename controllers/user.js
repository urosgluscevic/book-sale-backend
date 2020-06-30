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

function findById(ID){ //searches for an user with the passed username in the base
    return new Promise((resolve, reject) => {
       try{
            resolve(User.findById(ID));
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

function updateProfile(username, data){ //editing profile data
    return new Promise((resolve, reject) => {
        try{
            resolve(User.findOneAndUpdate({"username": username}, data, {new: true}));
        } catch(err) {
            reject(new Error(err));
        }
    })
}

function updateProfilebById(ID, data){ //editing profile data
    return new Promise((resolve, reject) => {
        try{
            resolve(User.findByIdAndUpdate(ID, data));
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

function numberOfRegistrations(gte,lt){
    return new Promise((resolve, reject) =>{
        try {
            resolve(User.find({createdAt: {
                $gte: ISODate(gte + " 00:00:00.000Z"),
                $lt: ISODate(lt + " 23:59:99.999Z")}
                }).count())
        } catch(err){
            reject(new Error(err));
        }
    })
}

function findUserById(id){
    return new Promise((resolve, reject) => {
        try{
            resolve(User.findById(id))
        } catch(err){
            reject(new Error(err));
        }
    })
}

function addRating(username, rating){ //adding reputation to a user
    return new Promise((resolve, reject) => {
        try {
            User.findOne({"username": username}).then(user => {
                let {ratings, reputation} = user;

                ratings += 1; //the number of people who rated this user
                reputation = (reputation * (ratings - 1) + rating) / ratings; //average rating

                resolve(User.findOneAndUpdate({"username": username}, {"ratings": ratings, "reputation": reputation}, {new: true}));
            })
        } catch (err) {
            reject(new Error(err))
        }
    }) 
}

module.exports = {
    findByUsername,
    createUser,
    updateProfile,
    deleteUser,
    findUserById,
    updateProfilebById,
    numberOfRegistrations,
    addRating,
    findById
}