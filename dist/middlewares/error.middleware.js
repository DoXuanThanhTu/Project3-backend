"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const http_error_1 = require("../errors/http.error");
const errorMiddleware = (err, req, res, next) => {
    if (err instanceof http_error_1.HttpError) {
        return res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.code,
                message: err.message,
            },
        });
    }
    console.error(err);
    res.status(500).json({
        success: false,
        error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong",
        },
    });
};
exports.errorMiddleware = errorMiddleware;
