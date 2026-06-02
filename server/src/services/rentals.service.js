import { getMemberTier, calcPoints, calcDiscount, calcNet } from "../utils/tier.js";
import { pool } from "../db/pool.js";

function normRental(r, items = []) {
  const allReturned = items.length > 0 && items.every((i) => i.returned);
  const today = new Date().toISOString().split("T")[0];
  const isOverdue = !allReturned && r.date && r.date.slice(0, 10) < today;

  const subtotal =
    items.length > 0
      ? items.reduce(
          (sum, i) => sum + Number(i.rate || i.unit_price || 0),
          0
        )
      : Number(r.total_price || 0);

  const discount = parseFloat(
    r.discount ??
      (parseFloat(r.total_price ?? 0) -
        parseFloat(r.discounted_price ?? r.total_price ?? 0))
  );

  const deposit = Number(r.deposit || 0);

  const totalDamageFee = items.reduce(
    (sum, i) => sum + Number(i.damage_fee || 0),
    0
  );

  const totalFee =
    subtotal -
    discount -
    deposit +
    totalDamageFee;

  return {
    id: r.id,
    code: r.rent_code,
    date: r.date,
    member_id: r.member_id,
    member: r.member,

    status: allReturned
      ? "Returned"
      : isOverdue
      ? "Overdue"
      : "Rented",

    subtotal,
    discount,
    deposit,

    total_fee: totalFee,

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
    damage_fee: Number(i.damage_fee ?? 0),
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
    SELECT r.*, m.name AS member_name, m.phone AS member_phone,
      (SELECT COUNT(*) FROM asset_rent_line_item li WHERE li.rent_id = r.id) AS item_count,
      (SELECT COUNT(*) FROM asset_rent_line_item li WHERE li.rent_id = r.id AND li.returned = 1) AS returned_count
    FROM assets_rent r
    LEFT JOIN member m ON m.id = r.member_id
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY r.id DESC`;
  const { rows } = await pool.query(sql, params);
  let result = rows.map((r) => {
    const itemCount = parseInt(r.item_count) || 0;
    const returnedCount = parseInt(r.returned_count) || 0;
    const allReturned = itemCount > 0 && itemCount === returnedCount;
    const today = new Date().toISOString().split("T")[0];
    const isOverdue = !allReturned && r.date && r.date.slice(0, 10) < today;
    const status = allReturned ? "Returned" : isOverdue ? "Overdue" : "Rented";
    return {
      ...normRental({ ...r, member: r.member_id != null ? { name: r.member_name, phone: r.member_phone } : null }),
      status,
    };
  });
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

export async function damageAnalysis() {
  const { rows } = await pool.query(`
    SELECT
      a.type AS asset_type,
      COUNT(*) FILTER (WHERE arli.damage_fee <> 0) AS count,
      COALESCE(SUM(arli.damage_fee),0) AS damage_fee
    FROM asset_rent_line_item arli
    JOIN asset a ON a.id = arli.asset_id
    JOIN assets_rent ar ON ar.id = arli.rent_id
    GROUP BY a.type
    ORDER BY a.type
  `);

  return rows;
}

export async function createRental(body) {
  const { items = [], ...r } = body;

  const tier = await getMemberTier(r.member_id);
  const rentalTotal = items.reduce(
    (sum, item) => sum + (parseFloat(item.rate) || 0),
    0
  );
  const penaltyTotal = items.reduce(
    (sum, item) => sum + (parseFloat(item.damage_fee || item.deposit) || 0),
    0
  );
  const subtotal = rentalTotal + penaltyTotal;
  const discount = Math.round(
    calcDiscount(subtotal, tier?.discount || 0)
  );
  const discounted_price = subtotal - discount;
  const total_price = subtotal;
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
      items.reduce(
        (sum, item) => sum + (parseFloat(item.deposit) || 0),
        0
      ),
      discounted_price,
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
          0,
          Math.round(parseFloat(i.rate) || 0),
        ]
      );
    }
  }

  return normRental(rental);
}

export async function updateRental(id, body) {
  const {
    status,
    deposit = null,
    rental_item = [],
  } = body;

  if (status === "Returned") {
    let totalDamageFee = 0;

    for (const item of rental_item) {
      const damageFee = Math.round(Number(item.damage_fee ?? 0));

      totalDamageFee += damageFee;

      await pool.query(
        `UPDATE asset_rent_line_item
         SET condition_in = $1,
             damage_fee = $2,
             returned = 1,
             extended_price = $3
         WHERE id = $4`,
        [
          item.condition_in || "",
          damageFee,
          Number(item.rate || 0) + damageFee,
          item.id,
        ]
      );
    }

    const { rows: rentalRows } = await pool.query(
      `SELECT total_price, deposit
       FROM assets_rent
       WHERE id = $1`,
      [id]
    );

    if (!rentalRows.length) {
      return null;
    }

    const rental = rentalRows[0];

    await pool.query(
      `UPDATE assets_rent
       SET deposit = COALESCE($1, deposit),
           due = $2
       WHERE id = $3`,
      [
        deposit != null ? Number(deposit) : null,
        Number(rental.total_price || 0) + totalDamageFee,
        id,
      ]
    );
  }

  const { rows } = await pool.query(
    `SELECT r.*,
            m.name AS member_name,
            m.phone AS member_phone,
            m.tier_id AS member_tier_id
     FROM assets_rent r
     LEFT JOIN member m ON m.id = r.member_id
     WHERE r.id = $1`,
    [id]
  );

  if (!rows.length) {
    return null;
  }

  const rental = rows[0];

  const { rows: items } = await pool.query(
    `SELECT li.*,
            a.brand AS asset_brand,
            a.code AS asset_code
     FROM asset_rent_line_item li
     LEFT JOIN asset a ON a.id = li.asset_id
     WHERE li.rent_id = $1`,
    [id]
  );

  const lineItems = items.map((i) => ({
    ...i,
    asset: i.asset_id
      ? {
          brand: i.asset_brand,
          code: i.asset_code,
        }
      : null,
  }));

  const member = rental.member_id
    ? {
        name: rental.member_name,
        phone: rental.member_phone,
        tier_id: rental.member_tier_id,
      }
    : null;

  return normRental(
    {
      ...rental,
      member,
    },
    lineItems
  );
}

export async function deleteRental(id) {
  await pool.query("DELETE FROM asset_rent_line_item WHERE rent_id = $1", [id]);
  await pool.query("DELETE FROM assets_rent WHERE id = $1", [id]);
  return { ok: true };
}
