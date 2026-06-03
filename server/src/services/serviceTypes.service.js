import { pool } from "../db/pool.js";

export async function listServiceTypes() {
  const { rows } = await pool.query("SELECT id, name FROM service_type ORDER BY id");
  return rows;
}
