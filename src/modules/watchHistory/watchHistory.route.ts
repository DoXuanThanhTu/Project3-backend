import express, { Router } from "express";
import {
  addWatchHistory,
  getMyWatchHistory,
  getRecentHistory,
  getMovieHistory,
  deleteWatchHistory,
  clearAllHistory,
  getHistoryStats,
  getContinueWatching,
  getWatchProgress,
  getMostWatchedGenres,
} from "./watchHistory.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router: Router = express.Router();

// Tất cả routes đều cần xác thực
router.use(authenticate);

// Thêm/cập nhật lịch sử xem
router.post("/", addWatchHistory);

// Lấy lịch sử xem của user
router.get("/", getMyWatchHistory);

// Lấy lịch sử xem gần đây
router.get("/recent", getRecentHistory);

// Lấy lịch sử xem của một phim cụ thể
router.get("/movie/:movieId", getMovieHistory);

// Xóa một mục lịch sử xem
router.delete("/:historyId", deleteWatchHistory);

// Xóa toàn bộ lịch sử xem
router.delete("/", clearAllHistory);

// Lấy thống kê lịch sử xem
router.get("/stats", getHistoryStats);

// Lấy danh sách "Tiếp tục xem"
router.get("/continue-watching", getContinueWatching);

// Lấy tiến độ xem của một phim
router.get("/progress/:movieId", getWatchProgress);

// Lấy thể loại xem nhiều nhất
router.get("/top-genres", getMostWatchedGenres);

export default router;
