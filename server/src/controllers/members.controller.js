import * as service from "../services/members.service.js";
import { sendData, sendCreated, sendOk, sendError } from "../utils/response.js";
import logger from "../utils/logger.js";

export async function list(req, res) {
  try { sendData(res, await service.listMembers(req.query)); }
  catch (e) { logger.error("listMembers failed", { error: e.message }); sendError(res, e.message, 400); }
}
export async function get(req, res) {
  try {
    const m = await service.getMember(req.params.id);
    if (!m) return sendError(res, "Not found", 404);
    sendData(res, m);
  } catch (e) { sendError(res, e.message, 400); }
}
export async function create(req, res) {
  try { sendCreated(res, await service.createMember(req.body)); }
  catch (e) { logger.error("createMember failed", { error: e.message }); sendError(res, e.message, 400); }
}
export async function update(req, res) {
  try {
    const m = await service.updateMember(req.params.id, req.body);
    if (!m) return sendError(res, "Not found", 404);
    sendData(res, m);
  } catch (e) { sendError(res, e.message, 400); }
}
export async function remove(req, res) {
  try { await service.deleteMember(req.params.id); sendOk(res); }
  catch (e) { sendError(res, e.message, 400); }
}
