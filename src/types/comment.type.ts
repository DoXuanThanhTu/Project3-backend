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
  seasonOrLabel?: string; // ví dụ: "2", "OVA1", "Special"
  episode?: number; // số tập (nếu là series)
  user?: IUser;
  // Các hành động xã hội
  likes?: number; // số lượt thích
  dislikes?: number; // số lượt không thích
  shares?: number; // số lượt chia sẻ
  useful?: number; // số lượt đánh dấu hữu ích

  // Comment lồng nhau
  parentId?: string; // id comment cha (nếu là reply)
  replies?: IComment[]; // danh sách reply con

  // Trạng thái
  isEdited?: boolean; // comment đã chỉnh sửa chưa
  isDeleted?: boolean; // comment đã bị xoá chưa
}
