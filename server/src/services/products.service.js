import { pool } from "../db/pool.js";

function norm(p) {
  if (!p) return p;
  return {
    id: p.id,
    created_at: p.created_at,
    code: p.code,
    name: p.name,
    category: p.category,
    unit_id: p.unit_id,
    unit_price: p.unit_price,
    stock: p.stock,
  };
}

export async function listProducts({ search = "", category = "", categories = "" } = {}) {
  const where = [];
  const params = [];
  if (search) {
    params.push(`%${search}%`);
    const p = params.length;
    where.push(`(code ILIKE $${p} OR name ILIKE $${p})`);
  }
  if (categories) {
    const cats = categories.split(",").map((c) => c.trim()).filter(Boolean);
    if (cats.length) {
      params.push(cats);
      where.push(`category = ANY($${params.length})`);
    }
  } else if (category) {
    params.push(category);
    where.push(`category = $${params.length}`);
  }
  const sql = `SELECT * FROM product ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY id`;
  const { rows } = await pool.query(sql, params);
  return rows.map(norm);
}

export async function getProduct(id) {
  const { rows } = await pool.query("SELECT * FROM product WHERE id = $1", [id]);
  return rows[0] ? norm(rows[0]) : null;
}

export async function createProduct(body) {
  const { rows: last } = await pool.query("SELECT MAX(id) AS m FROM product");
  const nextId = (last[0].m || 0) + 1;
  await pool.query(
    `INSERT INTO product (id, code, name, category, unit_price, stock)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [nextId, body.code, body.name, body.category, body.unit_price, body.stock || 0]
  );
  return getProduct(nextId);
}

export async function updateProduct(id, body) {
  const cur = (await pool.query("SELECT * FROM product WHERE id=$1", [id])).rows[0];
  if (!cur) return null;
  await pool.query(
    `UPDATE product SET code=$1, name=$2, category=$3, unit_price=$4, stock=$5 WHERE id=$6`,
    [
      body.code ?? cur.code,
      body.name ?? cur.name,
      body.category ?? cur.category,
      body.unit_price != null ? body.unit_price : cur.unit_price,
      body.stock != null ? body.stock : cur.stock,
      id,
    ]
  );
  return getProduct(id);
}

export async function deleteProduct(id) {
  await pool.query("DELETE FROM product WHERE id=$1", [id]);
  return { ok: true };
}
