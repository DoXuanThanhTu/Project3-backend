import { authenticate } from "../../middlewares/auth.middleware";
import { ProfileController } from "./profile.controller";
// routes/profile.routes.ts
import { Router } from "express";

const router = Router();

// Public routes
router.get("/:userId/profile", ProfileController.getUserProfile);
router.get("/:userId/watch-history", ProfileController.getWatchHistory);
router.get("/:userId/favorites", ProfileController.getFavorites);
router.get("/:userId/reviews", ProfileController.getReviews);
router.get("/:userId/stats", ProfileController.getStats);

// Protected routes (require authentication)
router.use(authenticate);
router.get("/me", ProfileController.getMe);
router.patch("/update", ProfileController.updateProfile);
router.patch("/preferences", ProfileController.updatePreferences);
// router.post("/watch-history", ProfileController.addWatchHistory);
router.post("/favorites/toggle", ProfileController.toggleFavorite);
router.post("/reviews", ProfileController.createOrUpdateReview);
router.delete("/reviews/:reviewId", ProfileController.deleteReview);
router.post("/achievements", ProfileController.addAchievement);

export default router;
