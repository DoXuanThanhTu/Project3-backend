"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const genre_controller_1 = require("./genre.controller");
const authorize_middleware_1 = require("../../middlewares/authorize.middleware");
const role_type_1 = require("../../types/role.type");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// ===== PUBLIC =====
router.get("/", genre_controller_1.GenreController.getActive);
router.get("/:slug", genre_controller_1.GenreController.getDetail);
// ===== ADMIN =====
router.use(auth_middleware_1.authenticate);
router.use((0, authorize_middleware_1.authorize)([role_type_1.Role.ADMIN]));
router.get("/admin/all", genre_controller_1.GenreController.getAll);
router.post("/", genre_controller_1.GenreController.create);
router.patch("/:id", genre_controller_1.GenreController.update);
router.delete("/:id", genre_controller_1.GenreController.delete);
exports.default = router;
