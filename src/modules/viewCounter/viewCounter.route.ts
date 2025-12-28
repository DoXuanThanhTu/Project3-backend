// routes/view.routes.ts
import express, { Router } from "express";
import {
  getMovieTotalViews,
  getStatistics,
  getTopMovies,
  incrementView,
} from "./viewCounter.controller";

const router: Router = express.Router();

// Tăng view
router.post("/increment", incrementView);

// Lấy thống kê
router.get("/stats", getStatistics);

// Lấy tổng view của movie
router.get("/movie/:movieId/total", getMovieTotalViews);

// Lấy top movies
router.get("/top", getTopMovies);

export default router;
