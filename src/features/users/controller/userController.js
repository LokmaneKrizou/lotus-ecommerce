const UserRepository = require('../repository/userRepository');
const TokenController = require('./tokenController');
const {InvalidCredentialsException} = require('../exceptions');
const bcrypt = require("bcryptjs");
const {BadRequestException} = require("../../../common/exceptions");

class UserController {

    constructor() {
        this.webLogin = this.webLogin.bind(this);
        this.mobileLogin = this.mobileLogin.bind(this);

    }

    async signup(req, res, next) {
        try {
            const input = req.body
            const {password, email, firstName, lastName, phone} = input;
            if (!password || !email || !firstName || !lastName || !phone) {
                next(new BadRequestException(" missing parameter"))
            }
            const hashedPassword = await bcrypt.hash(password, 12);
            const user = {
                ...input,
                password: hashedPassword
            };
            const result = await UserRepository.createUser(user)
            res.json({status: 'success', message: `user with email ${result.email} signed up successfully.`})
        } catch (err) {
            // console.log(err)
            next(err)
        }
    }

    async mobileLogin(req, res, next) {
        try {
            const tokens = await this.login(req.body, next)
            res.json({accessToken: tokens.accessToken, refreshToken: tokens.refreshToken});
        } catch (err) {
            next(err)
        }
    }

    async webLogin(req, res, next) {
        try {
            const tokens = await this.login(req.body, next)

            res.cookie('accessToken', tokens.accessToken, {
                httpOnly: false,
                secure: true,
                sameSite: 'lax',
            });
            res.cookie('refreshToken', tokens.refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'lax',
            });
            const user = await UserRepository.getUserById(tokens.userId)

            res.json({user: user});
        } catch (err) {
            next(err)
        }
    }

    async login(body, next) {
        try {
            const {password, email} = body
            if (!password || !email) {
                throw new BadRequestException(" missing parameter")
            }
            const user = await UserRepository.getUserByEmail(email)
            const isPasswordCorrect = await bcrypt.compare(password, user.password)
            if (!isPasswordCorrect) {
                throw new InvalidCredentialsException("Login failed, invalid credentials")

            }
            return await TokenController.generateTokens(user.id)
        } catch (err) {
            next(err)
        }
    }

    async logout(req, res, next) {
        try {
            const userId = req.userId;
            const accessToken = req.headers.authorization.split(' ')[1];
            await TokenController.deactivateTokens(userId, accessToken);
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
            res.json({message: " user logged out successfully"});
        } catch (err) {
            next(err)
        }
    }

    async deleteUser(req, res, next) {
        try {
            const userId = req.userId;
            const accessToken = req.headers.authorization.split(' ')[1]
            await TokenController.deactivateTokens(userId, accessToken);
            await UserRepository.deleteUser(userId);
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
            res.json({message: " user deleted successfully"});
        } catch (err) {
            next(err);
        }
    }

    async getUser(req, res, next) {
        try {
            const userId = req.userId;
            const user = await UserRepository.getUserById(userId)
            res.json({...user});
        } catch (err) {
            next(err);
        }
    }

    async updateUser(req, res, next) {
        try {
            const updatedUser = req.body
            const userId = req.userId;
            const user = await UserRepository.updateUser(userId, updatedUser)
            res.json({...user});
        } catch (err) {
            next(err);
        }
    }
    async changePassword(req, res, next) {
        try {
            const {newPassword, currentPassword} = req.body
            const userId = req.userId;

            // Fetch the user
            const user = await UserRepository.getUserByIdWithPassword(userId)

            // Check if current password matches
            const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password)
            if (!isPasswordCorrect) {
                throw new InvalidCredentialsException("Current password is incorrect");
            }

            // Hash the new password
            const hashedPassword = await bcrypt.hash(newPassword, 12);

            // Update the user's password
            const updatedUser = await UserRepository.updateUser(userId, { password: hashedPassword })

            res.json({message: "Password updated successfully"});
        } catch (err) {
            next(err);
        }
    }

    async getUsers(req, res, next) {
        try {
            const users = await UserRepository.getUsers()
            res.json({...users});
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new UserController();
