const jwt = require('jsonwebtoken');
const {UnauthorizedException} = require('../common/exceptions');
const TokenRepository = require('../features/users/repository/tokenRepository');

module.exports = async function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    try {
        if (!token) {
            throw new UnauthorizedException('Missing authorization header');
        }
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET_KEY || 'test key');
        const {sub: userId} = decoded;
        console.log(userId)
        if (await TokenRepository.isAccessTokenBlacklisted(userId, token)) {
            throw new UnauthorizedException('Invalid access token');
        }
        req.userId = userId;
        next();
    } catch (err) {
        next(new UnauthorizedException(err.message));
    }
}