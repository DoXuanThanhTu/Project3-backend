import { Request, Response } from "express";
import { FranchiseService } from "./franchise.service";
import { getLocalizedValueMap } from "../../utils/i18n.util";

export class FranchiseController {
  // ===== PUBLIC =====
  static async getActive(req: Request, res: Response) {
    const lang = (req.query.lang as string) || "vi";

    const franchises = await FranchiseService.getAllActive();

    const data = franchises.map((f: any) => ({
      id: f._id,
      title: getLocalizedValueMap(f.title, lang, f.defaultLang),
      slug: getLocalizedValueMap(f.slug, lang, f.defaultLang),
      description: getLocalizedValueMap(f.description, lang, f.defaultLang),
      movies: f.movies
        ? f.movies.map((m: any) => ({
            id: m._id,
            name: getLocalizedValueMap(m.title, lang, m.defaultLang),
            slug: getLocalizedValueMap(m.slug, lang, m.defaultLang),
            description: getLocalizedValueMap(
              m.description,
              lang,
              m.defaultLang
            ),
          }))
        : [],
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
        title: getLocalizedValueMap(
          franchise.title,
          lang,
          franchise.defaultLang
        ),
        slug: getLocalizedValueMap(franchise.slug, lang, franchise.defaultLang),
        description: getLocalizedValueMap(
          franchise.description,
          lang,
          franchise.defaultLang
        ),
        movies: franchise.movies
          ? franchise.movies.map((m: any) => ({
              id: m._id,
              title: getLocalizedValueMap(m.title, lang, m.defaultLang),
              slug: getLocalizedValueMap(m.slug, lang, m.defaultLang),
              description: getLocalizedValueMap(
                m.description,
                lang,
                m.defaultLang
              ),
            }))
          : [],
      },
    });
  }

  // ===== ADMIN =====
  static async getAll(req: Request, res: Response) {
    const franchises = await FranchiseService.getAll();

    res.json({
      success: true,
      data: franchises,
    });
  }

  static async create(req: Request, res: Response) {
    const franchise = await FranchiseService.create(req.body);

    res.status(201).json({
      success: true,
      data: franchise,
    });
  }

  static async update(req: Request, res: Response) {
    const franchise = await FranchiseService.update(req.params.id, req.body);

    res.json({
      success: true,
      data: franchise,
    });
  }

  static async delete(req: Request, res: Response) {
    await FranchiseService.delete(req.params.id);
    res.json({ success: true });
  }
}
