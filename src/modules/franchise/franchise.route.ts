import { Router } from "express";
import { FranchiseController } from "./franchise.controller";
import { authorize } from "../../middlewares/authorize.middleware";
import { Role } from "../../types/role.type";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

// ===== PUBLIC =====
router.get("/", FranchiseController.getActive);
router.get("/:slug", FranchiseController.getDetail);

// ===== ADMIN =====
router.use(authenticate);
router.use(authorize([Role.ADMIN]));

router.get("/admin/all", FranchiseController.getAll);
router.post("/", FranchiseController.create);
router.patch("/:id", FranchiseController.update);
router.delete("/:id", FranchiseController.delete);

export default router;
