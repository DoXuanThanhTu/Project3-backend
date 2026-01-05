import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { Role } from "../../types/role.type";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";

const router = Router();

router.use(authenticate);
router.use(authorize([Role.ADMIN]));
router.get("/stats", AdminController.getMovieStats);
router.get("/movie/:id", AdminController.getMovieById);
router.get("/movies", AdminController.getAllMovies);
router.get("/franchises", AdminController.getAllFranchises);
router.get("/franchises/:id", AdminController.getFranchiseById);

router.get("/genres", AdminController.getAllGenres);
router.get("/genres/:id", AdminController.getGenreById);

router.get("/people", AdminController.getAllPeople);
router.get("/episodes", AdminController.getAllEpisodes);
router.get("/episodes/:id", AdminController.getEpisodeById);
router.delete("/episodes/:id", AdminController.deleteEp);
router.post("/episodes/update-many", AdminController.updateManyEp);
router.get("/servers", AdminController.getAllServers);
router.get("/users", AdminController.getAllUsers);
router.post("/users", AdminController.createUser);
router.get("/users/:id", AdminController.getUserById);
router.patch("/users/:id", AdminController.updateUser);
router.patch("/users/:id/change-password", AdminController.changePassword);
router.delete("/users/:id", AdminController.deleteUser);
export default router;
