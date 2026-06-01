import * as service from "../services/assets.service.js";
import { sendData, sendCreated, sendOk, sendError } from "../utils/response.js";
import logger from "../utils/logger.js";

export async function list(req, res) {
  try { sendData(res, await service.listAssets(req.query)); }
  catch (e) { logger.error("listAssets failed", { error: e.message }); sendError(res, e.message, 400); }
}
export async function get(req, res) {
  try {
    const a = await service.getAsset(req.params.id);
    if (!a) return sendError(res, "Not found", 404);
    sendData(res, a);
  } catch (e) { sendError(res, e.message, 400); }
}
export async function create(req, res) {
  try { sendCreated(res, await service.createAsset(req.body)); }
  catch (e) { logger.error("createAsset failed", { error: e.message }); sendError(res, e.message, 400); }
}
export async function update(req, res) {
  try {
    const a = await service.updateAsset(req.params.id, req.body);
    if (!a) return sendError(res, "Not found", 404);
    sendData(res, a);
  } catch (e) { sendError(res, e.message, 400); }
}
export async function remove(req, res) {
  try { await service.deleteAsset(req.params.id); sendOk(res); }
  catch (e) { sendError(res, e.message, 400); }
}
