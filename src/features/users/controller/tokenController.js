const jwt = require('jsonwebtoken');
const TokenRepository = require('../repository/tokenRepository');
const {BadRequestException} = require('../../../common/exceptions');

class TokenController {
    constructor() {
        this.webRefreshToken = this.webRefreshToken.bind(this);
        this.mobileRefreshToken = this.mobileRefreshToken.bind(this);

    }

    async generateTokens(userId) {
        try {
            const accessToken = await TokenRepository.generateAccessToken(userId);
            const refreshToken = await TokenRepository.generateRefreshToken(userId);
            return {accessToken, refreshToken, userId};
        } catch (err) {
            throw err
        }
    }

    async webRefreshToken(req, res, next) {
        try {
            // Get refreshToken from cookies
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                throw new BadRequestException("Missing refresh token");
            }
            const tokens = await this.refreshToken(refreshToken, next)
            // Set new tokens in cookies
            res.cookie('accessToken', tokens.accessToken, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
            });
            res.cookie('refreshToken', tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
            });

            res.json({status: 'success'});
        } catch (err) {
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
            });
            res.clearCookie('accessToken', {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
            });
            next(err);
        }
    }

    async mobileRefreshToken(req, res, next) {
        try {
            const {refreshToken, grantType} = req.body
            if (grantType !== "refresh_token" && refreshToken == null && refreshToken === "") {
                throw new BadRequestException('"Login failed, invalid credentials')
            }
            const tokens = await this.refreshToken(refreshToken, next)
            res.json({...tokens})
        } catch (err) {
            next(err)
        }
    }

    async refreshToken(refreshToken, next) {
        try {
            // const userId = await TokenRepository.validateRefreshToken(refreshToken);
            const userId= "6447efa795981b1998025763"
            const accessToken = await TokenRepository.generateAccessToken(userId);
            const newRefreshToken = await TokenRepository.generateRefreshToken(userId);
            return {accessToken, refreshToken: newRefreshToken};
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
