import { pool } from "../db/pool.js";

function norm(a) {
  if (!a) return a;
  return { ...a, base_rate: a.price ?? a.base_rate ?? 0 };
}

export async function listAssets({ search = "", type = "" } = {}) {
  const where = [];
  const params = [];
  if (search) {
    params.push(`%${search}%`);
    const p = params.length;
    where.push(`(code ILIKE $${p} OR brand ILIKE $${p})`);
  }
  if (type) {
    params.push(type);
    where.push(`type = $${params.length}`);
  }
  const sql = `SELECT * FROM asset ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY id`;
  const { rows } = await pool.query(sql, params);
  return rows.map(norm);
}

export async function getAsset(id) {
  const { rows } = await pool.query("SELECT * FROM asset WHERE id = $1", [id]);
  return rows[0] ? norm(rows[0]) : null;
}

export async function createAsset(body) {
  const { rows: last } = await pool.query("SELECT MAX(id) AS m FROM asset");
  const nextId = (last[0].m || 0) + 1;
  await pool.query(
    `INSERT INTO asset (id, code, brand, type, price) VALUES ($1,$2,$3,$4,$5)`,
    [nextId, body.code, body.brand, body.type, body.base_rate]
  );
  return getAsset(nextId);
}

export async function updateAsset(id, body) {
  const cur = (await pool.query("SELECT * FROM asset WHERE id=$1", [id])).rows[0];
  if (!cur) return null;
  const price = body.base_rate !== undefined ? body.base_rate : (body.price !== undefined ? body.price : cur.price);
  await pool.query(
    `UPDATE asset SET code=$1, brand=$2, type=$3, purchase_date=$4, price=$5 WHERE id=$6`,
    [
      body.code ?? cur.code,
      body.brand ?? cur.brand,
      body.type ?? cur.type,
      body.purchase_date ?? cur.purchase_date,
      price,
      id,
    ]
  );
  return getAsset(id);
}

export async function deleteAsset(id) {
  await pool.query("DELETE FROM asset WHERE id=$1", [id]);
  return { ok: true };
}
