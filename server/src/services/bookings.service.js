import { getMemberTier, calcPoints, calcDiscount, calcNet } from "../utils/tier.js";
import { pool } from "../db/pool.js";

const today = () => new Date().toISOString().split("T")[0];

function deriveStatus(date) {
  return date && date < today() ? "Completed" : "Upcoming";
}

function normLine(c) {
  return {
    id: c.id,
    booking_id: c.court_reservation_id,
    court_id: c.court_number,
    court: { court_no: c.court_number, court_code: `C${String(c.court_number).padStart(3, "0")}` },
    date: c.date,
    start_time: c.start_time,
    end_time: c.end_time,
    hours: c.total_time,
    extended_price: c.extended_price,
  };
}

function normBooking(b) {
  return {
    id: b.id,
    code: b.reservation_code,
    booking_date: b.reservation_date,
    play_date: b.reservation_date,
    status: b.status ?? deriveStatus(b.reservation_date),
    subtotal: b.amount_sum ?? 0,
    discount: b.discount ?? 0,
    net_amount: b.net_amount ?? 0,
    points_earned: b.points_earned ?? 0,
    total_hour: b.total_hour ?? 0,
    deposit: 0, change: 0, points_redeemed: 0,
    member: b.member,
    booking_court: (b.booking_court ?? []).map(normLine),
  };
}

function buildMember(row) {
  if (row.m_name == null && row.phone == null && row.tier_id == null) return null;
  return { name: row.m_name, phone: row.phone, tier_id: row.tier_id };
}

export async function listBookings({ search = "", status = "", from = "", to = "" } = {}) {
  const where = [];
  const params = [];
  if (search) {
    params.push(`%${search}%`);
    where.push(`r.reservation_code ILIKE $${params.length}`);
  }
  if (from) {
    params.push(from);
    where.push(`r.reservation_date >= $${params.length}`);
  }
  if (to) {
    params.push(to);
    where.push(`r.reservation_date <= $${params.length}`);
  }
  const sql = `
    SELECT r.*, m.name AS m_name, m.phone AS phone, m.tier_id AS tier_id
    FROM court_reservation r
    LEFT JOIN member m ON m.id = r.member_id
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY r.id DESC`;
  const { rows } = await pool.query(sql, params);

  let data = rows.map((row) => ({ ...row, member: buildMember(row), booking_court: [] }));

  if (data.length) {
    const ids = data.map((b) => b.id);
    const { rows: lines } = await pool.query(
      "SELECT * FROM court_reservation_line_item WHERE court_reservation_id = ANY($1)",
      [ids]
    );
    const map = {};
    lines.forEach((l) => { (map[l.court_reservation_id] ??= []).push(l); });
    data = data.map((b) => ({ ...b, booking_court: map[b.id] ?? [] }));
  }

  let result = data.map(normBooking);
  if (status && status !== "All") result = result.filter((r) => r.status === status);
  return result;
}

export async function getBooking(id) {
  const { rows } = await pool.query(
    `SELECT r.*, m.name AS m_name, m.phone AS phone, m.tier_id AS tier_id
     FROM court_reservation r
     LEFT JOIN member m ON m.id = r.member_id
     WHERE r.id = $1`,
    [id]
  );
  if (!rows[0]) return null;
  const b = rows[0];
  const { rows: lines } = await pool.query(
    "SELECT * FROM court_reservation_line_item WHERE court_reservation_id = $1",
    [id]
  );
  return normBooking({ ...b, member: buildMember(b), booking_court: lines });
}

export async function createBooking(body) {
  const { courts = [], ...b } = body;

  const tier = await getMemberTier(b.member_id);
  const subtotal = parseFloat(b.subtotal) || 0;
  const discount = calcDiscount(subtotal, tier.discount);
  const net = calcNet(subtotal, discount);
  const points_earned = calcPoints(net, tier.multiplier);

  const { rows: last } = await pool.query("SELECT MAX(id) AS m FROM court_reservation");
  const nextId = (last[0].m || 0) + 1;
  const reservation_code = `RV${(b.play_date ?? b.booking_date ?? "").replace(/-/g, "")}-${String(nextId).padStart(2, "0")}`;
  const total_hour = courts.reduce((s, c) => s + (parseFloat(c.hours) || 0), 0);

  const { rows: inserted } = await pool.query(
    `INSERT INTO court_reservation
       (id, reservation_code, member_id, reservation_date, total_hour, amount_sum, discount, net_amount, points_earned)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [
      nextId,
      reservation_code,
      b.member_id,
      b.play_date ?? b.booking_date,
      total_hour,
      subtotal,
      discount,
      net,
      points_earned,
    ]
  );
  const booking = inserted[0];

  if (courts.length) {
    const { rows: lastLine } = await pool.query("SELECT MAX(id) AS m FROM court_reservation_line_item");
    let lineId = (lastLine[0].m || 0) + 1;
    for (const c of courts) {
      await pool.query(
        `INSERT INTO court_reservation_line_item
           (id, court_reservation_id, court_number, date, start_time, end_time, total_time, extended_price)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          lineId++,
          booking.id,
          parseInt(c.court_id ?? c.court_number),
          c.date ?? b.play_date,
          c.start_time,
          c.end_time,
          parseFloat(c.hours) || 0,
          c.extended_price ?? 0,
        ]
      );
    }
  }

  return normBooking({ ...booking, booking_court: courts });
}

export async function updateBooking(id, body) {
  const { play_date, booking_date, subtotal, discount, net_amount, points_earned, member_id, total_hour } = body;
  const updateData = {};
  if (play_date !== undefined || booking_date !== undefined) updateData.reservation_date = play_date ?? booking_date;
  if (subtotal !== undefined) updateData.amount_sum = subtotal;
  if (discount !== undefined) updateData.discount = discount;
  if (net_amount !== undefined) updateData.net_amount = net_amount;
  if (points_earned !== undefined) updateData.points_earned = points_earned;
  if (member_id !== undefined) updateData.member_id = member_id;
  if (total_hour !== undefined) updateData.total_hour = total_hour;

  const keys = Object.keys(updateData);
  if (keys.length) {
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
    const params = keys.map((k) => updateData[k]);
    params.push(id);
    await pool.query(
      `UPDATE court_reservation SET ${setClause} WHERE id = $${params.length}`,
      params
    );
  }

  return getBooking(id);
}

export async function deleteBooking(id) {
  await pool.query("DELETE FROM court_reservation_line_item WHERE court_reservation_id = $1", [id]);
  await pool.query("DELETE FROM court_reservation WHERE id = $1", [id]);
  return { ok: true };
}


export async function memberTierAnalysis() {
  const { rows } = await pool.query(`
    SELECT
        t.name AS tier,
        COUNT(DISTINCT m.id) AS total_members,
        COUNT(s.id) AS total_transaction,
        ROUND(SUM(s.net_total)::numeric, 2) AS total_revenue,
        ROUND(SUM(s.points_redeemed)::numeric, 2) AS total_points_redeemed,
        ROUND(AVG(s.net_total)::numeric, 2) AS avg_purchase,
        ROUND(
            (SUM(s.net_total) / COUNT(DISTINCT m.id))::numeric,
            2
        ) AS revenue_per_member
    FROM sale s
    JOIN member m ON s.member_id = m.id
    JOIN tier t ON m.tier_id = t.id
    WHERE s.sale_date BETWEEN '2026-01-01' AND '2026-12-31'
    GROUP BY t.name
    ORDER BY total_revenue DESC
  `);

  return rows;
}