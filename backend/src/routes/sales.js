import { Router } from "express";
import { supabase } from "../lib/supabase.js";

const router = Router();

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
    deposit: 0, change: 0,
    member: s.member,
    member_id: s.member_id,
  };
}

router.get("/", async (req, res) => {
  try {
    const { search, method, from, to } = req.query;
    let query = supabase
      .from("sale")
      .select("id,receipt_code,sale_date,purchase_method,net_total,member_id,member:member_id(name)")
      .order("id", { ascending: false });

    if (search)  query = query.ilike("receipt_code", `%${search}%`);
    if (method)  query = query.ilike("purchase_method", method);
    if (from)    query = query.gte("sale_date", from);
    if (to)      query = query.lte("sale_date", to);

    const { data, error } = await query;
    if (error) throw error;
    res.json((data ?? []).map(normSale));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.get("/points", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("sale")
      .select("sale_date,points_redeemed,points_earned,net_total")
      .order("sale_date", { ascending: true });
    if (error) throw error;

    
    const byMonth = {};
    (data ?? []).forEach((r) => {
      if (!r.sale_date) return;
      const d = new Date(r.sale_date);
      const key = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      if (!byMonth[key]) byMonth[key] = { month: key, count: 0, points_redeemed: 0, points_earned: 0, revenue: 0 };
      byMonth[key].count += 1;
      byMonth[key].points_redeemed += r.points_redeemed ?? 0;
      byMonth[key].points_earned += r.points_earned ?? 0;
      byMonth[key].revenue += parseFloat(r.net_total ?? 0);
    });

    res.json({
      monthly: Object.values(byMonth),
      total_transactions: (data ?? []).length,
      total_points_redeemed: (data ?? []).reduce((s, r) => s + (r.points_redeemed ?? 0), 0),
      bills_with_redemptions: (data ?? []).filter((r) => (r.points_redeemed ?? 0) > 0).length,
    });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

export default router;
