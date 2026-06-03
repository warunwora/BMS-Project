import * as service from "../services/workOrders.service.js";
import { sendData, sendCreated, sendOk, sendError } from "../utils/response.js";
import logger from "../utils/logger.js";

export async function list(req, res) {
  try { sendData(res, await service.listWorkOrders(req.query)); }
  catch (e) { logger.error("listWorkOrders failed", { error: e.message }); sendError(res, e.message, 400); }
}
export async function get(req, res) {
  try {
    const w = await service.getWorkOrder(req.params.id);
    if (!w) return sendError(res, "Not found", 404);
    sendData(res, w);
  } catch (e) { sendError(res, e.message, 400); }
}
export async function create(req, res) {
  try { sendCreated(res, await service.createWorkOrder(req.body)); }
  catch (e) { logger.error("createWorkOrder failed", { error: e.message }); sendError(res, e.message, 400); }
}
export async function update(req, res) {
  try {
    const w = await service.updateWorkOrder(req.params.id, req.body);
    if (!w) return sendError(res, "Not found", 404);
    sendData(res, w);
  } catch (e) { sendError(res, e.message, 400); }
}
export async function remove(req, res) {
  try { await service.deleteWorkOrder(req.params.id); sendOk(res); }
  catch (e) { sendError(res, e.message, 400); }
}

export async function serviceTypeAnalysis(req, res) {
  try {
    const rows =
      await service.serviceTypeAnalysis();

    res.json(rows);

  } catch (e) {
    console.error(e);

    res.status(400).json({
      success: false,
      message: e.message,
    });
  }
}