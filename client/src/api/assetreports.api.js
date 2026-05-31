import { http } from "./http.js";

export const reportDamageSummary = (params) => http(`/api/reports/damage-summary?${new URLSearchParams(params)}`);
export const reportRentalReceipt = (params) => http(`/api/reports/rental-receipt?${new URLSearchParams(params)}`);
export const reportUnreturned = (params) => http(`/api/reports/unreturned?${new URLSearchParams(params)}`);
export const reportDamageByType = (params) => http(`/api/reports/damage-by-type?${new URLSearchParams(params)}`);