import { get } from "node:http";
import { Router } from "express";
import { MovieController } from "./movie.controller";
import { authorize } from "../../middlewares/authorize.middleware";
import { Role } from "../../types/role.type";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

// ===== PUBLIC =====
router.get("/", MovieController.getPublished);
router.get("/:slug", MovieController.getDetail);
router.get("/genre/:slug", MovieController.getByGenre);
router.get("/search/:name", MovieController.searchMovies);
router.get("/same-franchise/:slug", MovieController.getMovieAndSameFranchise);
router.get("/franchise/:franchiseId", MovieController.getMovieByFranchise);

// ===== ADMIN =====
router.use(authenticate);
router.use(authorize([Role.ADMIN]));

router.get("/admin/all", MovieController.getAll);
router.post("/", MovieController.create);
router.patch("/:id", MovieController.update);
router.delete("/:id", MovieController.delete);

export default router;
