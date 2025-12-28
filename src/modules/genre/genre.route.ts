import { Router } from "express";
import { GenreController } from "./genre.controller";
import { authorize } from "../../middlewares/authorize.middleware";
import { Role } from "../../types/role.type";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

// ===== PUBLIC =====
router.get("/", GenreController.getActive);
router.get("/:slug", GenreController.getDetail);

// ===== ADMIN =====
router.use(authenticate);
router.use(authorize([Role.ADMIN]));

router.get("/admin/all", GenreController.getAll);
router.post("/", GenreController.create);
router.patch("/:id", GenreController.update);
router.delete("/:id", GenreController.delete);

export default router;
