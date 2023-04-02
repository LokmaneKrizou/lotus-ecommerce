const {mongoose} = require('mongoose');

const dbConnection = () => {
    if (process.env.NODE_ENV === "development") {
        mongoose.set('debug', true);
    }
    mongoose.connect(process.env.MONGO_DB_URL).then(() => {
        console.log("🚀 Database Connected Successfully...")
    })
        .catch((error) => {
            console.log('MongoDB connection error', error);
        });
}
module.exports = dbConnection