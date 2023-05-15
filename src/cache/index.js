const Redis = require('ioredis');
const dotEnv = require('dotenv');

dotEnv.config();

const redisClient = new Redis({
    password: process.env.REDIS_PASSWORD,
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10),
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('end', () => console.log('Redis client disconnected'));
redisClient.on('connect', function () {
    console.log('redis client connected');
});
redisClient.on('ready', () => {
    console.log('Redis client is ready');
});

module.exports = redisClient;
