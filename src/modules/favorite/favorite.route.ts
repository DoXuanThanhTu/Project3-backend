import express, { Router } from "express";
import {
  addFavorite,
  checkFavorite,
  getFavoriteCount,
  getFavoriteStats,
  getMostFavorited,
  getMyFavorites,
  getUsersWhoFavorited,
  removeFavorite,
  toggleFavorite,
} from "./favorite.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router: Router = express.Router();

// Tất cả routes đều cần xác thực
router.use(authenticate);

// Thêm/xóa favorite
router.post("/", toggleFavorite); // Toggle favorite (thêm/xóa)
router.post("/add", addFavorite); // Thêm favorite (cũ)
router.delete("/:movieId", removeFavorite); // Xóa favorite

// Lấy danh sách favorite của user
router.get("/my-favorites", getMyFavorites);

// Kiểm tra favorite
router.get("/check/:movieId", checkFavorite);

// Đếm số lượt favorite của movie
router.get("/count/:movieId", getFavoriteCount);

// Lấy danh sách phim được yêu thích nhiều nhất
router.get("/most-favorited", getMostFavorited);

// Lấy danh sách user đã favorite một phim
router.get("/users/:movieId", getUsersWhoFavorited);

// Lấy thống kê favorite
router.get("/stats", getFavoriteStats);

export default router;
