import express, { Router } from "express";
import {
  getMoviesRanking,
  getGenresRanking,
  getCountriesRanking,
} from "./rank.controller";

const router: Router = express.Router();

router.get("/movies", getMoviesRanking);
router.get("/genres", getGenresRanking);
router.get("/countries", getCountriesRanking);

export default router;
