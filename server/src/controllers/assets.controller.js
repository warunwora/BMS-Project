import { listAssets, createAssets, getAssets, updateAssets, deleteAssets } from "../services/assets.service.js";
import {sendList, sendOne, sendCreated, sendOk, sendError} from "../utils/response.js";
import logger from "../utils/logger.js";

export async function handleList(req, res) {
    try { sendList(res, await listAssets(req.query)); }
    catch (err) { logger.error("listAssets failed", { error: err.message }); sendError(res, err.message); }
}

export async function handleCreate(req, res) {
    try {sendCreated(res, await createAssets(req.body));}
    catch (err) {sendError(res, err.message, 400);}
}

export async function handleGet(req, res) {
    try {
        const row = await getAssets(req.params.code);
        if (!row) return sendError(res, "Asset not found", 404);
        sendOne(res, row);
    } catch (err) { sendError(res, err.message);}
}  

export async function handleUpdate(req, res) {
    try {
        const result = await updateAssets(req.params.code, req.body);
        if (!result) return sendError(res, "Asset not found", 404);
        sendOk(res, result);
    } catch (err) {sendError(res, err.message, 400);}
}

export async function handleDelete(req, res) {
    try {const result = await deleteAssets(req.params.code);
        if (!result) return sendError(res, "Asset not found", 404);
        sendOk(res, result);
    } catch (err) {sendError(res, err.message, 400);}
}

export async function getAssetByCode(req, res) {
    try {
        const row = await s.getAssetByCode(req.params.code);
        if (!row) return sendError(res, "Asset not found", 404);
        sendOne(res, row);
    } catch (err) { sendError(res, err.message); }
}