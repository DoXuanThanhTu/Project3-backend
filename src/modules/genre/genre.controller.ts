import { Request, Response } from "express";
import { GenreService } from "./genre.service";
import { getLocalizedValue } from "../../utils/i18n.util";

export class GenreController {
  // ===== PUBLIC =====
  static async getActive(req: Request, res: Response) {
    const lang = (req.query.lang as string) || "vi";
    const genres = await GenreService.getAllActive();

    const data = genres.map((g: any) => ({
      id: g._id,
      name: getLocalizedValue(g.name, lang, g.defaultLang),
      slug: getLocalizedValue(g.slug, lang, g.defaultLang),
    }));

    res.json({ success: true, data });
  }

  static async getDetail(req: Request, res: Response) {
    const lang = (req.query.lang as string) || "vi";
    const genre = await GenreService.getBySlug(req.params.slug, lang);

    res.json({
      success: true,
      data: {
        id: genre._id,
        name: getLocalizedValue(genre.name, lang, genre.defaultLang),
        description: getLocalizedValue(
          genre.description,
          lang,
          genre.defaultLang
        ),
      },
    });
  }

  // ===== ADMIN =====
  static async getAll(req: Request, res: Response) {
    const genres = await GenreService.getAll();
    res.json({ success: true, data: genres });
  }

  static async create(req: Request, res: Response) {
    const genre = await GenreService.create(req.body);
    res.status(201).json({ success: true, data: genre });
  }

  static async update(req: Request, res: Response) {
    const genre = await GenreService.update(req.params.id, req.body);
    res.json({ success: true, data: genre });
  }

  static async delete(req: Request, res: Response) {
    await GenreService.delete(req.params.id);
    res.json({ success: true });
  }
}
