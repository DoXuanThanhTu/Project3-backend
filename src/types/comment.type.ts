import { IMovie } from "./movie.type";
import { IUser } from "./user.type";

export interface IComment {
  id: string; // id comment
  userId?: string; // id người dùng
  content: string; // nội dung comment
  createdAt: Date; // thời gian tạo
  updatedAt?: Date; // thời gian chỉnh sửa
  // Liên kết tới phim/tập/season
  movie?: IMovie;
  movieId?: string; // id phim
  movieName?: string; // tên phim tại thời điểm comment
  episodeOrLabel?: string; // ví dụ: "2", "OVA1", "Special"
  episode?: number; // số tập (nếu là series)
  user?: IUser;
  // Các hành động xã hội
  likes?: string[]; // danh sách user đã thích
  dislikes?: string[]; // danh sách user đã không thích
  shares?: string[]; // danh sách user đã chia sẻ
  useful?: string[]; // danh sách user đã đánh dấu hữu ích

  // Comment lồng nhau
  parentId?: string | null; // id comment cha (nếu là reply)
  replies?: IComment[]; // danh sách reply con
  replyCount?: number; // số lượng reply con
  // Tổng hợp hành động
  totalLike?: number;
  totalDislike?: number;
  totalUseful?: number;
  totalShare?: number;
  // Trạng thái
  isEdited?: boolean; // comment đã chỉnh sửa chưa
  isDeleted?: boolean; // comment đã bị xoá chưa
}
