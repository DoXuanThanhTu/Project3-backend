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

router.patch("/:userId/profile", ProfileController.updateProfile);
router.patch("/:userId/preferences", ProfileController.updatePreferences);
router.post("/:userId/watch-history", ProfileController.addWatchHistory);
router.post("/:userId/favorites/toggle", ProfileController.toggleFavorite);
router.post("/:userId/reviews", ProfileController.createOrUpdateReview);
router.delete("/:userId/reviews/:reviewId", ProfileController.deleteReview);
router.post("/:userId/achievements", ProfileController.addAchievement);

export default router;
