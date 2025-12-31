"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const server_controller_1 = require("./server.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const authorize_middleware_1 = require("../../middlewares/authorize.middleware");
const role_type_1 = require("../../types/role.type");
const router = (0, express_1.Router)();
// ===== PUBLIC =====
router.get("/", server_controller_1.ServerController.getActive);
router.get("/:id", server_controller_1.ServerController.getDetail);
// ===== ADMIN =====
router.use(auth_middleware_1.authenticate);
router.use((0, authorize_middleware_1.authorize)([role_type_1.Role.ADMIN]));
router.get("/admin/all", server_controller_1.ServerController.getAll);
router.post("/", server_controller_1.ServerController.create);
router.patch("/:id", server_controller_1.ServerController.update);
router.delete("/:id", server_controller_1.ServerController.delete);
exports.default = router;
