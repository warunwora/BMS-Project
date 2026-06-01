import * as service from "../services/sessions.service.js";
import { sendData, sendCreated, sendOk, sendError } from "../utils/response.js";
import logger from "../utils/logger.js";

export async function list(req, res) {
  try { sendData(res, await service.listSessions(req.query)); }
  catch (e) { logger.error("listSessions failed", { error: e.message }); sendError(res, e.message, 400); }
}
export async function get(req, res) {
  try {
    const s = await service.getSession(req.params.id);
    if (!s) return sendError(res, "Not found", 404);
    sendData(res, s);
  } catch (e) { sendError(res, e.message, 400); }
}
export async function create(req, res) {
  try { sendCreated(res, await service.createSession(req.body)); }
  catch (e) { logger.error("createSession failed", { error: e.message }); sendError(res, e.message, 400); }
}
export async function update(req, res) {
  try {
    const s = await service.updateSession(req.params.id, req.body);
    if (!s) return sendError(res, "Not found", 404);
    sendData(res, s);
  } catch (e) { sendError(res, e.message, 400); }
}
export async function remove(req, res) {
  try { await service.deleteSession(req.params.id); sendOk(res); }
  catch (e) { sendError(res, e.message, 400); }
}
