import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { Role } from "../../types/role.type";
import { AdminController } from "./admin.controller";

const router = Router();

router.use(authenticate);
router.use(authorize([Role.ADMIN]));
router.get("/stats", AdminController.getMovieStats);
export default router;
