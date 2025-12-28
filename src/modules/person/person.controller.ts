import { Request, Response } from "express";
import { PersonService } from "./person.service";
import { getLocalizedValue } from "../../utils/i18n.util";
import { PersonRole } from "../../types/person.type";

export class PersonController {
  // ===== PUBLIC =====
  static async getActive(req: Request, res: Response) {
    const lang = (req.query.lang as string) || "vi";
    const role = req.query.role as PersonRole | undefined;

    const persons = await PersonService.getAllActive(role);

    const data = persons.map((p: any) => ({
      id: p._id,
      name: getLocalizedValue(p.name, lang, p.defaultLang),
      slug: getLocalizedValue(p.slug, lang, p.defaultLang),
      avatar: p.avatar,
      roles: p.roles,
    }));

    res.json({ success: true, data });
  }

  static async getDetail(req: Request, res: Response) {
    const lang = (req.query.lang as string) || "vi";
    const person = await PersonService.getBySlug(req.params.slug, lang);

    res.json({
      success: true,
      data: {
        id: person._id,
        name: getLocalizedValue(person.name, lang, person.defaultLang),
        bio: getLocalizedValue(person.bio, lang, person.defaultLang),
        avatar: person.avatar,
        cover: person.cover,
        birthday: person.birthday,
        country: person.country,
        roles: person.roles,
      },
    });
  }

  // ===== ADMIN =====
  static async getAll(req: Request, res: Response) {
    const persons = await PersonService.getAll();
    res.json({ success: true, data: persons });
  }

  static async create(req: Request, res: Response) {
    const person = await PersonService.create(req.body);
    res.status(201).json({ success: true, data: person });
  }

  static async update(req: Request, res: Response) {
    const person = await PersonService.update(req.params.id, req.body);
    res.json({ success: true, data: person });
  }

  static async delete(req: Request, res: Response) {
    await PersonService.delete(req.params.id);
    res.json({ success: true });
  }
}
