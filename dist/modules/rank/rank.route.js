"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const rank_controller_1 = require("./rank.controller");
const router = express_1.default.Router();
/**
 * @route GET /api/ranks
 * @description Lấy danh sách xếp hạng với filter
 * @access Public
 */
router.get("/", rank_controller_1.rankController.getRanks.bind(rank_controller_1.rankController));
/**
 * @route GET /api/ranks/most-viewed
 * @description Lấy xếp hạng phim xem nhiều nhất
 * @access Public
 */
router.get("/most-viewed", rank_controller_1.rankController.getMostViewed.bind(rank_controller_1.rankController));
/**
 * @route GET /api/ranks/top-rated
 * @description Lấy xếp hạng phim đánh giá cao nhất
 * @access Public
 */
router.get("/top-rated", rank_controller_1.rankController.getTopRated.bind(rank_controller_1.rankController));
/**
 * @route GET /api/ranks/newest
 * @description Lấy xếp hạng phim mới nhất
 * @access Public
 */
router.get("/newest", rank_controller_1.rankController.getNewest.bind(rank_controller_1.rankController));
/**
 * @route GET /api/ranks/trending
 * @description Lấy xếp hạng phim trending
 * @access Public
 */
router.get("/trending", rank_controller_1.rankController.getTrending.bind(rank_controller_1.rankController));
/**
 * @route GET /api/ranks/movie/:movieId
 * @description Lấy rank của một phim cụ thể
 * @access Public
 */
router.get("/movie/:movieId", rank_controller_1.rankController.getMovieRank.bind(rank_controller_1.rankController));
exports.default = router;
