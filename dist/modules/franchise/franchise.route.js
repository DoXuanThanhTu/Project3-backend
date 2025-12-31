"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const franchise_controller_1 = require("./franchise.controller");
const authorize_middleware_1 = require("../../middlewares/authorize.middleware");
const role_type_1 = require("../../types/role.type");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// ===== PUBLIC =====
router.get("/", franchise_controller_1.FranchiseController.getActive);
router.get("/:slug", franchise_controller_1.FranchiseController.getDetail);
// ===== ADMIN =====
router.use(auth_middleware_1.authenticate);
router.use((0, authorize_middleware_1.authorize)([role_type_1.Role.ADMIN]));
router.get("/admin/all", franchise_controller_1.FranchiseController.getAll);
router.post("/", franchise_controller_1.FranchiseController.create);
router.patch("/:id", franchise_controller_1.FranchiseController.update);
router.delete("/:id", franchise_controller_1.FranchiseController.delete);
exports.default = router;
