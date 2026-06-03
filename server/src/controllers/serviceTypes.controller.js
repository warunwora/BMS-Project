import * as service from "../services/serviceTypes.service.js";
import { sendData, sendError } from "../utils/response.js";
import logger from "../utils/logger.js";

export async function list(req, res) {
  try { sendData(res, await service.listServiceTypes()); }
  catch (e) { logger.error("listServiceTypes failed", { error: e.message }); sendError(res, e.message, 400); }
}
