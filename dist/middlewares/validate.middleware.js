"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const http_error_1 = require("../errors/http.error");
const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
    });
    if (!result.success) {
        throw new http_error_1.BadRequestError(result.error.issues[0].message);
    }
    next();
};
exports.validate = validate;
