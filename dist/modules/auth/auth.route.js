"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const auth_schema_1 = require("./auth.schema");
const rateLimit_middleware_1 = require("../../middlewares/rateLimit.middleware");
const router = (0, express_1.Router)();
router.post("/register", rateLimit_middleware_1.authRateLimit, (0, validate_middleware_1.validate)(auth_schema_1.registerSchema), auth_controller_1.AuthController.register);
router.post("/login", 
// authRateLimit,
// validate(loginSchema),
auth_controller_1.AuthController.login);
router.post("/refresh", (0, validate_middleware_1.validate)(auth_schema_1.refreshSchema), auth_controller_1.AuthController.refresh);
router.post("/logout", (0, validate_middleware_1.validate)(auth_schema_1.refreshSchema), auth_controller_1.AuthController.logout);
exports.default = router;
