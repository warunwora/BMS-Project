import { pool } from "../db/pool.js";

const TIER = { 1: "Bronze", 2: "Silver", 3: "Gold", 4: "Premium" };
const TIER_REV = { Bronze: 1, Silver: 2, Gold: 3, Premium: 4 };

function norm(m) {
  if (!m) return m;
  return {
    id: m.id,
    name: m.name,
    phone: m.phone,
    detail: m.detail,
    email: m.mail ?? "",
    points: m.current_reward_point ?? 0,
    lifetime_points: m["lifetime point"] ?? 0,
    gender: m.gender === "M" ? "Male" : m.gender === "F" ? "Female" : (m.gender ?? "Male"),
    tier_id: TIER[m.tier_id] ?? m.tier_id ?? "Bronze",
  };
}

export async function listMembers({ search = "", tier = "" } = {}) {
  const where = [];
  const params = [];
  if (search) {
    const num = parseInt(search);
    params.push(`%${search}%`);
    const p = params.length;
    if (isNaN(num)) {
      where.push(`(name ILIKE $${p} OR phone ILIKE $${p} OR mail ILIKE $${p})`);
    } else {
      params.push(num);
      where.push(`(name ILIKE $${p} OR phone ILIKE $${p} OR mail ILIKE $${p} OR id = $${p + 1})`);
    }
  }
  if (tier) {
    params.push(TIER_REV[tier] ?? tier);
    where.push(`tier_id = $${params.length}`);
  }
  const sql = `SELECT * FROM member ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY id`;
  const { rows } = await pool.query(sql, params);
  return rows.map(norm);
}

export async function getMember(id) {
  const { rows } = await pool.query("SELECT * FROM member WHERE id = $1", [id]);
  return rows[0] ? norm(rows[0]) : null;
}

export async function createMember(body) {
  const { rows: last } = await pool.query("SELECT MAX(id) AS m FROM member");
  const nextId = (last[0].m || 0) + 1;
  const gender = body.gender === "Male" ? "M" : body.gender === "Female" ? "F" : body.gender;
  await pool.query(
    `INSERT INTO member (id, name, phone, mail, detail, gender, tier_id, current_reward_point, "lifetime point")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [nextId, body.name, body.phone, body.email ?? body.mail, body.detail,
     gender, TIER_REV[body.tier_id] ?? body.tier_id ?? 1, body.points ?? 0, body.lifetime_points ?? 0]
  );
  return getMember(nextId);
}

export async function updateMember(id, body) {
  const cur = (await pool.query("SELECT * FROM member WHERE id=$1", [id])).rows[0];
  if (!cur) return null;
  const gender = body.gender === "Male" ? "M" : body.gender === "Female" ? "F" : (body.gender ?? cur.gender);
  await pool.query(
    `UPDATE member SET name=$1, phone=$2, mail=$3, detail=$4, gender=$5, tier_id=$6, current_reward_point=$7, "lifetime point"=$8 WHERE id=$9`,
    [
      body.name ?? cur.name,
      body.phone ?? cur.phone,
      body.email ?? body.mail ?? cur.mail,
      body.detail ?? cur.detail,
      gender,
      body.tier_id != null ? (TIER_REV[body.tier_id] ?? body.tier_id) : cur.tier_id,
      body.points != null ? body.points : cur.current_reward_point,
      body.lifetime_points != null ? body.lifetime_points : cur["lifetime point"],
      id,
    ]
  );
  return getMember(id);
}

export async function deleteMember(id) {
  await pool.query("DELETE FROM member WHERE id=$1", [id]);
  return { ok: true };
}
