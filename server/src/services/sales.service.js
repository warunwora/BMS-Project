import { pool } from "../db/pool.js";

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

export async function listSales({ search = "", method = "", from = "", to = "" } = {}) {
  const where = [];
  const params = [];
  if (search) {
    params.push(`%${search}%`);
    where.push(`s.receipt_code ILIKE $${params.length}`);
  }
  if (method) {
    params.push(method);
    where.push(`s.purchase_method ILIKE $${params.length}`);
  }
  if (from) {
    params.push(from);
    where.push(`s.sale_date >= $${params.length}`);
  }
  if (to) {
    params.push(to);
    where.push(`s.sale_date <= $${params.length}`);
  }
  const sql = `
    SELECT s.id, s.receipt_code, s.sale_date, s.purchase_method, s.net_total, s.member_id,
           m.name AS member_name
    FROM sale s
    LEFT JOIN member m ON m.id = s.member_id
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY s.id DESC`;
  const { rows } = await pool.query(sql, params);
  return rows.map((r) =>
    normSale({ ...r, member: r.member_name != null ? { name: r.member_name } : null })
  );
}

export async function pointsAnalytics() {
  const sql = `
    SELECT sale_date, points_redeemed, points_earned, net_total
    FROM sale
    ORDER BY sale_date ASC`;
  const { rows: data } = await pool.query(sql);

  const byMonth = {};
  data.forEach((r) => {
    if (!r.sale_date) return;
    const d = new Date(r.sale_date);
    const key = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    if (!byMonth[key]) byMonth[key] = { month: key, count: 0, points_redeemed: 0, points_earned: 0, revenue: 0 };
    byMonth[key].count += 1;
    byMonth[key].points_redeemed += parseFloat(r.points_redeemed ?? 0);
    byMonth[key].points_earned += parseFloat(r.points_earned ?? 0);
    byMonth[key].revenue += parseFloat(r.net_total ?? 0);
  });

  return {
    monthly: Object.values(byMonth),
    total_transactions: data.length,
    total_points_redeemed: data.reduce((s, r) => s + parseFloat(r.points_redeemed ?? 0), 0),
    bills_with_redemptions: data.filter((r) => parseFloat(r.points_redeemed ?? 0) > 0).length,
  };
}
