const DB_URL = process.env.MONGODB_URI ||"mongodb://urosmiodrag:urosmiodrag123@ds039331.mlab.com:39331/heroku_v97n9qzj";
const PORT = process.env.PORT || 5000;

module.exports = {
    DB_URL,
    PORT
}