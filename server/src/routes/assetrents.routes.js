import { Router } from "express";
import * as c from "../controllers/assetrents.controller.js";

const router = Router();
router.get("/", c.listAssetRents);
router.get("/:rent_code", c.getAssetRents);
router.post("/", c.createAssetRents);
router.put("/:rent_code", c.updateAssetRents);
router.delete("/:rent_code", c.deleteAssetRents);

export default router;