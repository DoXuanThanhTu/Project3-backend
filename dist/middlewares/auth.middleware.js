"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const http_error_1 = require("../errors/http.error");
const jwt_1 = require("../utils/jwt");
const authenticate = (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new http_error_1.UnauthorizedError("Authorization header missing");
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            throw new http_error_1.UnauthorizedError("Token not found");
        }
        const payload = (0, jwt_1.verifyAccessToken)(token);
        req.user = payload;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.authenticate = authenticate;
