import { Router } from "express";
import { supabase } from "../lib/supabase.js";

const router = Router();

function normRental(r, items = []) {
  const allReturned = items.length > 0 && items.every((i) => i.returned);
  return {
    id: r.id,
    code: r.rent_code,
    date: r.date,
    hours: r.hours,
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

router.get("/", async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = supabase
      .from("assets_rent")
      .select("*,member:member_id(name,phone)")
      .order("id", { ascending: false });

    if (search) query = query.ilike("rent_code", `%${search}%`);

    const { data, error } = await query;
    if (error) throw error;

    let rows = (data ?? []).map((r) => normRental(r));
    if (status && status !== "All") rows = rows.filter((r) => r.status === status);
    res.json(rows);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.get("/:id", async (req, res) => {
  try {
    const { data: r, error: e1 } = await supabase
      .from("assets_rent")
      .select("*,member:member_id(name,phone,tier_id)")
      .eq("id", req.params.id)
      .single();
    if (e1) throw e1;

    const { data: items } = await supabase
      .from("asset_rent_line_item")
      .select("*,asset:asset_id(brand,code)")
      .eq("rent_id", req.params.id);

    res.json(normRental(r, items ?? []));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.post("/", async (req, res) => {
  try {
    const { items = [], ...r } = req.body;

    const { data: last } = await supabase
      .from("assets_rent")
      .select("id")
      .order("id", { ascending: false })
      .limit(1);
    const nextId = ((last?.[0]?.id) ?? 0) + 1;
    const rent_code = `RI${(r.date ?? "").replace(/-/g, "")}-${String(nextId).padStart(2, "0")}`;

    const { data, error } = await supabase
      .from("assets_rent")
      .insert([{
        id: nextId,
        rent_code,
        created_at: new Date().toISOString(),
        member_id: r.member_id,
        hours: r.hours || items.length,
        date: r.date,
        total_price: Math.round(parseFloat(r.total_fee) || 0),
        discounted_price: Math.round(parseFloat(r.total_fee) || 0),
        deposit: 0,
        due: 0,
      }])
      .select();
    if (error) throw error;
    const rental = data[0];

    if (items.length) {
      const { data: lastLine } = await supabase
        .from("asset_rent_line_item")
        .select("id")
        .order("id", { ascending: false })
        .limit(1);
      let lineId = ((lastLine?.[0]?.id) ?? 0) + 1;
      const { error: lineErr } = await supabase.from("asset_rent_line_item").insert(
        items.map((i) => ({
          id: lineId++,
          created_at: new Date().toISOString(),
          rent_id: rental.id,
          date: r.date,
          asset_id: i.asset_id,
          unit_price: Math.round(parseFloat(i.rate) || 0),
          amount: 1,
          condition_out: i.condition_out ?? "good",
          condition_in: "",
          returned: 0,
          damage_fee: parseInt(i.deposit) || 0,
          extended_price: Math.round(parseFloat(i.rate) || 0),
        }))
      );
      if (lineErr) throw lineErr;
    }
    res.status(201).json(normRental(rental));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.put("/:id", async (req, res) => {
  try {
    const { status, member, rental_item, code, id, ...rest } = req.body;
    
    if (status === "Returned") {
      await supabase.from("asset_rent_line_item")
        .update({ returned: 1 })
        .eq("rent_id", req.params.id);
    }
    const { data, error } = await supabase
      .from("assets_rent")
      .update({ total_price: rest.total_fee ?? rest.total_price })
      .eq("id", req.params.id)
      .select();
    if (error) throw error;
    res.json(normRental(data[0]));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.delete("/:id", async (req, res) => {
  try {
    await supabase.from("asset_rent_line_item").delete().eq("rent_id", req.params.id);
    const { error } = await supabase.from("assets_rent").delete().eq("id", req.params.id);
    if (error) throw error;
    res.status(204).send();
  } catch (e) { res.status(400).json({ error: e.message }); }
});

export default router;
