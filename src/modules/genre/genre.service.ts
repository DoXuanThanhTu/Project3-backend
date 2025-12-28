import { IGenre } from "../../types/genre.type";
import { NotFoundError } from "../../errors/http.error";
import { GenreModel } from "../../models/genre.model";

export class GenreService {
  // ===== PUBLIC =====
  static async getAllActive() {
    return GenreModel.find({ isActive: true }).sort({ createdAt: 1 });
  }

  static async getBySlug(slug: string, lang: string) {
    const genre = await GenreModel.findOne({
      [`slug.${lang}`]: slug,
      isActive: true,
    });

    if (!genre) throw new NotFoundError("Genre not found");
    return genre;
  }

  // ===== ADMIN =====
  static async getAll() {
    return GenreModel.find().sort({ createdAt: -1 });
  }

  static async create(data: IGenre) {
    return GenreModel.create(data);
  }

  static async update(id: string, data: Partial<IGenre>) {
    const genre = await GenreModel.findByIdAndUpdate(id, data, {
      new: true,
    });

    if (!genre) throw new NotFoundError("Genre not found");
    return genre;
  }

  static async delete(id: string) {
    const genre = await GenreModel.findByIdAndDelete(id);
    if (!genre) throw new NotFoundError("Genre not found");
  }
}
