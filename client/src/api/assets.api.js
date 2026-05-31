import { http } from "./http.js";

export const listAssets = (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return http(`/api/assets?${q}`);
};
export const getAsset = (code) => http(`/api/assets/${code}`);
export const createAsset = (body) => http("/api/assets", { method: "POST", body: JSON.stringify(body) });
export const updateAsset = (code, body) => http(`/api/assets/${code}`, { method: "PUT", body: JSON.stringify(body) });
export const deleteAsset = (code) => http(`/api/assets/${code}`, { method: "DELETE" });