// routes/view.routes.ts
import express, { Router } from "express";
import {
  incrementView,
  getStatistics,
  getMovieStats,
  getTopMovies,
  getTrendingMovies,
  getViewAnalytics,
  manualUpdateMovieStats,
  batchUpdateAllMovieStats,
} from "./viewCounter.controller";

const router: Router = express.Router();

// Public routes
router.post("/increment", incrementView);
router.get("/stats", getStatistics);
router.get("/movie/:movieId/stats", getMovieStats);
router.get("/top", getTopMovies);
router.get("/trending", getTrendingMovies);

// Analytics route
router.get("/analytics", getViewAnalytics);

// Admin routes (might want to add authentication middleware)
router.post("/movie/:movieId/update-stats", manualUpdateMovieStats);
router.post("/batch-update-stats", batchUpdateAllMovieStats);

export default router;
