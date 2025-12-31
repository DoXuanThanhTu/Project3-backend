"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const http_error_1 = require("../errors/http.error");
const requireRole = (...roles) => (req, res, next) => {
    if (!req.user)
        throw new http_error_1.ForbiddenError();
    if (!roles.includes(req.user.role)) {
        throw new http_error_1.ForbiddenError("Permission denied");
    }
    next();
};
exports.requireRole = requireRole;
