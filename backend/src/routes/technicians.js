import { Router } from "express";
import { supabase } from "../lib/supabase.js";

const router = Router();

function norm(t) {
  return {
    id: t.id,
    name: t.name,
    phone: t.phone,
    code: t.code,
  };
}

router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    let query = supabase.from("technician").select("*");

    if (search) {
      const num = parseInt(search);
      const orFilter = `name.ilike.%${search}%,phone.ilike.%${search}%,code.ilike.%${search}%`;
      query = isNaN(num) ? query.or(orFilter) : query.or(`${orFilter},id.eq.${num}`);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json((data ?? []).map(norm));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("technician")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(norm(data));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, phone, code } = req.body;
    if (!name) throw new Error("Name is required");

    const { data, error } = await supabase
      .from("technician")
      .insert([{ name, phone, code }])
      .select()
      .single();

    if (error) throw error;
    res.json(norm(data));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, phone, code } = req.body;

    const { data, error } = await supabase
      .from("technician")
      .update({ name, phone, code })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(norm(data));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { error } = await supabase
      .from("technician")
      .delete()
      .eq("id", req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
