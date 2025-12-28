import { Router } from "express";
import { ProfileController } from "./profile.controller";
import { validate } from "../../middlewares/validate.middleware";
import { updateProfileSchema } from "./profile.schema";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/me", ProfileController.getMe);

router.put("/me", validate(updateProfileSchema), ProfileController.updateMe);

router.get("/:userId", ProfileController.getByUserId);

export default router;
