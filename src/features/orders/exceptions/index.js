class OrderNotFoundException extends Error {
    constructor(orderId) {
        super(`Order with id ${orderId} not found.`);
        this.name = "OrderNotFoundException";
        this.status = 404;
    }
}

class InvalidOrderBodyException extends Error {
    constructor(message) {
        super(message);
        this.name = "InvalidOrderDataException";
        this.status = 400;
    }
}

module.exports = {
    OrderNotFoundException,
    InvalidOrderBodyException,
};
