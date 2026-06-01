import * as service from "../services/courts.service.js";
import { sendData, sendCreated, sendOk, sendError } from "../utils/response.js";
import logger from "../utils/logger.js";

export async function list(req, res) {
  try { sendData(res, await service.listCourts(req.query)); }
  catch (e) { logger.error("listCourts failed", { error: e.message }); sendError(res, e.message, 400); }
}
export async function get(req, res) {
  try {
    const c = await service.getCourt(req.params.id);
    if (!c) return sendError(res, "Not found", 404);
    sendData(res, c);
  } catch (e) { sendError(res, e.message, 400); }
}
export async function create(req, res) {
  try { sendCreated(res, await service.createCourt(req.body)); }
  catch (e) { logger.error("createCourt failed", { error: e.message }); sendError(res, e.message, 400); }
}
export async function update(req, res) {
  try {
    const c = await service.updateCourt(req.params.id, req.body);
    if (!c) return sendError(res, "Not found", 404);
    sendData(res, c);
  } catch (e) { sendError(res, e.message, 400); }
}
export async function remove(req, res) {
  try { await service.deleteCourt(req.params.id); sendOk(res); }
  catch (e) { sendError(res, e.message, 400); }
}
