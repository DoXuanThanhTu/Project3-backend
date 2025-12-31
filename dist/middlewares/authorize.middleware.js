"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const http_error_1 = require("../errors/http.error");
const authorize = (allowedRoles) => (req, _res, next) => {
    if (!req.user) {
        throw new http_error_1.ForbiddenError("User not authenticated");
    }
    if (!allowedRoles.includes(req.user.role)) {
        throw new http_error_1.ForbiddenError("You do not have permission");
    }
    next();
};
exports.authorize = authorize;
