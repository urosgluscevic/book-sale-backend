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

function findAllComments(id){
    return new Promise((resolve, reject) => {
        try{
            resolve(Comment.find({"user": id}))
        } catch(err){
            reject(new Error(err));
        }
    })
}

module.exports = {
    postComment,
    findAllComments
}