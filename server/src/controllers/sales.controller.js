import * as service from "../services/sales.service.js";
import { sendData, sendError } from "../utils/response.js";
import logger from "../utils/logger.js";

export async function list(req, res) {
  try { sendData(res, await service.listSales(req.query)); }
  catch (e) { logger.error("listSales failed", { error: e.message }); sendError(res, e.message, 400); }
}

export async function points(req, res) {
  try { sendData(res, await service.pointsAnalytics()); }
  catch (e) { logger.error("pointsAnalytics failed", { error: e.message }); sendError(res, e.message, 400); }
}
