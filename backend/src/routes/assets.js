import { Router } from "express";
import { supabase } from "../lib/supabase.js";

const router = Router();

function norm(a) {
  return { ...a, base_rate: a.price ?? a.base_rate ?? 0 };
}

router.get("/", async (req, res) => {
  try {
    const { search, type } = req.query;
    let query = supabase.from("asset").select("*");

    if (search) {
      query = query.or(`code.ilike.%${search}%,brand.ilike.%${search}%`);
    }
    if (type) {
      query = query.eq("type", type);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json((data ?? []).map(norm));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.get("/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("asset")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(norm(data));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.post("/", async (req, res) => {
  try {
    const { code, brand, type, base_rate } = req.body;
    const { data: last } = await supabase.from("asset").select("id").order("id", { ascending: false }).limit(1);
    const nextId = ((last?.[0]?.id) ?? 0) + 1;
    const { data, error } = await supabase
      .from("asset")
      .insert([{ id: nextId, code, brand, type, price: base_rate }])
      .select();

    if (error) throw error;
    res.status(201).json(norm(data[0]));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.put("/:id", async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData.id;
    if (updateData.base_rate !== undefined) {
      updateData.price = updateData.base_rate;
      delete updateData.base_rate;
    }

    const { data, error } = await supabase
      .from("asset")
      .update(updateData)
      .eq("id", req.params.id)
      .select();

    if (error) throw error;
    res.json(norm(data[0]));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.delete("/:id", async (req, res) => {
  try {
    const { error } = await supabase
      .from("asset")
      .delete()
      .eq("id", req.params.id);

    if (error) throw error;
    res.status(204).send();
  } catch (e) { res.status(400).json({ error: e.message }); }
});

export default router;
