export interface IEpisode {
  id: string;

  // Liên kết tới phim và server
  movieId?: string; // id phim cha
  serverId?: string; // id server stream (nếu có nhiều server)

  // Thông tin đa ngôn ngữ
  title: Map<string, string>; // tiêu đề theo ngôn ngữ { vi: "...", en: "..." }
  description?: Map<string, string>; // mô tả theo ngôn ngữ
  slug: Map<string, string>; // slug theo ngôn ngữ
  defaultLang: string; // ngôn ngữ mặc định

  // Thông tin tập
  episodeOrLabel?: string; // số tập hoặc nhãn đặc biệt ("1", "OVA1", "Special")
  duration?: string; // thời lượng (ví dụ "24m")
  thumbnail?: string; // ảnh thumbnail
  videoUrl?: string; // link video

  // Trạng thái
  isPublished: boolean; // đã publish hay chưa
  createdAt?: Date; // thời gian tạo
  updatedAt?: Date; // thời gian cập nhật
}
