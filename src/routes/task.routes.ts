import { Router } from "express";
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask,
  updateTaskStatus,
} from "../controllers/task.controller";

const router = Router();

router.route("/").post(createTask).get(getTasks);

router.patch("/:id/status", updateTaskStatus);

router.route("/:id").get(getTaskById).patch(updateTask).delete(deleteTask);

export default router;
