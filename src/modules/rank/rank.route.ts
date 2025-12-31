import express from "express";
import { rankController } from "./rank.controller";

const router = express.Router();

/**
 * @route GET /api/ranks
 * @description Lấy danh sách xếp hạng với filter
 * @access Public
 */
router.get("/", rankController.getRanks.bind(rankController));

/**
 * @route GET /api/ranks/most-viewed
 * @description Lấy xếp hạng phim xem nhiều nhất
 * @access Public
 */
router.get("/most-viewed", rankController.getMostViewed.bind(rankController));

/**
 * @route GET /api/ranks/top-rated
 * @description Lấy xếp hạng phim đánh giá cao nhất
 * @access Public
 */
router.get("/top-rated", rankController.getTopRated.bind(rankController));

/**
 * @route GET /api/ranks/newest
 * @description Lấy xếp hạng phim mới nhất
 * @access Public
 */
router.get("/newest", rankController.getNewest.bind(rankController));

/**
 * @route GET /api/ranks/trending
 * @description Lấy xếp hạng phim trending
 * @access Public
 */
router.get("/trending", rankController.getTrending.bind(rankController));

/**
 * @route GET /api/ranks/movie/:movieId
 * @description Lấy rank của một phim cụ thể
 * @access Public
 */
router.get("/movie/:movieId", rankController.getMovieRank.bind(rankController));

export default router;
