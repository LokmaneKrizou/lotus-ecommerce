class CartNotFoundException extends Error {
    constructor(cartId) {
        super(`Cart with id ${cartId} not found.`);
        this.name = "CartNotFoundException";
        this.status = 404;
    }
}

class CartAlreadyExistsForUserException extends Error {
    constructor() {
        super(`You have abandoned cart already, something went wrong.`);
        this.name = "CartAlreadyExistsForUserException";
        this.status = 409;
    }
}

class InvalidCartBodyException extends Error {
    constructor(message) {
        super(message);
        this.name = "InvalidCartDataException";
        this.status = 400;
    }
}

module.exports = {
    CartNotFoundException,
    InvalidCartBodyException,
    CartAlreadyExistsForUserException
};
