import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validate } from "../../middlewares/validate.middleware";
import { loginSchema, registerSchema, refreshSchema } from "./auth.schema";
import { authRateLimit } from "../../middlewares/rateLimit.middleware";

const router = Router();

router.post(
  "/register",
  authRateLimit,
  validate(registerSchema),
  AuthController.register
);

router.post(
  "/login",
  // authRateLimit,
  // validate(loginSchema),
  AuthController.login
);

router.post("/refresh", validate(refreshSchema), AuthController.refresh);

router.post("/logout", validate(refreshSchema), AuthController.logout);

export default router;
