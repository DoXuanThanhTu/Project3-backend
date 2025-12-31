"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const flag_controller_1 = require("./flag.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const authorize_middleware_1 = require("../../middlewares/authorize.middleware");
const role_type_1 = require("../../types/role.type");
const router = (0, express_1.Router)();
const controller = new flag_controller_1.MovieFlagController();
// Admin routes (cần auth và admin role)
// Public routes
router.get("/flags/:flagType/movies", controller.getMoviesByFlag);
router.get("/movies/:movieId/flags", controller.getMovieFlags);
// System endpoint (có thể bảo vệ bằng API key)
router.post("/system/calculate-flags", controller.calculateSystemFlags);
router.use(auth_middleware_1.authenticate); // Middleware xác thực người dùng
router.use((0, authorize_middleware_1.authorize)([role_type_1.Role.ADMIN])); // Middleware kiểm tra quyền ADMIN
router.post("/admin/flags", controller.addFlag);
router.delete("/admin/flags/:movieId/:flagType", controller.removeFlag);
router.put("/admin/flags/:movieId", controller.updateFlag);
exports.default = router;
