import { Router } from "express";
import { MovieController } from "./movie.controller";
import { authorize } from "../../middlewares/authorize.middleware";
import { Role } from "../../types/role.type";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

// ===== PUBLIC ROUTES (Không cần xác thực) =====
router.get("/full/:slug", MovieController.getFullDetails); // Lấy toàn bộ thông tin movie

router.get("/", MovieController.getPublished); // Lấy danh sách phim đã publish
router.get("/new", MovieController.getNewMoviePublished); // Lấy danh sách phim mới nhất
router.get("/type/:type", MovieController.getMoviesByType); // Lấy phim theo type (phim lẻ, phim bộ, series...)
router.get("/genre/:slug", MovieController.getByGenre); // Lấy phim theo thể loại
router.get("/search/:keyword", MovieController.searchMovies); // Tìm kiếm phim
router.get("/same-franchise/:slug", MovieController.getMovieAndSameFranchise); // Lấy phim và các phim cùng franchise
router.get("/franchise/:franchiseId", MovieController.getMovieByFranchise); // Lấy phim theo franchise
router.get("/:slug", MovieController.getDetail); // Lấy chi tiết phim bằng slug
router.get(
  "/:movieId/episodes/server/:serverId",
  MovieController.getEpisodesByServer
); // Lấy episodes theo server
router.get("/:movieId/episode/:episodeId", MovieController.getEpisodeDetail); // Lấy chi tiết episode

// ===== ADMIN ROUTES (Cần xác thực và quyền ADMIN) =====
router.use(authenticate); // Middleware xác thực người dùng
router.use(authorize([Role.ADMIN])); // Middleware kiểm tra quyền ADMIN
// Thống kê
router.get("/admin/stats", MovieController.getStats); // Lấy thống kê
// Quản lý phim
router.get("/admin/all", MovieController.getAll); // Lấy tất cả phim (bao gồm chưa publish)
router.get("/admin/:id", MovieController.getOne); // Lấy chi tiết phim bằng ID (admin)
router.post("/admin", MovieController.create); // Tạo phim mới
router.patch("/admin/:id", MovieController.update); // Cập nhật phim
router.delete("/admin/:id", MovieController.delete); // Xóa phim

// Bulk operations
router.patch("/admin/bulk/update", MovieController.bulkUpdate); // Cập nhật nhiều phim cùng lúc
router.delete("/admin/bulk/delete", MovieController.bulkDelete); // Xóa nhiều phim cùng lúc

// Quản lý trạng thái
router.patch("/admin/:id/publish", MovieController.togglePublish); // Bật/tắt trạng thái publish

export default router;
