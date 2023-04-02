const redis = require('redis');
const dotEnv = require('dotenv')

dotEnv.config()

const redisClient = async () => {
    const client = redis.createClient({
        password: process.env.REDIS_PASSWORD,
        socket: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT
        }
    });
    client.on('error', (err) => console.log('Redis Client Error', err));
    client.on('end', () => console.log('Redis client disconnected'));
    client.on('connect', function () {
        console.log('redis client connected');
    });
    await client.connect()

    return client;
}

const getCachedTokenFor =async (key) => {
        const client = await redisClient()
        await client.get(key, (err, data) => {
            if (err) {
                console.log("error thrown")
                throw err
            } else {
                if (data !== null) {
                    console.log("token found")
                    return JSON.parse(data).token;
                } else {
                    console.log("no token")
                    return null;
                }
            }
        });
}
module.exports = {
    redisClient,
    getCachedTokenFor
};