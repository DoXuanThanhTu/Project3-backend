import { Router } from "express";
import { EpisodeController } from "./episode.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { Role } from "../../types/role.type";

const router = Router();

// ===== PUBLIC =====
router.get("/movie/:movieId", EpisodeController.getByMovie);
router.get("/:id", EpisodeController.getDetail);
router.get("/", EpisodeController.getAllEpisode);

// ===== ADMIN / USER =====
router.use(authenticate);
router.use(authorize([Role.ADMIN]));

router.get("/admin/all", EpisodeController.getAll);
router.post("/", EpisodeController.create);
router.patch("/:id", EpisodeController.update);
router.delete("/:id", EpisodeController.delete);
router.post("/create-from-text", EpisodeController.createFromText);
export default router;
