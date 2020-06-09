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

module.exports = {
    postComment
}