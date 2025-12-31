"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const comment_controller_1 = require("./comment.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const authorize_middleware_1 = require("../../middlewares/authorize.middleware");
const role_type_1 = require("../../types/role.type");
const router = (0, express_1.Router)();
// ===== PUBLIC =====
router.get("/movie/:movieId", comment_controller_1.CommentController.getByMovie);
router.get("/:id", comment_controller_1.CommentController.getDetail);
router.get("/", comment_controller_1.CommentController.getAllComment);
// ===== ADMIN / USER =====
router.use(auth_middleware_1.authenticate);
router.use((0, authorize_middleware_1.authorize)([role_type_1.Role.ADMIN]));
router.get("/admin/all", comment_controller_1.CommentController.getAll);
router.post("/", comment_controller_1.CommentController.create);
router.patch("/:id", comment_controller_1.CommentController.update);
router.delete("/:id", comment_controller_1.CommentController.delete);
exports.default = router;
