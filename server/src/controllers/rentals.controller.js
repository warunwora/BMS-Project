import * as service from "../services/rentals.service.js";
import { sendData, sendCreated, sendOk, sendError } from "../utils/response.js";
import logger from "../utils/logger.js";

export async function list(req, res) {
  try { sendData(res, await service.listRentals(req.query)); }
  catch (e) { logger.error("listRentals failed", { error: e.message }); sendError(res, e.message, 400); }
}
export async function get(req, res) {
  try {
    const r = await service.getRental(req.params.id);
    if (!r) return sendError(res, "Not found", 404);
    sendData(res, r);
  } catch (e) { sendError(res, e.message, 400); }
}
export async function create(req, res) {
  try { sendCreated(res, await service.createRental(req.body)); }
  catch (e) { logger.error("createRental failed", { error: e.message }); sendError(res, e.message, 400); }
}
export async function update(req, res) {
  try {
    const r = await service.updateRental(req.params.id, req.body);
    if (!r) return sendError(res, "Not found", 404);
    sendData(res, r);
  } catch (e) { sendError(res, e.message, 400); }
}
export async function remove(req, res) {
  try { await service.deleteRental(req.params.id); sendOk(res); }
  catch (e) { sendError(res, e.message, 400); }
}
