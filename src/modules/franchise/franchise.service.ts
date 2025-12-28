import { NotFoundError } from "../../errors/http.error";
import { FranchiseModel } from "../../models/franchise.model";
import { IFranchise } from "../../types/franchise.type";

export class FranchiseService {
  // ===== PUBLIC =====
  static async getAllActive() {
    return FranchiseModel.find({ isPublished: true })
      .sort({ createdAt: 1 })
      .populate("movies");
  }

  static async getBySlug(slug: string, lang: string) {
    const franchise = await FranchiseModel.findOne({
      [`slug.${lang}`]: slug,
      isPublished: true,
    }).populate("movies");

    if (!franchise) throw new NotFoundError("Franchise not found");
    return franchise;
  }

  // ===== ADMIN =====
  static async getAll() {
    return FranchiseModel.find().sort({ createdAt: -1 }).populate("movies");
  }

  static async create(data: IFranchise) {
    return FranchiseModel.create(data);
  }

  static async update(id: string, data: Partial<IFranchise>) {
    const franchise = await FranchiseModel.findByIdAndUpdate(id, data, {
      new: true,
    }).populate("movies");

    if (!franchise) throw new NotFoundError("Franchise not found");
    return franchise;
  }

  static async delete(id: string) {
    const franchise = await FranchiseModel.findByIdAndDelete(id);
    if (!franchise) throw new NotFoundError("Franchise not found");
  }
}
