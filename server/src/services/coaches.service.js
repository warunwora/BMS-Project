import { pool } from "../db/pool.js";

function norm(c) {
  if (!c) return c;
  return { ...c, id: c.coach_id, phone: c.phone_no ?? c.phone ?? "", speciality: (c.speciality ?? "").trim() };
}

export async function listCoaches({ search = "", speciality = "" } = {}) {
  const where = [];
  const params = [];
  if (search) {
    const num = parseInt(search);
    params.push(`%${search}%`);
    const p = params.length;
    if (isNaN(num)) {
      where.push(`name ILIKE $${p}`);
    } else {
      params.push(num);
      where.push(`(name ILIKE $${p} OR coach_id = $${p + 1})`);
    }
  }
  if (speciality) {
    params.push(speciality);
    where.push(`speciality = $${params.length}`);
  }
  const sql = `SELECT * FROM coach ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY coach_id`;
  const { rows } = await pool.query(sql, params);
  return rows.map(norm);
}

export async function getCoach(id) {
  const { rows } = await pool.query("SELECT * FROM coach WHERE coach_id = $1", [id]);
  return rows[0] ? norm(rows[0]) : null;
}

export async function createCoach(body) {
  const { rows: last } = await pool.query("SELECT MAX(coach_id) AS m FROM coach");
  const nextId = (last[0].m || 0) + 1;
  await pool.query(
    `INSERT INTO coach (coach_id, name, speciality, hourly_rate, phone_no)
     VALUES ($1,$2,$3,$4,$5)`,
    [nextId, body.name, body.speciality, body.hourly_rate, body.phone]
  );
  return getCoach(nextId);
}

export async function updateCoach(id, body) {
  const cur = (await pool.query("SELECT * FROM coach WHERE coach_id=$1", [id])).rows[0];
  if (!cur) return null;
  await pool.query(
    `UPDATE coach SET name=$1, speciality=$2, hourly_rate=$3, phone_no=$4 WHERE coach_id=$5`,
    [
      body.name ?? cur.name,
      body.speciality ?? cur.speciality,
      body.hourly_rate ?? cur.hourly_rate,
      body.phone ?? body.phone_no ?? cur.phone_no,
      id,
    ]
  );
  return getCoach(id);
}

export async function deleteCoach(id) {
  await pool.query("DELETE FROM coach WHERE coach_id=$1", [id]);
  return { ok: true };
}
