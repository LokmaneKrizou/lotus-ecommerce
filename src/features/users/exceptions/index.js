class UserNotFoundException extends Error {
    constructor(userId) {
        super(`User with ${userId} not found, sign up instead.`);
        this.name = "UserNotFoundException";
        this.status = 404;
    }
}

class UserAlreadyExistsException extends Error {
    constructor(email) {
        super(`A user with the email ${email} already exists, please login instead.`);
        this.name = "UserAlreadyExistsException";
        this.status = 409;
    }
}

class InvalidCredentialsException extends Error {
    constructor(message) {
        super(message);
        this.name = "InvalidCredentialsException";
        this.status = 400;
    }
}

class PasswordResetTokenInvalidException extends Error {
    constructor(message) {
        super(message);
        this.name = "PasswordResetTokenInvalidException";
        this.status = 400;
    }
}

class PasswordResetTokenExpiredException extends Error {
    constructor(message) {
        super(message);
        this.name = "PasswordResetTokenExpiredException";
        this.status = 400;
    }
}

class PasswordsDoNotMatchException extends Error {
    constructor(message) {
        super(message);
        this.name = "PasswordsDoNotMatchException";
        this.status = 400;
    }
}

module.exports = {
    UserNotFoundException,
    UserAlreadyExistsException,
    InvalidCredentialsException,
    PasswordsDoNotMatchException,
    PasswordResetTokenInvalidException,
    PasswordResetTokenExpiredException
}