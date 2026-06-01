import { getMemberTier, calcPoints, calcDiscount, calcNet } from "../utils/tier.js";
import { pool } from "../db/pool.js";

function normRental(r, items = []) {
  const allReturned = items.length > 0 && items.every((i) => i.returned);
  return {
    id: r.id,
    code: r.rent_code,
    date: r.date,
    member_id: r.member_id,
    member: r.member,
    status: allReturned ? "Returned" : "Rented",
    total_fee: r.total_price ?? 0,
    subtotal: r.total_price ?? 0,
    discount: r.discount ?? (parseFloat(r.total_price ?? 0) - parseFloat(r.discounted_price ?? r.total_price ?? 0)).toFixed(2),
    total_deposit: r.deposit ?? 0,
    net_refund: 0,
    change: 0,
    points_earned: r.points_earned ?? 0,
    rental_item: items.map(normItem),
  };
}

function normItem(i) {
  return {
    id: i.id,
    rental_id: i.rent_id,
    asset_id: i.asset_id,
    asset: i.asset,
    rate: i.unit_price ?? 0,
    condition_out: i.condition_out ?? "",
    condition_in: i.condition_in ?? "",
    deposit: i.damage_fee ?? 0,
    penalty: i.damage_fee > 0 ? "Minor" : "None",
    returned: i.returned,
    extended_price: i.extended_price,
  };
}

export async function listRentals({ search = "", status = "" } = {}) {
  const where = [];
  const params = [];
  if (search) {
    params.push(`%${search}%`);
    where.push(`r.rent_code ILIKE $${params.length}`);
  }
  const sql = `
    SELECT r.*, m.name AS member_name, m.phone AS member_phone
    FROM assets_rent r
    LEFT JOIN member m ON m.id = r.member_id
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY r.id DESC`;
  const { rows } = await pool.query(sql, params);
  let result = rows.map((r) =>
    normRental({ ...r, member: r.member_id != null ? { name: r.member_name, phone: r.member_phone } : null })
  );
  if (status && status !== "All") result = result.filter((r) => r.status === status);
  return result;
}

export async function getRental(id) {
  const { rows } = await pool.query(
    `SELECT r.*, m.name AS member_name, m.phone AS member_phone, m.tier_id AS member_tier_id
     FROM assets_rent r
     LEFT JOIN member m ON m.id = r.member_id
     WHERE r.id = $1`,
    [id]
  );
  const r = rows[0];
  if (!r) return null;

  const { rows: items } = await pool.query(
    `SELECT li.*, a.brand AS asset_brand, a.code AS asset_code
     FROM asset_rent_line_item li
     LEFT JOIN asset a ON a.id = li.asset_id
     WHERE li.rent_id = $1`,
    [id]
  );

  const member = r.member_id != null
    ? { name: r.member_name, phone: r.member_phone, tier_id: r.member_tier_id }
    : null;
  const lineItems = items.map((i) => ({
    ...i,
    asset: i.asset_id != null ? { brand: i.asset_brand, code: i.asset_code } : null,
  }));

  return normRental({ ...r, member }, lineItems);
}

export async function createRental(body) {
  const { items = [], ...r } = body;

  const tier = await getMemberTier(r.member_id);
  const total_price = Math.round(parseFloat(r.total_fee) || 0);
  const discount = Math.round(calcDiscount(total_price, tier.discount));
  const discounted_price = total_price - discount;

  const { rows: last } = await pool.query("SELECT MAX(id) AS m FROM assets_rent");
  const nextId = (last[0].m || 0) + 1;
  const rent_code = `RI${(r.date ?? "").replace(/-/g, "")}-${String(nextId).padStart(2, "0")}`;

  const { rows: inserted } = await pool.query(
    `INSERT INTO assets_rent (id, rent_code, created_at, member_id, hours, date, total_price, discounted_price, deposit, due)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [
      nextId,
      rent_code,
      new Date().toISOString(),
      r.member_id,
      items.length,
      r.date,
      total_price,
      discounted_price,
      0,
      0,
    ]
  );
  const rental = inserted[0];

  if (items.length) {
    const { rows: lastLine } = await pool.query("SELECT MAX(id) AS m FROM asset_rent_line_item");
    let lineId = (lastLine[0].m || 0) + 1;
    for (const i of items) {
      await pool.query(
        `INSERT INTO asset_rent_line_item (id, created_at, rent_id, date, asset_id, unit_price, amount, condition_out, condition_in, returned, damage_fee, extended_price)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          lineId++,
          new Date().toISOString(),
          rental.id,
          r.date,
          i.asset_id,
          Math.round(parseFloat(i.rate) || 0),
          1,
          i.condition_out ?? "good",
          "",
          0,
          parseInt(i.deposit) || 0,
          Math.round(parseFloat(i.rate) || 0),
        ]
      );
    }
  }

  return normRental(rental);
}

export async function updateRental(id, body) {
  const { status, member, rental_item, code, id: _id, ...rest } = body;

  if (status === "Returned") {
    await pool.query("UPDATE asset_rent_line_item SET returned = 1 WHERE rent_id = $1", [id]);
  }

  const { rows } = await pool.query(
    `UPDATE assets_rent SET total_price = COALESCE($1, total_price) WHERE id = $2 RETURNING *`,
    [rest.total_fee ?? rest.total_price ?? null, id]
  );
  return rows[0] ? normRental(rows[0]) : null;
}

export async function deleteRental(id) {
  await pool.query("DELETE FROM asset_rent_line_item WHERE rent_id = $1", [id]);
  await pool.query("DELETE FROM assets_rent WHERE id = $1", [id]);
  return { ok: true };
}
