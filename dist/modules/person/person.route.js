"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const person_controller_1 = require("./person.controller");
const authorize_middleware_1 = require("../../middlewares/authorize.middleware");
const role_type_1 = require("../../types/role.type");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// ===== PUBLIC =====
router.get("/", person_controller_1.PersonController.getActive);
router.get("/:slug", person_controller_1.PersonController.getDetail);
// ===== ADMIN =====
router.use(auth_middleware_1.authenticate);
router.use((0, authorize_middleware_1.authorize)([role_type_1.Role.ADMIN]));
router.get("/admin/all", person_controller_1.PersonController.getAll);
router.post("/", person_controller_1.PersonController.create);
router.patch("/:id", person_controller_1.PersonController.update);
router.delete("/:id", person_controller_1.PersonController.delete);
exports.default = router;
