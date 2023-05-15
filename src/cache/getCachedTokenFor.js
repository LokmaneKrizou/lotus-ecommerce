const redisClient = require("./index");
const getCachedTokenFor = async (key) => {
        try {
            const data = await redisClient.get(key);
            if (data !== null) {
                return JSON.parse(data).token;
            } else {
                return null;
            }
        } catch
            (err) {
            throw err;
        }
    }
;
module.exports = getCachedTokenFor