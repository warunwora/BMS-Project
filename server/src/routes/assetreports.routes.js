import { Router } from "express";
import { handleDamageSummary, handleRentalReceipt, handleUnreturned, handleDamageByType } from "../controllers/assetreports.controller.js";

const router = Router();
router.get("/damage-summary", handleDamageSummary);
router.get("/rental-receipt", handleRentalReceipt);
router.get("/unreturned", handleUnreturned);
router.get("/damage-by-type", handleDamageByType);
export default router;