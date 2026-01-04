import { Router } from "express";
import { CommentController } from "./comment.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { Role } from "../../types/role.type";

const router = Router();

// ===== PUBLIC =====
router.get("/root", CommentController.getRootComment);
router.delete("/:id", CommentController.delete);
router.get("/replies/:rootId", CommentController.getRepliesByRoot);
router.get("/movie/:movieId", CommentController.getByMovie);
router.get("/:id", CommentController.getDetail);
router.get("/", CommentController.getAllComment);

// ===== USER =====
router.use(authenticate);

router.post("/", CommentController.create);
router.get("/me/comments", CommentController.getMyComment);
router.patch("/:id", CommentController.update);
router.post("/react/:id", CommentController.react);
// ===== ADMIN =====

router.use(authorize([Role.ADMIN]));
router.get("/admin/all", CommentController.getAll);
export default router;
