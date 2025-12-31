"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.HttpError = void 0;
class HttpError extends Error {
    constructor(statusCode, code, message) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
    }
}
exports.HttpError = HttpError;
class BadRequestError extends HttpError {
    constructor(message = "Bad request") {
        super(400, "BAD_REQUEST", message);
    }
}
exports.BadRequestError = BadRequestError;
class UnauthorizedError extends HttpError {
    constructor(message = "Unauthorized") {
        super(401, "UNAUTHORIZED", message);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends HttpError {
    constructor(message = "Forbidden") {
        super(403, "FORBIDDEN", message);
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends HttpError {
    constructor(message = "Not found") {
        super(404, "NOT_FOUND", message);
    }
}
exports.NotFoundError = NotFoundError;
