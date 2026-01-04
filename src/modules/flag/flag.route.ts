import { Router } from "express";
import { MovieFlagController } from "./flag.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { Role } from "../../types/role.type";

const router = Router();
const controller = new MovieFlagController();

// Admin routes (cần auth và admin role)
// Public routes
router.get("/:flagType/movies", controller.getMoviesByFlag);
router.get("/movies/:movieId", controller.getMovieFlags);

// System endpoint (có thể bảo vệ bằng API key)
router.post("/system/calculate-flags", controller.calculateSystemFlags);

router.use(authenticate); // Middleware xác thực người dùng
router.use(authorize([Role.ADMIN])); // Middleware kiểm tra quyền ADMIN
router.post("/admin/flags", controller.addFlag);
router.delete("/admin/flags/:movieId/:flagType", controller.removeFlag);
router.put("/admin/flags/:movieId", controller.updateFlag);
export default router;
