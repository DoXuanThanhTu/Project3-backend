import { MovieService } from "../movie/movie.service";
import { AdminService } from "./admin.service";
import { Request, Response } from "express";

export class AdminController {
  static async getMovieById(req: Request, res: Response) {
    const movie = await AdminService.getMovieById(req, res);
    res.json({ success: true, data: movie });
  }
  static async getAllMovies(req: Request, res: Response) {
    const result = await AdminService.getAllMovies(req, res);
    res.json(result);
  }
  static async getMovieStats(req: Request, res: Response) {
    const stats = await AdminService.getMovieStats();
    res.json({ success: true, data: stats });
  }
  //Franchise endpoints
  static async getAllFranchises(req: Request, res: Response) {
    const franchises = await AdminService.getAllFranchises();
    res.json({ success: true, data: franchises });
  }

  static async getFranchiseById(req: Request, res: Response) {
    const franchise = await AdminService.getFranchiseById(req, res);
    res.json({ success: true, data: franchise });
  }

  //Genre endpoints
  static async getAllGenres(req: Request, res: Response) {
    const genres = await AdminService.getAllGenres();
    res.json({ success: true, data: genres });
  }

  static async getGenreById(req: Request, res: Response) {
    const genre = await AdminService.getGenreById(req, res);
    res.json({ success: true, data: genre });
  }

  //Person endpoints
  static async getAllPeople(req: Request, res: Response) {
    const people = await AdminService.getAllPeople();
    res.json({ success: true, data: people });
  }
  //Episode endpoints
  static async deleteEp(req: Request, res: Response) {
    const result = await AdminService.deleteEp();
    res.json({ success: true, data: result });
  }
  static async getAllEpisodes(req: Request, res: Response) {
    const result = await AdminService.getAllEpisodes(req, res);
    res.json(result);
  }

  static async getEpisodeById(req: Request, res: Response) {
    const episode = await AdminService.getEposideById(req, res);
    res.json({ success: true, data: episode });
  }

  static async updateManyEp(req: Request, res: Response) {
    const result = await AdminService.updateManyEp();
    res.json({ success: true, data: result });
  }
  //Server endpoints
  static async getAllServers(req: Request, res: Response) {
    const servers = await AdminService.getAllServers(req, res);
    res.json({ success: true, data: servers });
  }
  //User endpoints
  static async getAllUsers(req: Request, res: Response) {
    const users = await AdminService.getAllUsers(req, res);
    res.json(users);
  }
  static async getUserById(req: Request, res: Response) {
    const user = await AdminService.getUserById(req, res);
    res.json({ success: true, data: user });
  }
  static async updateUser(req: Request, res: Response) {
    const result = await AdminService.updateUser(req, res);
    res.json(result);
  }
  static async createUser(req: Request, res: Response) {
    const result = await AdminService.createUser(req, res);
    res.json(result);
  }
  static async changePassword(req: Request, res: Response) {
    const result = await AdminService.changePassword(req, res);
    res.json(result);
  }
  static async deleteUser(req: Request, res: Response) {
    const result = await AdminService.deleteUser(req, res);
    res.json(result);
  }
}
