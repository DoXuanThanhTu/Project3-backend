import { Router } from "express";
import { ServerController } from "./server.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { Role } from "../../types/role.type";

const router = Router();

// ===== PUBLIC =====
router.get("/", ServerController.getActive);
router.get("/:id", ServerController.getDetail);

// ===== ADMIN =====
router.use(authenticate);
router.use(authorize([Role.ADMIN]));

router.get("/admin/all", ServerController.getAll);
router.post("/", ServerController.create);
router.patch("/:id", ServerController.update);
router.delete("/:id", ServerController.delete);

export default router;
