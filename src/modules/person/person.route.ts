import { Router } from "express";
import { PersonController } from "./person.controller";
import { authorize } from "../../middlewares/authorize.middleware";
import { Role } from "../../types/role.type";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

// ===== PUBLIC =====
router.get("/", PersonController.getActive);
router.get("/:slug", PersonController.getDetail);

// ===== ADMIN =====
router.use(authenticate);
router.use(authorize([Role.ADMIN]));

router.get("/admin/all", PersonController.getAll);
router.post("/", PersonController.create);
router.patch("/:id", PersonController.update);
router.delete("/:id", PersonController.delete);

export default router;
