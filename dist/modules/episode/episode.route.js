"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const episode_controller_1 = require("./episode.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const authorize_middleware_1 = require("../../middlewares/authorize.middleware");
const role_type_1 = require("../../types/role.type");
const router = (0, express_1.Router)();
// ===== PUBLIC =====
router.get("/movie/:movieId", episode_controller_1.EpisodeController.getByMovie);
router.get("/:id", episode_controller_1.EpisodeController.getDetail);
router.get("/", episode_controller_1.EpisodeController.getAllEpisode);
// ===== ADMIN / USER =====
router.use(auth_middleware_1.authenticate);
router.use((0, authorize_middleware_1.authorize)([role_type_1.Role.ADMIN]));
router.get("/admin/all", episode_controller_1.EpisodeController.getAll);
router.post("/", episode_controller_1.EpisodeController.create);
router.patch("/:id", episode_controller_1.EpisodeController.update);
router.delete("/:id", episode_controller_1.EpisodeController.delete);
router.post("/create-from-text", episode_controller_1.EpisodeController.createFromText);
exports.default = router;
