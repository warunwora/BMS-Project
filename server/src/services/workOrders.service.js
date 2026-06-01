import { getMemberTier, calcPoints, calcDiscount, calcNet } from "../utils/tier.js";
import { pool } from "../db/pool.js";

const STATUS_UP = { pending: "Pending", completed: "Completed", cancelled: "Cancelled" };

function norm(w) {
  if (!w) return w;
  return {
    id: w.id,
    code: w.code,
    date: w.date,
    member_id: w.member_id,
    member: w.member,
    tech_id: String(w.technician_id ?? ""),
    est_finish_date: w.expected_finish_date ?? "",
    status: STATUS_UP[w.status?.toLowerCase()] ?? w.status ?? "Pending",
    subtotal: w.total_material_cost ?? 0,
    total_labor: w.total_labor_cost ?? 0,
    discount: w.member_discount ?? 0,
    net_amount: w.grand_total ?? 0,
    points_earned: w.points_earned ?? 0,
    work_order_item: w.work_order_item ?? [],
  };
}

export async function listWorkOrders({ search = "", tech_id = "", status = "", from = "", to = "" } = {}) {
  const where = [];
  const params = [];
  if (search) {
    params.push(`%${search}%`);
    where.push(`wo.code ILIKE $${params.length}`);
  }
  if (tech_id) {
    params.push(tech_id);
    where.push(`wo.technician_id = $${params.length}`);
  }
  if (status && status !== "All") {
    params.push(status);
    where.push(`wo.status ILIKE $${params.length}`);
  }
  if (from) {
    params.push(from);
    where.push(`wo.date >= $${params.length}`);
  }
  if (to) {
    params.push(to);
    where.push(`wo.date <= $${params.length}`);
  }
  const sql = `
    SELECT wo.*, m.name AS member_name
    FROM work_order wo
    LEFT JOIN member m ON m.id = wo.member_id
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY wo.id DESC`;
  const { rows } = await pool.query(sql, params);
  return rows.map((r) => norm({ ...r, member: r.member_name != null ? { name: r.member_name } : null }));
}

export async function getWorkOrder(id) {
  const { rows } = await pool.query(
    `SELECT wo.*, m.name AS member_name, m.phone AS member_phone, m.tier_id AS member_tier_id
     FROM work_order wo
     LEFT JOIN member m ON m.id = wo.member_id
     WHERE wo.id = $1`,
    [id]
  );
  const workOrder = rows[0];
  if (!workOrder) return null;

  const { rows: items } = await pool.query(
    `SELECT li.*,
            racket.code AS racket_code, racket.name AS racket_name,
            p.code AS product_code, p.name AS product_name,
            st.name AS service_name
     FROM work_order_line_item li
     LEFT JOIN product racket ON racket.id = li.racket_model_product_id
     LEFT JOIN product p ON p.id = li.product_id
     LEFT JOIN service_type st ON st.id = li.service_id
     WHERE li.work_order_id = $1`,
    [id]
  );

  const normItems = items.map((i) => ({
    id: i.id,
    work_order_id: i.work_order_id,
    asset: i.racket_name ?? i.racket_code ?? "",
    product_code: i.product_code ?? "",
    service: i.service_name ?? "",
    tension: i.tension_required,
    material_cost: i.material_cost ?? 0,
    labor_fee: i.labor_fee ?? 0,
  }));

  const member = {
    name: workOrder.member_name,
    phone: workOrder.member_phone,
    tier_id: workOrder.member_tier_id,
  };
  return { ...norm({ ...workOrder, member }), work_order_item: normItems };
}

export async function createWorkOrder(body) {
  const { items = [], ...w } = body;

  const tier = await getMemberTier(w.member_id);
  const material = parseFloat(w.subtotal) || 0;
  const labor = parseFloat(w.total_labor) || 0;
  const subtotal = material + labor;
  const discount = calcDiscount(subtotal, tier.discount);
  const net = calcNet(subtotal, discount);
  const points_earned = calcPoints(net, tier.multiplier);

  const { rows: last } = await pool.query("SELECT MAX(id) AS m FROM work_order");
  const nextId = (last[0].m || 0) + 1;
  const code = `WO${(w.date ?? "").replace(/-/g, "")}-${String(nextId).padStart(2, "0")}`;

  const { rows: woRows } = await pool.query(
    `INSERT INTO work_order
       (id, code, member_id, technician_id, date, expected_finish_date, status,
        total_material_cost, total_labor_cost, member_discount, grand_total, points_earned)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING *`,
    [
      nextId,
      code,
      w.member_id,
      parseInt(w.tech_id) || null,
      w.date,
      w.est_finish_date,
      w.status ?? "Pending",
      material,
      labor,
      discount,
      net,
      points_earned,
    ]
  );
  const wo = woRows[0];

  if (items?.length) {
    const { rows: lastLine } = await pool.query("SELECT MAX(id) AS m FROM work_order_line_item");
    let lineId = (lastLine[0].m || 0) + 1;
    for (const i of items) {
      const material = parseFloat(i.material_cost) || 0;
      const labor = parseFloat(i.labor_fee) || 0;
      await pool.query(
        `INSERT INTO work_order_line_item (id, work_order_id, material_cost, labor_fee, line_total)
         VALUES ($1,$2,$3,$4,$5)`,
        [lineId++, wo.id, material, labor, material + labor]
      );
    }
  }
  return norm(wo);
}

export async function updateWorkOrder(id, body) {
  const { tech_id, est_finish_date, subtotal, total_labor, net_amount, discount, status, member_id, points_earned } = body;
  const updateData = {};
  if (tech_id !== undefined) updateData.technician_id = parseInt(tech_id) || null;
  if (est_finish_date !== undefined) updateData.expected_finish_date = est_finish_date;
  if (subtotal !== undefined) updateData.total_material_cost = parseFloat(subtotal) || 0;
  if (total_labor !== undefined) updateData.total_labor_cost = parseFloat(total_labor) || 0;
  if (discount !== undefined) updateData.member_discount = parseFloat(discount) || 0;
  if (net_amount !== undefined) updateData.grand_total = parseFloat(net_amount) || 0;
  if (status !== undefined) updateData.status = status;
  if (member_id !== undefined) updateData.member_id = member_id;
  if (points_earned !== undefined) updateData.points_earned = points_earned;

  const keys = Object.keys(updateData);
  if (!keys.length) return getWorkOrderRaw(id);

  const sets = keys.map((k, idx) => `${k} = $${idx + 1}`);
  const params = keys.map((k) => updateData[k]);
  params.push(id);
  const { rows } = await pool.query(
    `UPDATE work_order SET ${sets.join(", ")} WHERE id = $${params.length} RETURNING *`,
    params
  );
  return rows[0] ? norm(rows[0]) : null;
}

async function getWorkOrderRaw(id) {
  const { rows } = await pool.query("SELECT * FROM work_order WHERE id = $1", [id]);
  return rows[0] ? norm(rows[0]) : null;
}

export async function deleteWorkOrder(id) {
  await pool.query("DELETE FROM work_order_line_item WHERE work_order_id = $1", [id]);
  await pool.query("DELETE FROM work_order WHERE id = $1", [id]);
  return { ok: true };
}
