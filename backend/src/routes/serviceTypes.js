import { Router } from "express";
import { supabase } from "../lib/supabase.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("service_type")
      .select("id, name")
      .order("name");
    if (error) throw error;
    res.json(data ?? []);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;