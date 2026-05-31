const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function http(path, options = {}) {
    const res = await fetch(`${BASE}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || "Request failed");
    return data;
}