import { http } from "../api/http.js";

function unwrap(res) {
  if (res && typeof res === "object" && "success" in res) {
    if (res.success === false) throw new Error(res.error?.message || "Request failed");
    return res.data;
  }
  return res;
}

export async function get(path, params = {}) {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== ""));
  return unwrap(await http(`/api${path}${qs.size ? "?" + qs : ""}`));
}

export async function post(path, body) {
  return unwrap(await http(`/api${path}`, { method: "POST", body: JSON.stringify(body) }));
}

export async function put(path, body) {
  return unwrap(await http(`/api${path}`, { method: "PUT", body: JSON.stringify(body) }));
}

export async function del(path) {
  return unwrap(await http(`/api${path}`, { method: "DELETE" }));
}
