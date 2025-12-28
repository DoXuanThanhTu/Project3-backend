import { Router } from "express";
import { CommentController } from "./comment.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { Role } from "../../types/role.type";

const router = Router();

// ===== PUBLIC =====
router.get("/movie/:movieId", CommentController.getByMovie);
router.get("/:id", CommentController.getDetail);
router.get("/", CommentController.getAllComment);

// ===== ADMIN / USER =====
router.use(authenticate);
router.use(authorize([Role.ADMIN]));
router.get("/admin/all", CommentController.getAll);
router.post("/", CommentController.create);
router.patch("/:id", CommentController.update);
router.delete("/:id", CommentController.delete);

export default router;
