import * as service from "../services/bookings.service.js";
import { sendData, sendCreated, sendOk, sendError } from "../utils/response.js";
import logger from "../utils/logger.js";

export async function list(req, res) {
  try { sendData(res, await service.listBookings(req.query)); }
  catch (e) { logger.error("listBookings failed", { error: e.message }); sendError(res, e.message, 400); }
}
export async function get(req, res) {
  try {
    const b = await service.getBooking(req.params.id);
    if (!b) return sendError(res, "Not found", 404);
    sendData(res, b);
  } catch (e) { sendError(res, e.message, 400); }
}
export async function create(req, res) {
  try { sendCreated(res, await service.createBooking(req.body)); }
  catch (e) { logger.error("createBooking failed", { error: e.message }); sendError(res, e.message, 400); }
}
export async function update(req, res) {
  try {
    const b = await service.updateBooking(req.params.id, req.body);
    if (!b) return sendError(res, "Not found", 404);
    sendData(res, b);
  } catch (e) { sendError(res, e.message, 400); }
}
export async function remove(req, res) {
  try { await service.deleteBooking(req.params.id); sendOk(res); }
  catch (e) { sendError(res, e.message, 400); }
}

export async function memberTierAnalysis(req, res) {
  try {
    const data =
      await service.memberTierAnalysis();

    res.json(data);

  } catch (e) {
    res.status(400).json({
      success: false,
      message: e.message,
    });
  }
}
