const jwt = require('jsonwebtoken');
const TokenRepository = require('../repository/tokenRepository');
const {BadRequestException} = require('../../../common/exceptions');

class TokenController {
    async generateTokens(userId) {
        try {
            const accessToken = await TokenRepository.generateAccessToken(userId);
            const refreshToken = await TokenRepository.generateRefreshToken(userId);
            return {accessToken, refreshToken};
        } catch (err) {
            throw err
        }
    }

    async refreshToken(req, res, next) {
        try {
            const {refreshToken, grantType} = req.body
            if (grantType === "refresh_token" && refreshToken != null && refreshToken !== "") {
                const userId = await TokenRepository.validateRefreshToken(refreshToken);
                const accessToken = await TokenRepository.generateAccessToken(userId);
                const newRefreshToken = await TokenRepository.generateRefreshToken(userId);
                res.json({accessToken, refreshToken: newRefreshToken});
            } else {
                throw new BadRequestException('"Login failed, invalid credentials')
            }
        } catch (err) {
            if (err instanceof jwt.TokenExpiredError) {
                next(new BadRequestException("Login failed, invalid credentials"));
            } else {
                next(err);
            }
        }
    }

    async deactivateTokens(userId, accessToken) {
        try {
            await TokenRepository.deleteRefreshToken(userId);
            await TokenRepository.blacklistAccessToken(userId, accessToken);
            return true;
        } catch (err) {
            throw err
        }
    }
}

module.exports = new TokenController();
