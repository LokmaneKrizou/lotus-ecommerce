class BadRequestException extends Error {
    constructor(message) {
        super(message);
        this.name = 'BadRequestException';
        this.statusCode = 400;
    }
}

class ForbiddenException extends Error {
    constructor(message) {
        super(message);
        this.name = "ForbiddenException";
        this.statusCode = 403;
    }
}

class InternalServerException extends Error {
    constructor(message) {
        super(message);
        this.name = 'InternalServerException';
        this.statusCode = 500;
    }
}

class NotFoundException extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundException';
        this.statusCode = 404;
    }
}

class UnauthorizedException extends Error {
    constructor(message) {
        super(message);
        this.name = 'UnauthorizedException';
        this.statusCode = 401;
    }
}


module.exports = {
    ForbiddenException,
    BadRequestException,
    InternalServerException,
    NotFoundException,
    UnauthorizedException
};