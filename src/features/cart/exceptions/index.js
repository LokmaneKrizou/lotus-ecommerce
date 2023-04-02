class CartNotFoundException extends Error {
    constructor(cartId) {
        super(`Cart with id ${cartId} not found.`);
        this.name = "CartNotFoundException";
        this.status = 404;
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
};
