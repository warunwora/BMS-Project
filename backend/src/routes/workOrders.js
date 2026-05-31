import { Router } from "express";
import { supabase } from "../lib/supabase.js";

const router = Router();

const STATUS_UP = { pending: "Pending", "in progress": "In Progress", completed: "Completed", cancelled: "Cancelled" };

function norm(w) {
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

router.get("/", async (req, res) => {
  try {
    const { search, tech_id, status, from, to } = req.query;
    let query = supabase.from("work_order").select("*,member:member_id(name)");
    if (search) query = query.ilike("code", `%${search}%`);
    if (tech_id) query = query.eq("technician_id", tech_id);
    if (status && status !== "All") query = query.ilike("status", status);
    if (from) query = query.gte("date", from);
    if (to) query = query.lte("date", to);
    const { data, error } = await query.order("id", { ascending: false });
    if (error) throw error;
    res.json((data ?? []).map(norm));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.get("/:id", async (req, res) => {
  try {
    const { data: workOrder, error: err1 } = await supabase
      .from("work_order")
      .select("*,member:member_id(name,phone,tier_id)")
      .eq("id", req.params.id)
      .single();

    if (err1) throw err1;
    if (!workOrder) return res.status(404).json({ error: "Not found" });

    const { data: items, error: err2 } = await supabase
      .from("work_order_line_item")
      .select("*,racket:racket_model_product_id(code,name),product:product_id(code,name),service:service_id(name)")
      .eq("work_order_id", req.params.id);

    const normItems = (items ?? []).map((i) => ({
      id: i.id,
      work_order_id: i.work_order_id,
      asset: i.product?.code ?? "",
      product_code: i.product?.code ?? "",
      service: i.service?.name ?? "",
      tension: i.tension_required,
      material_cost: i.material_cost ?? 0,
      labor_fee: i.labor_fee ?? 0,
    }));
    res.json({ ...norm(workOrder), work_order_item: normItems });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.post("/", async (req, res) => {
  try {
    const { items = [], ...w } = req.body;

    const { data: last } = await supabase.from("work_order").select("id").order("id", { ascending: false }).limit(1);
    const nextId = ((last?.[0]?.id) ?? 0) + 1;
    const code = `WO${(w.date ?? "").replace(/-/g, "")}-${String(nextId).padStart(2, "0")}`;

    const { data: woData, error: err1 } = await supabase
      .from("work_order")
      .insert([{
        id: nextId,
        code,
        member_id: w.member_id,
        technician_id: parseInt(w.tech_id) || null,
        date: w.date,
        expected_finish_date: w.est_finish_date,
        status: w.status ?? "Pending",
        total_material_cost: parseFloat(w.subtotal) || 0,
        total_labor_cost: parseFloat(w.total_labor) || 0,
        member_discount: parseFloat(w.discount) || 0,
        grand_total: parseFloat(w.net_amount) || 0,
        points_earned: w.points_earned ?? 0,
      }])
      .select();
    if (err1) throw err1;
    const wo = woData[0];

    if (items?.length) {
      const { data: lastLine } = await supabase.from("work_order_line_item").select("id").order("id", { ascending: false }).limit(1);
      let lineId = ((lastLine?.[0]?.id) ?? 0) + 1;
      const { error: err2 } = await supabase.from("work_order_line_item").insert(
        items.map((i) => ({
          id: lineId++,
          work_order_id: wo.id,
          racket_model_product_id: i.racket_model_product_id ?? null,
          product_id: i.product_id ?? null,
          service_id: i.service_id ?? null,
          tension_required: i.tension_required ?? null,
          material_cost: parseFloat(i.material_cost) || 0,
          labor_fee: parseFloat(i.labor_fee) || 0,
          line_total: (parseFloat(i.material_cost) || 0) + (parseFloat(i.labor_fee) || 0),
        }))
      );
      if (err2) throw err2;
    }
    res.status(201).json(norm(wo));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.put("/:id", async (req, res) => {
  try {
    const { member, work_order_item, code, id, tech_id, est_finish_date, subtotal, total_labor, net_amount, discount, ...rest } = req.body;
    const updateData = {
      ...rest,
      technician_id: parseInt(tech_id) || null,
      expected_finish_date: est_finish_date,
      total_material_cost: parseFloat(subtotal) || 0,
      total_labor_cost: parseFloat(total_labor) || 0,
      member_discount: parseFloat(discount) || 0,
      grand_total: parseFloat(net_amount) || 0,
    };
    Object.keys(updateData).forEach((k) => updateData[k] === undefined && delete updateData[k]);

    const { data, error } = await supabase
      .from("work_order")
      .update(updateData)
      .eq("id", req.params.id)
      .select();

    if (error) throw error;
    res.json(norm(data[0]));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.delete("/:id", async (req, res) => {
  try {
    await supabase.from("work_order_line_item").delete().eq("work_order_id", req.params.id);
    const { error } = await supabase.from("work_order").delete().eq("id", req.params.id);
    if (error) throw error;
    res.status(204).send();
  } catch (e) { res.status(400).json({ error: e.message }); }
});

export default router;
