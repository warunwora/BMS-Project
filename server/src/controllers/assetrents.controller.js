import * as assetrentService from "../services/assetrents.service.js";
import {sendList, sendOne, sendCreated, sendOk, sendError} from "../utils/response.js";
import logger from "../utils/logger.js";

export async function listAssetRents(req, res) {
    try {
        const result = await assetrentService.listAssetRents(req.query);
        sendList(res, result);
    } catch (err) {
        logger.error("listAssetRents failed", { error: err.message }); sendError(res, err.message);
    }
}

export async function getAssetRents(req, res) {
    try {
        const rent_code = decodeURIComponent(req.params.rent_code || "");
        const result = await assetrentService.getAssetRents(rent_code);
        if (!result) return sendError(res, "Asset Rents not found", 404);
        sendOne(res, result);
    } catch (err) {
        logger.error("getAssetRents failed", { error: err.message });
        sendError(res, err.message, 500);
    }
}

export async function createAssetRents(req, res) {
    try {
        const result = await assetrentService.createAssetRents(req.body);
        sendCreated(res, result);
    } catch (err) {
        logger.error("createAssetRents failed", { error: err.message });
        sendError(res, err.message, 500);
    }
}

export async function updateAssetRents(req, res) {
    try {
        const rent_code = decodeURIComponent(req.params.rent_code || "");
        const result = await assetrentService.updateAssetRents(rent_code, req.body);
        if (!result) return sendError(res, "Asset Rents not found", 404);
        sendOk(res, result);
    } catch (err) {
        logger.error("updateAssetRents failed", { error: err.message });
        sendError(res, err.message, 500);
    }
}

export async function deleteAssetRents(req, res) {
    try {
        const rent_code = decodeURIComponent(req.params.rent_code);
        const result = await assetrentService.deleteAssetRents(rent_code);
        if (!result) return sendError(res, "Asset Rents not found", 404);
        sendOk(res, result);
    } catch (err) {
        logger.error("deleteAssetRents failed", {error: error.message});
        sendError(res, err.message, 500);
    }
}