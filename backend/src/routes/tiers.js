import { Router } from "express";
import { supabase } from "../lib/supabase.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase.from("tier").select("*").order("id");
    if (error) throw error;
    res.json(data ?? []);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.get("/:id", async (req, res) => {
  try {
    const { data, error } = await supabase.from("tier").select("*").eq("id", req.params.id).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(data);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

export default router;
