import { IPerson, PersonRole } from "../../types/person.type";
import { NotFoundError } from "../../errors/http.error";
import { PersonModel } from "../../models/person.model";

export class PersonService {
  // ===== PUBLIC =====
  static async getAllActive(role?: PersonRole) {
    const filter: any = { isActive: true };
    if (role) filter.roles = role;

    return PersonModel.find(filter).sort({ createdAt: -1 });
  }

  static async getBySlug(slug: string, lang: string) {
    const person = await PersonModel.findOne({
      [`slug.${lang}`]: slug,
      isActive: true,
    });

    if (!person) throw new NotFoundError("Person not found");
    return person;
  }

  // ===== ADMIN =====
  static async getAll() {
    return PersonModel.find().sort({ createdAt: -1 });
  }

  static async create(data: IPerson) {
    return PersonModel.create(data);
  }

  static async update(id: string, data: Partial<IPerson>) {
    const person = await PersonModel.findByIdAndUpdate(id, data, {
      new: true,
    });

    if (!person) throw new NotFoundError("Person not found");
    return person;
  }

  static async delete(id: string) {
    const person = await PersonModel.findByIdAndDelete(id);
    if (!person) throw new NotFoundError("Person not found");
  }
}
