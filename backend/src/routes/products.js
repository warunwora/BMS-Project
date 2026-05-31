import { Router } from "express";
import { supabase } from "../lib/supabase.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = supabase.from("product").select("*");
    
    if (search) {
      query = query.or(`code.ilike.%${search}%,name.ilike.%${search}%`);
    }
    if (category) {
      query = query.eq("category", category);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.get("/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("product")
      .select("*")
      .eq("id", req.params.id)
      .single();
    
    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(data);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.post("/", async (req, res) => {
  try {
    const { code, name, category, unit_price, stock } = req.body;
    const { data: last } = await supabase.from("product").select("id").order("id", { ascending: false }).limit(1);
    const nextId = ((last?.[0]?.id) ?? 0) + 1;
    const { data, error } = await supabase
      .from("product")
      .insert([{ id: nextId, code, name, category, unit_price, stock: stock || 0 }])
      .select();
    
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.put("/:id", async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData.id;
    
    const { data, error } = await supabase
      .from("product")
      .update(updateData)
      .eq("id", req.params.id)
      .select();
    
    if (error) throw error;
    res.json(data[0]);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.delete("/:id", async (req, res) => {
  try {
    const { error } = await supabase
      .from("product")
      .delete()
      .eq("id", req.params.id);
    
    if (error) throw error;
    res.status(204).send();
  } catch (e) { res.status(400).json({ error: e.message }); }
});

export default router;
