import { Router } from "express";
import { supabase } from "../lib/supabase.js";

const router = Router();

const today = () => new Date().toISOString().split("T")[0];

function deriveStatus(date) {
  return date && date < today() ? "Completed" : "Upcoming";
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

router.get("/", async (req, res) => {
  try {
    const { search, status, from, to } = req.query;
    let query = supabase
      .from("court_reservation")
      .select("*,member:member_id(name,phone,tier_id)")
      .order("id", { ascending: false });

    if (search) query = query.ilike("reservation_code", `%${search}%`);
    if (from)   query = query.gte("reservation_date", from);
    if (to)     query = query.lte("reservation_date", to);

    let { data, error } = await query;
    if (error) throw error;

    if (data?.length) {
      const ids = data.map((b) => b.id);
      const { data: lines } = await supabase
        .from("court_reservation_line_item")
        .select("*")
        .in("court_reservation_id", ids);

      const map = {};
      (lines ?? []).forEach((l) => {
        (map[l.court_reservation_id] ??= []).push(l);
      });
      data = data.map((b) => ({ ...b, booking_court: map[b.id] ?? [] }));
    }

    let rows = (data ?? []).map(normBooking);
    if (status && status !== "All") rows = rows.filter((r) => r.status === status);
    res.json(rows);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.get("/:id", async (req, res) => {
  try {
    const { data: b, error: e1 } = await supabase
      .from("court_reservation")
      .select("*,member:member_id(name,phone,tier_id)")
      .eq("id", req.params.id)
      .single();
    if (e1) throw e1;

    const { data: lines } = await supabase
      .from("court_reservation_line_item")
      .select("*")
      .eq("court_reservation_id", req.params.id);

    res.json(normBooking({ ...b, booking_court: lines ?? [] }));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.post("/", async (req, res) => {
  try {
    const { courts = [], ...b } = req.body;

    const { data: last } = await supabase
      .from("court_reservation")
      .select("id")
      .order("id", { ascending: false })
      .limit(1);
    const nextId = ((last?.[0]?.id) ?? 0) + 1;
    const reservation_code = `RV${(b.play_date ?? b.booking_date ?? "").replace(/-/g, "")}-${String(nextId).padStart(2, "0")}`;

    const { data, error } = await supabase
      .from("court_reservation")
      .insert([{
        id: nextId,
        reservation_code,
        member_id: b.member_id,
        reservation_date: b.play_date ?? b.booking_date,
        total_hour: courts.reduce((s, c) => s + (parseFloat(c.hours) || 0), 0),
        amount_sum: b.subtotal ?? 0,
        discount: b.discount ?? 0,
        net_amount: b.net_amount ?? 0,
        points_earned: b.points_earned ?? 0,
      }])
      .select();
    if (error) throw error;
    const booking = data[0];

    if (courts.length) {
      const { data: lastLine } = await supabase
        .from("court_reservation_line_item")
        .select("id")
        .order("id", { ascending: false })
        .limit(1);
      let lineId = ((lastLine?.[0]?.id) ?? 0) + 1;
      await supabase.from("court_reservation_line_item").insert(
        courts.map((c) => ({
          id: lineId++,
          court_reservation_id: booking.id,
          court_number: parseInt(c.court_id ?? c.court_number),
          date: c.date ?? b.play_date,
          start_time: c.start_time,
          end_time: c.end_time,
          total_time: parseFloat(c.hours) || 0,
          extended_price: c.extended_price ?? 0,
        }))
      );
    }
    res.status(201).json(normBooking({ ...booking, booking_court: courts }));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.put("/:id", async (req, res) => {
  try {
    const { status, booking_court, code, id, booking_date, play_date, subtotal, discount, net_amount, points_earned, total_hour } = req.body;
    const updateData = {
      status,
      reservation_date: play_date ?? booking_date,
      amount_sum: subtotal,
      discount,
      net_amount,
      points_earned,
      total_hour,
    };
    Object.keys(updateData).forEach((k) => updateData[k] === undefined && delete updateData[k]);

    const { data, error } = await supabase
      .from("court_reservation")
      .update(updateData)
      .eq("id", req.params.id)
      .select();
    if (error) throw error;
    res.json(normBooking(data[0]));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.delete("/:id", async (req, res) => {
  try {
    await supabase.from("court_reservation_line_item").delete().eq("court_reservation_id", req.params.id);
    const { error } = await supabase.from("court_reservation").delete().eq("id", req.params.id);
    if (error) throw error;
    res.status(204).send();
  } catch (e) { res.status(400).json({ error: e.message }); }
});

export default router;
