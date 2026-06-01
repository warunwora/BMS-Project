import { pool } from "../db/pool.js";
import { getMemberTier, calcPoints, calcDiscount, calcNet } from "../utils/tier.js";

function normSale(s) {
  return {
    id: s.id,
    code: s.receipt_code,
    date: s.sale_date,
    method: s.purchase_method,
    subtotal: s.total_price ?? 0,
    discount: s.discount ?? 0,
    net_amount: s.net_total ?? 0,
    points_earned: s.points_earned ?? 0,
    points_redeemed: s.points_redeemed ?? 0,
    deposit: 0,
    change: 0,
    member: s.member,
    member_id: s.member_id,
  };
}

const pad2 = (n) => String(n).padStart(2, "0");

export async function getReceipt(id) {
  const { rows } = await pool.query(
    `SELECT s.*, json_build_object('name', m.name, 'phone', m.phone) AS member
       FROM sale s
       LEFT JOIN member m ON m.id = s.member_id
      WHERE s.id = $1`,
    [id]
  );
  const s = rows[0];
  if (!s) return null;
  if (s.member_id == null) s.member = null;

  const { rows: items } = await pool.query(
    `SELECT li.*, json_build_object('code', p.code, 'name', p.name, 'category', p.category) AS product
       FROM sale_line_item li
       LEFT JOIN product p ON p.id = li.product_id
      WHERE li.sale_id = $1`,
    [id]
  );

  const posItems = items.map((i) => ({
    id: i.id,
    receipt_id: i.sale_id,
    product_id: i.product_id,
    product: i.product_id == null ? null : i.product,
    unit_price: i.unit_price,
    qty: i.quantity,
    ext_price: i.extended_price,
  }));

  return { ...normSale(s), pos_item: posItems };
}

export async function createReceipt(body) {
  const { items = [], ...r } = body;

  const tier = await getMemberTier(r.member_id);
  const subtotal = parseFloat(r.subtotal) || 0;
  const points_redeemed = parseFloat(r.points_redeemed) || 0;
  const redeem_discount = points_redeemed * 0.1;
  const tier_discount = calcDiscount(subtotal, tier.discount);
  const total_discount = Math.round((tier_discount + redeem_discount) * 100) / 100;
  const net = calcNet(subtotal, total_discount);
  const points_earned = calcPoints(net, tier.multiplier);

  const { rows: lastSale } = await pool.query("SELECT MAX(id) AS m FROM sale");
  const nextSaleId = (lastSale[0].m || 0) + 1;
  const receipt_code = `PO${new Date().toISOString().split("T")[0].replace(/-/g, "")}-${pad2(nextSaleId)}`;

  const { rows } = await pool.query(
    `INSERT INTO sale (id, receipt_code, member_id, sale_date, purchase_method, total_price, discount, net_total, points_earned, points_redeemed)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [
      nextSaleId,
      receipt_code,
      r.member_id || null,
      r.date ?? new Date().toISOString().split("T")[0],
      r.method ?? "cash",
      subtotal,
      total_discount,
      net,
      points_earned,
      points_redeemed,
    ]
  );
  const sale = rows[0];

  if (items.length) {
    const { rows: lastLine } = await pool.query("SELECT MAX(id) AS m FROM sale_line_item");
    let lineId = (lastLine[0].m || 0) + 1;
    for (const i of items) {
      await pool.query(
        `INSERT INTO sale_line_item (id, created_at, sale_id, product_id, unit_price, quantity, extended_price)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          lineId++,
          new Date().toISOString(),
          sale.id,
          i.product_id,
          i.unit_price,
          i.qty ?? i.quantity ?? 1,
          i.ext_price ?? i.extended_price ?? 0,
        ]
      );
    }
  }

  return normSale(sale);
}

export async function deleteReceipt(id) {
  await pool.query("DELETE FROM sale_line_item WHERE sale_id = $1", [id]);
  await pool.query("DELETE FROM sale WHERE id = $1", [id]);
  return { ok: true };
}
