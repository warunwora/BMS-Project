import { Router } from "express";
import { supabase } from "../lib/supabase.js";

const router = Router();

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
    deposit: 0, change: 0,
    coaching_slot: slots.map(normSlot),
  };
}

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

router.get("/", async (req, res) => {
  try {
    const { search, coach_id, from, to } = req.query;
    let query = supabase
      .from("coaching_header")
      .select("*,member:member_id(name),coach:coach_id(name,speciality)")
      .order("session_no", { ascending: false });

    if (search) query = query.ilike("coaching_code", `%${search}%`);
    if (coach_id) query = query.eq("coach_id", coach_id);
    if (from) query = query.gte("date", from);
    if (to)   query = query.lte("date", to);

    let { data, error } = await query;
    if (error) throw error;

    if (data?.length) {
      const ids = data.map((s) => s.session_no);
      const { data: slots } = await supabase
        .from("coaching_line_item")
        .select("session_no,skill_focus")
        .in("session_no", ids);
      const slotMap = {};
      (slots ?? []).forEach((sl) => { if (!slotMap[sl.session_no]) slotMap[sl.session_no] = sl.skill_focus; });
      data = data.map((s) => ({ ...s, _skill_focus: slotMap[s.session_no] ?? "" }));
    }

    res.json((data ?? []).map((s) => ({ ...normSession(s), skill_focus: s._skill_focus ?? "" })));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.get("/:id", async (req, res) => {
  try {
    const { data: s, error: e1 } = await supabase
      .from("coaching_header")
      .select("*,member:member_id(name,phone,tier_id),coach:coach_id(name,speciality,hourly_rate)")
      .eq("session_no", req.params.id)
      .single();
    if (e1) throw e1;

    const { data: slots } = await supabase
      .from("coaching_line_item")
      .select("*")
      .eq("session_no", req.params.id);

    res.json(normSession(s, slots ?? []));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.post("/", async (req, res) => {
  try {
    const { slots = [], ...s } = req.body;

    const { data: last } = await supabase.from("coaching_header").select("session_no").order("session_no", { ascending: false }).limit(1);
    const nextNo = ((last?.[0]?.session_no) ?? 0) + 1;
    const coaching_code = `CS${(s.booking_date ?? "").replace(/-/g, "")}-${String(nextNo).padStart(2, "0")}`;

    const { data, error } = await supabase
      .from("coaching_header")
      .insert([{
        session_no: nextNo,
        coaching_code,
        member_id: s.member_id,
        coach_id: s.coach_id,
        date: s.booking_date,
        total_coaching_fee: parseFloat(s.subtotal) || 0,
        member_discount_amount: parseFloat(s.discount) || 0,
        net_coaching_fee: parseFloat(s.net_amount) || 0,
        points_earned: s.points_earned ?? 0,
      }])
      .select();
    if (error) throw error;
    const session = data[0];

    if (slots.length) {
      const { data: lastLine } = await supabase.from("coaching_line_item").select("line_id").order("line_id", { ascending: false }).limit(1);
      let lineId = ((lastLine?.[0]?.line_id) ?? 0) + 1;
      await supabase.from("coaching_line_item").insert(
        slots.map((sl) => ({
          line_id: lineId++,
          session_no: session.session_no,
          training_date: sl.training_date,
          start_time: sl.start_time,
          end_time: sl.end_time,
          hours: parseFloat(sl.hours) || 0,
          skill_focus: sl.skill_focus,
          hourly_rate: parseFloat(sl.rate) || 0,
          extended_fee: parseFloat(sl.extended_fee) || 0,
        }))
      );
    }
    res.status(201).json(normSession(session));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.put("/:id", async (req, res) => {
  try {
    const { member, coach, coaching_slot, code, id, booking_date, subtotal, discount, net_amount, ...rest } = req.body;
    const updateData = {
      ...rest,
      date: booking_date,
      total_coaching_fee: subtotal,
      member_discount_amount: discount,
      net_coaching_fee: net_amount,
    };
    Object.keys(updateData).forEach((k) => updateData[k] === undefined && delete updateData[k]);

    const { data, error } = await supabase
      .from("coaching_header")
      .update(updateData)
      .eq("session_no", req.params.id)
      .select();
    if (error) throw error;
    res.json(normSession(data[0]));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.delete("/:id", async (req, res) => {
  try {
    await supabase.from("coaching_line_item").delete().eq("session_no", req.params.id);
    const { error } = await supabase.from("coaching_header").delete().eq("session_no", req.params.id);
    if (error) throw error;
    res.status(204).send();
  } catch (e) { res.status(400).json({ error: e.message }); }
});

export default router;
