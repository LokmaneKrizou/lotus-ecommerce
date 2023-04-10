const {mongoose} = require('mongoose');

const DB_URL = process.env.NODE_ENV === 'development' ? "mongodb://localhost:27017" : process.env.MONGO_DB_URL

const dbConnection = () => {
    if (process.env.NODE_ENV === "development") {
        mongoose.set('debug', true);
    }
    mongoose.set('strictQuery', false);
    mongoose.connect(DB_URL).then(() => {
        console.log("🚀 Database Connected Successfully...")
    })
        .catch((error) => {
            console.log('MongoDB connection error', error);
        });
}
module.exports = dbConnection