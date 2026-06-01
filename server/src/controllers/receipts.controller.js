import * as service from "../services/receipts.service.js";
import { sendData, sendCreated, sendError } from "../utils/response.js";
import logger from "../utils/logger.js";

export async function get(req, res) {
  try {
    const r = await service.getReceipt(req.params.id);
    if (!r) return sendError(res, "Not found", 404);
    sendData(res, r);
  } catch (e) { sendError(res, e.message, 400); }
}

export async function create(req, res) {
  try { sendCreated(res, await service.createReceipt(req.body)); }
  catch (e) { logger.error("createReceipt failed", { error: e.message }); sendError(res, e.message, 400); }
}

export async function remove(req, res) {
  try { await service.deleteReceipt(req.params.id); res.status(204).send(); }
  catch (e) { sendError(res, e.message, 400); }
}
