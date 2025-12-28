import { Request, Response } from "express";
import { FranchiseService } from "./franchise.service";
import { getLocalizedValue } from "../../utils/i18n.util";

export class FranchiseController {
  // ===== PUBLIC =====
  static async getActive(req: Request, res: Response) {
    const lang = (req.query.lang as string) || "vi";
    const franchises = await FranchiseService.getAllActive();

    const data = franchises.map((f: any) => ({
      id: f._id,
      name: getLocalizedValue(f.name, lang, f.defaultLang),
      slug: getLocalizedValue(f.slug, lang, f.defaultLang),
      description: getLocalizedValue(f.description, lang, f.defaultLang),
    }));

    res.json({ success: true, data });
  }

  static async getDetail(req: Request, res: Response) {
    const lang = (req.query.lang as string) || "vi";
    const franchise = await FranchiseService.getBySlug(req.params.slug, lang);

    res.json({
      success: true,
      data: {
        id: franchise._id,
        name: getLocalizedValue(franchise.name, lang, franchise.defaultLang),
        description: getLocalizedValue(
          franchise.description,
          lang,
          franchise.defaultLang
        ),
        movies: franchise.movies,
      },
    });
  }

  // ===== ADMIN =====
  static async getAll(req: Request, res: Response) {
    const franchises = await FranchiseService.getAll();
    res.json({ success: true, data: franchises });
  }

  static async create(req: Request, res: Response) {
    const franchise = await FranchiseService.create(req.body);
    res.status(201).json({ success: true, data: franchise });
  }

  static async update(req: Request, res: Response) {
    const franchise = await FranchiseService.update(req.params.id, req.body);
    res.json({ success: true, data: franchise });
  }

  static async delete(req: Request, res: Response) {
    await FranchiseService.delete(req.params.id);
    res.json({ success: true });
  }
}
