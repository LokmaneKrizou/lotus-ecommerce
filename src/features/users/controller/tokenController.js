const jwt = require('jsonwebtoken');
const TokenRepository = require('../repository/tokenRepository');
const UserRepository = require('../repository/userRepository');
const {InternalServerException, UnauthorizedException} = require('../../../common/exceptions');

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
            const userId = req.userId
            const {refreshToken} = req.body
            const tokenExists = await TokenRepository.validateRefreshToken(userId, refreshToken);
            if (!tokenExists) {
                throw new UnauthorizedException("Invalid Request, please login again");
            }
            const accessToken = await TokenRepository.generateAccessToken(userId);
            const newRefreshToken = await TokenRepository.generateRefreshToken(userId);
            res.json({accessToken, refreshToken: newRefreshToken});
        } catch (err) {
            if (err instanceof jwt.TokenExpiredError) {
                next(new UnauthorizedException('Expired refresh token'));
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
