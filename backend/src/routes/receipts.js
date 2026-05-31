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

router.get("/:id", async (req, res) => {
  try {
    const { data: s, error: e1 } = await supabase
      .from("sale")
      .select("*,member:member_id(name,phone)")
      .eq("id", req.params.id)
      .single();
    if (e1) throw e1;

    const { data: items, error: e2 } = await supabase
      .from("sale_line_item")
      .select("*,product:product_id(code,name,category)")
      .eq("sale_id", req.params.id);
    if (e2) throw e2;

    const posItems = (items ?? []).map((i) => ({
      id: i.id,
      receipt_id: i.sale_id,
      product_id: i.product_id,
      product: i.product,
      unit_price: i.unit_price,
      qty: i.quantity,
      ext_price: i.extended_price,
    }));

    res.json({ ...normSale(s), pos_item: posItems });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.post("/", async (req, res) => {
  try {
    const { items = [], ...r } = req.body;
    const { data: lastSale } = await supabase.from("sale").select("id").order("id", { ascending: false }).limit(1);
    const nextSaleId = ((lastSale?.[0]?.id) ?? 0) + 1;
    const receipt_code = `PO${new Date().toISOString().split("T")[0].replace(/-/g, "")}-${String(nextSaleId).padStart(2, "0")}`;
    const { data, error } = await supabase
      .from("sale")
      .insert([{
        id: nextSaleId,
        receipt_code,
        member_id: r.member_id || null,
        sale_date: r.date ?? new Date().toISOString().split("T")[0],
        purchase_method: r.method ?? "cash",
        total_price: r.subtotal ?? 0,
        discount: r.discount ?? 0,
        net_total: r.net_amount ?? 0,
        points_earned: r.points_earned ?? 0,
        points_redeemed: r.points_redeemed ?? 0,
      }])
      .select();
    if (error) throw error;
    const sale = data[0];

    if (items.length) {
      const { data: lastLine } = await supabase.from("sale_line_item").select("id").order("id", { ascending: false }).limit(1);
      let lineId = ((lastLine?.[0]?.id) ?? 0) + 1;
      const { error: lineErr } = await supabase.from("sale_line_item").insert(
        items.map((i) => ({
          id: lineId++,
          created_at: new Date().toISOString(),
          sale_id: sale.id,
          product_id: i.product_id,
          unit_price: i.unit_price,
          quantity: i.qty ?? i.quantity ?? 1,
          extended_price: i.ext_price ?? i.extended_price ?? 0,
        }))
      );
      if (lineErr) throw lineErr;
    }
    res.status(201).json(normSale(sale));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.delete("/:id", async (req, res) => {
  try {
    await supabase.from("sale_line_item").delete().eq("sale_id", req.params.id);
    const { error } = await supabase.from("sale").delete().eq("id", req.params.id);
    if (error) throw error;
    res.status(204).send();
  } catch (e) { res.status(400).json({ error: e.message }); }
});

export default router;
