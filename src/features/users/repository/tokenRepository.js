const jwt = require('jsonwebtoken');
const {redisClient, getCachedTokenFor} = require('../../../cache');
const {UnauthorizedException, InternalServerException} = require('../../../common/exceptions');

const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION || '7 days';
const ACCESS_TOKEN_EXPIRATION = process.env.ACCESS_TOKEN_EXPIRATION || '1h';

class TokenRepository {
    async generateAccessToken(userId) {
        try {
            const accessSecret = process.env.JWT_ACCESS_SECRET_KEY || "test key"
            const payload = {sub: userId}
            const options = {expiresIn: ACCESS_TOKEN_EXPIRATION}
            return jwt.sign(payload, accessSecret, options)
        } catch (err) {
            throw new InternalServerException(err.message);
        }
    }

    async generateRefreshToken(userId) {
        try {
            const refreshSecret = process.env.JWT_REFRESH_SECRET_KEY || "test key"
            const payload = {sub: userId}
            const options = {expiresIn: REFRESH_TOKEN_EXPIRATION}
            const refreshToken = jwt.sign(payload, refreshSecret, options);
            const expireInSeconds = parseInt(REFRESH_TOKEN_EXPIRATION, 10) * 24 * 60 * 60;
            const jsonValue = JSON.stringify({token: refreshToken})
            const client = await redisClient()
            await client.set(userId, jsonValue, {EX: expireInSeconds});
            return refreshToken;
        } catch (err) {
            throw err;
        }
    }

    async validateRefreshToken(userId, token) {
        try {
            const cachedToken = await getCachedTokenFor(userId);
            return cachedToken === token;
        } catch (err) {
            throw new UnauthorizedException(err.message);
        }
    }

    async deleteRefreshToken(userId) {
        try {
            const client = await redisClient()
            await client.del(userId);
        } catch (err) {
            throw new InternalServerException(err.message);
        }
    }

    async blacklistAccessToken(userId, accessToken) {
        try {
            const key = `BL${userId}`;
            const jsonValue = JSON.stringify({token: accessToken})
            const client = await redisClient()
            await client.set(key, jsonValue);
        } catch (err) {
            throw new InternalServerException(err.message);
        }
    }

    async isAccessTokenBlacklisted(userId, accessToken) {
        try {
            const key = `BL${userId}`;
            console.log(key)
            const cachedToken = await getCachedTokenFor(key);
            return cachedToken === accessToken;
        } catch (err) {
            throw new UnauthorizedException(err.message)
        }
    }
}

module.exports = new TokenRepository();