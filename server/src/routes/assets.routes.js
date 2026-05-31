import { Router } from "express";
import { handleCreate, handleList, handleGet, handleUpdate, handleDelete } from "../controllers/assets.controller.js";

const router = Router();
router.get("/", handleList);
router.post("/", handleCreate);
router.get("/:code", handleGet);
router.put("/:code", handleUpdate);
router.delete("/:code", handleDelete);

export default router;