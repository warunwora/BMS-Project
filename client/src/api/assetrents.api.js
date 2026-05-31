import { http } from "./http.js";

export const listAssetRents = (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return http(`/api/assetrents?${q}`);
};
export const getAssetRent = (rent_code) => http(`/api/assetrents/${encodeURIComponent(rent_code)}`);
export const createAssetRent = (body) => http("/api/assetrents", { method: "POST", body: JSON.stringify(body) });
export const updateAssetRent = (rent_code, body) => http(`/api/assetrents/${encodeURIComponent(rent_code)}`, { method: "PUT", body: JSON.stringify(body) });
export const deleteAssetRent = (rent_code) => http(`/api/assetrents/${encodeURIComponent(rent_code)}`, { method: "DELETE" });