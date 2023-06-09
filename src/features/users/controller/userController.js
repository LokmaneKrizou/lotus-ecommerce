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
            const {password, email, firstName, lastName, address, phone} = input;
            if (!password || !email || !firstName || !lastName || !address || !phone) {
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
            // await TokenController.deactivateTokens(userId, accessToken);

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
