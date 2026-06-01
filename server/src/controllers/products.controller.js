import * as service from "../services/products.service.js";
import { sendData, sendCreated, sendOk, sendError } from "../utils/response.js";
import logger from "../utils/logger.js";

export async function list(req, res) {
  try { sendData(res, await service.listProducts(req.query)); }
  catch (e) { logger.error("listProducts failed", { error: e.message }); sendError(res, e.message, 400); }
}
export async function get(req, res) {
  try {
    const p = await service.getProduct(req.params.id);
    if (!p) return sendError(res, "Not found", 404);
    sendData(res, p);
  } catch (e) { sendError(res, e.message, 400); }
}
export async function create(req, res) {
  try { sendCreated(res, await service.createProduct(req.body)); }
  catch (e) { logger.error("createProduct failed", { error: e.message }); sendError(res, e.message, 400); }
}
export async function update(req, res) {
  try {
    const p = await service.updateProduct(req.params.id, req.body);
    if (!p) return sendError(res, "Not found", 404);
    sendData(res, p);
  } catch (e) { sendError(res, e.message, 400); }
}
export async function remove(req, res) {
  try { await service.deleteProduct(req.params.id); sendOk(res); }
  catch (e) { sendError(res, e.message, 400); }
}
