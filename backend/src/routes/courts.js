import { Router } from "express";
import { supabase } from "../lib/supabase.js";

const router = Router();

function norm(c) {
  return {
    id: c.court_number,
    court_no: c.court_number,
    court_code: c.court_code,
    weekday_price: c.price,
    weekend_price: c.price_weekend,
  };
}

router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    let query = supabase.from("court").select("*");
    if (search) query = query.ilike("court_code", `%${search}%`);
    const { data, error } = await query.order("court_number");
    if (error) throw error;
    res.json((data ?? []).map(norm));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.get("/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("court").select("*").eq("court_number", req.params.id).single();
    if (error) throw error;
    res.json(norm(data));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.post("/", async (req, res) => {
  try {
    const { court_no, court_code, weekday_price, weekend_price } = req.body;
    const { data, error } = await supabase
      .from("court")
      .insert([{ court_number: court_no, court_code, price: weekday_price, price_weekend: weekend_price }])
      .select();
    if (error) throw error;
    res.status(201).json(norm(data[0]));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.put("/:id", async (req, res) => {
  try {
    const { court_no, court_code, weekday_price, weekend_price } = req.body;
    const { data, error } = await supabase
      .from("court")
      .update({ court_number: court_no, court_code, price: weekday_price, price_weekend: weekend_price })
      .eq("court_number", req.params.id)
      .select();
    if (error) throw error;
    res.json(norm(data[0]));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.delete("/:id", async (req, res) => {
  try {
    const { error } = await supabase.from("court").delete().eq("court_number", req.params.id);
    if (error) throw error;
    res.status(204).send();
  } catch (e) { res.status(400).json({ error: e.message }); }
});

export default router;
