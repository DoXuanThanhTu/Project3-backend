"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const movie_controller_1 = require("./movie.controller");
const authorize_middleware_1 = require("../../middlewares/authorize.middleware");
const role_type_1 = require("../../types/role.type");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// ===== PUBLIC ROUTES (Không cần xác thực) =====
router.get("/full/:slug", movie_controller_1.MovieController.getFullDetails); // Lấy toàn bộ thông tin movie
router.get("/", movie_controller_1.MovieController.getPublished); // Lấy danh sách phim đã publish
router.get("/type/:type", movie_controller_1.MovieController.getMoviesByType); // Lấy phim theo type (phim lẻ, phim bộ, series...)
router.get("/genre/:slug", movie_controller_1.MovieController.getByGenre); // Lấy phim theo thể loại
router.get("/search/:keyword", movie_controller_1.MovieController.searchMovies); // Tìm kiếm phim
router.get("/same-franchise/:slug", movie_controller_1.MovieController.getMovieAndSameFranchise); // Lấy phim và các phim cùng franchise
router.get("/franchise/:franchiseId", movie_controller_1.MovieController.getMovieByFranchise); // Lấy phim theo franchise
router.get("/:slug", movie_controller_1.MovieController.getDetail); // Lấy chi tiết phim bằng slug
router.get("/:movieId/episodes/server/:serverId", movie_controller_1.MovieController.getEpisodesByServer); // Lấy episodes theo server
router.get("/:movieId/episode/:episodeId", movie_controller_1.MovieController.getEpisodeDetail); // Lấy chi tiết episode
// ===== ADMIN ROUTES (Cần xác thực và quyền ADMIN) =====
router.use(auth_middleware_1.authenticate); // Middleware xác thực người dùng
router.use((0, authorize_middleware_1.authorize)([role_type_1.Role.ADMIN])); // Middleware kiểm tra quyền ADMIN
// Thống kê
router.get("/admin/stats", movie_controller_1.MovieController.getStats); // Lấy thống kê
// Quản lý phim
router.get("/admin/all", movie_controller_1.MovieController.getAll); // Lấy tất cả phim (bao gồm chưa publish)
router.get("/admin/:id", movie_controller_1.MovieController.getOne); // Lấy chi tiết phim bằng ID (admin)
router.post("/admin", movie_controller_1.MovieController.create); // Tạo phim mới
router.patch("/admin/:id", movie_controller_1.MovieController.update); // Cập nhật phim
router.delete("/admin/:id", movie_controller_1.MovieController.delete); // Xóa phim
// Bulk operations
router.patch("/admin/bulk/update", movie_controller_1.MovieController.bulkUpdate); // Cập nhật nhiều phim cùng lúc
router.delete("/admin/bulk/delete", movie_controller_1.MovieController.bulkDelete); // Xóa nhiều phim cùng lúc
// Quản lý trạng thái
router.patch("/admin/:id/publish", movie_controller_1.MovieController.togglePublish); // Bật/tắt trạng thái publish
exports.default = router;
