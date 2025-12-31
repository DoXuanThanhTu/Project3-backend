"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/view.routes.ts
const express_1 = __importDefault(require("express"));
const viewCounter_controller_1 = require("./viewCounter.controller");
const router = express_1.default.Router();
// Tăng view
router.post("/increment", viewCounter_controller_1.incrementView);
// Lấy thống kê
router.get("/stats", viewCounter_controller_1.getStatistics);
// Lấy tổng view của movie
router.get("/movie/:movieId/total", viewCounter_controller_1.getMovieTotalViews);
// Lấy top movies
router.get("/top", viewCounter_controller_1.getTopMovies);
exports.default = router;
