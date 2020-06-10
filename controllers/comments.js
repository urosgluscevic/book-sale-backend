const Comment = require("../modules/comments");

function postComment(data){
    return new Promise((resolve, reject) => {
        try{
            resolve(Comment.create(data));
        } catch(err) {
            reject(new Error(err));
        }
    })
}

function findAllComments(id){ //returns all comments of the user with the passed id
    return new Promise((resolve, reject) => {
        try{
            resolve(Comment.find({"user": id}))
        } catch(err){
            reject(new Error(err));
        }
    })
}

function findComment(id){ //finds one comment by it's id
    return new Promise((resolve, reject) => {
        try{
            resolve(Comment.findById(id));
        } catch(err){
            reject(new Error(err));
        }
    })
}

function deleteComment(id){ //deletes a comment by it's id
    return new Promise((resolve, reject) => {
        try{
            resolve(Comment.findByIdAndDelete(id));
        } catch (err){
            reject(new Error(err));
        }
    })
}

function editComment(id, data){ // comment editing
    return new Promise((resolve, reject) => {
        try{
            resolve(Comment.findOneAndUpdate({"_id": id}, data));
        } catch(err){
            reject(new Error(err));
        }
    })
}

module.exports = {
    postComment,
    findAllComments,
    findComment,
    deleteComment,
    editComment
}