"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const profile_controller_1 = require("./profile.controller");
// routes/profile.routes.ts
const express_1 = require("express");
const router = (0, express_1.Router)();
// Public routes
router.get("/:userId/profile", profile_controller_1.ProfileController.getUserProfile);
router.get("/:userId/watch-history", profile_controller_1.ProfileController.getWatchHistory);
router.get("/:userId/favorites", profile_controller_1.ProfileController.getFavorites);
router.get("/:userId/reviews", profile_controller_1.ProfileController.getReviews);
router.get("/:userId/stats", profile_controller_1.ProfileController.getStats);
// Protected routes (require authentication)
router.use(auth_middleware_1.authenticate);
router.patch("/:userId/profile", profile_controller_1.ProfileController.updateProfile);
router.patch("/:userId/preferences", profile_controller_1.ProfileController.updatePreferences);
router.post("/:userId/watch-history", profile_controller_1.ProfileController.addWatchHistory);
router.post("/:userId/favorites/toggle", profile_controller_1.ProfileController.toggleFavorite);
router.post("/:userId/reviews", profile_controller_1.ProfileController.createOrUpdateReview);
router.delete("/:userId/reviews/:reviewId", profile_controller_1.ProfileController.deleteReview);
router.post("/:userId/achievements", profile_controller_1.ProfileController.addAchievement);
exports.default = router;
