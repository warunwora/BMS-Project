import { getMemberTier, calcPoints, calcDiscount, calcNet } from "../utils/tier.js";
import { pool } from "../db/pool.js";

function normSlot(sl) {
  return {
    id: sl.line_id,
    session_id: sl.session_no,
    training_date: sl.training_date,
    start_time: sl.start_time,
    end_time: sl.end_time,
    hours: sl.hours,
    skill_focus: sl.skill_focus,
    rate: sl.hourly_rate,
    extended_fee: sl.extended_fee,
  };
}

function normSession(s, slots = []) {
  return {
    id: s.session_no,
    code: s.coaching_code,
    booking_date: s.date,
    member_id: s.member_id,
    coach_id: s.coach_id,
    member: s.member,
    coach: s.coach,
    skill_focus: slots[0]?.skill_focus ?? "",
    subtotal: s.total_coaching_fee ?? 0,
    discount: s.member_discount_amount ?? 0,
    net_amount: s.net_coaching_fee ?? 0,
    points_earned: s.points_earned ?? 0,
    deposit: 0,
    change: 0,
    coaching_slot: slots.map(normSlot),
  };
}

export async function listSessions({ search = "", coach_id = "", from = "", to = "" } = {}) {
  const where = [];
  const params = [];
  if (search) {
    params.push(`%${search}%`);
    where.push(`h.coaching_code ILIKE $${params.length}`);
  }
  if (coach_id) {
    params.push(coach_id);
    where.push(`h.coach_id = $${params.length}`);
  }
  if (from) {
    params.push(from);
    where.push(`h.date >= $${params.length}`);
  }
  if (to) {
    params.push(to);
    where.push(`h.date <= $${params.length}`);
  }
  const sql = `
    SELECT h.*,
           m.name AS m_name,
           c.name AS c_name, c.speciality AS c_speciality
    FROM coaching_header h
    LEFT JOIN member m ON m.id = h.member_id
    LEFT JOIN coach c ON c.coach_id = h.coach_id
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY h.session_no DESC`;
  const { rows } = await pool.query(sql, params);

  const data = rows.map((r) => ({
    ...r,
    member: { name: r.m_name },
    coach: { name: r.c_name, speciality: r.c_speciality },
  }));

  const slotMap = {};
  if (data.length) {
    const ids = data.map((s) => s.session_no);
    const { rows: slots } = await pool.query(
      "SELECT session_no, skill_focus, start_time, end_time FROM coaching_line_item WHERE session_no = ANY($1)",
      [ids]
    );
    slots.forEach((sl) => {
      if (!(sl.session_no in slotMap)) slotMap[sl.session_no] = { skill_focus: sl.skill_focus, start_time: sl.start_time, end_time: sl.end_time };
    });
  }

  return data.map((s) => ({
    ...normSession(s),
    skill_focus: slotMap[s.session_no]?.skill_focus ?? "",
    start_time: slotMap[s.session_no]?.start_time ?? "",
    end_time: slotMap[s.session_no]?.end_time ?? "",
  }));
}

export async function getSession(id) {
  const { rows } = await pool.query(
    `SELECT h.*,
            m.name AS m_name, m.phone AS m_phone, m.tier_id AS m_tier_id,
            c.name AS c_name, c.speciality AS c_speciality, c.hourly_rate AS c_hourly_rate
     FROM coaching_header h
     LEFT JOIN member m ON m.id = h.member_id
     LEFT JOIN coach c ON c.coach_id = h.coach_id
     WHERE h.session_no = $1`,
    [id]
  );
  const r = rows[0];
  if (!r) return null;

  const s = {
    ...r,
    member: { name: r.m_name, phone: r.m_phone, tier_id: r.m_tier_id },
    coach: { name: r.c_name, speciality: r.c_speciality, hourly_rate: r.c_hourly_rate },
  };

  const { rows: slots } = await pool.query(
    "SELECT * FROM coaching_line_item WHERE session_no = $1",
    [id]
  );
  return normSession(s, slots);
}

export async function createSession(body) {
  const { slots = [], ...s } = body;

  const tier = await getMemberTier(s.member_id);
  const subtotal = parseFloat(s.subtotal) || 0;
  const discount = calcDiscount(subtotal, tier.discount);
  const net = calcNet(subtotal, discount);
  const points_earned = calcPoints(net, tier.multiplier);

  const { rows: last } = await pool.query("SELECT MAX(session_no) AS m FROM coaching_header");
  const nextNo = (last[0].m || 0) + 1;
  const coaching_code = `CS${(s.booking_date ?? "").replace(/-/g, "")}-${String(nextNo).padStart(2, "0")}`;

  await pool.query(
    `INSERT INTO coaching_header
      (session_no, coaching_code, member_id, coach_id, date,
       total_coaching_fee, member_discount_amount, net_coaching_fee, points_earned)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [
      nextNo,
      coaching_code,
      s.member_id,
      s.coach_id,
      s.booking_date,
      subtotal,
      discount,
      net,
      points_earned,
    ]
  );

  if (slots.length) {
    const { rows: lastLine } = await pool.query("SELECT MAX(line_id) AS m FROM coaching_line_item");
    let lineId = (lastLine[0].m || 0) + 1;
    for (const sl of slots) {
      await pool.query(
        `INSERT INTO coaching_line_item
          (line_id, session_no, training_date, start_time, end_time, hours, skill_focus, hourly_rate, extended_fee)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          lineId++,
          nextNo,
          sl.training_date,
          sl.start_time,
          sl.end_time,
          parseFloat(sl.hours) || 0,
          sl.skill_focus,
          parseFloat(sl.rate) || 0,
          parseFloat(sl.extended_fee) || 0,
        ]
      );
    }
  }

  const { rows } = await pool.query("SELECT * FROM coaching_header WHERE session_no = $1", [nextNo]);
  return normSession(rows[0]);
}

export async function updateSession(id, body) {
  const { booking_date, subtotal, discount, net_amount, points_earned, member_id, coach_id } = body;
  const updateData = {};
  if (booking_date !== undefined) updateData.date = booking_date;
  if (subtotal !== undefined) updateData.total_coaching_fee = subtotal;
  if (discount !== undefined) updateData.member_discount_amount = discount;
  if (net_amount !== undefined) updateData.net_coaching_fee = net_amount;
  if (points_earned !== undefined) updateData.points_earned = points_earned;
  if (member_id !== undefined) updateData.member_id = member_id;
  if (coach_id !== undefined) updateData.coach_id = coach_id;

  const cols = Object.keys(updateData);
  if (!cols.length) {
    const { rows } = await pool.query("SELECT * FROM coaching_header WHERE session_no = $1", [id]);
    return rows[0] ? normSession(rows[0]) : null;
  }

  const set = cols.map((c, i) => `${c} = $${i + 1}`).join(", ");
  const params = cols.map((c) => updateData[c]);
  params.push(id);
  const { rows } = await pool.query(
    `UPDATE coaching_header SET ${set} WHERE session_no = $${params.length} RETURNING *`,
    params
  );
  return rows[0] ? normSession(rows[0]) : null;
}

export async function deleteSession(id) {
  await pool.query("DELETE FROM coaching_line_item WHERE session_no = $1", [id]);
  await pool.query("DELETE FROM coaching_header WHERE session_no = $1", [id]);
  return { ok: true };
}
