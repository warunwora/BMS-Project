import { pool } from "../db/pool.js";

function norm(c) {
  if (!c) return c;
  return {
    id: c.court_number,
    court_no: c.court_number,
    court_code: c.court_code,
    weekday_price: c.price,
    weekend_price: c.price_weekend,
  };
}

export async function listCourts({ search = "" } = {}) {
  const where = [];
  const params = [];
  if (search) {
    params.push(`%${search}%`);
    where.push(`court_code ILIKE $${params.length}`);
  }
  const sql = `SELECT * FROM court ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY court_number`;
  const { rows } = await pool.query(sql, params);
  return rows.map(norm);
}

export async function getCourt(id) {
  const { rows } = await pool.query("SELECT * FROM court WHERE court_number = $1", [id]);
  return rows[0] ? norm(rows[0]) : null;
}

export async function createCourt(body) {
  const { rows } = await pool.query(
    `INSERT INTO court (court_number, court_code, price, price_weekend)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [body.court_no, body.court_code, body.weekday_price, body.weekend_price]
  );
  return norm(rows[0]);
}

export async function updateCourt(id, body) {
  const { rows } = await pool.query(
    `UPDATE court SET court_number=$1, court_code=$2, price=$3, price_weekend=$4
     WHERE court_number=$5 RETURNING *`,
    [body.court_no, body.court_code, body.weekday_price, body.weekend_price, id]
  );
  return rows[0] ? norm(rows[0]) : null;
}

export async function deleteCourt(id) {
  await pool.query("DELETE FROM court WHERE court_number=$1", [id]);
  return { ok: true };
}
