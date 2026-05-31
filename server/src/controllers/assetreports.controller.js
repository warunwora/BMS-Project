import { reportDamageSummary, reportRentalReceipt, reportUnreturned, reportDamageByType } from "../services/assetreprots.service.js";
import { sendOne, sendError } from "../utils/response.js";
import logger from "../utils/logger.js";

export async function handleDamageSummary(req, res) {
    try {
        const data = await reportDamageSummary(req.query);
        sendOne(res, data);
    } catch (err) { logger.error("reportDamageSummary failed", { error: err.message }); sendError(res, err.message); }
}

export async function handleRentalReceipt(req, res) {
    try {
        const data = await reportRentalReceipt(req.query);
        sendOne(res, data);
    } catch (err) { logger.error("reportRentalReceipt failed", { error: err.message }); sendError(res, err.message); }
}

export async function handleUnreturned(req, res) {
    try {
        const data = await reportUnreturned(req.query);
        sendOne(res, data);
    } catch (err) { logger.error("reportUnreturned failed", { error: err.message }); sendError(res, err.message); }
}

export async function handleDamageByType(req, res) {
    try {
        const data = await reportDamageByType(req.query);
        sendOne(res, data);
    } catch (err) { logger.error("reportDamageByType failed", { error: err.message }); sendError(res, err.message); }
}