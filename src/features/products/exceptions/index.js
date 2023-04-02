class ProductNotFoundException extends Error {
    constructor(productId) {
        super(`Product with id ${productId} not found.`);
        this.name = "ProductNotFoundException";
        this.status = 404;
    }
}

class ProductAlreadyExistsException extends Error {
    constructor(name) {
        super(`Product with name ${name} already exists.`);
        this.name = "ProductAlreadyExistsException";
        this.status = 409;
    }
}

class InvalidProductBodyException extends Error {
    constructor(message) {
        super(message);
        this.name = "InvalidProductDataException";
        this.status = 400;
    }
}

module.exports = {
    ProductNotFoundException,
    ProductAlreadyExistsException,
    InvalidProductBodyException
};
