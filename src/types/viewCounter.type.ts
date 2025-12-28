export interface IViewCounter {
  // Liên kết với Movie và Episode
  movieId?: string;
  episodeId?: string;

  // Thông tin view
  date: Date;
  count: number;

  // Phân loại view
  viewType: "movie" | "episode" | "trailer" | "preview";

  // Thông tin người dùng (nếu có)
  userId?: string;

  // Thông tin device/session để tránh spam
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;

  // Thời gian xem (cho phân tích)
  watchDuration: number;

  // Trạng thái
  isUnique: boolean;

  // Timestamps do Mongoose tự thêm
  createdAt?: Date;
  updatedAt?: Date;
}
