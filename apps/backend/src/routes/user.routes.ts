import { Router } from "express";
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
} from "../controllers/user.controller";

const router = Router();

router.route("/").post(createUser).get(getUsers);

router.route("/:id").get(getUserById).patch(updateUser).delete(deleteUser);

export default router;
