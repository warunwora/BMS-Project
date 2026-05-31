import { Router } from "express";
import { supabase } from "../lib/supabase.js";

const router = Router();

function norm(c) {
  return { ...c, id: c.coach_id, phone: c.phone_no ?? c.phone ?? "" };
}

router.get("/", async (req, res) => {
  try {
    const { search, speciality } = req.query;
    let query = supabase.from("coach").select("*");
    
    if (search) {
      const num = parseInt(search);
      const orFilter = `name.ilike.%${search}%`;
      query = isNaN(num) ? query.or(orFilter) : query.or(`${orFilter},coach_id.eq.${num}`);
    }
    if (speciality) {
      query = query.eq("speciality", speciality);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    res.json((data ?? []).map(norm));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.get("/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("coach")
      .select("*")
      .eq("coach_id", req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(norm(data));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.post("/", async (req, res) => {
  try {
    const { name, speciality, hourly_rate, phone } = req.body;
    const { data: last } = await supabase.from("coach").select("coach_id").order("coach_id", { ascending: false }).limit(1);
    const nextId = ((last?.[0]?.coach_id) ?? 0) + 1;
    const { data, error } = await supabase
      .from("coach")
      .insert([{ coach_id: nextId, name, speciality, hourly_rate, phone_no: phone }])
      .select();
    
    if (error) throw error;
    res.status(201).json(norm(data[0]));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.put("/:id", async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData.id;
    
    const { data, error } = await supabase
      .from("coach")
      .update(updateData)
      .eq("coach_id", req.params.id)
      .select();
    
    if (error) throw error;
    res.json(norm(data[0]));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.delete("/:id", async (req, res) => {
  try {
    const { error } = await supabase
      .from("coach")
      .delete()
      .eq("coach_id", req.params.id);
    
    if (error) throw error;
    res.status(204).send();
  } catch (e) { res.status(400).json({ error: e.message }); }
});

export default router;
