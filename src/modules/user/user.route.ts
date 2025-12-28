import { Router } from "express";
import { UserController } from "./user.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { Role } from "../../types/role.type";

const router = Router();

router.use(authenticate);
router.use(authorize([Role.ADMIN]));

router.get("/", UserController.getAll);
router.get("/:id", UserController.getById);
router.patch("/:id", UserController.update);
router.patch("/:id/role", UserController.updateRole);
router.patch("/:id/status", UserController.updateStatus);

export default router;
