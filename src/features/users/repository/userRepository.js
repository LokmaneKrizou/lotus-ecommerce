const {UserAlreadyExistsException, UserNotFoundException} = require('../exceptions')
const User = require('../model/user');
const {BadRequestException} = require("../../../common/exceptions");

class UserRepository {

    async createUser(user) {
        try {
            const newUser = await User.create(user);
            delete newUser.password
            return newUser.toObject();

        } catch (err) {
            if (err.code === 11000) {
                throw new UserAlreadyExistsException(user.email);
            }
            throw err;
        }
    }
    async getUserByIdWithPassword(userId) {
        const user = await User.findOne({_id: userId}).select('-__v');
        if (!user) {
            throw new UserNotFoundException(userId);
        }
        return user.toObject();
    }
    async getUserById(userId) {
        const user = await User.findOne({_id: userId}).select('-password -__v');
        if (!user) {
            throw new UserNotFoundException(userId);
        }
        return user.toObject();
    }

    async getUserByEmail(email) {
        const user = await User.findOne({email: email});
        if (!user) {
            throw new UserNotFoundException(email);
        }
        return user
    }

    async updateUser(userId, updatedUser) {
        const user = await User.findByIdAndUpdate(userId, updatedUser, {new: true}).select('-password -__v');
        if (!user) {
            throw new UserNotFoundException(userId);
        }
        return user.toObject();
    }

    async deleteUser(userId) {
        const deletedUser = await User.findByIdAndDelete(userId).select('-password -__v');
        if (!deletedUser) {
            throw new UserNotFoundException(userId);
        }
        return deletedUser.toObject();

    }

    async getUsers() {
        const users = await User.find()
        if (!users) {
            throw new BadRequestException("there is no users at this moment.");
        }
        return users;
    }
}

module.exports = new UserRepository();
