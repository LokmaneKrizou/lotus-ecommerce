const jwt = require('jsonwebtoken');
const {UnauthorizedException, BadRequestException, InternalServerException} = require('../../../common/exceptions');
const getCachedTokenFor = require("../../../cache/getCachedTokenFor");
const redisClient = require("../../../cache");

const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION || '7 days';
const ACCESS_TOKEN_EXPIRATION = process.env.ACCESS_TOKEN_EXPIRATION || '1h';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET_KEY || "test key"

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
            const payload = {sub: userId};
            const options = {expiresIn: REFRESH_TOKEN_EXPIRATION};
            const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, options);
            const expireInSeconds = parseInt(REFRESH_TOKEN_EXPIRATION, 10) * 24 * 60 * 60;
            const jsonValue = JSON.stringify({token: refreshToken});
            await redisClient.set(userId, jsonValue, 'EX', expireInSeconds);
            return refreshToken;
        } catch (err) {
            throw err;
        }
    }

    async validateRefreshToken(token) {
        try {
            const payload = jwt.verify(token, REFRESH_TOKEN_SECRET)
            const userId = payload.sub.toString()
            const cachedToken = await getCachedTokenFor(userId);
            if (token !== cachedToken) throw new BadRequestException("Invalid Request, please login again")
            return userId
        } catch (err) {
            throw new BadRequestException(err.message);
        }
    }

    async deleteRefreshToken(userId) {
        try {
            await redisClient.del(userId);
        } catch (err) {
            throw new InternalServerException(err.message);
        }
    }

    async blacklistAccessToken(userId, accessToken) {
        try {
            const key = `BL${userId}`;
            const jsonValue = JSON.stringify({token: accessToken})
            await redisClient.set(key, jsonValue);
        } catch (err) {
            throw new InternalServerException(err.message);
        }
    }

    async isAccessTokenBlacklisted(userId, accessToken) {
        try {
            const key = `BL${userId}`;
            const cachedToken = await getCachedTokenFor(key);
            return cachedToken === accessToken;
        } catch (err) {
            throw new UnauthorizedException(err.message)
        }
    }
}

module.exports = new TokenRepository();